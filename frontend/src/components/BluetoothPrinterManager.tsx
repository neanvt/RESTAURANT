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

  // Periodic retry attempts (every 30 seconds, max 5 attempts)
  useEffect(() => {
    if (!isSupported || isConnected || retryCount >= 5) return;

    const retryInterval = setInterval(async () => {
      if (!isConnected && !isConnecting) {
        console.log(`Attempting auto-connect retry ${retryCount + 1}/5`);
        const success = await autoDiscoverAndConnect();
        
        if (success) {
          toast.success("Bluetooth printer connected!", {
            icon: "🔗",
            duration: 2000,
          });
          setShowFloatingButton(false);
          clearInterval(retryInterval);
        } else {
          setRetryCount(prev => prev + 1);
        }
      }
    }, 30000); // Retry every 30 seconds

    return () => clearInterval(retryInterval);
  }, [isSupported, isConnected, isConnecting, retryCount, autoDiscoverAndConnect]);

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
        toast.success("Bluetooth printer connected automatically!", {
          icon: "🔗",
          duration: 3000,
        });
        setShowFloatingButton(false);
      } else {
        // Show floating button with a hint for first-time setup
        if (isSupported) {
          setShowFloatingButton(true);
          
          // Show a helpful toast for first-time users after a delay
          setTimeout(() => {
            if (!isConnected) {
              toast.info("💡 Tap the Bluetooth icon to connect your printer", {
                duration: 5000,
                action: {
                  label: "Connect",
                  onClick: handleManualConnect,
                },
              });
            }
          }, 2000);
        }
      }
    };

    attemptAutoConnect();
  }, [isSupported, hasTriedAutoConnect, autoDiscoverAndConnect, isConnected]);

  // Handle manual connection
  const handleManualConnect = async () => {
    const success = await connect();
    if (success) {
      setShowFloatingButton(false);
      toast.success("Bluetooth printer connected!", {
        icon: "🔗",
        duration: 3000,
      });
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