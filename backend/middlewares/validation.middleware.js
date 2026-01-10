import Joi from "joi";

/**
 * Validation middleware factory
 * @param {object} schema - Joi validation schema
 * @returns Middleware function
 */
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false, // Report all errors
            stripUnknown: true, // Remove unknown fields
        });

        if (error) {
            const errors = error.details.map((detail) => ({
                field: detail.path.join("."),
                message: detail.message,
            }));

            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
        }

        // Replace req.body with validated value
        req.body = value;
        next();
    };
};

/**
 * Registration validation schema
 */
const registerSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .required()
        .messages({
            "string.min": "Name must be at least 2 characters long",
            "string.max": "Name cannot exceed 50 characters",
            "any.required": "Name is required",
        }),

    email: Joi.string()
        .email()
        .lowercase()
        .trim()
        .required()
        .messages({
            "string.email": "Please provide a valid email address",
            "any.required": "Email is required",
        }),

    password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
            "string.min": "Password must be at least 8 characters long",
            "string.max": "Password cannot exceed 128 characters",
            "string.pattern.base":
                "Password must contain at least one uppercase letter, one lowercase letter, and one number",
            "any.required": "Password is required",
        }),

    role: Joi.string()
        .valid("student", "admin")
        .optional()
        .default("student"),
});

/**
 * Login validation schema
 */
const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .lowercase()
        .trim()
        .required()
        .messages({
            "string.email": "Please provide a valid email address",
            "any.required": "Email is required",
        }),

    password: Joi.string()
        .required()
        .messages({
            "any.required": "Password is required",
        }),
});

/**
 * Email validation schema
 */
const emailSchema = Joi.object({
    email: Joi.string()
        .email()
        .lowercase()
        .trim()
        .required()
        .messages({
            "string.email": "Please provide a valid email address",
            "any.required": "Email is required",
        }),
});

/**
 * Password reset validation schema
 */
const passwordResetSchema = Joi.object({
    token: Joi.string()
        .required()
        .messages({
            "any.required": "Reset token is required",
        }),

    password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
            "string.min": "Password must be at least 8 characters long",
            "string.max": "Password cannot exceed 128 characters",
            "string.pattern.base":
                "Password must contain at least one uppercase letter, one lowercase letter, and one number",
            "any.required": "Password is required",
        }),

    confirmPassword: Joi.string()
        .valid(Joi.ref("password"))
        .required()
        .messages({
            "any.only": "Passwords do not match",
            "any.required": "Password confirmation is required",
        }),
});

/**
 * Password change validation schema
 */
const passwordChangeSchema = Joi.object({
    currentPassword: Joi.string()
        .required()
        .messages({
            "any.required": "Current password is required",
        }),

    newPassword: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
            "string.min": "Password must be at least 8 characters long",
            "string.max": "Password cannot exceed 128 characters",
            "string.pattern.base":
                "Password must contain at least one uppercase letter, one lowercase letter, and one number",
            "any.required": "New password is required",
        }),

    confirmPassword: Joi.string()
        .valid(Joi.ref("newPassword"))
        .required()
        .messages({
            "any.only": "Passwords do not match",
            "any.required": "Password confirmation is required",
        }),
});

// Export validation middleware
export const validateRegister = validate(registerSchema);
export const validateLogin = validate(loginSchema);
export const validateEmail = validate(emailSchema);
export const validatePasswordReset = validate(passwordResetSchema);
export const validatePasswordChange = validate(passwordChangeSchema);
