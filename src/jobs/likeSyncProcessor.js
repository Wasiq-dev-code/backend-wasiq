import client from "../config/redis";

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
        // const value = await client.mget(...matchedKeys);
        for (let i = 0; i < matchedKeys.length; i++) {
          // const likeCount = parseInt(value[i] || 0);
          likeKeys.entries(matchedKeys[i]);
        }
      }
    } while (cursor !== "0");

    const usedKeys = [];
    const bulkOps = [];

    for (const [keys, likes] of likeKeys.entries()) {
      if (likes === 0) continue;

      const videoId = keys.split(":")[1];

      bulkOps.push({
        updateOne: {
          filter: { _id: videoId },
          update: {
            $incr: {},
          },
        },
      });
    }
  } catch (error) {
    console.error("Error syncing likes:", err);
    done(err);
  }
};
