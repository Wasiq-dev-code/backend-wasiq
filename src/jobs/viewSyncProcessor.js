import client from "../config/redis.js";
import { Video } from "../models/Video.model.js";

export const viewSyncProcessor = async (job, done) => {
  try {
    const keys = [];
    let cursor = "0";

    do {
      const result = await client.scan(
        cursor,
        "MATCH",
        "videoSync:*",
        "COUNT",
        100
      );
      cursor = result[0];
      keys.push(...result[1]);
    } while (cursor !== "0");

    const values = await client.mGet(...keys);

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

    done();
  } catch (err) {
    console.error("Error syncing views:", err);
    done(err);
  }
};
