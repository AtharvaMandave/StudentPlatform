# College Platform - Production-Level Authentication Backend

A fully secured, production-ready authentication system built with Node.js, Express, MongoDB, and JWT tokens.

## 🔐 Security Features

- **JWT Authentication**: Access tokens (15 min expiry) + Refresh tokens (7 days expiry)
- **Email Verification**: Required before account activation
- **Password Reset**: Secure token-based password recovery
- **Account Lockout**: Automatic lockout after 5 failed login attempts (15 minutes)
- **Rate Limiting**: 
  - 5 attempts per 15 minutes for login/register
  - 3 email requests per hour for verification/reset
  - 100 API requests per 15 minutes
- **Input Validation**: Comprehensive validation using Joi
- **Security Headers**: Helmet.js configuration
- **NoSQL Injection Prevention**: MongoDB query sanitization
- **XSS Protection**: Input sanitization
- **CORS**: Cross-origin resource sharing configuration
- **HttpOnly Cookies**: Secure token storage

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- SMTP service for emails (Gmail, SendGrid, etc.) - Optional in development

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory:

```env
# Environment
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=your_mongodb_connection_string_here

# JWT Secrets (Use strong random strings)
JWT_ACCESS_SECRET=your_jwt_access_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Email Configuration (Optional in development)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
EMAIL_FROM=noreply@collegeplatform.com
```

**Generate JWT Secrets:**
```bash
# In Node.js REPL or terminal
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Email Configuration:**
- For Gmail: Enable 2FA and create an [App Password](https://myaccount.google.com/apppasswords)
- For SendGrid: Use API key as password with username "apikey"
- In development, emails will be logged to console if not configured

### 3. Start the Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| POST | `/api/auth/refresh` | Refresh access token | No |
| GET | `/api/auth/verify-email/:token` | Verify email | No |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password | No |
| POST | `/api/auth/change-password` | Change password | Yes |
| GET | `/api/auth/me` | Get user profile | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |

### Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/health` | Server status | No |

## 🧪 Testing the API

### 1. Register a New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful! Please check your email to verify your account.",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "isEmailVerified": false
    }
  }
}
```

### 2. Verify Email

Check your email (or console logs in development) for the verification link:
```
http://localhost:3000/verify-email/{token}
```

Or test directly:
```bash
curl http://localhost:5000/api/auth/verify-email/{token}
```

### 3. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }' -c cookies.txt
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful!",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "isEmailVerified": true,
      "lastLogin": "2026-01-10T05:52:51.000Z"
    },
    "accessToken": "..."
  }
}
```

### 4. Access Protected Route

```bash
curl http://localhost:5000/api/auth/me -b cookies.txt
```

### 5. Refresh Token

```bash
curl -X POST http://localhost:5000/api/auth/refresh -b cookies.txt -c cookies.txt
```

### 6. Logout

```bash
curl -X POST http://localhost:5000/api/auth/logout -b cookies.txt
```

## 🏗️ Project Structure

```
backend/
├── auth/
│   ├── auth.controller.js    # Authentication controllers
│   └── auth.routes.js         # Authentication routes
├── config/
│   ├── db.js                  # Database connection
│   └── env.js                 # Environment configuration
├── middlewares/
│   ├── auth.middleware.js     # JWT verification middleware
│   ├── validation.middleware.js # Input validation
│   ├── ratelimit.middleware.js  # Rate limiting
│   └── security.middleware.js   # Security headers, sanitization
├── models/
│   └── user.model.js          # User schema and methods
├── utils/
│   ├── token.util.js          # JWT token utilities
│   └── email.util.js          # Email sending service
├── app.js                     # Express app configuration
├── server.js                  # Server entry point
├── package.json               # Dependencies
├── .env.example               # Environment template
└── README.md                  # This file
```

## 🔒 Security Best Practices

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Token Management
- Access tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- Tokens stored in HttpOnly cookies (client cannot access via JavaScript)
- Secure flag enabled in production
- SameSite strict policy

### Account Protection
- Account locked for 15 minutes after 5 failed login attempts
- Email verification required before login
- Password reset tokens expire after 1 hour
- Email verification tokens expire after 24 hours

### Rate Limiting
- Login/Register: 5 attempts per 15 minutes
- Email operations: 3 requests per hour
- Token refresh: 10 attempts per 15 minutes
- General API: 100 requests per 15 minutes

## 📧 Email Templates

The system includes professional HTML email templates for:
- **Email Verification**: Welcome message with verification link
- **Password Reset**: Secure password reset instructions
- **Welcome Email**: Sent after successful email verification

## 🌐 CORS Configuration

By default, the following origins are allowed:
- Frontend URL from environment variable
- `http://localhost:3000`
- `http://localhost:5173`

Modify `backend/middlewares/security.middleware.js` to add more origins.

## 🐛 Debugging

**Email not sending?**
- Check EMAIL_* environment variables
- In development, emails are logged to console if SMTP not configured
- For Gmail, ensure you're using an App Password, not your regular password

**JWT errors?**
- Ensure JWT_ACCESS_SECRET and JWT_REFRESH_SECRET are set
- Secrets should be long random strings (64+ characters)

**Database connection failed?**
- Verify MONGO_URI is correct
- Check MongoDB is running
- For MongoDB Atlas, whitelist your IP address

**Rate limit reached?**
- Wait for the time window to reset
- Adjust limits in `middlewares/ratelimit.middleware.js` for development

## 🚧 Development vs Production

**Development:**
- Detailed error messages with stack traces
- Email verification logged to console if SMTP not configured
- Cookies work without HTTPS
- CORS allows localhost origins

**Production:**
- Set `NODE_ENV=production`
- Use HTTPS (secure cookies enabled)
- Configure proper SMTP service
- Set strong JWT secrets
- Configure allowed CORS origins
- Monitor rate limits

## 📝 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| NODE_ENV | No | development | Environment mode |
| PORT | No | 5000 | Server port |
| MONGO_URI | **Yes** | - | MongoDB connection string |
| JWT_ACCESS_SECRET | **Yes** | - | Secret for access tokens |
| JWT_REFRESH_SECRET | **Yes** | - | Secret for refresh tokens |
| FRONTEND_URL | No | http://localhost:3000 | Frontend URL for CORS |
| EMAIL_HOST | No | - | SMTP host |
| EMAIL_PORT | No | 587 | SMTP port |
| EMAIL_USER | No | - | SMTP username |
| EMAIL_PASS | No | - | SMTP password |
| EMAIL_FROM | No | noreply@collegeplatform.com | Sender email |

## 🤝 Contributing

1. Follow the existing code structure
2. Add validation for all user inputs
3. Include error handling
4. Update documentation for new endpoints
5. Test thoroughly before committing

## 📄 License

ISC

---

**Built with ❤️ for College Platform**
