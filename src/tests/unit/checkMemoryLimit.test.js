import { beforeEach, describe, expect, jest, test } from "@jest/globals";

const mockRedis = {
  dbsize: jest.fn(),
  info: jest.fn(),
};

jest.unstable_mockModule("../../config/redis.js", () => ({
  default: mockRedis,
}));

let checkMemoryLimits;
beforeEach(async () => {
  process.env.MAX_KEYS = "10";
  process.env.MAX_MEMORY_MB = "5";
  const mod = await import("../../utils/Cache/checkMemoryLimits.js");
  checkMemoryLimits = mod.checkMemoryLimits;
  jest.clearAllMocks();
});

describe("Check Memory -- Unit Test", () => {
  test("Returns false when keys exceeds limit", async () => {
    mockRedis.dbsize.mockResolvedValue("11");
    mockRedis.info.mockResolvedValue("used_memory:1000\n");

    const result = await checkMemoryLimits();

    expect(result).toBe(false);
  });

  test("Returns false when memory exceeds limit", async () => {
    mockRedis.dbsize.mockResolvedValue("5");
    mockRedis.info.mockResolvedValue("used_memory:6000000\n");

    const result = await checkMemoryLimits();

    expect(result).toBe(false);
  });

  test("Returns true when both under limit", async () => {
    mockRedis.dbsize.mockResolvedValue("5");
    mockRedis.info.mockResolvedValue("used_memory:4000000\n");

    const result = await checkMemoryLimits();

    expect(result).toBe(true);
  });

  test("Returns false when error occured", async () => {
    mockRedis.dbsize.mockResolvedValue(new Error("redis err"));
    mockRedis.info.mockResolvedValue(null);

    const result = await checkMemoryLimits();

    expect(result).toBe(true);
  });
});
