"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PhoneInput from "@/components/auth/PhoneInput";
import { useAuth } from "@/hooks/useAuth";
import { login as apiLogin } from "@/lib/api/auth";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { sendOTP, isLoading, isAuthenticated, initRecaptcha } = useAuth();
  const setAuth = useAuthStore((s) => s.setAuth);
  // Default to password login and show it open by default
  const [mode, setMode] = useState<"otp" | "password">("password");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const recaptchaInitialized = useRef(false);

  // Initialize reCAPTCHA once after mount
  useEffect(() => {
    if (recaptchaInitialized.current) return;

    const timer = setTimeout(() => {
      const container = document.getElementById("recaptcha-container");
      if (container && !recaptchaInitialized.current) {
        try {
          initRecaptcha("recaptcha-container");
          recaptchaInitialized.current = true;
        } catch (error) {
          console.error("Failed to initialize reCAPTCHA:", error);
        }
      }
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSendOTP = async () => {
    setError("");

    if (!phone) {
      setError("Please enter your phone number");
      return;
    }

    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    console.log("📱 Sending OTP to:", phone);
    const result = await sendOTP(phone);
    console.log("📱 sendOTP result:", result);

    if (result.success) {
      console.log("✅ OTP sent successfully, navigating to verify page");
      // Navigate to verify page
      router.push(`/verify?phone=${phone}`);
    } else {
      console.error("❌ Failed to send OTP:", result.error);
      setError(result.error || "Failed to send OTP. Please try again.");
    }
  };

  const handlePasswordLogin = async () => {
    setError("");
    if (!identifier || !password) {
      setError("Please enter identifier and password");
      return;
    }

    try {
      const res = await apiLogin({ identifier, password });
      if (res.success && res.data) {
        try {
          setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
        } catch (e) {}
        router.push("/dashboard");
      } else {
        setError(res.error?.message || "Login failed");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message || err.message || "Login failed"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {/* reCAPTCHA container outside of Card to prevent re-renders */}
      <div id="recaptcha-container" className="fixed top-0 left-0 z-50"></div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Welcome to Restaurant POS
          </CardTitle>
          <CardDescription className="text-center">
            Sign in with your email/phone and password, or use OTP login
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-center gap-2">
              <Button
                variant={mode === "otp" ? "default" : "ghost"}
                onClick={() => setMode("otp")}
              >
                Login with OTP
              </Button>
              <Button
                variant={mode === "password" ? "default" : "ghost"}
                onClick={() => setMode("password")}
              >
                Email/Phone + Password
              </Button>
            </div>

            {mode === "otp" ? (
              <>
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  error={error}
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendOTP}
                  disabled={isLoading || !phone || phone.length !== 10}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              </>
            ) : (
              <>
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Email or Phone"
                  value={identifier}
                  onChange={(e) =>
                    setIdentifier((e.target as HTMLInputElement).value)
                  }
                />
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword((e.target as HTMLInputElement).value)
                  }
                />
                <Button
                  onClick={handlePasswordLogin}
                  disabled={isLoading || !identifier || !password}
                  className="w-full"
                  size="lg"
                >
                  Sign in
                </Button>
              </>
            )}
          </div>

          <div className="pt-2">
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => router.push("/signup")}
            >
              Sign up instead
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
