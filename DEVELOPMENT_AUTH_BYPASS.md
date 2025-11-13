# Development Authentication Bypass

## Problem

Even Firebase test phone numbers require the Blaze (paid) plan to be enabled. The test numbers don't bypass billing - they only reduce SMS costs during testing.

## Solution: Development Bypass Mode

I've provided a simple development-only authentication bypass that allows you to test the application without any Firebase billing or configuration.

## How to Use

### Option 1: Use Any Phone Number (Dev Mode)

In development mode, the application will accept ANY phone number and ANY 6-digit code:

1. Go to `http://localhost:3000/login`
2. Enter any 10-digit phone number (e.g., `9999999999`)
3. Click "Send OTP"
4. Enter any 6-digit code (e.g., `123456`)
5. Click "Verify"
6. You'll be logged in!

### Option 2: Skip OTP Entirely

For even faster development, you can bypass the entire OTP flow:

1. Enter any phone number
2. App automatically logs you in without OTP

## Important Notes

⚠️ **This is for DEVELOPMENT ONLY**

- Do NOT use in production
- Remove bypass before deploying
- Firebase billing is still required for production

✅ **What You Can Test**

- Complete application workflow
- All POS features
- Order management
- Invoice generation
- Reports and analytics

## Switching Back to Firebase

When ready for production with real SMS:

1. Enable Firebase Blaze plan
2. Remove development bypass code
3. Firebase authentication will work normally

## Current Status

Your application is **fully functional for development**:

- ✅ All features working
- ✅ No billing required for testing
- ✅ Test all POS functionality
- ✅ Switch to real auth when ready

## Firebase Billing (For Production)

When you're ready to go live:

- Cost: FREE for first 10,000 verifications/month
- Very affordable after that
- Your configured test numbers will work immediately
