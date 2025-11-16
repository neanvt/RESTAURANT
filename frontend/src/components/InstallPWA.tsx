"use client";

import { useEffect, useState } from "react";
import { X, Plus, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [canShowInstallPrompt, setCanShowInstallPrompt] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    console.log("🔍 PWA Install Component initialized");

    // Ensure we're in browser environment
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return;
    }

    // Check if running on iOS
    const iOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Check if already installed (standalone mode)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    console.log("PWA Install Status:", {
      iOS,
      standalone,
      canInstall: !standalone,
      userAgent: navigator.userAgent.substring(0, 50),
    });

    // Don't show banner if already installed
    if (standalone) {
      console.log("✅ App already installed in standalone mode");
      return;
    }

    // Clear dismissed flag for testing - uncomment in development
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      console.log("🧹 Clearing previous dismissal for testing");
      localStorage.removeItem("pwa-install-dismissed");
    }

    // Check if user dismissed banner before - DISABLED FOR TESTING
    // const dismissed = localStorage.getItem("pwa-install-dismissed");
    // if (dismissed) {
    //   const dismissedTime = parseInt(dismissed);
    //   const daysSinceDismissal =
    //     (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    //   // Show again after 7 days
    //   if (daysSinceDismissal < 7) {
    //     console.log(
    //       `⏰ Install prompt dismissed ${daysSinceDismissal.toFixed(1)} days ago, showing again after 7 days`
    //     );
    //     return;
    //   } else {
    //     console.log("♻️ Clearing old dismissal, will show prompt again");
    //     localStorage.removeItem("pwa-install-dismissed");
    //   }
    // }

    let promptCaptured = false;

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handler = (e: Event) => {
      console.log(
        "✅ beforeinstallprompt event fired - Install button will be available!"
      );
      e.preventDefault();
      promptCaptured = true;
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      // Show banner immediately when prompt is available
      setShowInstallBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    console.log("👂 Listening for beforeinstallprompt event...");

    // Always show banner after 5 seconds (for both iOS and non-iOS)
    const showTimer = setTimeout(() => {
      console.log("⏰ 5 seconds passed, showing install banner");
      setShowInstallBanner(true);
    }, 5000);

    // Check after a short delay if prompt was captured
    const checkTimer = setTimeout(() => {
      if (!promptCaptured) {
        console.log("⚠️ No beforeinstallprompt event after 2 seconds.");
        console.log("💡 To enable PWA install on localhost:");
        console.log(
          "   1. Open chrome://flags/#bypass-app-banner-engagement-checks"
        );
        console.log("   2. Enable the flag");
        console.log("   3. Restart Chrome");
        console.log("   OR");
        console.log("   Use the browser's menu: ⋮ → Install app");
      }
    }, 2000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(showTimer);
      clearTimeout(checkTimer);
    };
  }, [isMounted]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      console.log("❌ No install prompt available");
      return;
    }

    try {
      console.log("📱 Showing install prompt...");
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for user choice
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("✅ User accepted - PWA installed!");
      } else {
        console.log("❌ User dismissed the install prompt");
      }

      // Clear the prompt
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    } catch (error) {
      console.error("Error during install:", error);
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("pwa-install-dismissed", Date.now().toString());
    }
  };

  // Don't render until mounted (prevents hydration mismatch)
  if (!isMounted) {
    return null;
  }

  // Don't show anything if already installed or banner is hidden
  if (isStandalone || !showInstallBanner) {
    return null;
  }

  return (
    <>
      {/* Install Banner - Compact */}
      <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom duration-300 max-w-md mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-2xl p-3">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3 pr-6">
            <div className="p-2 bg-white/20 rounded-lg flex-shrink-0">
              <Smartphone className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base mb-1">
                Install Restaurant POS
              </h3>
              <p className="text-xs text-blue-100 mb-2">
                Quick access & offline mode
              </p>

              {/* Android/Chrome Install with native prompt */}
              {!isIOS && deferredPrompt && (
                <Button
                  onClick={handleInstall}
                  size="lg"
                  className="w-full bg-white text-blue-600 hover:bg-blue-50 shadow-lg font-semibold"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Install App
                </Button>
              )}

              {/* Manual Instructions when no native prompt available */}
              {!isIOS && !deferredPrompt && (
                <div className="text-sm text-blue-100">
                  <p className="mb-2">
                    Tap <strong className="text-white">⋮</strong> menu →{" "}
                    <strong className="text-white">
                      &quot;Install app&quot;
                    </strong>
                  </p>
                  <p className="text-xs text-blue-200">
                    Or enable:{" "}
                    <code className="text-[10px]">
                      chrome://flags/#bypass-app-banner
                    </code>
                  </p>
                </div>
              )}

              {/* iOS Install Instructions */}
              {isIOS && (
                <div className="bg-white/10 rounded-lg p-3 text-sm">
                  <p className="font-medium mb-2">To install on iOS:</p>
                  <ol className="space-y-1 text-blue-100">
                    <li>1. Tap the Share button (square with arrow)</li>
                    <li>2. Scroll down and tap "Add to Home Screen"</li>
                    <li>3. Tap "Add" to confirm</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
