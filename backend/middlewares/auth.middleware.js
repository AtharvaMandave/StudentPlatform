import { verifyAccessToken } from "../utils/token.util.js";
import User from "../models/user.model.js";

/**
 * Protect routes - Verify JWT access token
 */
export const protect = async (req, res, next) => {
    try {
        let token;

        // Get token from cookies or Authorization header
        if (req.cookies.accessToken) {
            token = req.cookies.accessToken;
        } else if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized. Please login to access this resource.",
            });
        }

        // Verify token
        let decoded;
        try {
            decoded = verifyAccessToken(token);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token. Please login again.",
            });
        }

        // Check if user still exists
        const user = await User.findById(decoded.id).select("+isActive");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists.",
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account has been deactivated. Please contact support.",
            });
        }

        // Check if user verified email
        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email to access this resource.",
            });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(500).json({
            success: false,
            message: "Authentication failed. Please try again.",
        });
    }
};

/**
 * Restrict access to specific roles
 * @param  {...string} roles - Allowed roles
 */
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Not authorized.",
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to perform this action.",
            });
        }

        next();
    };
};

/**
 * Optional authentication - Attaches user if token exists but doesn't require it
 */
export const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.cookies.accessToken) {
            token = req.cookies.accessToken;
        } else if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return next();
        }

        try {
            const decoded = verifyAccessToken(token);
            const user = await User.findById(decoded.id);

            if (user && user.isActive && user.isEmailVerified) {
                req.user = user;
            }
        } catch (error) {
            // Silently fail for optional auth
        }

        next();
    } catch (error) {
        next();
    }
};
