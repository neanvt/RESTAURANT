/**
 * Debug utility to check authentication status for outlet creation
 */

import { getAccessToken, getRefreshToken } from "./auth-token";

export const debugOutletAuth = () => {
  console.group("🔍 Outlet Auth Debug");

  // Check if we're in browser
  if (typeof window === "undefined") {
    console.log("❌ Not in browser environment");
    console.groupEnd();
    return;
  }

  // Check localStorage
  console.log("📦 LocalStorage Keys:", Object.keys(localStorage));

  // Check auth-storage
  const authStorage = localStorage.getItem("auth-storage");
  console.log("🔐 auth-storage exists:", !!authStorage);

  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      console.log("📋 Parsed auth-storage:", {
        hasState: !!parsed.state,
        hasAccessToken: !!parsed.state?.accessToken,
        hasRefreshToken: !!parsed.state?.refreshToken,
        hasUser: !!parsed.state?.user,
        isAuthenticated: parsed.state?.isAuthenticated,
      });

      // Show token info without revealing full token
      if (parsed.state?.accessToken) {
        const token = parsed.state.accessToken;
        console.log("🎫 Access Token:", {
          length: token.length,
          starts: token.substring(0, 20) + "...",
          ends: "..." + token.substring(token.length - 20),
        });

        // Try to decode JWT (without verification)
        try {
          const parts = token.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            const now = Math.floor((typeof window !== "undefined" ? Date.now() : 0) / 1000);
            console.log("📅 Token Payload:", {
              userId: payload.userId,
              role: payload.role,
              expiresAt: new Date(payload.exp * 1000).toLocaleString(),
              isExpired: payload.exp < now,
              remainingMinutes: Math.floor((payload.exp - now) / 60),
            });
          }
        } catch (e) {
          console.error("❌ Could not decode token:", e);
        }
      }
    } catch (error) {
      console.error("❌ Error parsing auth-storage:", error);
    }
  } else {
    console.log("❌ No auth-storage found in localStorage");
  }

  // Test the helper functions
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  console.log("🔑 Token Helper Results:", {
    accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : null,
    refreshToken: refreshToken ? `${refreshToken.substring(0, 20)}...` : null,
  });

  console.log("\n💡 If token is expired, you need to:");
  console.log("   1. Refresh the token using /api/auth/refresh");
  console.log("   2. Or login again at /login");

  console.groupEnd();

  return {
    hasToken: !!accessToken,
    tokenPreview: accessToken ? accessToken.substring(0, 30) + "..." : null,
  };
};

// Auto-run in development
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  (window as any).debugOutletAuth = debugOutletAuth;
  console.log("💡 Run debugOutletAuth() in console to check auth status");
}
