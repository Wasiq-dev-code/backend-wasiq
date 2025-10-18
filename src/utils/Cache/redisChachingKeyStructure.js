/**
 * @module CacheUtils
 * @description
 * Utility module for managing cache keys and deleting cached data in Redis.
 * It includes helper functions to generate consistent cache key
 * and to clear specific cached entities such as videos, users, and related video lists.
 *
 * These functions are useful for cache invalidation after database updates (e.g., when a video or user changes).
 */

import client from "../../config/redis.js";

/**
 * @constant {Object} cacheKeys
 * @description
 * Provides helper functions to generate Redis key names for different entities.
 *
 * @property {function(string): string} video - Returns the cache key for a specific video.
 * Format: `"video:<videoId>"`
 * @property {function(string): string} user - Returns the cache key for a specific user.
 * Format: `"user:<userId>"`
 *
 * @example
 * const key = cacheKeys.video("abc123");
 * console.log(key); // "video:abc123"
 */
export const cacheKeys = {
  video: (id) => `video:${id}`,
  // videoList: (page) => `videos:page:${page}`,
  user: (id) => `user:${id}`,
};

/**
 * @function clearVideoCache
 * @description
 * Deletes the cached data for a specific video from Redis.
 *
 * @param {string} videoId - The unique ID of the video whose cache should be cleared.
 * @returns {Promise<boolean>}
 * Returns `true` if deletion succeeded, or `false` if an error occurred.
 *
 * @example
 * const success = await clearVideoCache("abc123");
 * if (success) console.log("Video cache cleared.");
 */
export const clearVideoCache = async (videoId) => {
  try {
    const key = cacheKeys.video(videoId);
    await client.del(key);
    return true;
  } catch (error) {
    console.error("Error while deleting video", error);
    return false;
  }
};

/**
 * @function clearUserCache
 * @description
 * Deletes the cached data for a specific user from Redis.
 *
 * @param {string} userId - The unique ID of the user whose cache should be cleared.
 * @returns {Promise<boolean>}
 * Returns `true` if the key was successfully deleted, otherwise `false`.
 *
 * @example
 * const success = await clearUserCache("user_789");
 * if (success) console.log("User cache cleared.");
 */
export const clearUserCache = async (userId) => {
  try {
    const key = cacheKeys.user(userId);
    await client.del(key);
    return true;
  } catch (error) {
    console.error("Error while deleting the key on redis", error);
    return false;
  }
};

/**
 * @function clearVideoListCache
 * @description
 * Deletes all cache entries related to a specific video list from Redis.
 * It works in two steps:
 * 1. Fetches all cache keys stored in a Redis set (`videoCacheKey:<videoId>`).
 * 2. Deletes each listed key and the set itself using a Redis pipeline for efficiency.
 *
 * @param {string} videoId - The video ID used to locate the page of related cache keys.
 * @returns {Promise<boolean>}
 * Returns `true` if all keys were successfully deleted, or `false` if an error occurred.
 *
 * @example
 * const success = await clearVideoListCache("abc123");
 * if (success) console.log("Video list cache cleared.");
 */
export const clearVideoListCache = async (videoId) => {
  try {
    const setKey = `videoCacheKey:${videoId}`;

    const existedKey = await client.sMembers(setKey);

    if (existedKey.length >= 1) {
      const pipeline = client.multi();

      for (const key of existedKey) {
        pipeline.del(key);
      }

      pipeline.del(setKey);

      await pipeline.exec();
    }

    return true;
  } catch (error) {
    console.error("Error while deleting the key in redis", error);
    return false;
  }
};

/**
 * @note
 * The `clearVideoListCache()` uses Redis sets (`sMembers`) to track grouped cache keys.
 * These utilities help maintain cache consistency after updates, deletes, or other write operations.
 */
