import client from "../config/redis.js";

export const waitForData = async (lockKey, key, maxAttempts = 5) => {
  for (let i = 0; i < maxAttempts; i++) {
    const cacheData = await client.get(key);
    if (cacheData) return cacheData;

    const checkLockKey = await client.exists(lockKey);
    if (!checkLockKey) break;

    const delay = Math.min(100 * 2 ** i, 1000);
    await new Promise((r) => setTimeout(r, delay));
  }
  return null;
};
