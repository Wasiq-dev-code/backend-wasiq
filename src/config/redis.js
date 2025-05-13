import redis from "redis";

const client = redis.createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
  },
});

client.on("error", function (error) {
  throw error;
});

let isconnected = false;

const redisconnect = async () => {
  if (!isconnected) {
    await client.connect();
    isconnected = true;
  }
};
await redisconnect();

export default client;
