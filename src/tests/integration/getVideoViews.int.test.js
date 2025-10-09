import redisMock from "ioredis-mock";
import { beforeAll, describe, expect, jest, test } from "@jest/globals";

jest.unstable_mockModule("../../config/redis.js", () => {
  const redis = new redisMock();
  return { default: redis };
});

describe("GetVideoViews -- Integration Test", () => {
  let redis, getVideoViews;

  beforeAll(async () => {
    const mod = await import("../../config/redis.js");
    redis = mod.default;
    const helper = await import("../../utils/Cache/getVideoViews.js");
    getVideoViews = helper.getVideoViews;
  });

  test("Should fetch stored value from redis", async () => {
    await redis.set("video:125:views", "500");
    const result = await getVideoViews("125");
    expect(result).toBe(500);
  });

  test("Should return 0 when key does not exist in redis", async () => {
    const result = await getVideoViews("12333");
    expect(result).toBe(0);
  });
});
