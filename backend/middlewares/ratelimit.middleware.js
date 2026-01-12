import rateLimit from "express-rate-limit";

/* Signup & Login limiter - Stricter for security */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts (reduced from 10 for better security)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again after 15 minutes.",
  },
  skipSuccessfulRequests: false, // Count both successful and failed requests
});

/* Refresh token limiter */
export const refreshLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 10, // 10 refresh attempts
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many token refresh attempts. Please try again later.",
  },
});

/* Email operations limiter (verification, password reset) */
export const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 email requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many email requests. Please try again after 1 hour.",
  },
});

/* General API limiter */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per 15 minutes (increased for development)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});
