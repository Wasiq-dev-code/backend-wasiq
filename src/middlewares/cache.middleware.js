import client from "../config/redis";
import crypto from "crypto";

const cacheFromRedis = (prefix, duration) => async (req, res, next) => {
  const rawkey = `${prefix}:${req.originalUrl}`;
  const key = `${prefix}:${crypto.createHash("md5").update(rawkey).digest("hex")}`;

  try {
    const cached = await client.get(key);

    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const originalResponse = res.json;

    res.json = async function (body) {
      await client.setEx(key, duration, JSON.stringify(body)).catch((err) => {
        console.error("Error while set data", err);
      });

      if (prefix.startsWith("videos:page")) {
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

export default cacheFromRedis;
