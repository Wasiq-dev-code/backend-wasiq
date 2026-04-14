import { getSortedQuery } from "../helpers/getSortedQuery.js";
import crypto from "crypto";

export const generateCacheKey = (path, query, prefix) => {
  const baseUrl = path;
  const sortedQuery = getSortedQuery(query);
  const rawKey = `${prefix}${baseUrl}${sortedQuery}`;
  return `${prefix}:${crypto.createHash("md5").update(rawKey).digest("hex")}`;
};
