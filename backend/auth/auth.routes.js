import express from "express";
import {
    register,
    login,
    logout,
    refreshToken,
    verifyEmail,
    forgotPassword,
    resetPassword,
    changePassword,
    getProfile,
    updateProfile,
} from "./auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import {
    validateRegister,
    validateLogin,
    validateEmail,
    validatePasswordReset,
    validatePasswordChange,
} from "../middlewares/validation.middleware.js";
import {
    authLimiter,
    refreshLimiter,
    emailLimiter,
} from "../middlewares/ratelimit.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", authLimiter, validateRegister, register);
router.post("/login", authLimiter, validateLogin, login);
router.post("/refresh", refreshLimiter, refreshToken);

// Email verification
router.get("/verify-email/:token", emailLimiter, verifyEmail);

// Password reset
router.post("/forgot-password", emailLimiter, validateEmail, forgotPassword);
router.post("/reset-password", validatePasswordReset, resetPassword);

// Protected routes (require authentication)
router.post("/logout", protect, logout);
router.post("/change-password", protect, validatePasswordChange, changePassword);
router.get("/me", protect, getProfile);
router.put("/profile", protect, updateProfile);

export default router;