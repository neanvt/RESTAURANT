# Troubleshooting 401 Authentication Errors

## Current Situation

You're seeing:

```
GET /api/reports/dashboard 401 6.927 ms - 87
GET /api/reports/dashboard 401 12.311 ms - 87
```

This means the backend is rejecting requests due to missing or invalid authentication.

## Root Causes & Solutions

### ✅ Code Fixes Applied

All code fixes have been completed:

- ✅ Created centralized token utility
- ✅ Updated all 13 API files
- ✅ Added toast notifications
- ✅ Added framer-motion dependency

### ⚠️ Most Likely Issue: Frontend Not Restarted

**The frontend dev server needs to be restarted to apply the changes!**

## Step-by-Step Fix

### 1. Restart Frontend Server

```bash
# Stop the current frontend server (Ctrl+C in terminal)

# Navigate to frontend directory
cd frontend

# Clear Next.js cache
rm -rf .next

# Restart the development server
npm run dev
```

### 2. Clear Browser Storage

Open browser DevTools (F12) and run:

```javascript
// Clear all auth data
localStorage.clear();
sessionStorage.clear();

// Reload page
location.reload();
```

### 3. Login Fresh

1. Navigate to `http://localhost:3000/login`
2. Enter phone number
3. Verify OTP
4. You should be redirected to dashboard

### 4. Verify Token Storage

After login, open browser console and run:

```javascript
debugAuth();
```

You should see output like:

```
🔍 Auth Debug Info
  📦 All localStorage keys: ["auth-storage"]
  🔐 auth-storage raw: {...}
  ✅ auth-storage parsed: {state: {...}}
  🎫 accessToken: EXISTS
  🔄 refreshToken: EXISTS
  👤 user: EXISTS
  🔓 isAuthenticated: true
  📝 Token preview: eyJhbGciOiJIUzI1Ni...
```

If you see "MISSING" tokens, the login didn't complete properly.

## Common Issues

### Issue 1: "No auth-storage found"

**Cause**: Not logged in or login failed

**Solution**:

1. Go to `/login`
2. Complete login flow
3. Check for any error messages
4. Verify backend is running on port 5005

### Issue 2: "Token EXISTS but still 401"

**Cause**: Token might be expired or invalid

**Solution**:

```bash
# Clear storage and login again
localStorage.clear();
location.href = '/login';
```

### Issue 3: "auth-storage has wrong format"

**Cause**: Old token format from before fixes

**Solution**:

```javascript
// Clear old format
localStorage.removeItem("auth-storage");
localStorage.removeItem("token");
localStorage.removeItem("accessToken");
localStorage.removeItem("user");

// Login again
location.href = "/login";
```

## Verification Checklist

Run these checks in order:

### ✅ 1. Backend Running

```bash
# Check if backend is running
curl http://localhost:5005/api/health

# Should return: {"status":"ok"}
```

### ✅ 2. Frontend Running

```bash
# Should be running on http://localhost:3000
# Check for compilation errors in terminal
```

### ✅ 3. Can Access Login Page

```
http://localhost:3000/login
Should load without errors
```

### ✅ 4. Firebase Configured

Check browser console for Firebase errors during login

### ✅ 5. OTP Working

- Enter phone number
- OTP should be sent
- No errors in console

### ✅ 6. Token Stored After Login

```javascript
// Run in console after successful login
debugAuth();
// Should show: hasToken: true
```

### ✅ 7. API Calls Work

```javascript
// After login, run in console:
fetch("http://localhost:5005/api/reports/dashboard", {
  headers: {
    Authorization: `Bearer ${
      JSON.parse(localStorage.getItem("auth-storage")).state.accessToken
    }`,
  },
})
  .then((r) => r.json())
  .then(console.log);
```

If this returns data (not 401), the token works!

## Debug Commands

### Check Token in Console

```javascript
// Get token
const token = JSON.parse(localStorage.getItem("auth-storage"))?.state
  ?.accessToken;
console.log("Token:", token ? "EXISTS" : "MISSING");

// Decode JWT (first part)
if (token) {
  const payload = JSON.parse(atob(token.split(".")[1]));
  console.log("Token payload:", payload);
  console.log("Token expires:", new Date(payload.exp * 1000));
}
```

### Manual API Test

```javascript
// Test API with current token
const testAPI = async () => {
  const authStorage = localStorage.getItem("auth-storage");
  if (!authStorage) {
    console.error("No auth storage found!");
    return;
  }

  const token = JSON.parse(authStorage).state?.accessToken;
  if (!token) {
    console.error("No token in auth storage!");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:5005/api/reports/dashboard",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Status:", response.status);
    const data = await response.json();
    console.log("Response:", data);
  } catch (error) {
    console.error("API Error:", error);
  }
};

testAPI();
```

## Still Getting 401?

If you've done all the above and still getting 401:

### Check Backend Logs

Look for errors like:

```
"Invalid token"
"Token expired"
"No authorization header"
"JWT verification failed"
```

### Check Token Format

The token should look like:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI...
```

If it's different or missing parts, there's an issue with backend token generation.

### Verify Backend Auth Middleware

Check if backend is using correct secret key and JWT validation.

## Quick Reset (Nuclear Option)

If nothing works, do a complete reset:

```bash
# 1. Stop both servers (Ctrl+C)

# 2. Clear all storage
# In browser console:
localStorage.clear();
sessionStorage.clear();
indexedDB.deleteDatabase('firebaseLocalStorageDb');

# 3. Clear Next.js cache
cd frontend
rm -rf .next node_modules/.cache

# 4. Restart backend
cd ../backend
npm run dev

# 5. In new terminal, restart frontend
cd ../frontend
npm run dev

# 6. Open fresh incognito window
# 7. Navigate to http://localhost:3000/login
# 8. Complete login flow
# 9. Check if dashboard loads
```

## Success Indicators

You'll know it's working when:

- ✅ Login redirects to `/dashboard`
- ✅ Dashboard shows data (not loading forever)
- ✅ No 401 errors in Network tab
- ✅ `debugAuth()` shows token EXISTS
- ✅ API calls return 200 status

## Need More Help?

Run this complete diagnostic:

```javascript
// Complete diagnostic
const diagnostic = async () => {
  console.group("🔬 Complete Diagnostic");

  // 1. Check auth storage
  const auth = localStorage.getItem("auth-storage");
  console.log("1. Auth Storage:", auth ? "✅ EXISTS" : "❌ MISSING");

  if (auth) {
    const parsed = JSON.parse(auth);
    const token = parsed.state?.accessToken;
    console.log("2. Token:", token ? "✅ EXISTS" : "❌ MISSING");

    if (token) {
      // 3. Test API
      try {
        const res = await fetch("http://localhost:5005/api/reports/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(
          "3. API Test:",
          res.status === 200 ? "✅ SUCCESS" : `❌ FAILED (${res.status})`
        );

        if (res.status !== 200) {
          const error = await res.text();
          console.log("   Error:", error);
        }
      } catch (e) {
        console.log("3. API Test:", "❌ NETWORK ERROR", e.message);
      }
    }
  }

  console.groupEnd();
};

diagnostic();
```

Copy the output and share if you need further assistance!
