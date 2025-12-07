"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OTPInput from "@/components/auth/OTPInput";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import * as authApi from "@/lib/api/auth";
import { Loader2, ArrowLeft } from "lucide-react";

export default function VerifyClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";
  const user = useAuthStore((state) => state.user);

  const {
    verifyOTP,
    sendOTP,
    isLoading,
    isAuthenticated,
    confirmOTPOnly,
    loginWithIdToken,
  } = useAuth();
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [mounted, setMounted] = useState(false);
  const [checkingParams, setCheckingParams] = useState(true);

  // Mark component as mounted and give time for searchParams to load
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setCheckingParams(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Redirect if no phone number ONLY after checking params is complete
  useEffect(() => {
    if (!checkingParams && !phone) {
      console.log(
        "❌ No phone number found after waiting, redirecting to login"
      );
      router.push("/login");
    } else if (phone) {
      console.log("✅ Phone number found:", phone);
    }
  }, [checkingParams, phone, router]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log("✅ Already authenticated, redirecting to dashboard");
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Show loading while checking or mounting
  if (!mounted || checkingParams) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  // Show loading if still no phone (edge case)
  if (!phone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-gray-600">Redirecting...</span>
      </div>
    );
  }

  const handleVerify = async () => {
    setError("");

    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    const result = await verifyOTP(otp, name || undefined);

    if (result.success) {
      // Wait a moment for auth store to update
      setTimeout(() => {
        const authStorage = localStorage.getItem("auth-storage");
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          const currentUser = parsed.state?.user;
          if (currentUser?.requirePasswordChange) {
            router.push("/change-password");
            return;
          }
        }
        router.push("/dashboard");
      }, 100);
    } else {
      setError(result.error || "Verification failed. Please try again.");
    }
  };

  const handleSetPassword = async () => {
    setError("");

    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // Confirm OTP with Firebase and get ID token
    const confirmResult = await confirmOTPOnly(otp);
    if (!confirmResult.success || !confirmResult.idToken) {
      setError(confirmResult.error || "Failed to verify OTP");
      return;
    }

    // Call backend to set password
    try {
      const setResp = await authApi.setPassword({
        idToken: confirmResult.idToken,
        password,
      });

      if (!setResp || !setResp.success) {
        setError(setResp?.error?.message || "Failed to set password");
        return;
      }

      // Now login using the same idToken to get app tokens
      const loginResult = await loginWithIdToken(
        confirmResult.idToken,
        name || undefined
      );
      if (!loginResult.success) {
        setError(loginResult.error || "Failed to complete login");
        return;
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "An error occurred while setting password");
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setResending(true);

    const result = await sendOTP(phone);

    if (result.success) {
      setOtp("");
      setError("");
      alert("OTP sent successfully!");
    } else {
      setError(result.error || "Failed to resend OTP");
    }

    setResending(false);
  };

  const handleBack = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Verify OTP
          </CardTitle>
          <CardDescription className="text-center">
            Enter the verification code sent to +91 {phone}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <OTPInput
            value={otp}
            onChange={setOtp}
            error={error}
            disabled={isLoading}
          />

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Name (Optional)
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {!showSetPassword ? (
            <div className="text-center">
              <Button
                variant="link"
                onClick={() => setShowSetPassword(true)}
                className="text-sm"
              >
                Or set a password for this account
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Choose a password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />

              <Button
                onClick={handleSetPassword}
                disabled={isLoading || otp.length !== 6 || password.length < 6}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting...
                  </>
                ) : (
                  "Set Password & Continue"
                )}
              </Button>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => setShowSetPassword(false)}
                  className="text-sm"
                >
                  Back to OTP verification
                </Button>
              </div>
            </div>
          )}

          <Button
            onClick={handleVerify}
            disabled={isLoading || otp.length !== 6}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify & Continue"
            )}
          </Button>

          <div className="text-center">
            <Button
              variant="link"
              onClick={handleResendOTP}
              disabled={isLoading || resending}
              className="text-sm"
            >
              {resending ? "Resending..." : "Didn't receive OTP? Resend"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
