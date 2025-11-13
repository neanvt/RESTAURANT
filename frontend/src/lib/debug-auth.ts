/**
 * Debug utility to check authentication state
 * Use this in browser console or components to troubleshoot auth issues
 */

export const debugAuth = () => {
  console.group("🔍 Auth Debug Info");

  // Check all localStorage keys
  console.log("📦 All localStorage keys:", Object.keys(localStorage));

  // Check auth-storage
  const authStorage = localStorage.getItem("auth-storage");
  console.log("🔐 auth-storage raw:", authStorage);

  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      console.log("✅ auth-storage parsed:", parsed);
      console.log(
        "🎫 accessToken:",
        parsed.state?.accessToken ? "EXISTS" : "MISSING"
      );
      console.log(
        "🔄 refreshToken:",
        parsed.state?.refreshToken ? "EXISTS" : "MISSING"
      );
      console.log("👤 user:", parsed.state?.user ? "EXISTS" : "MISSING");
      console.log("🔓 isAuthenticated:", parsed.state?.isAuthenticated);

      if (parsed.state?.accessToken) {
        console.log(
          "📝 Token preview:",
          parsed.state.accessToken.substring(0, 20) + "..."
        );
      }
    } catch (e) {
      console.error("❌ Failed to parse auth-storage:", e);
    }
  } else {
    console.warn("⚠️ No auth-storage found - User not logged in!");
  }

  // Check legacy keys
  console.log(
    "🗝️ Legacy 'token' key:",
    localStorage.getItem("token") ? "EXISTS" : "NONE"
  );
  console.log(
    "🗝️ Legacy 'accessToken' key:",
    localStorage.getItem("accessToken") ? "EXISTS" : "NONE"
  );

  console.groupEnd();

  return {
    hasAuthStorage: !!authStorage,
    hasToken: !!authStorage && !!JSON.parse(authStorage).state?.accessToken,
    isAuthenticated:
      !!authStorage && !!JSON.parse(authStorage).state?.isAuthenticated,
  };
};

// Auto-run in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  // Make available globally for console debugging
  (window as any).debugAuth = debugAuth;
  console.log(
    "💡 Debug utility loaded. Run 'debugAuth()' in console to check auth state."
  );
}
