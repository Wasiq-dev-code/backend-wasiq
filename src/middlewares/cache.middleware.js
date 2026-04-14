import client from "../config/redis.js";
import { ApiError } from "../utils/Api/ApiError.js";

import { isRedisAvailable } from "../utils/Cache/checkRedisConnection.js";
import { acquireLock } from "../utils/Cache/AquireLock.js";
import { waitForData } from "../utils/Cache/waitForData.js";
import { processData } from "../utils/Cache/processData.js";
import { generateCacheKey } from "../utils/Cache/generateCacheKey.js";
// import { CacheMonitor } from "../utils/Cache/cacheMonitoring.js";
import { checkMemoryLimits } from "../utils/Cache/checkMemoryLimits.js";
// import { getVideoViews } from "../utils/Cache/getVideoViews.js";

// const monitor = new CacheMonitor();

const cacheMiddleware = (prefix, duration, option) => {
  const { compressData = true, bypassHeader = "x-bypass-cache" } = option;

  // console.log(prefix, duration, option);

  return async (req, res, next) => {
    if (!isRedisAvailable()) {
      console.log("Redis DOWN → fallback to MongoDB");
      return next();
    }

    if (
      req.method !== "GET" ||
      // !redisStatus.available ||
      req.headers[bypassHeader]
    )
      return next();

    const key = generateCacheKey(req.path, req.query, prefix);

    if (!key) {
      throw new ApiError("while generating key", key);
    }

    const lockKey = `lock:${key}`;

    if (!lockKey) {
      throw new ApiError("while generating lockkey", lockKey);
    }

    try {
      const cacheData = await client.get(key);
      if (cacheData) {
        // monitor.recordHit();
        // console.log("Data already in redis", cacheData);
        console.log("cachedData", cacheData);
        const decompressedData = processData.decompress(
          cacheData,
          compressData
        );

        console.log("decompressed data", decompressedData);
        if (!decompressedData) {
          throw new ApiError(
            "Error while decompressing data",
            decompressedData
          );
        }
        // console.log(decompressedData);

        // const finalData = JSON.parse(decompressedData);
        // console.log(finalData);

        console.log("giving response from redis");

        if (prefix === "Video") {
          return res.json(JSON.parse(decompressedData));
        }

        if (prefix === "videosList") {
          const sortedData = JSON.parse(decompressedData);

          console.log(sortedData);

          return res.json(sortedData);
        }
      }

      // IF THE DESIREABLE DATA IS NOT PRESENT IN REDIS
      const islock = await acquireLock(lockKey);
      if (islock) {
        const waited = await waitForData(lockKey, key);
        if (waited) {
          return res.json(waited);
        }
      }

      const originalJson = res.json.bind(res);
      const originalSend = res.send.bind(res);

      const cacheAndRespond = (body, sender) => {
        // console.log("Body Data", body);
        if (res.statusCode !== 200) {
          return sender(body);
        }
        sender(body);

        // Redis work must be async & non-blocking
        (async () => {
          try {
            const canCache = await checkMemoryLimits();
            if (canCache) {
              console.log("Body data", body);

              const cachedData = processData.compress(body, compressData);

              console.log("cached data", cachedData);

              const ttl = parseInt(duration, 10);

              if (isNaN(ttl) || ttl < 0) {
                throw new Error(`Invalid TTL duration: ${duration}`);
              }

              await client.set(key, JSON.stringify(cachedData), "EX", ttl);

              if (prefix === "videosList" && Array.isArray(body?.videos)) {
                try {
                  for (const video of body.videos) {
                    console.log(video);

                    const setKey = `videoCacheKey:${video._id}`;

                    const existedKey = await client.sMembers(setKey);

                    if (existedKey.length >= 5) {
                      console.log(
                        `Skipping cache for video ${video._id}, already in 5 pages.`
                      );
                      continue;
                    }

                    const pipeline = client.multi();

                    pipeline.sadd(setKey, key);
                    pipeline.expire(setKey, ttl);

                    await pipeline.exec();
                  }
                } catch (error) {
                  throw ApiError(
                    error,
                    "Error while conditioning of videolist"
                  );
                }
              }
            } else {
              console.warn("Cache cleared due to memory limits");
            }
          } catch (err) {
            console.log("Error in cacheAndRespond", err);
          } finally {
            if (islock) {
              await client.del(lockKey).catch(() => {});
            }
          }
        })();
      };

      res.json = (body) => cacheAndRespond(body, originalJson);
      res.send = (body) => {
        if (
          typeof body === "object" ||
          (typeof body === "string" && body.trim().startsWith("{"))
        ) {
          return cacheAndRespond(body, originalSend);
        }
        return originalSend(body);
      };

      next();
    } catch (error) {
      console.error("Error while running cacheMiddleware:", error);
      await client.del(lockKey).catch(() => {});
      // next(ApiError(error, error.message));
    }
  };
};

export default cacheMiddleware;
