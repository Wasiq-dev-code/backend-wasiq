import { getSortedQuery } from "../helpers/getSortedQuery.js";
import crypto from "crypto";

export const generateCacheKey = (req, prefix) => {
  const baseUrl = req.path;
  const sortedQuery = getSortedQuery(req.query);
  const rawKey = `${prefix}${baseUrl}${sortedQuery}`;
  return `${prefix}:${crypto.createHash("md5").update(rawKey).digest("hex")}`;
};
