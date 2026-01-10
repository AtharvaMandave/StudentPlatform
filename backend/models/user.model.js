import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Email verification fields
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    // Password reset fields
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },

    // Account security fields
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    accountLockedUntil: {
      type: Date,
      default: null,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

/* Hash password before saving */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

/* Compare password during login */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

/* Generate email verification token */
userSchema.methods.generateEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");

  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return token; // Return unhashed token to send via email
};

/* Generate password reset token */
userSchema.methods.generatePasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour

  return token; // Return unhashed token to send via email
};

/* Check if account is locked */
userSchema.methods.isAccountLocked = function () {
  return this.accountLockedUntil && this.accountLockedUntil > Date.now();
};

/* Increment failed login attempts */
userSchema.methods.incrementLoginAttempts = async function () {
  // Reset if lock has expired
  if (this.accountLockedUntil && this.accountLockedUntil < Date.now()) {
    this.failedLoginAttempts = 1;
    this.accountLockedUntil = null;
  } else {
    this.failedLoginAttempts += 1;

    // Lock account after 5 failed attempts for 15 minutes
    if (this.failedLoginAttempts >= 5) {
      this.accountLockedUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
    }
  }

  await this.save();
};

/* Reset failed login attempts */
userSchema.methods.resetLoginAttempts = async function () {
  if (this.failedLoginAttempts > 0 || this.accountLockedUntil) {
    this.failedLoginAttempts = 0;
    this.accountLockedUntil = null;
    await this.save();
  }
};

/* Remove sensitive fields from JSON response */
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpires;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.failedLoginAttempts;
  delete user.accountLockedUntil;
  return user;
};

const User = mongoose.model("User", userSchema);

export default User;