import { describe, expect, jest, test, beforeEach } from "@jest/globals";

process.env.REDIS_HOST = "localhost";
process.env.REDIS_PORT = "6379";
process.env.REDIS_PASSWORD = "secret";

const onMock = jest.fn();

const RedisMock = jest.fn(() => {
  return { on: onMock };
});

let client;
let RedisConstructor;

beforeEach(async () => {
  jest.resetModules();

  onMock.mockClear();
  RedisMock.mockClear();

  jest.unstable_mockModule("ioredis", () => ({
    default: RedisMock,
  }));

  const importedClientModule = await import("../../config/redis.js");
  const importedIoredis = await import("ioredis");

  client = importedClientModule.default;
  RedisConstructor = importedIoredis.default;
});

describe("RedisConnect -- MockTest", () => {
  test("Should create redis instance with correct options", () => {
    expect(RedisConstructor).toHaveBeenCalledTimes(1);
    expect(RedisConstructor).toHaveBeenCalledWith({
      host: "localhost",
      port: 6379,
      password: "secret",
      tls: { rejectUnauthorized: false },
      lazyConnect: true,
      maxRetriesPerRequest: null,
      reconnectOnError: expect.any(Function),
      retryStrategy: expect.any(Function),
    });
  });

  test("Should register event listeners", () => {
    expect(onMock).toHaveBeenCalledWith("connect", expect.any(Function));
    expect(onMock).toHaveBeenCalledWith("error", expect.any(Function));
  });

  test("Should log message on error and connect", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const connectHandler = onMock.mock.calls.find((c) => c[0] === "connect")[1];
    const errorHandler = onMock.mock.calls.find((c) => c[0] === "error")[1];

    connectHandler();
    errorHandler({
      message: "Test Redis Error",
    });

    expect(consoleLogSpy).toHaveBeenCalledWith("✅ Redis client connected");
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "❌ Redis client connection error:",
      "Test Redis Error"
    );

    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});
