import { beforeAll, describe, expect, jest, test } from "@jest/globals";

const mockRedis = {
  ping: jest.fn(),
};

jest.unstable_mockModule("../../config/redis.js", () => ({
  default: mockRedis,
}));

let redisAvailable, monitorRedis;

beforeAll(async () => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  const mod = await import("../../utils/Cache/checkRedisConnection.js");
  redisAvailable = mod.redisAvailable;
  monitorRedis = mod.monitorRedis;
});

describe("Redis Connection -- Unit Test", () => {
  test("Should return success when redis connection on", async () => {
    mockRedis.ping.mockResolvedValue("PONG");

    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    monitorRedis();

    await jest.runOnlyPendingTimersAsync();

    expect(mockRedis.ping).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith("✅ Redis restored");
  });

  test("should return failed when redis connection down", async () => {
    mockRedis.ping.mockRejectedValue(new Error("Redis error"));

    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    monitorRedis();
    await jest.runOnlyPendingTimersAsync();

    expect(mockRedis.ping).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith("❌ Redis lost");
  });

  test("should log lost/restored transitions", async () => {
    mockRedis.ping.mockRejectedValue(new Error("Redis err"));
    mockRedis.ping.mockResolvedValue("PONG");

    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    monitorRedis();

    await jest.runOnlyPendingTimersAsync();

    await jest.runOnlyPendingTimersAsync();

    expect(mockRedis.ping).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith("❌ Redis lost");
    expect(logSpy).toHaveBeenCalledWith("✅ Redis restored");
  });

  test("should clear interval on process signals", async () => {
    const clearSpy = jest
      .spyOn(global, "clearInterval")
      .mockImplementation(() => {});
    const processOnSpy = jest.spyOn(process, "on").mockImplementation(() => {});

    monitorRedis();

    expect(processOnSpy).toHaveBeenCalledWith("SIGTERM", expect.any(Function));
    expect(processOnSpy).toHaveBeenCalledWith("SIGINT", expect.any(Function));

    const handler = processOnSpy.mock.calls.find((c) => c[0] === "SIGTERM")[1];
    handler();

    expect(clearSpy).toHaveBeenCalled();
  });
});
