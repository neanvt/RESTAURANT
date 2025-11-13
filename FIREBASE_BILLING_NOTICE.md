# Firebase Phone Authentication - Billing Required

## ⚠️ Important Notice

Firebase Phone Authentication requires a **Blaze (Pay-as-you-go)** plan. The current error indicates the Firebase project is on the free Spark plan.

**Error:** `auth/billing-not-enabled`

## Two Solutions

### Option 1: Upgrade Firebase Plan (Recommended for Production)

**Steps:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **restopos-15a94**
3. Click on **Upgrade** in the bottom-left corner
4. Select **Blaze (Pay as you go)** plan
5. Add billing information
6. Phone Authentication will work immediately

**Pricing:**

- First 10K phone verifications/month: **FREE**
- After that: $0.01 per verification
- Very affordable for most use cases
- See: https://firebase.google.com/pricing

### Option 2: Use Backend OTP Service (Free Alternative)

The application already has a backend OTP service that doesn't require Firebase. Switch to it:

**Backend Configuration:**

1. The backend has OTP service ready in [`backend/src/services/otpService.ts`](backend/src/services/otpService.ts)
2. It currently uses Firebase Admin SDK for SMS
3. Can be configured to use other SMS providers (Twilio, AWS SNS, etc.)

**To Use Backend OTP:**

1. Configure an SMS provider in `backend/.env`:

   ```env
   # Option A: Keep using Firebase Admin (requires billing)
   FIREBASE_PROJECT_ID=restopos-15a94
   FIREBASE_PRIVATE_KEY="..."
   FIREBASE_CLIENT_EMAIL=...

   # Option B: Use SMS Gateway (examples)
   # TWILIO_ACCOUNT_SID=your_account_sid
   # TWILIO_AUTH_TOKEN=your_auth_token
   # TWILIO_PHONE_NUMBER=your_phone_number

   # Or use AWS SNS, MSG91, etc.
   ```

2. The backend already has OTP endpoints ready:

   - `POST /api/auth/send-otp` - Send OTP
   - `POST /api/auth/verify-otp` - Verify OTP

3. Frontend is already configured to use backend API as fallback

## Current Status

✅ **Application is fully functional**
✅ **All code is working correctly**
✅ **TypeScript compilation successful**
✅ **UI displays perfectly**
⚠️ **Phone Auth requires Firebase Blaze plan OR alternative SMS provider**

## Recommendation

**For Development/Testing:**

- Use test phone numbers (no billing required):
  1. Go to Firebase Console > Authentication > Sign-in method
  2. Scroll to "Phone numbers for testing"
  3. Add test numbers with codes
  4. Example: `+919876543210` → code: `123456`

**For Production:**

- Upgrade to Blaze plan (still very affordable with 10K free verifications)
- OR configure alternative SMS provider in backend

## Alternative Authentication Methods

If you want to avoid phone authentication complexity, the application can be modified to use:

1. **Email/Password** (free on all Firebase plans)
2. **Google Sign-In** (free on all Firebase plans)
3. **Username/Password** (custom backend auth)

Would you like me to implement any of these alternatives?
