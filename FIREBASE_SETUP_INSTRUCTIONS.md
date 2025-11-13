# Firebase Phone Authentication Setup Instructions

## ⚠️ Important: Phone Authentication Configuration Required

The application is currently showing the error: `Firebase: Error (auth/configuration-not-found)` because Phone Authentication needs to be enabled in the Firebase Console.

## Step-by-Step Setup

### 1. Enable Phone Authentication in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **restopos-15a94**
3. Navigate to **Authentication** in the left sidebar
4. Click on the **Sign-in method** tab
5. Find **Phone** in the list of providers
6. Click on **Phone** to enable it
7. Toggle the **Enable** switch to ON
8. Click **Save**

### 2. Add Test Phone Numbers (Optional - for development)

For testing without sending actual SMS:

1. In the same **Sign-in method** page, scroll down to **Phone numbers for testing**
2. Click **Add phone number**
3. Add test numbers with their verification codes:
   - Phone: `+919876543210`
   - Code: `123456`
4. Click **Add**

### 3. Configure reCAPTCHA (Required for production)

Firebase Phone Auth uses reCAPTCHA for verification:

1. The application will automatically use reCAPTCHA v2
2. For production, you may want to upgrade to reCAPTCHA Enterprise:
   - Go to **Authentication** > **Settings**
   - Enable **reCAPTCHA Enterprise** if needed

### 4. Verify Firebase Configuration

Ensure all environment variables are set in `frontend/.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDAVPvjZX1m5FD3qufBRUfrvWVrG4_b4wY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=restopos-15a94.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=restopos-15a94
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=restopos-15a94.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=367863495242
NEXT_PUBLIC_FIREBASE_APP_ID=1:367863495242:android:da836b0356f0f75a1384b3
```

### 5. Restart the Application

After enabling Phone Auth in Firebase Console:

```bash
# Restart frontend
cd frontend
npm run dev
```

### 6. Test the Login

1. Go to `http://localhost:3000/login`
2. Enter a valid Indian phone number (e.g., `9876543210`)
3. Click **Send OTP**
4. You should receive an OTP via SMS (or use test number code)
5. Enter the OTP to complete login

## Alternative: Use Backend OTP Service

If you don't want to use Firebase Phone Auth, you can use the backend's OTP service:

1. Ensure backend is running: `cd backend && npm run dev`
2. The backend has an SMS gateway integration (requires configuration)
3. Update frontend to call backend API instead of Firebase Auth

## Troubleshooting

### Error: `auth/configuration-not-found`

**Solution:** Enable Phone Authentication in Firebase Console (see step 1 above)

### Error: `auth/invalid-phone-number`

**Solution:** Ensure phone number is in E.164 format: `+91XXXXXXXXXX`

### Error: reCAPTCHA not loading

**Solution:**

- Check if your domain is authorized in Firebase Console
- For localhost, it should work automatically
- Ensure you're not blocking third-party cookies

### SMS not received

**Solution:**

- Check if Phone Auth is enabled in Firebase Console
- Verify you have SMS quota in your Firebase plan
- Use test phone numbers for development
- Check Firebase Console > Authentication > Usage for any errors

## Firebase Pricing Note

- Firebase Phone Auth has usage limits on the free plan
- First 10K verifications/month are free
- After that, pricing applies: https://firebase.google.com/pricing

## Need Help?

Refer to [FIREBASE_CONFIG.md](FIREBASE_CONFIG.md) for complete Firebase setup documentation.
