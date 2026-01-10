import nodemailer from "nodemailer";
import { env } from "../config/env.js";

/**
 * Create Nodemailer transporter
 */
const createTransporter = () => {
    // For development, use Ethereal Email (fake SMTP service)
    // For production, use your actual SMTP service
    if (env.NODE_ENV === 'development' && !env.EMAIL_HOST) {
        console.warn('⚠️  No email configuration found. Emails will be logged to console.');
        return null;
    }

    return nodemailer.createTransport({
        host: env.EMAIL_HOST,
        port: env.EMAIL_PORT,
        secure: env.EMAIL_PORT === 465, // true for 465, false for other ports
        auth: {
            user: env.EMAIL_USER,
            pass: env.EMAIL_PASS,
        },
    });
};

const transporter = createTransporter();

/**
 * Send email verification link
 * @param {string} email - User email
 * @param {string} token - Verification token
 * @param {string} name - User name
 */
export const sendVerificationEmail = async (email, token, name) => {
    const verificationUrl = `${env.FRONTEND_URL}/verify-email/${token}`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to College Platform! 🎓</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Thank you for registering! Please verify your email address to activate your account.</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </p>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
            <p><strong>This link will expire in 24 hours.</strong></p>
            <p>If you didn't create an account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2026 College Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

    if (!transporter) {
        console.log('📧 [EMAIL] Verification email to:', email);
        console.log('🔗 Verification URL:', verificationUrl);
        return;
    }

    await transporter.sendMail({
        from: `"College Platform" <${env.EMAIL_FROM}>`,
        to: email,
        subject: 'Verify Your Email Address - College Platform',
        html: htmlContent,
    });
};

/**
 * Send password reset link
 * @param {string} email - User email
 * @param {string} token - Reset token
 * @param {string} name - User name
 */
export const sendPasswordResetEmail = async (email, token, name) => {
    const resetUrl = `${env.FRONTEND_URL}/reset-password/${token}`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request 🔒</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #f5576c;">${resetUrl}</p>
            <div class="warning">
              <strong>⏰ This link will expire in 1 hour.</strong>
            </div>
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
          </div>
          <div class="footer">
            <p>© 2026 College Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

    if (!transporter) {
        console.log('📧 [EMAIL] Password reset email to:', email);
        console.log('🔗 Reset URL:', resetUrl);
        return;
    }

    await transporter.sendMail({
        from: `"College Platform" <${env.EMAIL_FROM}>`,
        to: email,
        subject: 'Password Reset Request - College Platform',
        html: htmlContent,
    });
};

/**
 * Send welcome email after verification
 * @param {string} email - User email
 * @param {string} name - User name
 */
export const sendWelcomeEmail = async (email, name) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #4facfe; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #4facfe; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome Aboard! 🚀</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Your email has been verified successfully! Welcome to College Platform. 🎉</p>
            <p>You can now access all features of the platform:</p>
            <div class="feature">📚 Access course materials and resources</div>
            <div class="feature">👥 Connect with classmates and faculty</div>
            <div class="feature">📝 Submit assignments and track grades</div>
            <div class="feature">📅 View your academic calendar</div>
            <p style="text-align: center;">
              <a href="${env.FRONTEND_URL}/login" class="button">Get Started</a>
            </p>
            <p>If you have any questions, feel free to reach out to our support team.</p>
          </div>
          <div class="footer">
            <p>© 2026 College Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

    if (!transporter) {
        console.log('📧 [EMAIL] Welcome email to:', email);
        return;
    }

    await transporter.sendMail({
        from: `"College Platform" <${env.EMAIL_FROM}>`,
        to: email,
        subject: 'Welcome to College Platform! 🎓',
        html: htmlContent,
    });
};
