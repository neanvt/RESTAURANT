"use client";

import { useState, useCallback, useEffect } from "react";
import { bluetoothPrinter } from "@/lib/bluetoothPrinter";
import { toast } from "sonner";

export function useBluetoothPrinter() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Auto-reconnect on mount and background reconnection
  useEffect(() => {
    const tryAutoConnect = async () => {
      if (bluetoothPrinter.isSupported() && !bluetoothPrinter.isConnected()) {
        const connected = await bluetoothPrinter.autoDiscoverAndConnect();
        if (connected) {
          setIsConnected(true);
          console.log("✅ Printer auto-connected on mount");
        }
      }
    };

    // Initial connection attempt
    tryAutoConnect();

    // Background reconnection with exponential backoff
    let retryTimeout: NodeJS.Timeout;
    let retryCount = 0;
    const maxRetries = 5;
    const baseDelay = 1000; // 1 second

    const backgroundReconnect = () => {
      if (bluetoothPrinter.isSupported() && !bluetoothPrinter.isConnected() && retryCount < maxRetries) {
        const delay = Math.min(baseDelay * Math.pow(2, retryCount), 16000); // Cap at 16 seconds
        retryTimeout = setTimeout(async () => {
          try {
            const connected = await bluetoothPrinter.autoDiscoverAndConnect();
            if (connected) {
              setIsConnected(true);
              console.log(`✅ Background reconnection successful (attempt ${retryCount + 1})`);
              retryCount = 0; // Reset on success
            } else {
              retryCount++;
              backgroundReconnect(); // Try again
            }
          } catch (error) {
            retryCount++;
            console.log(`❌ Background reconnection failed (attempt ${retryCount}):`, error);
            backgroundReconnect(); // Try again
          }
        }, delay);
      }
    };

    // Start background reconnection after initial attempt
    const backgroundInterval = setInterval(() => {
      if (!bluetoothPrinter.isConnected()) {
        backgroundReconnect();
      }
    }, 15000); // Check every 15 seconds

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
      if (backgroundInterval) clearInterval(backgroundInterval);
    };
  }, []);

  /**
   * Auto-discover and connect to available Bluetooth printers
   */
  const autoDiscoverAndConnect = useCallback(async () => {
    if (!bluetoothPrinter.isSupported()) {
      console.log("Bluetooth printing not supported on this device");
      return false;
    }

    if (bluetoothPrinter.isConnected()) {
      console.log("Printer already connected");
      return true;
    }

    setIsConnecting(true);
    try {
      // Use the enhanced auto-discover and connect method
      const connected = await bluetoothPrinter.autoDiscoverAndConnect();
      if (connected) {
        setIsConnected(true);
        console.log("✅ Successfully connected to Bluetooth printer");
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error("Auto-discovery failed:", error);
      setIsConnected(false);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  /**
   * Check if Bluetooth printing is supported
   */
  const isSupported = useCallback(() => {
    return bluetoothPrinter.isSupported();
  }, []);

  /**
   * Connect to Bluetooth printer
   */
  const connect = useCallback(async () => {
    if (!bluetoothPrinter.isSupported()) {
      toast.error(
        "Bluetooth printing is not supported on this device. Please use Chrome on Android."
      );
      return false;
    }

    setIsConnecting(true);
    try {
      await bluetoothPrinter.connect();
      setIsConnected(true);
      toast.success("Printer connected successfully!");
      return true;
    } catch (error: any) {
      console.error("Printer connection failed:", error);

      if (error.name === "NotFoundError") {
        toast.error(
          "No printer found. Make sure your Bluetooth printer is on and in pairing mode."
        );
      } else if (error.name === "SecurityError") {
        toast.error(
          "Bluetooth access denied. Please allow Bluetooth permissions."
        );
      } else {
        toast.error(`Failed to connect to printer: ${error.message}`);
      }

      setIsConnected(false);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  /**
   * Disconnect from printer
   */
  const disconnect = useCallback(async () => {
    try {
      await bluetoothPrinter.disconnect();
      setIsConnected(false);
      toast.info("Printer disconnected");
    } catch (error) {
      console.error("Disconnect failed:", error);
      toast.error("Failed to disconnect printer");
    }
  }, []);

  /**
   * Print test page
   */
  const printTest = useCallback(async () => {
    if (!bluetoothPrinter.isConnected()) {
      toast.warning("Please connect to a printer first");
      const connected = await connect();
      if (!connected) return;
    }

    setIsPrinting(true);
    try {
      await bluetoothPrinter.printTestPage();
      toast.success("Test page printed successfully!");
    } catch (error: any) {
      console.error("Print test failed:", error);
      toast.error(`Print failed: ${error.message}`);
    } finally {
      setIsPrinting(false);
    }
  }, [connect]);

  /**
   * Print invoice
   */
  const printInvoice = useCallback(
    async (invoice: any) => {
      if (!bluetoothPrinter.isConnected()) {
        toast.warning("Connecting to printer...");
        const connected = await connect();
        if (!connected) return;
      }

      setIsPrinting(true);
      try {
        await bluetoothPrinter.printInvoice(invoice);
        toast.success("Invoice printed successfully!");
      } catch (error: any) {
        console.error("Print invoice failed:", error);
        toast.error(`Print failed: ${error.message}`);
      } finally {
        setIsPrinting(false);
      }
    },
    [connect]
  );

  /**
   * Print KOT (Kitchen Order Ticket)
   */
  const printKOT = useCallback(
    async (kot: any) => {
      if (!bluetoothPrinter.isConnected()) {
        toast.warning("Connecting to printer...");
        const connected = await connect();
        if (!connected) return;
      }

      setIsPrinting(true);
      try {
        await bluetoothPrinter.printKOT(kot);
        toast.success("KOT sent to kitchen!");
      } catch (error: any) {
        console.error("Print KOT failed:", error);
        toast.error(`Print failed: ${error.message}`);
      } finally {
        setIsPrinting(false);
      }
    },
    [connect]
  );

  return {
    isSupported: isSupported(),
    isConnected,
    isConnecting,
    isPrinting,
    connect,
    disconnect,
    printTest,
    printInvoice,
    printKOT,
    autoDiscoverAndConnect,
  };
}
