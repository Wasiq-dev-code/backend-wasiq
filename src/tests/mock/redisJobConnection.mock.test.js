import { describe, expect, test, beforeEach } from "@jest/globals";

beforeEach(() => {
  process.env.REDIS_HOST = "localhost";
  process.env.REDIS_PORT = "6379";
  process.env.REDIS_PASSWORD = "secret";
});

describe("redisJobConnection -- Config Test", () => {
  test("Should export correct redis job connection config", async () => {
    const { redisJobConnection } = await import(
      "../../config/redisJobConnection.js"
    );

    expect(redisJobConnection).toEqual({
      host: "localhost",
      port: 6379,
      username: "default",
      password: "secret",
      tls: {
        rejectUnauthorized: false,
      },
    });
  });

  test("Should parse port as number", async () => {
    const { redisJobConnection } = await import(
      "../../config/redisJobConnection.js"
    );

    expect(typeof redisJobConnection.port).toBe("number");
  });
});
