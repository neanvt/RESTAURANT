import * as admin from "firebase-admin";
import * as path from "path";

let messagingInstance: admin.messaging.Messaging | null = null;

try {
  // Initialize Firebase Admin
  // In production (Vercel), use environment variables
  // In development, try to load from service account file
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    // Use environment variables (for Vercel/production)
    console.log("🔧 Initializing Firebase Admin with environment variables...");
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    console.log("✅ Firebase Admin initialized successfully with environment variables");
  } else {
    // Try to load from file (for local development)
    console.log("🔧 Initializing Firebase Admin with service account file...");
    const serviceAccount = require(path.join(
      __dirname,
      "../../restopos-15a94-firebase-adminsdk-fbsvc-170f8160c3.json"
    ));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase Admin initialized successfully with service account file");
  }

  messagingInstance = admin.messaging();
} catch (error) {
  console.error("❌ Firebase Admin initialization failed:", error);
  console.log(
    "⚠️  Firebase Admin initialization skipped (service account not found)"
  );
  console.log(
    "   Push notifications and OTP verification will not work until Firebase credentials are configured"
  );
}

export const messaging = messagingInstance;
export default admin;
