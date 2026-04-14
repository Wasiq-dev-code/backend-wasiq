import client from "../../config/redis.js";

let redisAvailable = false;

client.on("connect", () => {
  redisAvailable = true;
});

client.on("end", () => {
  redisAvailable = false;
});

client.on("error", () => {
  redisAvailable = false;
});

export const isRedisAvailable = () => redisAvailable;
