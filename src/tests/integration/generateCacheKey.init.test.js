import redisMock from "ioredis-mock";
import { beforeAll, describe, expect, test } from "@jest/globals";

import { generateCacheKey } from "../../utils/Cache/generateCacheKey.js";

describe("GenerateCacheKey -- Integration Test", () => {
  let redis;
  beforeAll(() => {
    redis = new redisMock();
  });

  test("should set the value and get when called", async () => {
    const req = { path: "/videos", query: { a: "1", b: "was" } };

    const key = generateCacheKey(req, "cache");
    await redis.set(key, JSON.stringify({ views: 500 }));

    const cached = await redis.get(key);
    const parsed = JSON.parse(cached);

    expect(parsed.views).toBe(500);
  });
});
