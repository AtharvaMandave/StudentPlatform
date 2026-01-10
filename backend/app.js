import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import {
    configureHelmet,
    getCorsOptions,
    xssProtection,
} from "./middlewares/security.middleware.js";
import { apiLimiter } from "./middlewares/ratelimit.middleware.js";
import authRoutes from "./auth/auth.routes.js";
import connectRoutes from "./connect/connect.routes.js";
import { env } from "./config/env.js";

const app = express();

// Security middleware
app.use(configureHelmet()); // Set security headers
app.use(cors(getCorsOptions())); // Enable CORS

// Body parsing middleware
app.use(express.json({ limit: "10mb" })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies

// XSS protection
app.use(xssProtection);

// Apply general rate limiting to all routes
app.use("/api/", apiLimiter);

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running!",
        environment: env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/connect", connectRoutes);

// 404 handler - Must be after all routes, before error handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Error:", err);

    // Handle CORS errors
    if (err.message === "Not allowed by CORS") {
        return res.status(403).json({
            success: false,
            message: "CORS policy: Origin not allowed",
        });
    }

    // Handle validation errors
    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: Object.values(err.errors).map((e) => e.message),
        });
    }

    // Handle duplicate key errors
    if (err.code === 11000) {
        return res.status(409).json({
            success: false,
            message: "Duplicate field value entered",
        });
    }

    // Handle JWT errors
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            success: false,
            message: "Invalid token. Please login again.",
        });
    }

    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            message: "Token expired. Please login again.",
        });
    }

    // Default server error
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal server error",
        ...(env.NODE_ENV === "development" && { stack: err.stack }),
    });
});

export default app;
