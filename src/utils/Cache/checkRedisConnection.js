/**
 * @function monitorRedis
 * @description
 * Continuously monitors the Redis connection health by periodically sending a `PING` command.
 * If the connection is lost or restored, it updates the global `redisAvailable` flag
 * and logs the similar status message in the console.
 *
 * The check runs at regular intervals defined by the environment variable `HEALTH_CHECK_INTERVAL`
 * (in milliseconds). If not set, it defaults to 30 seconds (30000 ms).
 *
 * @global variable
 * @property {boolean} redisAvailable
 * Indicates whether Redis is currently reachable (`true`) or unavailable (`false`).
 * Automatically updated by this function.
 *
 *  @returns {}
 * Does not return anything. Starts a recurring background check for Redis connectivity.
 *
 * * @example
 * // Example usage:
 * import { monitorRedis, redisAvailable } from "./utils/monitorRedis.js";
 *
 * monitorRedis();
 *
 * if redis false
 * if (!redisAvailable) {
 *   console.warn("Redis is currently unavailable. Skipping cache operations.");
 * }
 *
 * @environment
 * Environment Vairble:
 * `HEALTH_CHECK_INTERVAL` - Milliseconds time to check health
 *
 * @note
 * `Redis restored` when the connection is re-established.
 * `Redis lost` when the connection fails
 */

import client from "../../config/redis.js";

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
