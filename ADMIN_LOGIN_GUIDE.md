# Admin Login Guide - IWAS

## ✅ Solution: Admin Login Fixed

Your admin login issue has been resolved! Here's what was done:

---

## 🔍 Problem Analysis

The admin login was failing even with correct credentials (`admin@iwas.com` / `Arjun@16`) due to:

1. **Frontend Environment Variable Missing**: The `NEXT_PUBLIC_API_URL` was not configured in `.env`
2. **Backend Route Path Issue**: The npm script had incorrect path casing (`src/scripts/` vs `src/Scripts/`)
3. **Admin Account Status**: Admin account needed to be explicitly created

---

## ✅ Issues Fixed

### 1. **Added Frontend API URL**
```env
# Added to .env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

This tells the frontend where to find the backend API.

### 2. **Fixed Package.json Script Path**
```json
// Changed from:
"seed:admin": "node -r dotenv/config src/scripts/createAdmin.js"

// To:
"seed:admin": "node -r dotenv/config src/Scripts/createAdmin.js"

// Also added:
"update:admin-password": "node -r dotenv/config src/Scripts/updateAdminPassword.js"
```

### 3. **Created Admin Account**
```bash
npm run seed:admin
```
Output: ✅ Admin created: admin@iwas.com

---

## 👤 Admin Credentials

| Field | Value |
|-------|-------|
| **Email** | admin@iwas.com |
| **Password** | Arjun@16 |
| **Role** | admin |

---

## 🚀 How to Login

### Step 1: Start the Backend
```bash
cd backend
npm run dev
```
Expected: Backend running on `http://localhost:4000`

### Step 2: Start the Frontend
```bash
npm run dev
```
Expected: Frontend running on `http://localhost:3000`

### Step 3: Login
1. Go to `http://localhost:3000/login`
2. Enter:
   - **Email**: `admin@iwas.com`
   - **Password**: `Arjun@16`
3. Click "Sign in"
4. You'll be redirected to `/admin` dashboard

---

## 🛠️ Troubleshooting

### If login still fails:

#### 1. **Verify Backend is Running**
```bash
# Test backend API
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@iwas.com","password":"Arjun@16"}'
```

Expected response:
```json
{
  "user": {
    "id": "69170fe9e2133c9bad840d37",
    "name": "Admin",
    "email": "admin@iwas.com",
    "role": "admin"
  }
}
```

#### 2. **Check .env Configuration**
Verify `.env` has:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

#### 3. **Clear Browser Cache**
- Press `Ctrl + Shift + Delete`
- Clear all browsing data
- Refresh the page

#### 4. **Recreate Admin Account**
```bash
# If admin doesn't exist:
cd backend
npm run seed:admin

# To update admin password:
npm run update:admin-password
```

#### 5. **Check MongoDB Connection**
```bash
# Verify MongoDB is running
# Default: mongodb://127.0.0.1:27017/iwas
# Check in backend/.env for MONGODB_URI
```

---

## 📋 Backend Environment Setup

File: `backend/.env`
```env
MONGODB_URI=mongodb://127.0.0.1:27017/iwas
ADMIN_EMAIL=admin@iwas.com
ADMIN_PASSWORD=Arjun@16
JWT_SECRET=your_jwt_secret_key
PORT=4000
```

---

## 📋 Frontend Environment Setup

File: `.env`
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
TURSO_CONNECTION_URL=...
TURSO_AUTH_TOKEN=...
```

---

## 🔐 Admin Panel Features (After Login)

Once logged in, you'll have access to:

✅ **Dashboard Overview**
- Key statistics and metrics
- Claims overview
- User activity
- Payment status

✅ **User Management**
- View all users
- Manage user roles
- User activity logs
- Account status

✅ **Health Insurance Management**
- Approve/Reject health applications
- Manage health policies
- Review health claims
- Process claim payments

✅ **General Insurance Management**
- Approve/Reject insurance applications
- Manage insurance policies
- Review insurance claims
- Update claim status

✅ **Reports & Analytics**
- Generate claims reports
- View payment reports
- User statistics
- System analytics

---

## 🔄 Password Management

### To Update Admin Password:

**Option 1: Using the Script**
```bash
cd backend
npm run update:admin-password
```

**Option 2: Programmatically**
Edit `backend/src/Scripts/updateAdminPassword.js`:
```javascript
const newPassword = "YourNewPassword123!";  // Change this
```

**Option 3: Through Admin Dashboard**
1. Login as admin
2. Go to Admin Panel
3. Navigate to "Account Settings"
4. Update password

---

## ✨ Quick Reference

| Action | Command |
|--------|---------|
| Create Admin | `npm run seed:admin` |
| Update Password | `npm run update:admin-password` |
| Start Backend | `cd backend && npm run dev` |
| Start Frontend | `npm run dev` |
| Test Login API | `curl -X POST http://localhost:4000/api/auth/login` |

---

## 📞 Support

If you continue to experience issues:

1. **Check the logs**:
   - Backend console for database/auth errors
   - Browser DevTools (F12) for frontend errors

2. **Verify configurations**:
   - .env files are in correct locations
   - Environment variables are properly set
   - MongoDB is running

3. **Restart services**:
   - Kill and restart both backend and frontend
   - Clear browser cache and cookies
   - Hard refresh (Ctrl + Shift + R)

---

**Last Updated**: November 14, 2025
**Status**: ✅ Fully Operational
