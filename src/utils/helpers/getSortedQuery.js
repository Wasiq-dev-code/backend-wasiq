export const getSortedQuery = (query) => {
  if (!query || typeof query !== "object") return "";
  return Object.keys(query)
    .sort()
    .map((key) => `${key}=${query[key]}`)
    .join("&");
};
