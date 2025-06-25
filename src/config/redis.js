import Redis from "ioredis";

const client = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  username: "default", // most Redis Cloud setups need this
  password: process.env.REDIS_PASSWORD,
});

client.on("connect", () => {
  console.log("✅ Redis client connected");
});

client.on("error", (error) => {
  console.error("❌ Redis client connection error:", error.message);
  // Don't throw — let app continue or handle gracefully
});

export default client;

// let isconnected = false;

// const redisconnect = async () => {
//   if (!isconnected) {
//     await client.connect();
//     isconnected = true;
//   }
// };
// await redisconnect();
