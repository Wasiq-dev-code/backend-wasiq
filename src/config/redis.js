import Redis from "ioredis";

const client = new Redis(process.env.REDIS_URL);

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
