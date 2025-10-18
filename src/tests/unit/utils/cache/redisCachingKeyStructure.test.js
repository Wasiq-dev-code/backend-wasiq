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
  __esModule: true,
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
    it("Should delete related keys using pipeline", async () => {
      const mockExec = jest.fn().mockResolvedValue(true);
      const pipeline = {
        del: jest.fn().mockReturnThis(),
        exec: mockExec,
      };

      client.sMembers.mockResolvedValue(["videos:page:1", "videos:page:2"]);
      client.multi.mockReturnValue(pipeline);

      const result = await clearVideoListCache("v123");

      expect(client.sMembers).toHaveBeenCalledWith("videoCacheKey:v123");
      expect(pipeline.exec).toHaveBeenCalledTimes(1);
      expect(pipeline.del).toHaveBeenCalledTimes(3);
      expect(result).toBe(true);
    });

    it("should return true if no keys exist", async () => {
      client.sMembers.mockResolvedValue([]);
      const result = await clearVideoListCache("v123");
      expect(result).toBe(true);
    });

    it("should return false on error", async () => {
      client.sMembers.mockRejectedValue(new Error("redis failed"));
      const result = await clearVideoListCache("v123");
      expect(result).toBe(false);
    });
  });
});
