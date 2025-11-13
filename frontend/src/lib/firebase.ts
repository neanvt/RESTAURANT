import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let isFirebaseInitialized = false;

// Initialize Firebase only on client side and only when config is present
if (typeof window !== "undefined") {
  if (!firebaseConfig.apiKey) {
    // Missing public API key at runtime (likely env not present at build time)
    // Log clearly so deployed console shows what's wrong instead of crashing the app
    // eslint-disable-next-line no-console
    console.error(
      "Missing NEXT_PUBLIC_FIREBASE_API_KEY. Firebase will not initialize. Please set NEXT_PUBLIC_FIREBASE_API_KEY and other NEXT_PUBLIC_FIREBASE_* env vars at build time."
    );
  } else {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    isFirebaseInitialized = true;
  }
}

export { app, auth, isFirebaseInitialized };
