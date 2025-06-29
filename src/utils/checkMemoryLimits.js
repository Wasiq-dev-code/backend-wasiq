export const checkMemoryLimits = async (client) => {
  try {
    const keysInRedis = await client.dbsize();
    const keysLimit = parseInt(process.env.MAX_KEYS, 10);
    if (keysInRedis > keysLimit) {
      console.warn(`cache keys ${keysInRedis} exceeded limits${keysLimit}`);
      return false;
    }

    const info = await client.info("memory");
    const memoryLine = info
      ?.split("\n")
      .find((line) => line.startsWith("used_memory:"));
    const usedmemory = parseInt(memoryLine?.split(":")[1] || "0", 10);

    const memoryUsageLimit =
      parseInt(process.env.MAX_MEMORY_MB, 10) * 1024 * 1024;

    if (usedmemory > memoryUsageLimit) {
      console.warn(
        `memory usage limit ${memoryUsageLimit} memory used ${usedmemory}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error("Memory check failed:", error);
    return true; // Continue on error
  }
};
