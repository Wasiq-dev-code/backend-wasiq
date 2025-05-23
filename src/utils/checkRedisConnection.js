import client from "../config/redis";

export const checkRedisConnection = async (redisStatus) => {
  try {
    await client.ping();
    if (!redisStatus.available) {
      console.log("redis connection re establish");
    }
    redisStatus.available = true;
  } catch (error) {
    if (redisAvailable) {
      console.log("connection lost", error);
    }
    redisStatus.available = false;
  }
};
