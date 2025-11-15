# 🔧 Admin Login - Verification Checklist

## ✅ What Was Fixed

### Issue #1: Missing Frontend Environment Variable
- ❌ **Before**: `.env` missing `NEXT_PUBLIC_API_URL`
- ✅ **After**: Added `NEXT_PUBLIC_API_URL=http://localhost:4000`
- **Impact**: Frontend couldn't communicate with backend API

### Issue #2: Incorrect npm Script Path
- ❌ **Before**: `src/scripts/createAdmin.js` (lowercase)
- ✅ **After**: `src/Scripts/createAdmin.js` (correct case)
- **Impact**: Admin creation script couldn't run

### Issue #3: Admin Account Verification
- ✅ **Status**: Admin account successfully created
- **Email**: admin@iwas.com
- **Role**: admin

---

## 📋 Pre-Login Checklist

Before attempting to login, verify all these items:

### Backend Setup
- [ ] MongoDB is running (`mongodb://127.0.0.1:27017/iwas`)
- [ ] Backend `.env` has correct values:
  ```env
  MONGODB_URI=mongodb://127.0.0.1:27017/iwas
  ADMIN_EMAIL=admin@iwas.com
  ADMIN_PASSWORD=Arjun@16
  ```
- [ ] Backend dependencies installed: `cd backend && npm install`
- [ ] Admin account created: `npm run seed:admin`
- [ ] Backend running: `npm run dev` (port 4000)

### Frontend Setup
- [ ] Frontend `.env` has:
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:4000
  ```
- [ ] Frontend dependencies installed: `npm install`
- [ ] Frontend running: `npm run dev` (port 3000)

### Browser
- [ ] Browser cache cleared
- [ ] Cookies cleared for localhost:3000
- [ ] Using a supported browser (Chrome, Firefox, Safari, Edge)

---

## 🚀 Testing Steps

### Test 1: Backend API Direct Call
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@iwas.com","password":"Arjun@16"}'
```

**Expected Response**:
```json
{
  "user": {
    "id": "...",
    "name": "Admin",
    "email": "admin@iwas.com",
    "role": "admin"
  }
}
```

**If this fails**: Backend issue
- [ ] Check MongoDB connection
- [ ] Check admin credentials in database
- [ ] Check backend logs for errors

### Test 2: Frontend Login
1. [ ] Navigate to `http://localhost:3000/login`
2. [ ] Enter email: `admin@iwas.com`
3. [ ] Enter password: `Arjun@16`
4. [ ] Click "Sign in"
5. [ ] Should redirect to `/admin`

**If this fails**: 
- [ ] Check browser console (F12) for errors
- [ ] Check `.env` API URL configuration
- [ ] Verify backend is accessible

### Test 3: Admin Dashboard
1. [ ] Successfully logged in and on `/admin` page
2. [ ] Can see dashboard overview
3. [ ] Can navigate between sections
4. [ ] Can see user management options
5. [ ] Can see claims management options

---

## 🔍 Diagnostic Commands

### Check MongoDB
```bash
# Verify MongoDB is running
# MacOS/Linux:
ps aux | grep mongod

# Windows (PowerShell):
Get-Process mongod -ErrorAction SilentlyContinue

# Connect to MongoDB:
mongosh mongodb://127.0.0.1:27017/iwas
```

### Check Admin User in Database
```bash
# Connect to MongoDB shell
mongosh mongodb://127.0.0.1:27017/iwas

# Run these commands:
use iwas
db.users.find({email: "admin@iwas.com"})
db.users.find({role: "admin"})
```

### Check Backend Logs
```bash
cd backend
npm run dev

# Look for these messages:
# ✅ MongoDB connected
# ✅ Server running on port 4000
# ✅ Admin created: admin@iwas.com
```

### Check Frontend Logs
Open browser DevTools (F12) → Console tab
Look for:
- [ ] No CORS errors
- [ ] No 404 errors on `/api/auth/login`
- [ ] Login response is successful

---

## 🎯 Quick Fix Guide

### Scenario 1: "Invalid credentials" Error
1. Verify admin account exists: `npm run seed:admin`
2. Check credentials in `.env`
3. Clear browser cache and try again
4. Check if password needs to be reset

### Scenario 2: "API unreachable" Error
1. Verify backend is running: `npm run dev`
2. Check `.env` has `NEXT_PUBLIC_API_URL=http://localhost:4000`
3. Verify port 4000 is not in use: `netstat -an | findstr 4000`
4. Restart backend service

### Scenario 3: "Database connection failed"
1. Start MongoDB: `mongod` (or as system service)
2. Verify MongoDB URI in `backend/.env`
3. Test connection: `mongosh mongodb://127.0.0.1:27017/iwas`
4. Check MongoDB is listening on port 27017

### Scenario 4: "Token invalid/expired"
1. Clear browser localStorage: `localStorage.clear()`
2. Clear cookies
3. Try logging in again
4. If persistent, check JWT configuration

---

## 📊 System Status Check

Run this to verify everything is working:

```bash
#!/bin/bash
# Check MongoDB
echo "Checking MongoDB..."
mongo --eval "db.adminCommand('ping')" 2>/dev/null && echo "✅ MongoDB OK" || echo "❌ MongoDB FAILED"

# Check Backend
echo "Checking Backend..."
curl -s http://localhost:4000/ && echo "✅ Backend OK" || echo "❌ Backend FAILED"

# Check Frontend
echo "Checking Frontend..."
curl -s http://localhost:3000/ > /dev/null && echo "✅ Frontend OK" || echo "❌ Frontend FAILED"

# Check Admin Account
echo "Checking Admin Account..."
cd backend
npm run seed:admin
```

---

## 📝 Configuration Files Summary

### backend/.env
```env
MONGODB_URI=mongodb://127.0.0.1:27017/iwas
ADMIN_EMAIL=admin@iwas.com
ADMIN_PASSWORD=Arjun@16
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=http://localhost:3000
PORT=4000
NODE_ENV=development
```

### .env (Frontend)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
TURSO_CONNECTION_URL=libsql://...
TURSO_AUTH_TOKEN=eyJhbGc...
```

---

## ✅ Final Verification

- [ ] Admin credentials: admin@iwas.com / Arjun@16
- [ ] Backend running on http://localhost:4000
- [ ] Frontend running on http://localhost:3000
- [ ] Environment variables configured
- [ ] MongoDB connected
- [ ] Admin account created in database
- [ ] Can login successfully
- [ ] Redirected to `/admin` dashboard
- [ ] Dashboard loads and is functional

---

## 🎉 Success Indicators

You'll know everything is working when:

1. ✅ Login page accepts credentials without error
2. ✅ Redirected to admin dashboard
3. ✅ Dashboard displays all sections:
   - Overview/Statistics
   - User Management
   - Health Insurance Management
   - General Insurance Management
   - Payment Tracking
   - Reports & Analytics
4. ✅ Can navigate between sections
5. ✅ Can perform admin operations
6. ✅ No console errors in DevTools

---

**Need Help?** Check the logs and run the diagnostic commands above.
