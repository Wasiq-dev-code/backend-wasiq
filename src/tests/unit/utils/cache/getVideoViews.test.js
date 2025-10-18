import { afterEach, describe, expect, jest, test } from "@jest/globals";

// Jest mock is on top to avoid overriding
jest.unstable_mockModule("../../config/redis.js", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

const { default: client } = await import("../../config/redis.js");
const { getVideoViews } = await import("../../utils/Cache/getVideoViews.js");

describe("GetVideoViews -- Unit Test", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Should return parsed integer when redis returns a value", async () => {
    client.get.mockResolvedValue("42");

    const result = await getVideoViews("125");

    expect(client.get).toHaveBeenCalledWith("video:125:views");
    expect(result).toBe(42);
  });

  test("Should return 0 when redis returns null", async () => {
    client.get.mockResolvedValue(null);

    const result = await getVideoViews("125");

    expect(client.get).toHaveBeenCalledWith("video:125:views");
    expect(result).toBe(0);
  });

  test("Should return 0 when redis returns a non-numeric value", async () => {
    client.get.mockResolvedValue("Abc");

    const result = await getVideoViews("125");

    expect(client.get).toHaveBeenCalledWith("video:125:views");
    expect(result).toBe(0);
  });
});
