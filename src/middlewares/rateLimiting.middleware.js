import rateLimit from "express-rate-limit";

const viewRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per IP per minute
  message: "Too many requests. Try again later.",
  standardHeaders: true, // Adds RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers (optional)
});

export default viewRateLimiter;
