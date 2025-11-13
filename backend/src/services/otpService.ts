import admin from "firebase-admin";

interface OTPVerificationResult {
  success: boolean;
  phone?: string;
  error?: string;
}

class OTPService {
  private initialized = false;

  constructor() {
    this.initializeFirebase();
  }

  /**
   * Initialize Firebase Admin SDK
   */
  private initializeFirebase() {
    try {
      if (!this.initialized && !admin.apps.length) {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(
          /\\n/g,
          "\n"
        );
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

        console.log("🔧 Firebase Admin SDK initialization...");
        console.log(`   Project ID: ${projectId ? "✓" : "✗"}`);
        console.log(
          `   Private Key: ${
            privateKey ? "✓ (length: " + privateKey.length + ")" : "✗"
          }`
        );
        console.log(`   Client Email: ${clientEmail ? "✓" : "✗"}`);

        if (!projectId || !privateKey || !clientEmail) {
          console.error(
            "❌ Firebase credentials not found. OTP service will not be available."
          );
          console.error(
            `   Missing: ${!projectId ? "FIREBASE_PROJECT_ID " : ""}${
              !privateKey ? "FIREBASE_PRIVATE_KEY " : ""
            }${!clientEmail ? "FIREBASE_CLIENT_EMAIL" : ""}`
          );
          return;
        }

        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            privateKey,
            clientEmail,
          }),
        });

        this.initialized = true;
        console.log("✅ Firebase Admin SDK initialized successfully");
      } else if (this.initialized) {
        console.log("ℹ️  Firebase Admin SDK already initialized");
      }
    } catch (error) {
      console.error("❌ Failed to initialize Firebase Admin SDK:", error);
      if (error instanceof Error) {
        console.error("   Error message:", error.message);
        console.error("   Error stack:", error.stack);
      }
    }
  }

  /**
   * Send OTP to phone number using Firebase Authentication
   * Note: This is a placeholder as Firebase Admin SDK doesn't directly send OTP
   * The actual OTP sending is handled by Firebase Auth on the client side
   * This method is here for future implementation with SMS gateway
   */
  async sendOTP(phone: string): Promise<{ success: boolean; message: string }> {
    try {
      // Validate phone number format
      if (!this.validatePhoneNumber(phone)) {
        return {
          success: false,
          message:
            "Invalid phone number format. Please provide a 10-digit Indian phone number.",
        };
      }

      // In production, you would integrate with an SMS gateway here
      // Format would be: const formattedPhone = `+91${phone}`;
      // For now, we're using Firebase Auth on the client side
      // This is just a validation endpoint

      return {
        success: true,
        message:
          "OTP sent successfully. Please verify using Firebase Auth on client side.",
      };
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      return {
        success: false,
        message: error.message || "Failed to send OTP",
      };
    }
  }

  /**
   * Verify OTP with Firebase ID token
   * The client sends the Firebase ID token after verifying OTP
   */
  async verifyOTP(idToken: string): Promise<OTPVerificationResult> {
    try {
      if (!this.initialized) {
        return {
          success: false,
          error: "Firebase is not initialized",
        };
      }

      // Verify the Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      // Extract phone number from the token
      const phone = decodedToken.phone_number;

      if (!phone) {
        return {
          success: false,
          error: "Phone number not found in token",
        };
      }

      // Remove country code if present
      const cleanPhone = phone.replace(/^\+91/, "");

      return {
        success: true,
        phone: cleanPhone,
      };
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      return {
        success: false,
        error: error.message || "Failed to verify OTP",
      };
    }
  }

  /**
   * Validate Indian phone number format
   */
  private validatePhoneNumber(phone: string): boolean {
    return /^[6-9]\d{9}$/.test(phone);
  }

  /**
   * Rate limiting check for OTP requests
   * This should be implemented with Redis in production
   */
  async checkRateLimit(
    _phone: string
  ): Promise<{ allowed: boolean; message?: string }> {
    // TODO: Implement Redis-based rate limiting
    // For now, we'll allow all requests
    return { allowed: true };
  }

  /**
   * Store OTP attempt for rate limiting (to be implemented with Redis)
   */
  async recordOTPAttempt(_phone: string): Promise<void> {
    // TODO: Implement with Redis
    // Store timestamp of OTP request for rate limiting
  }
}

export default new OTPService();
