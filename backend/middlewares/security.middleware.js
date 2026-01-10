import helmet from "helmet";
import { env } from "../config/env.js";

/**
 * Configure Helmet security headers
 */
export const configureHelmet = () => {
    return helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
            },
        },
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: "cross-origin" },
    });
};

/**
 * CORS configuration
 */
export const getCorsOptions = () => {
    return {
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, Postman, etc.)
            if (!origin) return callback(null, true);

            const allowedOrigins = [
                env.FRONTEND_URL,
                "http://localhost:3000",
                "http://localhost:5173",
            ];

            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true, // Allow cookies
        optionsSuccessStatus: 200,
    };
};

/**
 * XSS protection middleware - Basic sanitization
 */
export const xssProtection = (req, res, next) => {
    // Sanitize request body recursively
    const sanitize = (obj) => {
        if (typeof obj === "string") {
            return obj.replace(/[<>]/g, "");
        }

        if (Array.isArray(obj)) {
            return obj.map(sanitize);
        }

        if (obj && typeof obj === "object") {
            const sanitized = {};
            for (const key in obj) {
                sanitized[key] = sanitize(obj[key]);
            }
            return sanitized;
        }

        return obj;
    };

    if (req.body) {
        req.body = sanitize(req.body);
    }

    next();
};
