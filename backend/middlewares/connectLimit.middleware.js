import rateLimit from "express-rate-limit";

/**
 * Rate limiter for connection requests
 * 10 requests per day
 */
export const connectionRequestLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 10,
    message: {
        success: false,
        message: "Too many connection requests. Please try again tomorrow.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Use user ID only (no IP fallback to avoid IPv6 issues)
    keyGenerator: (req) => req.user?._id?.toString() || "anonymous",
    skip: (req) => !req.user, // Skip if no user (will be caught by auth middleware)
});

/**
 * Rate limiter for messages
 * 50 messages per connection per day
 */
export const messageLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 50,
    message: {
        success: false,
        message: "Daily message limit reached. Please try again tomorrow.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => `${req.user?._id?.toString() || "anon"}-${req.params?.connectionId || "none"}`,
    skip: (req) => !req.user,
});

/**
 * Rate limiter for profile views
 * 100 views per day
 */
export const profileViewLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 100,
    message: {
        success: false,
        message: "Too many profile views. Please try again tomorrow.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.user?._id?.toString() || "anonymous",
    skip: (req) => !req.user,
});

/**
 * Rate limiter for discovery/search
 * 60 requests per hour
 */
export const discoveryLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 60,
    message: {
        success: false,
        message: "Too many search requests. Please slow down.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.user?._id?.toString() || "anonymous",
    skip: (req) => !req.user,
});

export default {
    connectionRequestLimiter,
    messageLimiter,
    profileViewLimiter,
    discoveryLimiter,
};
