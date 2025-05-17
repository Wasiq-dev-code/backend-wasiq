import { asyncHandler } from "../utils/asyncHandler";
import client from "../config/redis";
const cacheFromRedis = (prefix, duration) => async (req, res, next) => {
  const key = `${prefix}:${req.originalUrl}`;
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
      return originalResponse.call(this, body);
    };
    next();
  } catch (error) {
    console.error("Occuring while running cacheMiddleware");
    next();
  }
};

export default cacheFromRedis;
