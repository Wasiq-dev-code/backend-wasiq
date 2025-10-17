/**
 * @function generateCacheKey
 * @description
 * Generates a cache key based on the HTTP request’s path and query parameters.
 * Preventing duplicate or inconsistent key entries
 *
 * The generated key is hashed using the **MD5** algorithm for better security and professnalism.
 *
 * @param {Object} req - The Express request object.
 * @param {string} req.path - The request path (e.g., `/api/videos`).
 * @param {Object} req.query - The query parameters from the request.
 * @param {string} prefix - A namespace prefix for grouping cache keys (e.g., "video", "user").
 *
 * @returns {string}
 * A unique, consistent Redis secure cache key in the format.
 * <prefix>:<md5-hash>
 *
 * @example
 * Example usage:
 * const key = generateCacheKey(req, "video");
 * console.log(key);// Output example: "video:9f3a3a1bde89acb18bba5430f8e7f4e1"
 *
 */

import { getSortedQuery } from "../helpers/getSortedQuery.js";
import crypto from "crypto";

export const generateCacheKey = (req, prefix) => {
  const baseUrl = req.path;
  const sortedQuery = getSortedQuery(req.query);
  const rawKey = `${prefix}${baseUrl}${sortedQuery}`;
  return `${prefix}:${crypto.createHash("md5").update(rawKey).digest("hex")}`;
};
