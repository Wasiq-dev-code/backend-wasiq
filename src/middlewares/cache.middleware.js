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

  setInterval(checkRedisConnection(), 30000);

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

    if (req.header[bypassHeader]) return next();

    try {
      const cached = await client.get(key);

      if (cached) {
        return res.json(JSON.parse(cached));
      }

      const key = generateCacheKey(req);

      const originalResponse = res.json;

      res.json = async function (body) {
        try {
          await client.setEx(key, duration, JSON.stringify(body));
        } catch (err) {
          console.error("Error while set data", err);
        }

        if (prefix === "videosList") {
          await client.sAdd("videoListKeys", key);
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
