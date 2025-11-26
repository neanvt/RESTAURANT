"use client";

import { useState, useCallback, useEffect } from "react";
import { bluetoothPrinter } from "@/lib/bluetoothPrinter";
import { toast } from "sonner";

export function useBluetoothPrinter() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Auto-reconnect on mount and sync connection state regularly
  useEffect(() => {
    const syncAndConnect = async () => {
      // Sync actual connection state with React state
      const actuallyConnected = bluetoothPrinter.isConnected();
      if (actuallyConnected !== isConnected) {
        setIsConnected(actuallyConnected);
        console.log(`🔄 Synced connection state: ${actuallyConnected}`);
      }

      // Try auto-connection if not connected
      if (bluetoothPrinter.isSupported() && !actuallyConnected) {
        console.log("🔌 Attempting auto-connection...");
        try {
          const connected = await bluetoothPrinter.autoDiscoverAndConnect();
          if (connected) {
            setIsConnected(true);
            console.log("✅ Printer auto-connected on mount");
          }
        } catch (error) {
          console.log("❌ Auto-connection failed:", error);
        }
      }
    };

    // Initial sync and connect
    syncAndConnect();

    // Regular connection monitoring
    const connectionCheck = setInterval(() => {
      const actuallyConnected = bluetoothPrinter.isConnected();
      if (actuallyConnected !== isConnected) {
        setIsConnected(actuallyConnected);
        console.log(`🔄 Connection state changed: ${actuallyConnected}`);
      }
    }, 3000); // Check every 3 seconds

    return () => {
      clearInterval(connectionCheck);
    };
  }, [isConnected]);

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
      console.log("🖨️ Starting KOT print process...");
      console.log("📄 KOT data:", kot);

      // Force connection state sync
      const actuallyConnected = bluetoothPrinter.isConnected();
      if (actuallyConnected !== isConnected) {
        setIsConnected(actuallyConnected);
        console.log(
          `🔄 Synced connection state before printing: ${actuallyConnected}`
        );
      }

      if (!actuallyConnected) {
        console.log("🔌 Printer not connected, attempting connection...");
        toast.warning("Connecting to printer...");

        try {
          const connected = await connect();
          if (!connected) {
            console.error("❌ Failed to connect for KOT printing");
            return;
          }
          console.log("✅ Connected successfully for KOT printing");
        } catch (error) {
          console.error("❌ Connection failed:", error);
          return;
        }
      }

      setIsPrinting(true);
      try {
        console.log("📤 Sending KOT to Bluetooth printer...");
        await bluetoothPrinter.printKOT(kot);
        console.log("✅ KOT printed successfully via Bluetooth");
        toast.success("KOT sent to kitchen!");

        // Ensure connection state stays correct
        setIsConnected(bluetoothPrinter.isConnected());
      } catch (error: any) {
        console.error("❌ Bluetooth KOT print failed:", error);
        toast.error(`Print failed: ${error.message}`);

        // Update connection state if needed
        setIsConnected(bluetoothPrinter.isConnected());
      } finally {
        setIsPrinting(false);
      }
    },
    [connect, isConnected]
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
