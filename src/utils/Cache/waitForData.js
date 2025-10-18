/**
 * @function waitForData
 * @description
 * This helper implements a short wait through loop:
 * It attempts up to `maxAttempts` (5) reads from Redis for `key`.
 * If `key` is present it returns the cached value immediately.
 * If the `lockKey` is gone (producer finished or gave up) the loop stops early.
 * If `key` is not present but a separate `lockKey` still exists, it waits and retries.
 *
 * Logical usage: A request checks cache; if cache miss, (acquireLock.js) sets a lockKey and computes value.
 * Consumers can call `waitForData(lockKey, key)` to avoid duplicate work and wait briefly for the process of (acquireLock.js).
 *
 * @param {string} lockKey - Redis key used as a "work-in-progress" lock by the (acquireLock.js). If this key no longer exists, the function stops waiting and returns `null`.
 * @param {string} key - Redis key to read the cached value from.
 *
 * @returns {Promise<string|null>}
 * Returns the cached value (string) if it became available within the retries, otherwise `null`.
 *
 * @behavior details
 * `maxAttempts` is set to 5.
 * Delay between attempts is `Math.min(100 * 2**i, 1000)` milliseconds (exponential backoff capped at 1000ms).
 * i.e.: 100ms, 200ms, 400ms, 800ms, 1000ms.
 * If a cached value is found it is returned as-is.
 *
 * @example
 * Consumer side:
 * const cached = await waitForData("lock:video:123", "video:123:data");
 * if (cached) {
 *   const payload = JSON.parse(cached);
 *   // use payload...
 * } else {
 *   // cache still missing — proceed to compute or return fallback
 * }
 */

import client from "../../config/redis.js";

export const waitForData = async (lockKey, key) => {
  const maxAttempts = 5;
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
