import client from "../../config/redis.js";

export const acquireLock = async (lockKey, timeOut) => {
  try {
    const result = await client.set(lockKey, "1", "PX", timeOut * 1000, "NX");
    return result === "OK";
  } catch {
    return false;
  }
};
