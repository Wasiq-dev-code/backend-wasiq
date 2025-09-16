import client from "../config/redis.js";
import { Like } from "../modules/Like/Likes.model.js";

export const likeSyncProcessor = async (Job, done) => {
  try {
    const likeKeys = new Map();
    let cursor = "0";

    do {
      const [nextCursor, matchedKeys] = await client.scan(
        cursor,
        "MATCH",
        "syncLikes:*",
        "COUNT",
        100
      );

      cursor = nextCursor;
      if (matchedKeys.length > 0) {
        const value = await client.mget(...matchedKeys);
        for (let i = 0; i < matchedKeys.length; i++) {
          const likeCount = parseInt(value[i] || 0);
          likeKeys.set(matchedKeys[i], likeCount);
        }
      }
    } while (cursor !== "0");

    const usedKeys = [];
    const bulkOps = [];

    for (const [keys, likes] of likeKeys) {
      if (likes === 0) continue;

      const [, userId, videoId, commentId] = keys.split(":");

      bulkOps.push({
        insertOne: {
          document: {
            userliked: userId,
            video: videoId && videoId !== "null" ? videoId : null,
            comment: commentId && commentId !== "null" ? commentId : null,
          },
        },
      });

      usedKeys.push(keys);
    }

    if (bulkOps.length > 0) {
      try {
        await Like.bulkWrite(bulkOps, { ordered: false });
        console.log("✅ Bulk insert done, duplicates ignored");

        if (usedKeys.length > 1) {
          await client.del(...usedKeys);
        }
      } catch (err) {
        if (err.code === 11000) {
          console.log("⚠ Duplicate like(s) ignored");
        } else {
          throw err;
        }
      }
    }
    done();
  } catch (error) {
    console.error("Error syncing likes:", error);
    done(error);
  }
};
