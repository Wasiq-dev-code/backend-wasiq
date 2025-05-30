import client from "../config/redis.js";
import { checkRedisConnection } from "../utils/checkRedisConnection.js";
import { acquireLock } from "../utils/AquireLock.js";
import { waitForData } from "../utils/waitForData.js";
import { processData } from "../utils/processData.js";
import { generateCacheKey } from "../utils/generateCacheKey.js";
import { CacheMonitor } from "../utils/cacheMonitoring.js";
import { checkMemoryLimits } from "../utils/checkMemoryLimits.js";
import { ApiError } from "../utils/ApiError.js";

const monitor = new CacheMonitor();

const cacheMiddleware = (prefix, duration, option) => {
  const { compressData = true, bypassHeader = "x-bypass-cache" } = option;

  // console.log(prefix, duration, option);

  let redisStatus = { available: true };

  if (!redisStatus) {
    throw new ApiError.CachingError("redisStatus", redisStatus);
  }

  checkRedisConnection(redisStatus);
  const refreshRedis = setInterval(
    checkRedisConnection,
    process?.env?.HEALTH_CHECK_INTERVAL
  );
  process.on("SIGTERM", () => clearTimeout(refreshRedis));
  process.on("SIGINT", () => clearTimeout(refreshRedis));

  return async (req, res, next) => {
    if (
      req.method !== "GET" ||
      !redisStatus.available ||
      req.headers[bypassHeader]
    )
      return next();

    const key = generateCacheKey(req);

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
        const finalData = JSON.parse(decompressedData);

        return res.json(finalData);
      }
      monitor.recordMiss();
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
        try {
          const canCache = await checkMemoryLimits(client);
          if (canCache) {
            const cachedData = processData.compress(body, compressData);
            const ttl = parseInt(duration, 10);
            if (isNaN(ttl) || ttl < 0) {
              throw new Error(`Invalid TTL duration: ${duration}`);
            }
            if (ttl > 2147483647) {
              throw new Error(`TTL too large: ${ttl}`);
            }
            console.log(ttl, "wasiq is bad asss");

            // console.log(key, ttl, cacheAndRespond);

            await client.setEx(key, ttl, cachedData);

            if (prefix === "videosList") {
              await client.sAdd("videoListKeys", key);
            }
          } else {
            await client.flushDb();
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
      next(new ApiError.CachingError("middleware failure", error.message));
    }
  };
};

export default cacheMiddleware;
