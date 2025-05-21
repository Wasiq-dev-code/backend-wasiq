export const getSortedQuery = (query) => {
  return Object.keys(query)
    .sort()
    .map((key) => `${key}=${query[key]}`)
    .join("&");
};
