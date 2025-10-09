import redisMock from "ioredis-mock";
import { beforeAll, describe, expect, jest, test } from "@jest/globals";

jest.unstable_mockModule("../../config/redis.js", () => {
  const redis = new redisMock();
  return { default: redis };
});

describe("AquireLock -- Integration Test", () => {
  let redis, aquireLock;

  beforeAll(async () => {
    const mod = await import("../../config/redis.js");
    redis = mod.default;
    const helper = await import("../../utils/Cache/AquireLock.js");
    aquireLock = helper.acquireLock;
  });

  test("Should aquire lock successfully", async () => {
    const result = await aquireLock("Lock:123", 2);
    expect(result).toBe(true);
  });

  test("should not acquire lock if already locked", async () => {
    await aquireLock("Lock:123", 2);
    const result = await aquireLock("Lock:123", 2);
    expect(result).toBe(false);
  });

  test("Should aquire lock again after expiry", async () => {
    await aquireLock("Lock:123", 1);
    await new Promise((res) => setTimeout(res, 2000));
    const result = await aquireLock("Lock:123", 1);
    expect(result).toBe(true);
  });
});
