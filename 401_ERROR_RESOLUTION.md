# 401 Error Resolution - Firebase Admin SDK Initialization

## Problem

Backend API endpoint `/api/auth/verify-otp` was returning **401 Unauthorized** when the frontend tried to verify OTP with Firebase ID token.

## Root Cause

The Firebase Admin SDK was not properly initialized because environment variables were not loaded at the right time.

### Sequence of Events (Before Fix):

1. `backend/src/server.ts` imports `app` from `./app.ts`
2. `app.ts` imports all route files
3. Route files import controller files
4. Controller files import service files (including `otpService`)
5. `otpService` constructor runs immediately, trying to read `process.env.FIREBASE_*` variables
6. **At this point, `dotenv.config()` hasn't been called yet!**
7. All Firebase env variables are `undefined`
8. Firebase Admin SDK fails to initialize
9. `otpService.verifyOTP()` returns error: "Firebase is not initialized"
10. Controller returns 401 status

## Solution

Move `dotenv.config()` to the **very first line** before any other imports in `backend/src/server.ts`:

```typescript
import dotenv from "dotenv";

// Load environment variables FIRST, before any other imports
dotenv.config();

import app from "./app";
import { connectDatabase } from "./config/database";
import logger from "./utils/logger";
```

## Verification

After the fix, the terminal shows successful initialization:

```
🔧 Firebase Admin SDK initialization...
   Project ID: ✓
   Private Key: ✓ (length: 1704)
   Client Email: ✓
✅ Firebase Admin SDK initialized successfully
```

## Test the Fix

### 1. Backend is running on port 5005

```bash
curl http://localhost:5005/api/health
# Should return: {"status":"ok",...}
```

### 2. Test OTP flow with test phone numbers:

- **Phone:** +91 99170 85800, **Code:** 234567
- **Phone:** +91 82186 99051, **Code:** 987654
- **Phone:** +91 70889 70099, **Code:** 123456

### 3. Login flow:

1. Go to http://localhost:3000/login
2. Enter test phone number: `9917085800`
3. Solve reCAPTCHA
4. Firebase sends OTP to phone (or use test code: 234567)
5. Enter OTP code: `234567`
6. Frontend gets Firebase ID token
7. Frontend sends ID token to `/api/auth/verify-otp`
8. Backend verifies token with Firebase Admin SDK ✅
9. Backend creates/finds user in MongoDB
10. Backend returns JWT tokens
11. User is logged in successfully

## Files Modified

- `backend/src/server.ts` - Moved `dotenv.config()` before imports
- `backend/src/services/otpService.ts` - Added detailed logging for debugging

## Important Notes

### Environment Variable Loading Order

Always load environment variables **before** any other imports that might use them:

```typescript
// ✅ CORRECT
import dotenv from "dotenv";
dotenv.config();
import { MyService } from "./services";

// ❌ WRONG
import { MyService } from "./services";
import dotenv from "dotenv";
dotenv.config();
```

### Firebase Credentials Required

Ensure these variables are set in `backend/.env`:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY` (with newlines as `\n`)
- `FIREBASE_CLIENT_EMAIL`

### Test Phone Numbers

Firebase requires test phone numbers to be configured in Firebase Console > Authentication > Sign-in method > Phone > Phone numbers for testing.

## Status

✅ **RESOLVED** - Backend server successfully initializes Firebase Admin SDK and can verify OTP tokens.
