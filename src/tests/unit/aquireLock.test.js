import { afterEach, describe, expect, jest, test } from "@jest/globals";

// Jest mock is on top to avoid overriding
jest.unstable_mockModule("../../config/redis.js", () => ({
  __esModule: true,
  default: {
    set: jest.fn(),
  },
}));
const { default: client } = await import("../../config/redis.js");
const { acquireLock } = await import("../../utils/Cache/AquireLock.js");

describe("AquireLock -- Unit Test", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Should return true when redis returns OK", async () => {
    client.set.mockResolvedValue("OK");

    const result = await acquireLock("Lock:test", 2);

    expect(result).toBe(true);
    expect(client.set).toHaveBeenCalledWith(
      "Lock:test",
      "1",
      "PX",
      2 * 1000,
      "NX"
    );
  });

  test("should return false when redis returns null", async () => {
    client.set.mockResolvedValue(null);

    const result = await acquireLock("Lock:test", 2);

    expect(result).toBe(false);
    expect(client.set).toHaveBeenCalledWith(
      "Lock:test",
      "1",
      "PX",
      2 * 1000,
      "NX"
    );
  });

  test("Should return false when redis returns an Error", async () => {
    client.set.mockRejectedValue(new Error("Redis Error"));

    const result = await acquireLock("Lock:test", 2);

    expect(result).toBe(false);
    expect(client.set).toHaveBeenCalledWith(
      "Lock:test",
      "1",
      "PX",
      2 * 1000,
      "NX"
    );
  });
});
