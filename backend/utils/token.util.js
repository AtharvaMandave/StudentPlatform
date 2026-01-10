import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * Generate JWT Access Token (short-lived)
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @returns {string} JWT token
 */
export const generateAccessToken = (userId, role) => {
    return jwt.sign(
        {
            id: userId,
            role
        },
        env.JWT_ACCESS_SECRET,
        {
            expiresIn: env.ACCESS_TOKEN_EXPIRY,
            issuer: 'college-platform',
            audience: 'college-platform-api'
        }
    );
};

/**
 * Generate JWT Refresh Token (long-lived)
 * @param {string} userId - User ID
 * @returns {string} JWT token
 */
export const generateRefreshToken = (userId) => {
    return jwt.sign(
        {
            id: userId,
            type: 'refresh'
        },
        env.JWT_REFRESH_SECRET,
        {
            expiresIn: env.REFRESH_TOKEN_EXPIRY,
            issuer: 'college-platform',
            audience: 'college-platform-api'
        }
    );
};

/**
 * Verify JWT Access Token
 * @param {string} token - JWT token
 * @returns {object} Decoded payload
 */
export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, env.JWT_ACCESS_SECRET, {
            issuer: 'college-platform',
            audience: 'college-platform-api'
        });
    } catch (error) {
        throw new Error(`Invalid access token: ${error.message}`);
    }
};

/**
 * Verify JWT Refresh Token
 * @param {string} token - JWT token
 * @returns {object} Decoded payload
 */
export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, env.JWT_REFRESH_SECRET, {
            issuer: 'college-platform',
            audience: 'college-platform-api'
        });
    } catch (error) {
        throw new Error(`Invalid refresh token: ${error.message}`);
    }
};

/**
 * Cookie options for access token
 */
export const getAccessTokenCookieOptions = () => ({
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
    path: '/'
});

/**
 * Cookie options for refresh token
 */
export const getRefreshTokenCookieOptions = () => ({
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/api/auth/refresh'
});
