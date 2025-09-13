import client from "../config/redis.js";
import { Video } from "../models/Video.model.js";

export const viewSyncProcessor = async (job, done) => {
  try {
    const keys = [];
    let cursor = "0";

    do {
      const [nextCursor, matchedKeys] = await client.scan(
        cursor,
        "MATCH",
        "videoSync:*",
        "COUNT",
        100
      );
      // console.log(result);
      // console.log("result Data error");
      cursor = nextCursor;
      if (matchedKeys > 0) {
        keys.push(...matchedKeys);
      } else {
        console.log("⚠️ No keys found to sync.");
        return done(); // graceful exit
      }
    } while (cursor !== "0");

    let values = [];

    if (keys.length > 0) {
      values = await client.mget(...keys);
    } else {
      console.log("⚠️ No keys found to sync.");
      return done(); // graceful exit
    }

    const bulkOps = [];
    const usedKeys = [];

    for (let i = 0; i < keys.length; i++) {
      const views = parseInt(values[i] || 0);

      if (views === 0) continue;

      const videoId = keys[i].split(":")[1];

      bulkOps.push({
        updateOne: {
          filter: { _id: videoId },
          update: {
            $inc: { views: views },
          },
        },
      });

      usedKeys.push(keys[i]);
    }

    if (bulkOps.length > 0) {
      await Video.bulkWrite(bulkOps);

      const pipeline = client.multi();
      usedKeys.forEach((key) => pipeline.set(key, 0));
      await pipeline.exec();
    }
    console.log("Job initallize once");
    const now = new Date();
    console.log(now);

    done();
  } catch (err) {
    console.error("Error syncing views:", err);
    done(err);
  }
};
