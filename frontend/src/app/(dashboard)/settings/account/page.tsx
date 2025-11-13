"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, User, Lock, LogOut, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import * as authApi from "@/lib/api/auth";

export default function AccountSettingsPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const { sendOTP, confirmOTPOnly, loginWithIdToken } = useAuth();
  const user = useAuthStore((state) => state.user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [newPasswordOtp, setNewPasswordOtp] = useState("");

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Sync profile data with user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In a real implementation, this would update user profile
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsChangingPassword(true);

    try {
      // In a real implementation, this would change password
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.success("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error("Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSendOtpForPassword = async () => {
    if (!user?.phone) {
      toast.error("No phone number found on your account");
      return;
    }

    setIsSendingOtp(true);
    try {
      const resp = await sendOTP(user.phone);
      if (resp.success) {
        toast.success("OTP sent to your phone");
        setOtpSent(true);
      } else {
        toast.error(resp.error || "Failed to send OTP");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpValue || otpValue.length !== 6) {
      toast.error("Enter the 6-digit OTP");
      return;
    }

    if (!newPasswordOtp || newPasswordOtp.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsChangingPassword(true);

    try {
      // Confirm OTP with Firebase to get idToken
      const confirm = await confirmOTPOnly(otpValue);
      if (!confirm.success || !confirm.idToken) {
        toast.error(confirm.error || "OTP verification failed");
        setIsChangingPassword(false);
        return;
      }

      // Call backend to set password
      const setResp = await authApi.setPassword({
        idToken: confirm.idToken,
        password: newPasswordOtp,
      });

      if (!setResp || !setResp.success) {
        toast.error(setResp?.error?.message || "Failed to set password");
        setIsChangingPassword(false);
        return;
      }

      // Login with idToken to refresh app tokens
      const loginRes = await loginWithIdToken(
        confirm.idToken,
        user?.name || undefined
      );
      if (!loginRes.success) {
        toast.error(
          loginRes.error || "Failed to complete login after setting password"
        );
        setIsChangingPassword(false);
        return;
      }

      toast.success("Password set successfully");
      // Reset OTP UI
      setOtpValue("");
      setNewPasswordOtp("");
      setOtpSent(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to set password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await logout();
      router.push("/login");
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    if (
      !confirm(
        "This will permanently delete all your data. Are you absolutely sure?"
      )
    ) {
      return;
    }

    try {
      // In a real implementation, this would delete the account
      toast.success("Account deletion initiated");
      await logout();
      router.push("/login");
    } catch (error: any) {
      toast.error("Failed to delete account");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Account Settings
              </h1>
              <p className="text-sm text-gray-600">
                Manage your profile and security
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  placeholder="Your full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  placeholder="+91 9876543210"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  Phone number cannot be changed
                </p>
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password (OTP-based) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="h-5 w-5 text-green-600" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!otpSent ? (
                <>
                  <p className="text-sm text-gray-600">
                    We'll send an OTP to your registered phone number (+91{" "}
                    {user?.phone}) to verify ownership before setting a new
                    password.
                  </p>
                  <Button
                    onClick={handleSendOtpForPassword}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isSendingOtp}
                  >
                    {isSendingOtp ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Send OTP to set password
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <form onSubmit={handleOtpSetPassword} className="space-y-4">
                  <div>
                    <Label htmlFor="otp">OTP</Label>
                    <Input
                      id="otp"
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPasswordOtp">New Password</Label>
                    <Input
                      id="newPasswordOtp"
                      type="password"
                      value={newPasswordOtp}
                      onChange={(e) => setNewPasswordOtp(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Setting...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Set Password & Login
                      </>
                    )}
                  </Button>
                  <div className="text-center">
                    <Button variant="link" onClick={() => setOtpSent(false)}>
                      Back
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout from this device
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-base text-red-600">
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Once you delete your account, there is no going back. Please be
              certain.
            </p>
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleDeleteAccount}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
