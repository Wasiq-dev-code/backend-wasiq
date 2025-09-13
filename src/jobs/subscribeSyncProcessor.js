import client from "../config/redis";
import { Subscription } from "../modules/Subscription/Subscription.model.js";

export const subscriberSyncProcessor = async (Job, done) => {
  try {
    const subscriberKeys = new Map();
    let cursor = "0";

    do {
      const [nextCursor, matchedKeys] = await client.scan(
        cursor,
        "MATCH",
        "syncSubscriber:*",
        "COUNT",
        100
      );

      cursor = nextCursor;
      if (matchedKeys.length > 0) {
        const value = await client.mget(...matchedKeys);
        for (let i = 0; i < matchedKeys.length; i++) {
          const subscriberCount = parseInt(value[i] || 0);
          subscriberKeys.set(matchedKeys[i], subscriberCount);
        }
      }
    } while (cursor !== "0");

    const usedKeys = [];
    const bulkOps = [];

    for (const [keys, subscriber] of subscriberKeys) {
      if (subscriber === 0) continue;

      const [, _Id, channelId] = keys.split(":");

      bulkOps.push({
        insertOne: {
          document: {
            subscriber: _Id,
            channel: channelId,
          },
        },
      });

      usedKeys.push(keys);
    }

    if (bulkOps.length > 0) {
      try {
        await Subscription.bulkWrite(bulkOps, { ordered: false });
        console.log("✅ Bulk insert done, duplicates ignored");

        if (usedKeys.length > 1) {
          await client.del(...usedKeys);
        }
      } catch (err) {
        if (err.code === 11000) {
          console.log("⚠ Duplicate subscriber(s) ignored");
        } else {
          throw err;
        }
      }
    }
    done();
  } catch (error) {
    console.error("Error syncing subscriber:", error);
    done(error);
  }
};
