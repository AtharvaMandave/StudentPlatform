# Quick Setup Guide for Production-Level Authentication

## Step 1: Create .env File

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Or create a new `.env` file with the following content:

```env
NODE_ENV=development
PORT=5000

# REQUIRED: Add your MongoDB connection string
MONGO_URI=mongodb://localhost:27017/college-platform
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/college-platform

# REQUIRED: Generate JWT secrets (run command below)
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

FRONTEND_URL=http://localhost:3000

# OPTIONAL: Email configuration (will log to console if not set)
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=noreply@collegeplatform.com
```

## Step 2: Generate JWT Secrets

Run these commands to generate strong random secrets:

### Windows PowerShell:
```powershell
# Access Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Refresh Secret  
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Linux/Mac:
```bash
# Access Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Refresh Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the generated strings and paste them into your `.env` file.

## Step 3: Configure MongoDB

### Option A: Local MongoDB
```env
MONGO_URI=mongodb://localhost:27017/college-platform
```

### Option B: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user
4. Whitelist your IP (or use 0.0.0.0/0 for development)
5. Get connection string and replace in .env

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/college-platform
```

## Step 4: (Optional) Configure Email

### For Gmail:
1. Enable 2-Factor Authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Update .env:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_FROM=your.email@gmail.com
```

### For SendGrid:
1. Create account at https://sendgrid.com
2. Create API key
3. Update .env:

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your_sendgrid_api_key
EMAIL_FROM=noreply@yourdomain.com
```

### Skip Email (Development Only):
Leave EMAIL fields empty. Verification links will be logged to console.

## Step 5: Install Dependencies

```bash
npm install
```

## Step 6: Start the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

## Step 7: Test the Setup

Open your browser or use curl:

```bash
# Check server health
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running!",
  "environment": "development",
  "timestamp": "2026-01-10T05:52:51.000Z"
}
```

## Quick Test Flow

### 1. Register a user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test1234"}'
```

### 2. Check console for verification link (if email not configured)

Look for output like:
```
📧 [EMAIL] Verification email to: test@example.com
🔗 Verification URL: http://localhost:3000/verify-email/abc123...
```

### 3. Verify email (using token from console)
```bash
curl http://localhost:5000/api/auth/verify-email/YOUR_TOKEN_HERE
```

### 4. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}' \
  -c cookies.txt
```

### 5. Access protected route
```bash
curl http://localhost:5000/api/auth/me -b cookies.txt
```

## Troubleshooting

### Error: "Missing required environment variables"
- Ensure all required variables are set in `.env`
- Required: MONGO_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET

### Error: "Database connection failed"
- Check MongoDB is running (if local)
- Verify MONGO_URI is correct
- For Atlas, check IP whitelist

### Error: "Module not found"
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then `npm install`

### Emails not sending
- Check EMAIL_* configuration
- Verify SMTP credentials
- In development, check console logs for email content

## Next Steps

1. **Frontend Integration**: Use the API endpoints in your frontend
2. **Add More Routes**: Extend with your business logic
3. **Database Models**: Add more models (courses, assignments, etc.)
4. **File Uploads**: Add profile pictures, documents, etc.
5. **Role-Based Access**: Use `restrictTo` middleware for admin routes

## Security Checklist for Production

- [ ] Set NODE_ENV=production
- [ ] Use strong JWT secrets (64+ characters)
- [ ] Configure SMTP email service
- [ ] Use HTTPS
- [ ] Set proper CORS origins
- [ ] Use environment variables, never hardcode secrets
- [ ] Enable MongoDB authentication
- [ ] Set up monitoring and logging
- [ ] Regular security updates

---

**You're all set! 🚀**
