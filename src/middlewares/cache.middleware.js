import client from "../config/redis";
import crypto from "crypto";
import { getSortedQuery } from "../utils/getSortedQuery";

const cacheMiddleware = (prefix, duration) => async (req, res, next) => {
  if (req.method !== "GET") return next();

  const baseUrl = req.path;
  const sortedQuery = getSortedQuery(req.query);
  const rawKey = `${prefix}${baseUrl}${sortedQuery}`;
  const key = `${prefix}:${crypto.createHash("md5").update(rawKey).digest("hex")}`;

  try {
    const cached = await client.get(key);

    if (cached) {
      return res.json(JSON.parse(cached));
    }

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

export default cacheMiddleware;
