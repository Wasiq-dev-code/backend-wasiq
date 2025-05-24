import client from "../config/redis.js";
import { checkRedisConnection } from "../utils/checkRedisConnection.js";
import { acquireLock } from "../utils/AquireLock.js";
import { waitForData } from "../utils/waitForData.js";
import { processData } from "../utils/processData.js";
import { generateCacheKey } from "../utils/generateCacheKey.js";
import { CacheMonitor } from "../utils/cacheMonitoring.js";

const monitor = new CacheMonitor();

const cacheMiddleware = (prefix, duration, option) => {
  const { compressData = false, bypassHeader = "x-bypass-cache" } = option;

  let redisStatus = { available: true };

  checkRedisConnection(redisStatus);
  const refreshRedis = setInterval(checkRedisConnection, 30000);
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
    const lockKey = `lock:${key}`;

    try {
      const cacheData = await client.get(key);
      if (cacheData) {
        monitor.recordHit();
        const decompressedData = processData.decompress(
          cacheData,
          compressData
        );
        return res.json(decompressedData);
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
        try {
          const cachedData = processData.compress(body, compressData);
          await client.setEx(key, duration, cachedData);

          if (prefix === "videosList") {
            await client.sAdd("videoListKeys", key);
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
      next();
    }
  };
};

export default cacheMiddleware;
