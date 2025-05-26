import client from "../config/redis.js";

export const checkRedisConnection = async (redisStatus) => {
  try {
    await client.ping();
    if (!redisStatus.available) {
      console.log("redis connection re establish");
    }
    redisStatus.available = true;
  } catch (error) {
    if (redisStatus) {
      redisStatus.available = false;
      console.log("connection lost", error);
    }
  }
};
