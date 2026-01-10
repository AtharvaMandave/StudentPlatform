import User from "../models/user.model.js";
import crypto from "crypto";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    getAccessTokenCookieOptions,
    getRefreshTokenCookieOptions,
} from "../utils/token.util.js";
import {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail,
} from "../utils/email.util.js";

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists.",
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: role || "student",
        });

        // Generate email verification token
        const verificationToken = user.generateEmailVerificationToken();
        await user.save({ validateBeforeSave: false });

        // Send verification email
        try {
            await sendVerificationEmail(email, verificationToken, name);
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
            // Continue registration even if email fails
        }

        res.status(201).json({
            success: true,
            message: "Registration successful! Please check your email to verify your account.",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified,
                },
            },
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            success: false,
            message: "Registration failed. Please try again.",
            error: error.message,
        });
    }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user and include password field
        const user = await User.findOne({ email })
            .select("+password +refreshToken +failedLoginAttempts +accountLockedUntil");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        // Check if account is locked
        if (user.isAccountLocked()) {
            const lockTimeRemaining = Math.ceil(
                (user.accountLockedUntil - Date.now()) / 1000 / 60
            );
            return res.status(423).json({
                success: false,
                message: `Account locked due to multiple failed login attempts. Please try again in ${lockTimeRemaining} minutes.`,
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account has been deactivated. Please contact support.",
            });
        }

        // Verify password
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            await user.incrementLoginAttempts();

            const remainingAttempts = 5 - user.failedLoginAttempts;
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
                ...(remainingAttempts > 0 && remainingAttempts <= 3 && {
                    warning: `${remainingAttempts} attempts remaining before account lockout.`,
                }),
            });
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before logging in. Check your inbox for the verification link.",
            });
        }

        // Reset failed login attempts on successful login
        await user.resetLoginAttempts();

        // Update last login
        user.lastLogin = Date.now();

        // Generate tokens
        const accessToken = generateAccessToken(user._id, user.role);
        const refreshToken = generateRefreshToken(user._id);

        // Save refresh token to database
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        // Set cookies
        res.cookie("accessToken", accessToken, getAccessTokenCookieOptions());
        res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());

        res.status(200).json({
            success: true,
            message: "Login successful!",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified,
                    lastLogin: user.lastLogin,
                },
                accessToken, // Also send in response body for mobile/non-cookie clients
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Login failed. Please try again.",
            error: error.message,
        });
    }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
export const logout = async (req, res) => {
    try {
        // Clear refresh token from database
        const user = await User.findById(req.user._id).select("+refreshToken");
        if (user) {
            user.refreshToken = null;
            await user.save({ validateBeforeSave: false });
        }

        // Clear cookies
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        res.status(200).json({
            success: true,
            message: "Logout successful!",
        });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({
            success: false,
            message: "Logout failed. Please try again.",
        });
    }
};

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.cookies;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Refresh token not found. Please login again.",
            });
        }

        // Verify refresh token
        let decoded;
        try {
            decoded = verifyRefreshToken(token);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired refresh token. Please login again.",
            });
        }

        // Find user and verify refresh token matches
        const user = await User.findById(decoded.id).select("+refreshToken");
        if (!user || user.refreshToken !== token) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token. Please login again.",
            });
        }

        // Check if user is active and verified
        if (!user.isActive || !user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: "Account access denied.",
            });
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(user._id, user.role);

        // Set new access token cookie
        res.cookie("accessToken", newAccessToken, getAccessTokenCookieOptions());

        res.status(200).json({
            success: true,
            message: "Token refreshed successfully!",
            data: {
                accessToken: newAccessToken,
            },
        });
    } catch (error) {
        console.error("Token refresh error:", error);
        res.status(500).json({
            success: false,
            message: "Token refresh failed. Please try again.",
        });
    }
};

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    Verify user email
 * @access  Public
 */
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        // Hash the token to compare with database
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        // Find user with valid verification token
        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() },
        }).select("+emailVerificationToken +emailVerificationExpires");

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification token.",
            });
        }

        // Verify email
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save({ validateBeforeSave: false });

        // Send welcome email
        try {
            await sendWelcomeEmail(user.email, user.name);
        } catch (emailError) {
            console.error("Welcome email failed:", emailError);
        }

        res.status(200).json({
            success: true,
            message: "Email verified successfully! You can now login.",
        });
    } catch (error) {
        console.error("Email verification error:", error);
        res.status(500).json({
            success: false,
            message: "Email verification failed. Please try again.",
        });
    }
};

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        // Don't reveal if user exists or not for security
        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If an account exists with this email, a password reset link has been sent.",
            });
        }

        // Generate password reset token
        const resetToken = user.generatePasswordResetToken();
        await user.save({ validateBeforeSave: false });

        // Send password reset email
        try {
            await sendPasswordResetEmail(email, resetToken, user.name);
        } catch (emailError) {
            console.error("Password reset email failed:", emailError);
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({
                success: false,
                message: "Failed to send password reset email. Please try again.",
            });
        }

        res.status(200).json({
            success: true,
            message: "If an account exists with this email, a password reset link has been sent.",
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({
            success: false,
            message: "Password reset request failed. Please try again.",
        });
    }
};

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 */
export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        // Hash the token to compare with database
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        // Find user with valid reset token
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        }).select("+passwordResetToken +passwordResetExpires +password");

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired password reset token.",
            });
        }

        // Set new password
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.refreshToken = null; // Invalidate existing sessions
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password reset successful! You can now login with your new password.",
        });
    } catch (error) {
        console.error("Password reset error:", error);
        res.status(500).json({
            success: false,
            message: "Password reset failed. Please try again.",
        });
    }
};

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password for authenticated user
 * @access  Private
 */
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Get user with password
        const user = await User.findById(req.user._id).select("+password +refreshToken");

        // Verify current password
        const isPasswordCorrect = await user.comparePassword(currentPassword);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect.",
            });
        }

        // Set new password
        user.password = newPassword;
        user.refreshToken = null; // Invalidate existing sessions
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully! Please login with your new password.",
        });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({
            success: false,
            message: "Password change failed. Please try again.",
        });
    }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        res.status(200).json({
            success: true,
            data: {
                user,
            },
        });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch profile.",
        });
    }
};

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
export const updateProfile = async (req, res) => {
    try {
        const { name } = req.body;

        const user = await User.findById(req.user._id);

        if (name) user.name = name;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully!",
            data: {
                user,
            },
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({
            success: false,
            message: "Profile update failed. Please try again.",
        });
    }
};
