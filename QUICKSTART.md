# 🚀 Quick Start - JWT Authentication

## TL;DR - Get Started in 3 Steps

### 1. Start Backend
```bash
cd back-end
npm start
```
✅ Should see: "Connected to MongoDB Atlas" and "Server running on port 7001"

### 2. Start Frontend
```bash
cd front-end  
npm run dev
```
✅ Should see: "Local: http://localhost:5173/" (or similar)

### 3. Login
- Navigate to the app in your browser
- Click "Get Started"
- Click **"🚀 Quick Demo Login (dev)"** button

**Demo Credentials** (if needed):
- Email: `demo@fieldnotes.app`
- Password: `password123`

---

## ✅ What's Working Now

- ✅ JWT authentication on all API endpoints
- ✅ Frontend sends tokens automatically
- ✅ Login/Register forms functional
- ✅ Auth state managed globally
- ✅ Test user created in MongoDB
- ✅ "Access token required" errors fixed

---

## 📝 Test User Info

**Email**: `demo@fieldnotes.app`  
**Password**: `password123`  
**User ID**: `692cd73b55793bcaa23e9683`

To recreate:
```bash
cd back-end
node scripts/createTestUser.js
```

---

## 🔧 Environment Setup

**Backend** needs `.env` file (already created):
```bash
cd back-end
# .env file exists with MongoDB URI and JWT_SECRET
```

**Frontend** - No .env needed for basic usage

---

## 🐛 Troubleshooting

### "Access token required" error?
→ **Login first!** Click the demo login button

### Backend won't start?
→ Check `.env` file exists in `back-end/` directory

### Can't login?
→ Run: `node back-end/scripts/createTestUser.js`

### Frontend errors?
→ Clear browser: `localStorage.clear()` then refresh

---

## 📚 More Info

- **Full Guide**: `JWT_SETUP_GUIDE.md`
- **Summary**: `JWT_IMPLEMENTATION_SUMMARY.md`
- **Sprint Requirements**: `instructions-3-database.md`

---

## 🎯 What Changed

**The Problem**: Backend required JWT tokens but frontend wasn't sending them

**The Solution**: 
1. Created AuthContext to manage login state
2. Updated API service to include tokens in requests
3. Made login/register pages functional
4. Created test user for quick login

**Result**: Authentication now works end-to-end! 🎉
