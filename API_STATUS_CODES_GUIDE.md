# 🐛 API Status Codes - Troubleshooting Guide

## Overview of Errors from Your Logs

```
GET /api/health/policies 400 in 9157ms     ❌ Bad Request
GET /api/insurance/policies 404 in 10889ms ❌ Not Found
```

---

## ❌ HTTP 400 - Bad Request

### What It Means
The server received the request but it was malformed or missing required data.

### For `/api/health/policies`

**Common Causes**:
1. **Missing `userId` Query Parameter**
   ```
   ❌ GET /api/health/policies
   ✅ GET /api/health/policies?userId=123
   ```

2. **Invalid `userId` Format**
   ```
   ❌ GET /api/health/policies?userId=
   ✅ GET /api/health/policies?userId=abc123def456
   ```

3. **Missing Authentication Token**
   ```
   ❌ GET /api/health/policies?userId=123
   ✅ GET /api/health/policies?userId=123 
         -H "Authorization: Bearer token_here"
   ```

### Solution
Ensure frontend is sending:
```javascript
// Correct implementation
const userId = user?.id;
if (!userId) {
  console.error("User ID not available");
  return;
}

const response = await fetch(
  `/api/health/policies?userId=${userId}`,
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);

if (!response.ok) {
  const error = await response.json();
  console.error("Error:", error);
}
```

---

## ❌ HTTP 404 - Not Found

### What It Means
The requested endpoint does not exist on the server.

### For `/api/insurance/policies`

**Possible Causes**:
1. **Route Not Registered**
   - Insurance routes might not be properly imported in `app.js`
   
2. **Wrong Endpoint Path**
   ```
   ❌ /api/insurance/policy          (wrong - singular)
   ✅ /api/insurance/policies         (correct - plural)
   ```

3. **Typo in Route**
   ```
   ❌ /api/insurance/polcies          (typo)
   ✅ /api/insurance/policies         (correct)
   ```

### Verification
Check that `backend/src/app.js` has:
```javascript
import insuranceRoutes from "./routes/insuranceRoutes.js";
app.use("/api/insurance", insuranceRoutes);
```

And `backend/src/routes/insuranceRoutes.js` has:
```javascript
router.get('/policies', insuranceController.getUserPolicies);
```

### Solution
If still getting 404:
1. **Restart Backend**
   ```bash
   cd backend
   npm run dev
   ```

2. **Clear Cache**
   - Browser: Ctrl+Shift+Delete
   - Restart frontend: npm run dev

3. **Verify Routes**
   ```bash
   # In backend directory
   npm run dev
   
   # In another terminal, test:
   curl http://localhost:4000/api/insurance/policies?userId=test
   ```

---

## 🧪 Quick Diagnosis Tests

### Test 1: Check if Backend is Running
```bash
curl http://localhost:4000/
# Expected: "IWAS Backend Running"
```

### Test 2: Check Health Routes
```bash
curl http://localhost:4000/api/health/plans
# Expected: 200 OK with plans array
```

### Test 3: Check Insurance Routes
```bash
curl "http://localhost:4000/api/insurance/policies?userId=test"
# Expected: 200 OK with empty array (no userId match) or policies
```

### Test 4: Check with Valid User
```bash
# First, get admin user ID
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@iwas.com","password":"Arjun@16"}'

# Then use that ID
curl "http://localhost:4000/api/health/policies?userId=ACTUAL_USER_ID"
```

---

## 📊 Common Response Patterns

### 200 OK - Success
```json
{
  "status": 200,
  "data": [...]
}
```
✅ Everything working correctly

### 400 Bad Request
```json
{
  "error": "userId is required"
}
```
⚠️ Check request parameters

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```
⚠️ Check authentication token

### 404 Not Found
```json
{
  "error": "Route not found"
}
```
⚠️ Check endpoint path and backend

### 500 Server Error
```json
{
  "error": "Internal server error"
}
```
⚠️ Check backend logs for details

---

## 🔧 Step-by-Step Fix

### Step 1: Stop Everything
```bash
# Kill backend and frontend
Ctrl+C in both terminals
```

### Step 2: Verify Files
Check that these files exist and are correct:
- [ ] `backend/src/app.js` - has health routes import
- [ ] `backend/src/routes/healthInsuranceRoutes.js` - exists
- [ ] `backend/src/routes/insuranceRoutes.js` - exists

### Step 3: Restart Backend
```bash
cd backend
npm run dev

# Expected output:
# MongoDB connected
# Server running on port 4000
```

### Step 4: Restart Frontend
```bash
npm run dev

# Expected output:
# Local: http://localhost:3000
```

### Step 5: Clear Cache
- Press F12 to open DevTools
- Right-click on refresh button → "Empty cache and hard refresh"
- Or use Ctrl+Shift+R

### Step 6: Test
- Go to http://localhost:3000/admin
- Check console (F12) for any errors
- Should see successful API calls (200 status)

---

## 🎯 Expected vs Actual

### Before Fix
```
❌ GET /api/health/policies 400 in 9157ms
❌ GET /api/insurance/policies 404 in 10889ms
```

### After Fix
```
✅ GET /api/health/policies 200 in 150ms
✅ GET /api/insurance/policies 200 in 200ms
```

---

## 📝 Debug Tips

### Enable Detailed Logging
Add to `backend/src/app.js`:
```javascript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

### Check Network Tab
1. Open DevTools (F12)
2. Go to "Network" tab
3. Refresh page
4. Look for failed requests (red status codes)
5. Click on request to see details

### Check Console Tab
1. Open DevTools (F12)
2. Go to "Console" tab
3. Look for error messages
4. Expand errors to see stack trace

---

## 🆘 Still Not Working?

1. **Verify MongoDB is running**
   ```bash
   mongosh mongodb://127.0.0.1:27017/iwas
   ```

2. **Check backend console output**
   - Look for "MongoDB connected"
   - Look for error messages

3. **Try direct API test**
   ```bash
   curl http://localhost:4000/api/health/plans
   ```

4. **Restart everything**
   - Kill both frontend and backend
   - Close browser
   - Run backend: `npm run dev`
   - Run frontend: `npm run dev`
   - Go to http://localhost:3000

5. **Check the logs**
   - Admin Dashboard page shows what's happening
   - Backend console shows request logs
   - Browser console shows frontend errors

---

**Status**: 🔧 Issue Identified & Fix Applied
**Next**: Restart backend and test endpoints
