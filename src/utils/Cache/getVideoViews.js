/**
 * @function getVideoViews
 * @description
 * Get the total number of views for a specific video from redis.
 * The function looks up the key pattern `video:<videoId>:views` and returns
 * the stored view count as an integer.
 *
 * If the key does not exist or the value is invalid, it safely returns `0`.
 *
 * @returns {Promise<number>}
 * Returns the number of views for the given video.
 * If the key is missing or not set, returns `0`.
 *
 * @example
 * Example usage:
 * const views = await getVideoViews("abc123");
 * console.log(`Video has ${views} views`);
 *
 * @note
 * The view count is expected to be stored in Redis under the key format:
 * `video:<videoId>:views`.
 * Make sure the key is updated in the IncreaseViewsMiddleware(e.g., using `INCR` or `SET`).
 */

import client from "../../config/redis.js";

export const getVideoViews = async (videoId) => {
  const views = await client.get(`video:${videoId}:views`);
  return parseInt(views) || 0;
};
