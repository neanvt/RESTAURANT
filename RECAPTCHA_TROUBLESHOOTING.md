# reCAPTCHA Troubleshooting Guide

## Common Issues and Solutions

### 1. "Failed to initialize reCAPTCHA Enterprise config"

**Status**: ⚠️ Warning (Not an Error)

This warning is **expected** and **harmless**. Firebase tries to initialize reCAPTCHA Enterprise first, then falls back to reCAPTCHA v2, which is what we're using.

**Solution**: Ignore this warning. The authentication will work correctly.

---

### 2. SecurityError: Protocol Mismatch (HTTPS vs HTTP)

**Error Message:**

```
SecurityError: Failed to read a named property from 'Window':
Blocked a frame with origin "https://www.google.com" from accessing
a frame with origin "http://localhost:3000". Protocols must match.
```

**Cause**: Google's reCAPTCHA (HTTPS) tries to communicate with localhost (HTTP), causing a security error in browsers.

**Solutions**:

#### Option A: Use Normal (Visible) reCAPTCHA

Changed in `frontend/src/hooks/useAuth.ts` - reCAPTCHA size set to "normal" instead of "invisible":

```typescript
recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
  size: "normal", // Changed from "invisible"
  callback: () => {
    console.log("reCAPTCHA verified successfully");
  },
});
```

**This is the current configuration** - users will see the reCAPTCHA checkbox.

#### Option B: Use Firebase Test Phone Numbers (Recommended for Development)

Test phone numbers bypass reCAPTCHA entirely. Configured in Firebase Console:

- **+91 99170 85800** → Code: `234567`
- **+91 82186 99051** → Code: `987654`
- **+91 70889 70099** → Code: `123456`

**To use:**

1. Go to http://localhost:3000/login
2. Enter test phone: `9917085800` (without +91)
3. Click "Send OTP" - reCAPTCHA will still appear but won't block
4. Enter code: `234567`
5. Login successful ✅

#### Option C: Use HTTPS in Development (Advanced)

Set up local HTTPS with mkcert or similar tools. This matches Google's protocol.

---

### 3. Manifest Syntax Error

**Error**: `Manifest: Line: 1, column: 1, Syntax error.`

**Cause**: Browser caching old manifest or serving issue.

**Solutions**:

1. **Hard Refresh**: Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

2. **Clear Browser Cache**:

   - Chrome DevTools → Application → Storage → Clear site data
   - Or disable cache while DevTools is open

3. **Verify Manifest**:

   ```bash
   cat frontend/public/manifest.json
   ```

   Should show valid JSON without errors.

4. **Restart Frontend** (if needed):
   ```bash
   cd frontend
   npm run dev
   ```

---

## Current Configuration

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5005/api
NEXT_PUBLIC_FIREBASE_PROJECT_ID=restopos-15a94
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDAVPvjZX1m5FD3qufBRUfrvWVrG4_b4wY
```

### Backend (.env)

```env
PORT=5005
FIREBASE_PROJECT_ID=restopos-15a94
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@restopos-15a94.iam.gserviceaccount.com
```

---

## Testing Authentication

### Method 1: Using Test Phone Numbers (Easiest)

1. Navigate to http://localhost:3000/login
2. Enter: `9917085800`
3. Complete reCAPTCHA (checkbox will appear)
4. Enter OTP: `234567`
5. ✅ Login successful

### Method 2: Using Real Phone Numbers

1. Navigate to http://localhost:3000/login
2. Enter your 10-digit phone number
3. Complete reCAPTCHA verification (checkbox)
4. Wait for SMS with OTP code
5. Enter the received OTP code
6. ✅ Login successful

---

## Verification Steps

### 1. Backend Health Check

```bash
curl http://localhost:5005/api/health
```

**Expected**: `{"status":"ok",...}`

### 2. Check Backend Logs

Should show:

```
✅ Firebase Admin SDK initialized successfully
   Project ID: ✓
   Private Key: ✓ (length: 1704)
   Client Email: ✓
```

### 3. Test OTP Verification

Backend logs should show on successful login:

```
POST /api/auth/verify-otp 200 229.937 ms - 627
```

---

## Browser Console Warnings (Safe to Ignore)

### ✅ Safe Warnings:

- `Failed to initialize reCAPTCHA Enterprise config` - Expected fallback behavior
- `[Fast Refresh] rebuilding/done` - Next.js hot reload
- `Duplicate schema index on {"phone":1}` - Mongoose warning (won't affect functionality)

### ⚠️ Warnings to Fix:

- `SecurityError: Protocol mismatch` - Fixed by using normal reCAPTCHA size
- `Manifest syntax error` - Fixed with valid manifest.json

### ❌ Actual Errors:

- `401 Unauthorized` - **RESOLVED** ✅
- `Firebase credentials not found` - **RESOLVED** ✅

---

## Production Recommendations

For production deployment:

1. **Use Invisible reCAPTCHA** (works fine on HTTPS)
2. **Remove test phone numbers** from Firebase Console
3. **Enable reCAPTCHA Enterprise** for better bot protection
4. **Use environment-specific Firebase projects**
5. **Add proper PWA icons** to manifest.json

---

## Quick Reference

| Issue                        | Status     | Action                            |
| ---------------------------- | ---------- | --------------------------------- |
| reCAPTCHA Enterprise warning | ⚠️ Safe    | Ignore                            |
| Protocol mismatch error      | ✅ Fixed   | Using normal reCAPTCHA            |
| 401 Error                    | ✅ Fixed   | dotenv.config() order fixed       |
| Manifest syntax              | ✅ Fixed   | Valid JSON, clear cache           |
| Test phone authentication    | ✅ Working | Use codes: 234567, 987654, 123456 |

---

## Support

If you encounter issues:

1. Check backend logs for Firebase initialization
2. Verify `.env` files have correct values
3. Clear browser cache and restart dev servers
4. Use test phone numbers for reliable testing
