import rateLimit from "express-rate-limit";

// Video views limiter
export const viewRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 20 requests per IP
  message: "Too many video requests. Please wait a minute.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth limiter (login/register)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: "Too many login attempts. Please try again in 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Upload limiter
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 4, // 2 uploads
  message: "Upload limit reached. Please try again in an hour.",
  standardHeaders: true,
  legacyHeaders: false,
});
