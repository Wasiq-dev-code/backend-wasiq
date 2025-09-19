export const redisJobConnection = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  username: "default",
  password: process.env.REDIS_PASSWORD,
  tls: {
    rejectUnauthorized: false,
  },
};
