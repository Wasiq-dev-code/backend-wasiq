import client from "../config/redis.js";

export let redisAvailable = false;

export const monitorRedis = () => {
  const checkConnection = async () => {
    try {
      await client.ping();
      if (!redisAvailable) console.log("✅ Redis restored");
      redisAvailable = true;
    } catch (err) {
      if (redisAvailable) console.log("❌ Redis lost");
      redisAvailable = false;
    }
  };

  const intervalId = setInterval(
    checkConnection,
    process.env.HEALTH_CHECK_INTERVAL || 30000
  );

  process.on("SIGTERM", () => clearInterval(intervalId));
  process.on("SIGINT", () => clearInterval(intervalId));
};
