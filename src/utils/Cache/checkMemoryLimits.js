/**
 * @function checkMemoryLimits
 * @description
 * Monitors Redis memory and key usage to prevent cache overload.
 * This function checks two conditions:
 * 1: The total number of keys stored in Redis. dbsize(). Does not exceed process.env.MAX_KEYS
 * 2: The total memory used info("memory") Does not exceed the memory limits process.env MAX_MEMORY_MB
 *
 * If either limit is exceeded, it logs a warning message and returns `false`.
 * Otherwise, it returns `true`.
 *
 * @returns {Promise<boolean>}
 * Returns `true` if Redis usage is within safe limits.
 * Returns `false` if either the number of keys or memory usage exceeds defined limits.
 * Returns `true` (safe) even on error, to prevent unintentional app shutdown
 *
 * @example
 * Example usage:
 * const isWithinLimits = await checkMemoryLimits();
 * if (!isWithinLimits) {
 *   console.warn("Redis memory or key limit exceeded. Skipping cache write.");
 * } else {
 *   // Safe to write new cache entries
 * }
 *
 * @environment
 * Environment variables:
 * `MAX_KEYS`: Maximum number of Redis keys allowed.
 * `MAX_MEMORY_MB`: Maximum memory limit in megabytes.
 *
 * @note
 * If keys or memory exceeds its given limit. It will not delete and reduce the keys and memory Instead slap warning.
 *
 */

import client from "../../config/redis.js";

export const checkMemoryLimits = async () => {
  try {
    const keysInRedis = await client.dbsize();
    const keysLimit = parseInt(process.env.MAX_KEYS, 10);
    if (keysInRedis > keysLimit) {
      console.warn(`cache keys ${keysInRedis} exceeded limits${keysLimit}`);
      return false;
    }

    const info = await client.info("memory");
    const memoryLine = info
      ?.split("\n")
      .find((line) => line.startsWith("used_memory:"));
    const usedmemory = parseInt(memoryLine?.split(":")[1] || "0", 10);

    const memoryUsageLimit =
      parseInt(process.env.MAX_MEMORY_MB, 10) * 1024 * 1024;

    if (usedmemory > memoryUsageLimit) {
      console.warn(
        `memory usage limit ${memoryUsageLimit} memory used ${usedmemory}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error("Memory check failed:", error);
    return true; // Continue on error
  }
};
