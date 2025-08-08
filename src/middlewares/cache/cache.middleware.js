import client from "../../config/redis.js";
import { redisAvailable } from "../utils/checkRedisConnection.js";
import { acquireLock } from "../utils/AquireLock.js";
import { waitForData } from "../utils/waitForData.js";
import { processData } from "../utils/processData.js";
import { generateCacheKey } from "../utils/generateCacheKey.js";
import { CacheMonitor } from "../utils/cacheMonitoring.js";
import { checkMemoryLimits } from "../utils/checkMemoryLimits.js";
import { ApiError } from "../utils/ApiError.js";
import { getVideoViews } from "../utils/getVideoViews.js";

const monitor = new CacheMonitor();

const cacheMiddleware = (prefix, duration, option) => {
  const { compressData = true, bypassHeader = "x-bypass-cache" } = option;

  // console.log(prefix, duration, option);

  return async (req, res, next) => {
    if (!redisAvailable) {
      console.log("⚠ Redis DOWN → fallback to MongoDB");
      next();
    }

    if (
      req.method !== "GET" ||
      !redisStatus.available ||
      req.headers[bypassHeader]
    )
      return next();

    const key = generateCacheKey(req, prefix);

    if (!key) {
      throw new ApiError.CachingError("while generating key", key);
    }

    const lockKey = `lock:${key}`;

    if (!lockKey) {
      throw new ApiError.CachingError("while generating lockkey", lockKey);
    }

    try {
      const cacheData = await client.get(key);
      if (cacheData) {
        monitor.recordHit();
        const decompressedData = processData.decompress(
          cacheData,
          compressData
        );
        if (!decompressedData) {
          throw new ApiError.CachingError(
            "while decompressing data",
            decompressedData
          );
        }
        // console.log(decompressedData);

        // const finalData = JSON.parse(decompressedData);
        // console.log(finalData);

        console.log("giving response from redis");

        if (prefix === "Video") {
          const { videoId } = req.params;
          const view = await getVideoViews(videoId);
          decompressedData.data.views = view;
          return res.json(decompressedData);
        }

        if (prefix === "videosList") {
          const sortedData = JSON.parse(decompressedData);

          console.log(sortedData);

          const updatedData = await Promise.all(
            sortedData.data.videos.map(async (video) => {
              const view = await getVideoViews(video._id);
              return { ...video, views: view };
            })
          );

          return res.json(updatedData);
        }
      }
      monitor.recordMiss();
      console.log("giving mongoose");
      const islock = await acquireLock(lockKey);
      if (islock) {
        const waited = await waitForData(lockKey, key);
        if (waited) {
          return res.json(waited);
        }
      }

      const originalJson = res.json.bind(res);
      const originalSend = res.send.bind(res);

      const cacheAndRespond = async (body, sender) => {
        // console.log(body, duration);
        // console.log("giving response directly throw mongoose");
        try {
          const canCache = await checkMemoryLimits();
          if (canCache) {
            if (prefix === "Video") {
              const { videoId } = req.params;

              if (!videoId) {
                throw new ApiError(400, "videoId is required");
              }
              const view = await getVideoViews(videoId);

              console.log(view);

              body.data.views = isNaN(parseInt(view, 10))
                ? 0
                : parseInt(view, 10);
            }

            const cachedData = processData.compress(body, compressData);

            const ttl = parseInt(duration, 10);

            if (isNaN(ttl) || ttl < 0) {
              throw new Error(`Invalid TTL duration: ${duration}`);
            }

            if (ttl > 2147483647) {
              throw new Error(`TTL too large: ${ttl}`);
            }

            // console.log(ttl, "First time uploading on redis");

            // console.log(key, ttl, cacheAndRespond);

            await client.set(key, cachedData, "EX", ttl);

            if (prefix === "videosList" && Array.isArray(body?.videos)) {
              try {
                for (const video of body.videos) {
                  console.log(video);
                  const idOfVideos = video._id;
                  const view = await getVideoViews(idOfVideos);
                  console.log(view);
                  video.views = view;

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
                throw ApiError.CachingError(
                  error,
                  "Error while conditioning of videolist"
                );
              }
            }
          } else {
            // await client.flushDb();

            console.warn("Cache cleared due to memory limits");
          }
        } catch (err) {
          console.log("Error in cacheAndRespond", err);
        } finally {
          if (islock) {
            await client.del(lockKey).catch(() => {});
          }
        }
        return sender(body);
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
      // next(ApiError.CachingError(error, error.message));
    }
  };
};

export default cacheMiddleware;
