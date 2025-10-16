/**
 * @function getSortedQuery
 *
 * Build a query string from a plain object.
 *
 * @description:
 * If input is falsy or not an object, returns empty string.
 * Keys will be sorted alphabetically to make output logical.
 * Values are used as is (no encoding) to maintain given behaviour.
 *
 * @param {Object} query - Plain object containing query params (e.g. req.query)
 * @returns {string} A sorted query string like "a=1&b=2" or "" for invalid input.
 *
 * @example
 * getSortedQuery({ b: 2, a: 1 }) // "a=1&b=2"
 */

export const getSortedQuery = (query) => {
  if (!query || typeof query !== "object") return "";
  return Object.keys(query)
    .sort()
    .map((key) => `${key}=${query[key]}`)
    .join("&");
};
