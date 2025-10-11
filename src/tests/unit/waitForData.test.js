import { beforeEach, describe, expect, jest, test } from "@jest/globals";

const mockRedis = {
  get: jest.fn(),
  exists: jest.fn(),
};

jest.unstable_mockModule("../../config/redis.js", () => ({
  default: mockRedis,
}));

let waitForData;

beforeEach(async () => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  const helper = await import("../../utils/Cache/waitForData.js");
  waitForData = helper.waitForData;
});

describe("Wait for data -- Unit Test", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test("Should return cache data if available", async () => {
    mockRedis.get.mockResolvedValueOnce("Cached");

    const result = await waitForData("Lock", "Key");
    expect(result).toBe("Cached");

    expect(mockRedis.get).toHaveBeenCalledTimes(1);
  });

  test("Should break when lock no longer exists", async () => {
    mockRedis.get.mockResolvedValueOnce(null);

    mockRedis.exists.mockResolvedValueOnce(0);

    const result = await waitForData("Lock", "Key");
    expect(result).toBe(null);
    expect(mockRedis.get).toHaveBeenCalledTimes(1);
    expect(mockRedis.exists).toHaveBeenCalledTimes(1);
  });

  test("Should return cached data after a while", async () => {
    mockRedis.get
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce("Cached");
    mockRedis.exists.mockResolvedValue(1);
    const promise = waitForData("Lock", "Key");

    jest.runAllTimersAsync();

    const result = await promise;
    expect(result).toBe("Cached");
    expect(mockRedis.get).toHaveBeenCalledTimes(4);
    expect(mockRedis.exists).toHaveBeenCalledTimes(3);
  });

  test("Should return null When lock available but key's not", async () => {
    mockRedis.get.mockResolvedValueOnce(null);

    mockRedis.exists.mockResolvedValue(1);
    const promise = waitForData("Lock", "Key");

    jest.runAllTimersAsync();

    const result = await promise;
    expect(result).toBe(null);
    expect(mockRedis.get).toHaveBeenCalledTimes(5);
    expect(mockRedis.exists).toHaveBeenCalledTimes(5);
  });
});
