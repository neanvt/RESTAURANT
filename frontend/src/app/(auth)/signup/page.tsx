"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { register as apiRegister, sendOTP as apiSendOTP } from "@/lib/api/auth";
import { useAuthStore } from "@/store/authStore";

export default function SignupPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingUser, setExistingUser] = useState(false);

  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSignup = async () => {
    setError("");
    if (!phone || phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    try {
      const res = await apiRegister({ phone, name, email, password });
      if (res.success && res.data) {
        // store auth in zustand
        try {
          setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
        } catch (e) {
          // ignore
        }
        router.push("/dashboard");
      } else {
        setError(res.error?.message || "Signup failed");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message || err.message || "Signup failed";
      setError(msg);
      // If backend returned 409 (user exists), surface actions
      if (err?.response?.status === 409) {
        setExistingUser(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sign up
          </CardTitle>
          <CardDescription className="text-center">
            Create an account without OTP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Name (optional)"
            value={name}
            onChange={(e) => setName((e.target as HTMLInputElement).value)}
          />
          <Input
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
          />
          <Input
            placeholder="Phone (10 digits)"
            value={phone}
            onChange={(e) => setPhone((e.target as HTMLInputElement).value)}
          />
          <Input
            placeholder="Password (min 6 chars)"
            type="password"
            value={password}
            onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
          />

          {error && <div className="text-sm text-red-600">{error}</div>}

          <Button onClick={handleSignup} disabled={loading} className="w-full">
            {loading ? "Signing up..." : "Sign up"}
          </Button>

          {existingUser && (
            <div className="space-y-2">
              <div className="text-sm text-yellow-700">
                An account with this phone/email already exists.
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => router.push("/login")}
                  className="flex-1"
                >
                  Sign in
                </Button>
                <Button
                  className="flex-1"
                  onClick={async () => {
                    // Try sending OTP to let the user verify and login
                    try {
                      setLoading(true);
                      await apiSendOTP({ phone });
                      router.push(`/verify?phone=${phone}`);
                    } catch (e: any) {
                      setError(
                        e?.response?.data?.error?.message ||
                          "Failed to send OTP"
                      );
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Request OTP
                </Button>
              </div>
            </div>
          )}

          <div className="text-center text-sm text-gray-600">
            By signing up you agree to our Terms of Service
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
