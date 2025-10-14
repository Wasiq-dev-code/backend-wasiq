import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";

const client = {
  del: jest.fn(),
  sMembers: jest.fn(),
  multi: jest.fn(),
};

jest.unstable_mockModule("../../config/redis.js", () => ({
  default: client,
}));

let clearVideoCache, clearUserCache, clearVideoListCache;

beforeAll(async () => {
  const helper = await import("../../utils/Cache/redisChachingKeyStructure.js");
  clearUserCache = helper.clearUserCache;
  clearVideoCache = helper.clearVideoCache;
  clearVideoListCache = helper.clearVideoListCache;
});

describe("ClearCache -- Unit Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("ClearVideoCache", () => {
    it("Return true when video cache delete", async () => {
      client.del.mockResolvedValue(1);
      const result = await clearVideoCache("125");

      expect(client.del).toHaveBeenCalledWith("video:125");
      expect(result).toBe(true);
    });

    it("Return false when videocache has an error", async () => {
      client.del.mockRejectedValue(new Error("Redis error"));
      const result = await clearVideoCache("125");

      expect(client.del).toHaveBeenCalledWith("video:125");
      expect(result).toBe(false);
    });
  });

  describe("ClearUserCache", () => {
    it("Return true when usercache delete", async () => {
      client.del.mockResolvedValue(1);
      const result = await clearUserCache("125");

      expect(client.del).toHaveBeenCalledWith("user:125");
      expect(result).toBe(true);
    });

    it("Return false when usercache has an error", async () => {
      client.del.mockRejectedValue(new Error("Redis error"));
      const result = await clearUserCache("125");

      expect(client.del).toHaveBeenCalledWith("user:125");
      expect(result).toBe(false);
    });
  });

  describe("ClearVideoListCache", () => {
    it("")
  })
});
