# JWT Authentication Setup Guide

## Overview

JWT authentication has been implemented to secure all API endpoints. All requests now require a valid JWT token in the Authorization header.

## Quick Start

### 1. Set Up Environment Variables

Make sure you have a `.env` file in the `back-end` directory with these variables:

```bash
# Copy from .env.example
cp .env.example .env
```

Required variables:
- `MONGODB_URI` - MongoDB connection string (already configured)
- `JWT_SECRET` - Secret key for signing tokens (change in production!)
- `USE_MOCK_DB=false` - Set to false to use MongoDB

### 2. Start the Backend Server

```bash
cd back-end
npm install
npm start
```

The server should start on `http://localhost:7001`

### 3. Create a Test User

Run this script to create a demo user:

```bash
cd back-end
node scripts/createTestUser.js
```

This creates:
- **Email**: `demo@fieldnotes.app`
- **Password**: `password123`

### 4. Start the Frontend

```bash
cd front-end
npm install
npm run dev
```

The frontend should start on `http://localhost:7002`

### 5. Login

1. Navigate to `http://localhost:7002`
2. Click on "Get Started" or go directly to the auth page
3. **Quick Login**: Click the "🚀 Quick Demo Login (dev)" button
4. **Or** manually enter:
   - Email: `demo@fieldnotes.app`
   - Password: `password123`

## How It Works

### Frontend Changes

1. **AuthContext** (`front-end/src/contexts/AuthContext.jsx`)
   - Manages authentication state globally
   - Provides `login()`, `register()`, `logout()` functions
   - Stores JWT token in localStorage

2. **API Service** (`front-end/src/services/api.js`)
   - Automatically includes JWT token in all requests
   - Reads token from localStorage
   - Adds `Authorization: Bearer <token>` header

3. **App.jsx**
   - Wrapped with `AuthProvider`
   - Redirects to auth page if not authenticated
   - Checks authentication status on load

4. **AuthPage** (`front-end/src/pages/AuthPage.jsx`)
   - Login and registration forms
   - Quick demo login button for development
   - Error handling and validation

### Backend Implementation

1. **JWT Middleware** (`back-end/middleware/auth.js`)
   - `authenticateToken` - Requires valid JWT token
   - `optionalAuth` - Token optional but validated if present
   - Returns 401 if token missing, 403 if invalid

2. **Protected Routes**
   - All article, tag, feed, highlight, and user routes require authentication
   - Data automatically filtered by authenticated user's ID
   - Ownership verification on update/delete operations

3. **Auth Routes** (`back-end/routes/auth.js`)
   - `POST /api/auth/register` - Create new user, returns JWT
   - `POST /api/auth/login` - Authenticate user, returns JWT
   - `POST /api/auth/verify` - Verify token validity
   - `POST /api/auth/refresh` - Get new token
   - `POST /api/auth/logout` - Logout (client-side token removal)

## Creating Additional Users

### Via API (Postman/curl)

```bash
curl -X POST http://localhost:7001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "displayName": "Test User"
  }'
```

### Via Frontend

1. Go to auth page
2. Click "Sign up"
3. Fill in the registration form
4. Submit

## Testing Authentication

### 1. Test Protected Endpoints

Without token (should fail with 401):
```bash
curl http://localhost:7001/api/articles
```

With token:
```bash
# First login to get token
TOKEN=$(curl -X POST http://localhost:7001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo@fieldnotes.app","password":"password123"}' \
  | jq -r '.data.token')

# Use token to access protected endpoint
curl http://localhost:7001/api/articles \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Test Token Expiration

Tokens expire after 7 days (configurable via `JWT_EXPIRES_IN` in .env)

## Troubleshooting

### "Access token required" Error

**Cause**: No JWT token in localStorage or expired token

**Solutions**:
1. Login again via the auth page
2. Check browser console for token: `localStorage.getItem('authToken')`
3. Clear localStorage and login again: `localStorage.clear()`

### "Invalid credentials" Error

**Cause**: Wrong email/password or user doesn't exist

**Solutions**:
1. Verify you're using the correct credentials
2. Create a test user: `node back-end/scripts/createTestUser.js`
3. Register a new account via the signup form

### Backend Not Connecting to MongoDB

**Cause**: MongoDB connection string incorrect or network issue

**Solutions**:
1. Check `MONGODB_URI` in `.env` file
2. Verify MongoDB Atlas IP whitelist (should allow 0.0.0.0/0 for dev)
3. Check console for connection errors
4. Temporarily use mock DB: `USE_MOCK_DB=true`

### CORS Errors

**Cause**: Frontend URL not whitelisted in backend

**Solutions**:
1. Check `FRONTEND_URL` in backend `.env` (should be `http://localhost:7002`)
2. Restart backend server after changing .env

## Development Tips

### Auto-Login for Testing

The "🚀 Quick Demo Login" button on the auth page automatically logs you in with demo credentials. This is only shown in login mode for quick testing.

### Using Mock Database

To bypass MongoDB and use in-memory mock data:

```bash
# In back-end/.env
USE_MOCK_DB=true
```

**Note**: Mock DB doesn't persist data and won't require authentication setup, but is useful for quick testing.

### Checking Current User

In browser console:
```javascript
// Get stored token
localStorage.getItem('authToken')

// Get stored user
JSON.parse(localStorage.getItem('authUser'))
```

### Manual Token Testing

```javascript
// In browser console, set token manually
localStorage.setItem('authToken', 'your-jwt-token-here')
```

## Security Notes

⚠️ **IMPORTANT for Production**:

1. Change `JWT_SECRET` to a strong random string (minimum 32 characters)
2. Set `NODE_ENV=production`
3. Use HTTPS for all requests
4. Implement token refresh strategy
5. Add rate limiting to auth endpoints
6. Don't commit `.env` files to version control
7. Implement proper password reset flow
8. Add account lockout after failed attempts
9. Use secure password hashing (already using bcrypt with 10 rounds)

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/verify` | Verify token | Yes |
| POST | `/api/auth/refresh` | Refresh token | Yes |
| POST | `/api/auth/logout` | Logout user | No |

### Protected Endpoints (All Require JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/articles` | Get user's articles |
| POST | `/api/articles` | Create article |
| GET | `/api/tags` | Get user's tags |
| POST | `/api/tags` | Create tag |
| GET | `/api/feeds` | Get user's feeds |
| POST | `/api/feeds` | Create feed |
| GET | `/api/highlights` | Get user's highlights |
| POST | `/api/highlights` | Create highlight |

All protected endpoints automatically filter data by the authenticated user's ID.

## Files Modified

### Frontend
- ✅ `front-end/src/contexts/AuthContext.jsx` - NEW: Auth state management
- ✅ `front-end/src/services/api.js` - Updated: Auto-inject JWT tokens
- ✅ `front-end/src/App.jsx` - Updated: AuthProvider wrapper, auth redirects
- ✅ `front-end/src/pages/AuthPage.jsx` - Updated: Working login/register forms

### Backend
- ✅ `back-end/middleware/auth.js` - Existing: JWT verification
- ✅ `back-end/middleware/validation.js` - Existing: Input validation
- ✅ `back-end/routes/auth.js` - Existing: Auth endpoints
- ✅ `back-end/routes/*.js` - Existing: All routes protected
- ✅ `back-end/scripts/createTestUser.js` - NEW: Test user creation script

## Next Steps

1. ✅ JWT authentication working
2. ✅ All routes protected
3. ✅ Frontend properly sending tokens
4. ✅ Test user creation script
5. 🔄 **Test the application end-to-end**
6. 📝 Add token refresh logic (optional)
7. 📝 Implement password reset (optional)
8. 📝 Add user profile editing (optional)

## Support

If you encounter issues:
1. Check this README
2. Review browser console for errors
3. Check backend console for connection errors
4. Verify .env configuration
5. Try creating a new test user
6. Clear localStorage and login again
