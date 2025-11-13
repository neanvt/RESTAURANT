# Firebase Configuration

This document describes the Firebase configuration for the Restaurant POS application.

## Project Information

- **Project ID**: `restopos-15a94`
- **Project Number**: `367863495242`
- **Storage Bucket**: `restopos-15a94.firebasestorage.app`

## Android Client

The application is configured for Android with the following details:

- **Package Name**: `com.neanv.stallbill`
- **Mobile SDK App ID**: `1:367863495242:android:da836b0356f0f75a1384b3`

## API Configuration

### Frontend (Client-side)

- **API Key**: `AIzaSyDAVPvjZX1m5FD3qufBRUfrvWVrG4_b4wY`

### Backend (Service Account)

- **Service Account Email**: `firebase-adminsdk-fbsvc@restopos-15a94.iam.gserviceaccount.com`
- **Client ID**: `112283845393454141877`
- **Private Key ID**: `b86c1b18e78e27c2ce4b181e9ed6d3512629dcfe`

## Environment Variables

The Firebase configuration is managed through environment variables in the frontend application:

### Frontend Configuration

The following environment variables are used in [`frontend/src/lib/firebase.ts`](frontend/src/lib/firebase.ts:5):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDAVPvjZX1m5FD3qufBRUfrvWVrG4_b4wY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=restopos-15a94.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=restopos-15a94
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=restopos-15a94.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=367863495242
NEXT_PUBLIC_FIREBASE_APP_ID=1:367863495242:android:da836b0356f0f75a1384b3
```

## Setup Instructions

### Local Development

1. The Firebase configuration has been added to [`frontend/.env.local`](frontend/.env.local:1) for local development.
2. This file is already included in [`.gitignore`](.gitignore:1) to prevent accidental commits of sensitive credentials.

### Production Deployment

For production deployments:

1. Set the environment variables in your hosting platform (Vercel, Netlify, etc.)
2. Never commit actual credentials to version control
3. Use the [`frontend/.env.example`](frontend/.env.example:1) file as a template

## Backend Configuration

### Service Account Credentials

The backend uses Firebase Admin SDK with service account credentials for server-side operations.

#### Environment Variables (Backend)

The following environment variables are configured in [`backend/.env`](backend/.env:15):

```env
FIREBASE_PROJECT_ID=restopos-15a94
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@restopos-15a94.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=restopos-15a94.firebasestorage.app
```

**Important Notes:**

- The private key must be wrapped in quotes and include literal `\n` characters
- The [`otpService.ts`](backend/src/services/otpService.ts:23) automatically replaces `\\n` with actual newlines
- Never commit the actual private key to version control

### Firebase Admin SDK Initialization

The Firebase Admin SDK is initialized in [`backend/src/services/otpService.ts`](backend/src/services/otpService.ts:19):

```typescript
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});
```

## Firebase Services Used

### Authentication

The application uses Firebase Authentication for user authentication:

- **Phone Authentication**: Used for OTP-based login
- **Auth Domain**: `restopos-15a94.firebaseapp.com`
- **Token Verification**: Backend verifies Firebase ID tokens using Admin SDK

### Storage (Potential Future Use)

The storage bucket `restopos-15a94.firebasestorage.app` can be used for:

- Menu item images
- Invoice PDFs
- User profile pictures
- KOT attachments

## Security Considerations

1. **API Key Security**: The Firebase API key is safe to expose in client-side code as it's designed for public use. Firebase Security Rules protect your data.

2. **Security Rules**: Ensure Firebase Security Rules are properly configured to protect your data:

   - Authentication rules in Firebase Console
   - Firestore rules (if using Firestore)
   - Storage rules (if using Cloud Storage)

3. **Environment Files**:
   - [`frontend/.env.local`](frontend/.env.local:1) contains actual credentials (not committed)
   - [`frontend/.env.example`](frontend/.env.example:1) is a template (committed to repo)

## Integration Points

### Frontend Firebase Client

The Firebase client is initialized in [`frontend/src/lib/firebase.ts`](frontend/src/lib/firebase.ts:1):

```typescript
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
```

### Authentication Flow

1. **Client initiates login**: User enters phone number in [`frontend/src/app/(auth)/login/page.tsx`](<frontend/src/app/(auth)/login/page.tsx:1>)
2. **OTP sent**: Firebase sends OTP via Phone Authentication (client-side)
3. **OTP verification**: User verifies OTP in [`frontend/src/app/(auth)/verify/page.tsx`](<frontend/src/app/(auth)/verify/page.tsx:1>)
4. **Token generation**: Client receives Firebase ID token
5. **Backend verification**: Backend validates Firebase ID token in [`backend/src/services/otpService.ts`](backend/src/services/otpService.ts:94)
6. **User creation/login**: Backend finds or creates user in [`backend/src/services/authService.ts`](backend/src/services/authService.ts:74)
7. **JWT tokens**: Backend issues JWT access and refresh tokens
8. **Protected routes**: [`backend/src/middleware/authMiddleware.ts`](backend/src/middleware/authMiddleware.ts:20) validates JWT tokens for protected endpoints

## Troubleshooting

### Frontend Issues

1. **"Firebase not initialized" error**

   - Ensure environment variables are set correctly in [`frontend/.env.local`](frontend/.env.local:1)
   - Verify all `NEXT_PUBLIC_*` variables are present
   - Restart the development server after adding environment variables

2. **OTP not receiving**

   - Verify Phone Authentication is enabled in Firebase Console
   - Check Firebase project settings match the configuration
   - Ensure authorized domains include your deployment URL
   - For testing, add test phone numbers in Firebase Console

3. **CORS errors**
   - Add your domain to authorized domains in Firebase Console
   - For local development, ensure `localhost:3000` is authorized

### Backend Issues

1. **"Firebase is not initialized" error**

   - Check [`backend/.env`](backend/.env:15) contains all Firebase credentials
   - Verify the private key format includes quotes and `\n` characters
   - Check logs for Firebase initialization errors on server startup

2. **Token verification fails**

   - Ensure the Firebase ID token is sent in request body
   - Verify the token hasn't expired (tokens expire after 1 hour)
   - Check that the service account has proper permissions in Firebase Console

3. **Private key format errors**
   - The private key must be wrapped in double quotes
   - Include literal `\n` characters (not actual newlines)
   - Example format: `"-----BEGIN PRIVATE KEY-----\nkey_content\n-----END PRIVATE KEY-----\n"`

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

## Service Account Security

### Best Practices

1. **Never commit service account credentials**

   - The [`backend/.env`](backend/.env:1) file is in [`.gitignore`](.gitignore:1)
   - Use environment variables in production
   - Rotate keys periodically in Firebase Console

2. **Service Account Permissions**

   - The service account has admin access to Firebase services
   - Only use for server-side operations
   - Never expose service account credentials to clients

3. **Token Management**
   - Firebase ID tokens expire after 1 hour
   - Backend generates its own JWT tokens for session management
   - Refresh tokens are used to obtain new JWT tokens without re-authentication

### Production Deployment

For production environments:

1. **Set environment variables** in your hosting platform
2. **Use secrets management** (e.g., AWS Secrets Manager, Google Secret Manager)
3. **Enable Firebase App Check** to prevent unauthorized access
4. **Monitor usage** in Firebase Console for suspicious activity

## Configuration Files Summary

| File                                               | Purpose                          | Committed to Git |
| -------------------------------------------------- | -------------------------------- | ---------------- |
| [`frontend/.env.local`](frontend/.env.local:1)     | Frontend development credentials | ❌ No            |
| [`frontend/.env.example`](frontend/.env.example:1) | Frontend template                | ✅ Yes           |
| [`backend/.env`](backend/.env:1)                   | Backend development credentials  | ❌ No            |
| [`backend/.env.example`](backend/.env.example:1)   | Backend template                 | ✅ Yes           |
| [`FIREBASE_CONFIG.md`](FIREBASE_CONFIG.md:1)       | Documentation                    | ✅ Yes           |

## Configuration File Location

The original Firebase configuration JSONs (client config and service account) have been documented in this file and integrated into the application's environment variables.
