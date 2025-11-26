"use client";

import { useEffect, useState } from "react";
import { useBluetoothPrinter } from "@/hooks/useBluetoothPrinter";
import { toast } from "sonner";
import { Bluetooth, BluetoothConnected } from "lucide-react";

/**
 * BluetoothPrinterManager - Global component for managing Bluetooth printer connection
 * Should be included in the app layout to automatically handle printer connections
 */
export default function BluetoothPrinterManager() {
  const {
    isSupported,
    isConnected,
    isConnecting,
    autoDiscoverAndConnect,
    connect,
  } = useBluetoothPrinter();

  const [hasTriedAutoConnect, setHasTriedAutoConnect] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Periodic retry attempts (every 60 seconds, max 3 attempts)
  useEffect(() => {
    if (!isSupported || isConnected || retryCount >= 3) return;

    const retryInterval = setInterval(async () => {
      if (!isConnected && !isConnecting) {
        console.log(`Attempting auto-connect retry ${retryCount + 1}/3`);
        const success = await autoDiscoverAndConnect();

        if (success) {
          // Don't show toast on retry success - it's handled by initial connection
          setShowFloatingButton(false);
          clearInterval(retryInterval);
        } else {
          setRetryCount((prev) => prev + 1);
        }
      }
    }, 60000); // Retry every 60 seconds

    return () => clearInterval(retryInterval);
  }, [
    isSupported,
    isConnected,
    isConnecting,
    retryCount,
    autoDiscoverAndConnect,
  ]);

  // Auto-discover and connect on app load
  useEffect(() => {
    if (!isSupported) {
      console.log("Bluetooth printing not supported");
      return;
    }

    if (hasTriedAutoConnect) return;

    const attemptAutoConnect = async () => {
      setHasTriedAutoConnect(true);

      // Try enhanced auto-discovery which includes paired device scanning
      const success = await autoDiscoverAndConnect();

      if (success) {
        // Connection successful - no toast needed, the green indicator will show
        setShowFloatingButton(false);
      } else {
        // Show floating button silently - user can click to connect
        if (isSupported) {
          setShowFloatingButton(true);
        }
      }
    };

    attemptAutoConnect();
  }, [isSupported, hasTriedAutoConnect, autoDiscoverAndConnect, isConnected]);

  // Handle manual connection
  const handleManualConnect = async () => {
    try {
      const success = await connect();
      if (success) {
        setShowFloatingButton(false);
        // Toast is already shown by the connect() function in the hook
      }
    } catch (error) {
      console.error("Manual connect failed:", error);

      if (error instanceof Error) {
        if (
          error.message.includes("globally disabled") ||
          error.message.includes("NotFoundError")
        ) {
          toast.error("Bluetooth is disabled in your browser", {
            icon: "⚠️",
            duration: 6000,
            description: "Visit Printer Settings for setup instructions",
            action: {
              label: "Settings",
              onClick: () => (window.location.href = "/settings/printer"),
            },
          });
        } else {
          toast.error("Failed to connect: " + error.message, {
            icon: "❌",
            duration: 4000,
          });
        }
      }
    }
  };

  // Hide floating button if already connected
  useEffect(() => {
    if (isConnected) {
      setShowFloatingButton(false);
    }
  }, [isConnected]);

  // Don't render anything if Bluetooth is not supported
  if (!isSupported) {
    return null;
  }

  return (
    <>
      {/* Connection Status Toast - only for successful auto-connections */}
      {/* Toasts are handled in the useEffect above */}

      {/* Floating Connect Button - shown when printer not connected */}
      {showFloatingButton && !isConnected && (
        <div className="fixed bottom-20 right-4 z-50 md:bottom-4">
          <button
            onClick={handleManualConnect}
            disabled={isConnecting}
            className={`
              w-14 h-14 rounded-full shadow-lg border-2 
              flex items-center justify-center 
              transition-all duration-300 hover:scale-105
              ${
                isConnecting
                  ? "bg-blue-100 text-blue-600 border-blue-300 animate-pulse"
                  : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
              }
            `}
            title="Connect Bluetooth Printer"
            aria-label="Connect Bluetooth Printer"
          >
            {isConnecting ? (
              <div className="animate-spin">
                <Bluetooth className="h-6 w-6" />
              </div>
            ) : (
              <Bluetooth className="h-6 w-6" />
            )}
          </button>
        </div>
      )}

      {/* Connected Status Indicator - minimal floating indicator when connected */}
      {isConnected && (
        <div className="fixed bottom-20 right-4 z-40 md:bottom-4">
          <div
            className="w-12 h-12 rounded-full bg-green-100 border-2 border-green-300
                     flex items-center justify-center animate-pulse"
            title="Bluetooth Printer Connected"
            aria-label="Bluetooth Printer Connected"
          >
            <BluetoothConnected className="h-5 w-5 text-green-600" />
          </div>
        </div>
      )}
    </>
  );
}
