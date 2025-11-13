"use client";

import { useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { auth, isFirebaseInitialized } from "@/lib/firebase";
import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
} from "firebase/auth";
import * as authApi from "@/lib/api/auth";

let recaptchaVerifier: RecaptchaVerifier | null = null;
let confirmationResult: ConfirmationResult | null = null;

export const useAuth = () => {
  const {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isLoading,
    setAuth,
    logout: logoutStore,
    setLoading,
  } = useAuthStore();

  /**
   * Initialize reCAPTCHA for phone authentication
   */
  const initRecaptcha = useCallback(
    (elementId: string = "recaptcha-container") => {
      if (!recaptchaVerifier && typeof window !== "undefined") {
        if (!isFirebaseInitialized || !auth) {
          console.error(
            "reCAPTCHA init skipped: Firebase not initialized (missing NEXT_PUBLIC_FIREBASE_* env vars)."
          );
          return null;
        }
        try {
          // Suppress reCAPTCHA's internal errors
          const originalError = console.error;
          console.error = (...args: any[]) => {
            if (
              args[0]?.toString().includes("recaptcha") ||
              args[0]?.toString().includes("style")
            ) {
              return; // Suppress reCAPTCHA cleanup errors
            }
            originalError(...args);
          };

          recaptchaVerifier = new RecaptchaVerifier(auth as any, elementId, {
            size: "invisible",
            callback: () => {
              console.log("✅ reCAPTCHA verified successfully");
            },
            "error-callback": (error: any) => {
              console.log("reCAPTCHA error:", error);
            },
          });

          console.log("✅ reCAPTCHA initialized");
        } catch (error) {
          console.log("Failed to initialize reCAPTCHA:", error);
        }
      }
      return recaptchaVerifier;
    },
    []
  );

  /**
   * Send OTP to phone number
   */
  const sendOTP = useCallback(
    async (phone: string): Promise<{ success: boolean; error?: string }> => {
      try {
        console.log("🔵 sendOTP called with phone:", phone);
        setLoading(true);

        // Validate phone number
        if (!/^[6-9]\d{9}$/.test(phone)) {
          console.log("❌ Phone validation failed");
          return {
            success: false,
            error: "Please enter a valid 10-digit phone number",
          };
        }
        console.log("✅ Phone validation passed");

        // Initialize reCAPTCHA if not already done
        if (!recaptchaVerifier) {
          console.log("🔄 Initializing reCAPTCHA...");
          initRecaptcha();
        }

        if (!recaptchaVerifier) {
          console.log("❌ reCAPTCHA not initialized");
          return {
            success: false,
            error: "Failed to initialize reCAPTCHA",
          };
        }
        console.log("✅ reCAPTCHA ready");

        // Send OTP via Firebase
        if (!isFirebaseInitialized || !auth) {
          console.error("Cannot send OTP: Firebase not initialized.");
          return {
            success: false,
            error: "Firebase not initialized. Contact admin.",
          };
        }
        const formattedPhone = `+91${phone}`;
        console.log(
          "📞 Calling Firebase signInWithPhoneNumber for:",
          formattedPhone
        );

        confirmationResult = await signInWithPhoneNumber(
          auth as any,
          formattedPhone,
          recaptchaVerifier as any
        );

        console.log(
          "✅ Firebase signInWithPhoneNumber successful, confirmationResult:",
          !!confirmationResult
        );
        return { success: true };
      } catch (error: any) {
        console.error("❌ Error in sendOTP:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);

        // Reset reCAPTCHA on error
        if (recaptchaVerifier) {
          try {
            recaptchaVerifier.clear();
          } catch (e) {
            // Ignore cleanup errors
          }
          recaptchaVerifier = null;
        }

        return {
          success: false,
          error: error.message || "Failed to send OTP. Please try again.",
        };
      } finally {
        console.log("🔵 sendOTP completed, success check above");
        setLoading(false);
      }
    },
    [initRecaptcha, setLoading]
  );

  /**
   * Verify OTP and login
   */
  const verifyOTP = useCallback(
    async (
      otp: string,
      name?: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        console.log("🔵 verifyOTP called with OTP:", otp);
        setLoading(true);

        if (!confirmationResult) {
          console.log("❌ No confirmationResult found");
          return {
            success: false,
            error: "Please request OTP first",
          };
        }

        // Verify OTP with Firebase
        console.log("📞 Confirming OTP with Firebase...");
        const result = await confirmationResult.confirm(otp);
        console.log("✅ Firebase OTP confirmed, getting ID token...");
        const idToken = await result.user.getIdToken();
        console.log("✅ ID token obtained, verifying with backend...");

        // Verify with backend and get user data
        const response = await authApi.verifyOTP({ idToken, name });
        console.log("📱 Backend response:", response);

        if (!response.success || !response.data) {
          console.log("❌ Backend verification failed:", response.error);
          return {
            success: false,
            error: response.error?.message || "Verification failed",
          };
        }

        console.log("✅ Backend verification successful, storing auth data...");
        // Store auth data
        setAuth(
          response.data.user,
          response.data.accessToken,
          response.data.refreshToken
        );

        // Clear confirmation result
        confirmationResult = null;

        console.log("✅ verifyOTP completed successfully");
        return { success: true };
      } catch (error: any) {
        console.error("❌ Error in verifyOTP:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        return {
          success: false,
          error: error.message || "Invalid OTP. Please try again.",
        };
      } finally {
        console.log("🔵 verifyOTP completed");
        setLoading(false);
      }
    },
    [setAuth, setLoading]
  );

  /**
   * Confirm OTP with Firebase and return ID token without calling backend
   */
  const confirmOTPOnly = useCallback(
    async (
      otp: string
    ): Promise<{ success: boolean; idToken?: string; error?: string }> => {
      try {
        setLoading(true);

        if (!confirmationResult) {
          return { success: false, error: "Please request OTP first" };
        }

        const result = await confirmationResult.confirm(otp);
        const idToken = await result.user.getIdToken();

        // Do not clear confirmationResult here; leave it to caller to decide
        return { success: true, idToken };
      } catch (error: any) {
        console.error("Error in confirmOTPOnly:", error);
        return { success: false, error: error.message || "Invalid OTP" };
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  /**
   * Login using an existing Firebase ID token (useful after set-password)
   */
  const loginWithIdToken = useCallback(
    async (
      idToken: string,
      name?: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        setLoading(true);
        const response = await authApi.verifyOTP({ idToken, name });
        if (!response.success || !response.data) {
          return {
            success: false,
            error: response.error?.message || "Verification failed",
          };
        }

        setAuth(
          response.data.user,
          response.data.accessToken,
          response.data.refreshToken
        );

        // Clear confirmation result after successful login
        confirmationResult = null;

        return { success: true };
      } catch (error: any) {
        console.error("Error in loginWithIdToken:", error);
        return { success: false, error: error.message || "Login failed" };
      } finally {
        setLoading(false);
      }
    },
    [setAuth, setLoading]
  );

  /**
   * Refresh access token
   */
  const refresh = useCallback(async (): Promise<boolean> => {
    try {
      if (!refreshToken) {
        return false;
      }

      const response = await authApi.refreshToken({ refreshToken });

      if (!response.success || !response.data) {
        return false;
      }

      // Update tokens in store
      useAuthStore
        .getState()
        .setTokens(response.data.accessToken, response.data.refreshToken);

      return true;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return false;
    }
  }, [refreshToken]);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      if (accessToken) {
        await authApi.logout(accessToken);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      // Clear auth state
      logoutStore();

      // Sign out from Firebase
      if (auth && auth.currentUser) {
        await auth.signOut();
      }

      // Clear reCAPTCHA
      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
        } catch (e) {
          // Ignore cleanup errors
        }
        recaptchaVerifier = null;
      }
      confirmationResult = null;
    }
  }, [accessToken, logoutStore]);

  /**
   * Get current user from backend
   */
  const fetchUser = useCallback(async () => {
    try {
      if (!accessToken) {
        return null;
      }

      const response = await authApi.getCurrentUser(accessToken);

      if (response.success && response.data?.user) {
        useAuthStore.getState().setUser(response.data.user);
        return response.data.user;
      }

      return null;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  }, [accessToken]);

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isLoading,
    sendOTP,
    verifyOTP,
    confirmOTPOnly,
    loginWithIdToken,
    logout,
    refresh,
    fetchUser,
    initRecaptcha,
  };
};
