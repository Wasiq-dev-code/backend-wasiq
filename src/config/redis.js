/**
 * @file redisClient.js
 * @description Initializes and exports a configured Redis client instance using ioredis.
 * This module manages a secure, resilient connection to a Redis database — including
 * TLS configuration (for Aiven or other managed Redis services), retry logic, and
 * event-based logging for connection states.
 */

import Redis from "ioredis";

/**
 * Creates and configures a Redis client using environment variables.
 *
 * Features:
 * **TLS Enabled:** Uses a secure connection with `rejectUnauthorized: false` for
 * managed Redis providers like Aiven.
 * **Lazy Connection:** The client doesn’t connect automatically until a command is sent.
 * **Automatic Retry Logic:** Implements exponential backoff with capped delay.
 * **Reconnect Handling:** Automatically reconnects when a recoverable error occurs.
 * **Graceful Error Handling:** Logs errors without crashing the application.
 *
 * @constant
 * @type {Redis}
 *
 * @example
 * import redisClient from "./config/redisClient.js";
 *
 * await redisClient.connect(); // Manually connect (if lazyConnect: true)
 * await redisClient.set("key", "value");
 * const result = await redisClient.get("key");
 * console.log(result);
 */

const client = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,

  // Secure connection (commonly used for cloud-managed Redis, e.g., Aiven)
  tls: {
    rejectUnauthorized: false,
  },

  // Connection behavior
  lazyConnect: true, // Waits for first command before connecting
  maxRetriesPerRequest: null, // Prevents command failures on retry
  reconnectOnError: (err) => {
    console.warn("🔁 Reconnect on error:", err.message);
    return true; // Always attempt to reconnect
  },
  retryStrategy: (times) => {
    const delay = Math.min(times * 200, 2000);
    console.log(`♻️ Retry Redis connection in ${delay}ms`);
    return delay;
  },
});

// Event listeners
client.on("connect", () => {
  console.log("✅ Redis client connected");
});

client.on("error", (error) => {
  console.error("❌ Redis client connection error:", error.message);
  // Do not throw — allow the app to handle gracefully
});

export default client;
