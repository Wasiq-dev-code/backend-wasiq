import Redis from "ioredis";

const client = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,

  tls: {
    rejectUnauthorized: false, // Aiven ke TLS ke liye
  },

  lazyConnect: true,
  maxRetriesPerRequest: null,
  reconnectOnError: (err) => {
    console.warn("🔁 Reconnect on error:", err.message);
    return true;
  },
  retryStrategy: (times) => {
    const delay = Math.min(times * 200, 2000);
    console.log(`♻️ Retry Redis connection in ${delay}ms`);
    return delay;
  },
});

client.on("connect", () => {
  console.log("✅ Redis client connected");
});

client.on("error", (error) => {
  console.error("❌ Redis client connection error:", error.message);
  // Don't throw — let app continue or handle gracefully
});

export default client;
