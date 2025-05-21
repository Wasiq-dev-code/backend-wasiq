import client from "../config/redis";
import crypto from "crypto";
import { getSortedQuery } from "../utils/getSortedQuery";

const cacheMiddleware = (prefix, duration, option) => {
  const { compressData = false, bypassHeader = "x-bypass-cache" } = option;

  let redisAvailable = true;

  const checkRedisConnection = async () => {
    try {
      await client.ping();
      if (!redisAvailable) {
        console.log("redis connection re establish");
      }
      redisAvailable = true;
    } catch (error) {
      if (redisAvailable) {
        console.log("connection lost", error);
      }
      redisAvailable = false;
    }
  };

  checkRedisConnection();

  setInterval(checkRedisConnection, 30000);

  const generateCacheKey = (req) => {
    const baseUrl = req.path;
    const sortedQuery = getSortedQuery(req.query);
    const rawKey = `${prefix}${baseUrl}${sortedQuery}`;
    return `${prefix}:${crypto.createHash("md5").update(rawKey).digest("hex")}`;
  };

  const processData = {
    compress: (data) => {
      return compressData
        ? Buffer.from(JSON.stringify(data)).toString("base64")
        : JSON.stringify(data);
    },

    decompress: (data) => {
      return compressData
        ? JSON.parse(Buffer.from(data, "base64").toString())
        : JSON.parse(data);
    },
  };

  return async (req, res, next) => {
    if (req.method !== "GET") return next();

    if (!redisAvailable) return next();

    if (req.headers[bypassHeader]) return next();

    const key = generateCacheKey(req);

    try {
      const lock = `lock:${key}`;
      const isLock = await client.get(lock);

      if (isLock) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        const afterCache = await client.get(key);
        if (afterCache) {
          return res.json(processData.decompress(afterCache));
        }
      }

      await client.setEx(lock, 30, "1");

      const originalResponse = res.json;

      res.json = async function (body) {
        try {
          if (res.statusCode < 400) {
            const cacheData = processData.compress(body);

            await client.setEx(key, duration, cacheData);

            if (prefix === "videosList") {
              await client.sAdd("videoListKeys", key);
            }

            await client.del(lock);
          }
        } catch (err) {
          console.error("Error while set data", err);
          await client.del(lock).catch(() => {});
        }

        return originalResponse.call(this, body);
      };
      next();
    } catch (error) {
      console.error("Occuring while running cacheMiddleware");
      next();
    }
  };
};

export default cacheMiddleware;
