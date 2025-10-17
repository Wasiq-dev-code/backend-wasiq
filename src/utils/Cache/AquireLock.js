/**
 * @function acquireLock
 *
 * Aquire a distributed lock in redis using the `Set` command PX and Nx.
 * This ensures that lock is created because it does not exists already. Lock will automatically expires after a specified timeout
 *
 * @param {string} lockKey - The unique key used to identify in redis.
 * @param {number} timeOut - This is the number for the timeout of the lock. It expires after this period complete.
 *
 * @returns {Promise<boolean>}
 * Returns `true` if the lock was successfully acquired (i.e., Redis returns "OK"),
 * otherwise returns `false` (if the key already exists or an error occurs)
 *
 * @example :
 *  const isLocked = await acquireLock("video:process:123", 30);
 * if (isLocked) {
 *   // Perform some critical operation
 *   ...
 * } else {
 *   // Lock already held by another process
 *   console.log("Resource is locked");
 * }
 *
 *
 */

import client from "../../config/redis.js";

export const acquireLock = async (lockKey, timeOut) => {
  try {
    const result = await client.set(lockKey, "1", "PX", timeOut * 1000, "NX");
    return result === "OK";
  } catch {
    return false;
  }
};
