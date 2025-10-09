import { describe, test, expect } from "@jest/globals";
import { generateCacheKey } from "../../utils/Cache/generateCacheKey.js";

describe("GenerateCacheKey -- Unit Test", () => {
  test("Should generate same keys despite inorder strucutre of Query data", () => {
    const req1 = { path: "/Video", query: { a: "1", b: "2" } };
    const req2 = { path: "/Video", query: { b: "2", a: "1" } };

    const key1 = generateCacheKey(req1, "cache");
    const key2 = generateCacheKey(req2, "cache");

    expect(key1).toBe(key2);
  });

  test("Should generate different keys for different query values", () => {
    const req1 = { path: "/Video", query: { a: "1" } };
    const req2 = { path: "/Video", query: { a: "2" } };

    const key1 = generateCacheKey(req1, "cache");
    const key2 = generateCacheKey(req2, "cache");

    expect(key1).not.toBe(key2);
  });

  test("Should handle empty query object", () => {
    const req = { path: "/Video", query: {} };
    const key = generateCacheKey(req, "cache");

    expect(key.startsWith("cache")).toBe(true);
    expect(key.length).toBeGreaterThan(10);
  });
});
