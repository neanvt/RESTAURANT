import * as admin from "firebase-admin";
import * as path from "path";

let messagingInstance: admin.messaging.Messaging | null = null;

try {
  // Initialize Firebase Admin
  const serviceAccount = require(path.join(
    __dirname,
    "../../firebase-service-account.json"
  ));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  messagingInstance = admin.messaging();
  console.log("✅ Firebase Admin initialized successfully");
} catch (error) {
  console.log(
    "⚠️  Firebase Admin initialization skipped (service account not found)"
  );
  console.log(
    "   Push notifications will not work until firebase-service-account.json is added"
  );
}

export const messaging = messagingInstance;
export default admin;
