/**
 * @file redisJobConnection.js
 * @description Exports a secure and configurable Redis connection object.
 * Typically used by job queue systems such as BullMQ, Bull, or custom workers
 * to establish a connection with a Redis instance.
 */

/**
 * Redis connection configuration object.
 *
 * This object contains all necessary parameters to establish a secure connection
 * with a Redis instance. It is designed for use in job queues, background workers,
 * and distributed caching systems.
 *
 * Features:
 * Uses environment variables for host, port, and password.
 * Includes TLS configuration for secure cloud-hosted Redis.
 * Defaults to the "default" username (as per Redis 6+ ACL requirements).
 *
 * @constant
 * @type {Object}
 * @property {string} host - The hostname or IP address of the Redis server.
 * @property {number} port - The port number on which Redis is running.
 * @property {string} username - The Redis username (default for most setups).
 * @property {string} password - The Redis password for authentication.
 * @property {Object} tls - TLS options for secure connections.
 * @property {boolean} tls.rejectUnauthorized - When `false`, allows self-signed certificates (required for Aiven and similar).
 *
 * @example
 * import { redisJobConnection } from "./config/redisJobConnection.js";
 * import { Queue } from "bullmq";
 *
 * const emailQueue = new Queue("emailQueue", {
 *   connection: redisJobConnection,
 * });
 *
 * await emailQueue.add("sendEmail", { to: "user@example.com" });
 */
export const redisJobConnection = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  username: "default",
  password: process.env.REDIS_PASSWORD,
  tls: {
    rejectUnauthorized: false, // Required for Aiven or similar managed Redis
  },
};
