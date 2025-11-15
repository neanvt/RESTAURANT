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

  useEffect(() => {
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
      console.log("App already installed in standalone mode");
      return;
    }

    // Check if user dismissed banner before
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissal =
        (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

      // Show again after 7 days
      if (daysSinceDismissal < 7) {
        console.log(
          `Install prompt dismissed ${daysSinceDismissal.toFixed(1)} days ago`
        );
        return;
      }
    }

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handler = (e: Event) => {
      console.log("beforeinstallprompt event fired");
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Show banner after 5 seconds for all non-installed cases
    setTimeout(() => {
      console.log("Showing install banner");
      setShowInstallBanner(true);
    }, 5000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for user choice
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("✅ PWA installed");
    }

    // Clear the prompt
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  const handleShowManually = () => {
    setShowInstallBanner(true);
  };

  // Show manual trigger button in development (always show if not installed)
  if (isStandalone) {
    return null;
  }

  // Show test button if banner is hidden
  if (!showInstallBanner) {
    return (
      <button
        onClick={handleShowManually}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors text-xs z-50 opacity-50 hover:opacity-100"
        title="Show install prompt"
      >
        📱 Install
      </button>
    );
  }

  return (
    <>
      {/* Install Banner */}
      <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom duration-300">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-2xl p-4">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-3 pr-6">
            <div className="p-2 bg-white/20 rounded-lg">
              <Smartphone className="h-6 w-6" />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">
                Install Restaurant POS
              </h3>
              <p className="text-sm text-blue-100 mb-3">
                Add to your home screen for quick access and offline support!
              </p>

              {/* Android/Chrome Install */}
              {!isIOS && (
                <div className="space-y-2">
                  {deferredPrompt ? (
                    <Button
                      onClick={handleInstall}
                      className="w-full bg-white text-blue-600 hover:bg-blue-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Install App
                    </Button>
                  ) : (
                    <div className="text-center text-sm text-blue-100">
                      <p className="mb-2">To install this app:</p>
                      <p className="text-xs">
                        Tap your browser&apos;s menu and select &quot;Install app&quot; or &quot;Add to Home screen&quot;
                      </p>
                    </div>
                  )}
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
