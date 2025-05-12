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

await client.connect();

export default client;
