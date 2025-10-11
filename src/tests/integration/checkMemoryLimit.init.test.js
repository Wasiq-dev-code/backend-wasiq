import redisMock from "ioredis-mock";
import { beforeAll, describe, expect, jest, test } from "@jest/globals";

jest.unstable_mockModule("../../config/redis.js", () => {
  const client = new redisMock();
  return { default: client };
});

let client, checkMemoryLimits;

beforeAll(async () => {
  const mod = await import("../../config/redis.js");
  client = mod.default;
  const helper = await import("../../utils/Cache/checkMemoryLimits.js");
  checkMemoryLimits = helper.checkMemoryLimits;
});

describe("Check Memory -- Integration Test", () => {
  test("Should return false when key limits exceed", async () => {
    process.env.MAX_KEYS = "1";
    process.env.MAX_MEMORY_MB = "2";

    await client.set("k1", "v1");
    await client.set("k2", "v2");

    client.info = async () => "used_memory:1000000\n";

    const result = await checkMemoryLimits();

    expect(result).toBe(false);
  });

  test("Should return true when key and memory under limit", async () => {
    process.env.MAX_KEYS = "5";
    process.env.MAX_MEMORY_MB = "2";

    await client.set("k1", "v1");
    await client.set("k2", "v2");

    client.info = async () => "used_memory:1000000\n";

    const result = await checkMemoryLimits();

    expect(result).toBe(true);
  });

  test("Should return false when memory limits exceed", async () => {
    process.env.MAX_KEYS = "5";
    process.env.MAX_MEMORY_MB = "2";

    await client.set("k1", "v1");
    await client.set("k2", "v2");

    client.info = async () => "used_memory:4000000\n";

    const result = await checkMemoryLimits();

    expect(result).toBe(false);
  });
});
