import redisMock from "ioredis-mock";
import { beforeAll, describe, expect, jest, test } from "@jest/globals";

jest.unstable_mockModule("../../config/redis.js", () => {
  const client = new redisMock();
  return { default: client };
});

let client, waitForData;

beforeAll(async () => {
  const mod = await import("../../config/redis.js");
  client = mod.default;
  const helper = await import("../../utils/Cache/waitForData.js");
  waitForData = helper.waitForData;
});

describe("Wait for data -- Integration Test", () => {
  test("Should return data immediately if present", async () => {
    await client.set("VideoLock", "23");
    await client.set("VideoKey", "found");

    const result = await waitForData("VideoLock", "VideoKey");
    expect(result).toBe("found");
  });

  test("Returns null when lock remove and data is not present", async () => {
    await client.del("VideoLock");

    const result = await waitForData("VideoLock", "Video999");
    expect(result).toBe(null);
  });

  test("Returns data after delayed", async () => {
    await client.set("VideoLock", "1");

    setTimeout(async () => {
      await client.set("Video:Late", "Available");
    }, 200);

    const result = await waitForData("VideoLock", "Video:Late");
    expect(result).toBe("Available");
  });

  test("Returns null if data never appears after maxattempts", async () => {
    await client.set("VideoLock", "1");

    const result = await waitForData("VideoLock", "Video:key");
    expect(result).toBe(null);
  });
});
