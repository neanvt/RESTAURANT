/**
 * Bluetooth Thermal Printer Service for Mobile Devices
 * Supports 58mm thermal printers like Shreyans SC588
 * Uses Web Bluetooth API (Chrome Android) and ESC/POS commands
 */

// ESC/POS Commands for thermal printers
const ESC = "\x1B";
const GS = "\x1D";

const Commands = {
  // Initialize printer
  INIT: `${ESC}@`,

  // Text formatting
  BOLD_ON: `${ESC}E1`,
  BOLD_OFF: `${ESC}E0`,
  UNDERLINE_ON: `${ESC}-1`,
  UNDERLINE_OFF: `${ESC}-0`,
  DOUBLE_WIDTH: `${GS}!\x11`,
  NORMAL_WIDTH: `${GS}!\x00`,

  // Alignment
  ALIGN_LEFT: `${ESC}a0`,
  ALIGN_CENTER: `${ESC}a1`,
  ALIGN_RIGHT: `${ESC}a2`,

  // Text size
  SIZE_NORMAL: `${GS}!\x00`,
  SIZE_DOUBLE_HEIGHT: `${GS}!\x01`,
  SIZE_DOUBLE_WIDTH: `${GS}!\x10`,
  SIZE_DOUBLE: `${GS}!\x11`,
  SIZE_SMALL: `${GS}!\x00`,

  // Line spacing
  LINE_SPACING_DEFAULT: `${ESC}2`,
  LINE_SPACING_NARROW: `${ESC}3\x10`,

  // Paper cutting
  CUT_PAPER: `${GS}V\x00`,
  CUT_PAPER_PARTIAL: `${GS}V\x01`,

  // Feed
  FEED_LINE: "\n",
  FEED_LINES_2: "\n\n",
  FEED_LINES_3: "\n\n\n",

  // Barcode
  BARCODE_HEIGHT: (h: number) => `${GS}h${String.fromCharCode(h)}`,
  BARCODE_WIDTH: (w: number) => `${GS}w${String.fromCharCode(w)}`,

  // QR Code
  QR_CODE: (data: string) => {
    const qrSize = 6; // Module size 1-16
    const errorLevel = 48; // L=48, M=49, Q=50, H=51
    const len = data.length;
    const pl = len % 256;
    const ph = Math.floor(len / 256);

    return (
      `${GS}(k${String.fromCharCode(4, 0)}149${String.fromCharCode(
        qrSize,
        0
      )}` +
      `${GS}(k${String.fromCharCode(3, 0)}149${String.fromCharCode(
        errorLevel
      )}` +
      `${GS}(k${String.fromCharCode(pl + 3, ph)}149${String.fromCharCode(
        80,
        48
      )}${data}` +
      `${GS}(k${String.fromCharCode(3, 0)}149${String.fromCharCode(81, 48)}`
    );
  },

  // Line separators (32 chars for 58mm)
  HORIZONTAL_LINE: "--------------------------------",
  DOUBLE_LINE: "================================",
  DOTTED_LINE: "................................",
};

export interface BluetoothPrinterDevice {
  device: any; // BluetoothDevice
  characteristic: any | null; // BluetoothRemoteGATTCharacteristic
  connected: boolean;
}

class BluetoothPrinterService {
  private device: any | null = null; // BluetoothDevice
  private characteristic: any | null = null; // BluetoothRemoteGATTCharacteristic
  private encoder = new TextEncoder();
  private readonly STORAGE_KEY = "bluetooth_printer_device";

  // Standard Bluetooth service UUID for serial port
  private readonly SERVICE_UUID = "000018f0-0000-1000-8000-00805f9b34fb";
  private readonly CHARACTERISTIC_UUID = "00002af1-0000-1000-8000-00805f9b34fb";

  /**
   * Check if Web Bluetooth is supported
   */
  isSupported(): boolean {
    if (typeof navigator === "undefined") return false;
    return "bluetooth" in navigator;
  }

  /**
   * Save printer device ID to localStorage
   */
  private saveDevice(deviceId: string, deviceName: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify({ id: deviceId, name: deviceName })
      );
    }
  }

  /**
   * Get saved printer device info
   */
  private getSavedDevice(): { id: string; name: string } | null {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  }

  /**
   * Clear saved printer device
   */
  private clearSavedDevice(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Auto-reconnect to previously connected printer
   */
  async autoReconnect(): Promise<boolean> {
    const saved = this.getSavedDevice();
    if (!saved) return false;

    try {
      // Check if Web Bluetooth API is available
      if (!navigator.bluetooth || !navigator.bluetooth.getDevices) {
        console.log("Web Bluetooth API not available for auto-reconnect");
        return false;
      }

      // Try to get the device from bluetooth devices
      const devices = await navigator.bluetooth.getDevices();
      const device = devices.find((d: any) => d.id === saved.id);

      if (!device || !device.gatt) {
        this.clearSavedDevice();
        return false;
      }

      this.device = device;
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(this.SERVICE_UUID);
      this.characteristic = await service.getCharacteristic(
        this.CHARACTERISTIC_UUID
      );

      console.log("✅ Auto-reconnected to printer:", saved.name);
      return true;
    } catch (error) {
      console.log("Auto-reconnect failed:", error);
      this.clearSavedDevice();
      return false;
    }
  }

  /**
   * Enhanced auto-discovery that attempts to connect to any known printer types
   * This tries to connect to already paired devices automatically
   */
  async autoDiscoverAndConnect(): Promise<boolean> {
    if (!this.isSupported()) {
      console.log("Web Bluetooth is not supported on this device.");
      return false;
    }

    // First try auto-reconnect to saved device
    const reconnected = await this.autoReconnect();
    if (reconnected) return true;

    // Strategy 1: Try to get already paired devices (if API is available)
    if (
      navigator.bluetooth &&
      typeof navigator.bluetooth.getDevices === "function"
    ) {
      try {
        const pairedConnected = await this.connectToPairedDevices();
        if (pairedConnected) return true;
      } catch (error) {
        console.log("Paired devices connection failed:", error);
      }
    }

    // Strategy 2: Try silent connection with common printer services
    try {
      const silentConnected = await this.attemptSilentConnection();
      if (silentConnected) return true;
    } catch (error) {
      console.log("Silent connection failed:", error);
    }

    console.log("All auto-connection strategies failed");
    return false;
  }

  /**
   * Strategy 1: Connect to already paired devices
   */
  private async connectToPairedDevices(): Promise<boolean> {
    try {
      const devices = await navigator.bluetooth.getDevices();
      console.log(`Found ${devices.length} paired Bluetooth devices`);

      for (const device of devices) {
        // Look for printer-like devices
        if (device.name && this.isPrinterDevice(device.name)) {
          console.log(
            `Attempting to connect to potential printer: ${device.name}`
          );
          try {
            if (!device.gatt) {
              console.log(`Device ${device.name} has no GATT interface`);
              continue;
            }

            this.device = device;
            const server = await device.gatt.connect();

            try {
              const service = await server.getPrimaryService(this.SERVICE_UUID);
              this.characteristic = await service.getCharacteristic(
                this.CHARACTERISTIC_UUID
              );

              // Save this device for future auto-reconnect
              this.saveDevice(device.id, device.name);

              console.log(
                "✅ Auto-connected to discovered printer:",
                device.name
              );
              return true;
            } catch (serviceError) {
              console.log(
                `Service/characteristic error for ${device.name}:`,
                serviceError
              );
              // Try to disconnect if we connected but couldn't get service
              try {
                server.disconnect();
              } catch (e) {
                // Ignore disconnect errors
              }
              continue;
            }
          } catch (error) {
            console.log("Failed to connect to device:", device.name, error);
            continue;
          }
        }
      }

      console.log("No compatible printers found in paired devices");
    } catch (error) {
      console.log("Failed to get paired devices:", error);
    }

    return false;
  }

  /**
   * Check if a device name suggests it's a printer
   */
  private isPrinterDevice(name: string): boolean {
    const printerKeywords = [
      "printer",
      "pos",
      "thermal",
      "receipt",
      "bluetooth printer",
      "rpp",
      "mtp",
      "shreyans",
      "sc588",
      "zj",
      "epson",
      "star",
      "xprinter",
      "gprinter",
      "bixolon",
      "citizen",
      "goojprt",
      "munbyn",
      "milestone",
      "print",
      "58mm",
      "80mm",
    ];

    const lowerName = name.toLowerCase();
    const isMatch = printerKeywords.some((keyword) =>
      lowerName.includes(keyword)
    );

    if (isMatch) {
      console.log(`Device '${name}' identified as potential printer`);
    }

    return isMatch;
  }

  /**
   * Strategy 2: Attempt silent connection with common printer services
   * This tries to connect without showing the device selection dialog when possible
   */
  private async attemptSilentConnection(): Promise<boolean> {
    // Check if we can attempt background discovery
    if (!navigator.bluetooth) {
      console.log("Bluetooth not available for silent connection");
      return false;
    }

    try {
      // Try to get availability first
      const available = await navigator.bluetooth.getAvailability();
      if (!available) {
        console.log("Bluetooth not available on device");
        return false;
      }

      // Attempt to connect using watchAdvertisements if available
      // This is a more advanced approach for newer Chrome versions
      console.log("Attempting silent connection via advertisement watching...");

      // For now, we'll return false as true silent connection
      // requires the device to be pre-paired or use experimental APIs
      console.log(
        "Silent connection not available - requires user interaction for security"
      );
      return false;
    } catch (error) {
      console.log("Silent connection attempt failed:", error);
      return false;
    }
  }

  /**
   * Smart connect that tries auto-discovery first, then falls back to manual selection
   */
  async smartConnect(): Promise<boolean> {
    // Try auto-discovery first
    const autoConnected = await this.autoDiscoverAndConnect();
    if (autoConnected) return true;

    // Don't fall back to manual connection - let user manually trigger it
    return false;
  }

  /**
   * Connect to a Bluetooth thermal printer
   */
  async connect(): Promise<void> {
    if (!this.isSupported()) {
      throw new Error(
        "Web Bluetooth is not supported or is disabled. Please enable Web Bluetooth in your browser settings or use Chrome on Android/Windows."
      );
    }

    // Additional check for globally disabled API
    try {
      if (navigator.bluetooth && navigator.bluetooth.getAvailability) {
        await navigator.bluetooth.getAvailability();
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("globally disabled")
      ) {
        throw new Error(
          "Web Bluetooth API is globally disabled. Please enable it in chrome://flags/#enable-web-bluetooth or use a supported browser."
        );
      }
    }

    try {
      // Enhanced device filters to catch more printer types
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: [this.SERVICE_UUID] },
          { namePrefix: "BlueTooth Printer" },
          { namePrefix: "Printer" },
          { namePrefix: "POS" },
          { namePrefix: "Thermal" },
          { namePrefix: "RPP" },
          { namePrefix: "MTP" },
          { namePrefix: "ZJ" },
          { namePrefix: "Shreyans" },
          { namePrefix: "SC588" },
          { namePrefix: "EPSON" },
          { namePrefix: "Star" },
          { namePrefix: "XPrinter" },
          { namePrefix: "GPrinter" },
          { namePrefix: "BIXOLON" },
          { namePrefix: "Citizen" },
        ],
        optionalServices: [this.SERVICE_UUID],
      });

      if (!this.device.gatt) {
        throw new Error("GATT not available");
      }

      // Connect to GATT server
      const server = await this.device.gatt.connect();

      // Get service
      const service = await server.getPrimaryService(this.SERVICE_UUID);

      // Get characteristic
      this.characteristic = await service.getCharacteristic(
        this.CHARACTERISTIC_UUID
      );

      // Save device info for auto-reconnect
      this.saveDevice(this.device.id, this.device.name);

      console.log("✅ Bluetooth printer connected:", this.device.name);
    } catch (error) {
      console.error("❌ Bluetooth connection failed:", error);
      throw error;
    }
  }

  /**
   * Disconnect from printer
   */
  async disconnect(): Promise<void> {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
      this.device = null;
      this.characteristic = null;
      this.clearSavedDevice();
      console.log("Bluetooth printer disconnected");
    }
  }

  /**
   * Check if printer is connected
   */
  isConnected(): boolean {
    return this.device?.gatt?.connected ?? false;
  }

  /**
   * Wrap text to fit within specified width
   */
  private wrapText(text: string, width: number): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      if ((currentLine + word).length <= width) {
        currentLine += (currentLine ? " " : "") + word;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          // Word is longer than width, split it
          lines.push(word.substring(0, width));
          currentLine = word.substring(width);
        }
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * Send raw data to printer
   */
  private async write(data: string | Uint8Array): Promise<void> {
    if (!this.characteristic) {
      throw new Error("Printer not connected. Please connect first.");
    }

    const bytes = typeof data === "string" ? this.encoder.encode(data) : data;

    // Split into chunks of 512 bytes (Bluetooth MTU limit)
    const chunkSize = 512;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, i + chunkSize);
      await this.characteristic.writeValue(chunk);
      // Small delay between chunks
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  /**
   * Print text with formatting
   */
  async printText(
    text: string,
    options?: {
      bold?: boolean;
      underline?: boolean;
      align?: "left" | "center" | "right";
      size?: "normal" | "double" | "small";
    }
  ): Promise<void> {
    let output = "";

    // Apply formatting
    if (options?.bold) output += Commands.BOLD_ON;
    if (options?.underline) output += Commands.UNDERLINE_ON;

    if (options?.align === "center") output += Commands.ALIGN_CENTER;
    else if (options?.align === "right") output += Commands.ALIGN_RIGHT;
    else output += Commands.ALIGN_LEFT;

    if (options?.size === "double") output += Commands.SIZE_DOUBLE;
    else if (options?.size === "small") output += Commands.SIZE_SMALL;
    else output += Commands.SIZE_NORMAL;

    // Add text
    output += text;

    // Reset formatting
    output += Commands.BOLD_OFF;
    output += Commands.UNDERLINE_OFF;
    output += Commands.SIZE_NORMAL;
    output += Commands.ALIGN_LEFT;
    output += Commands.FEED_LINE;

    await this.write(output);
  }

  /**
   * Print a line separator
   */
  async printLine(type: "single" | "double" = "single"): Promise<void> {
    await this.write(
      type === "double" ? Commands.DOUBLE_LINE : Commands.HORIZONTAL_LINE
    );
    await this.write(Commands.FEED_LINE);
  }

  /**
   * Print left-right aligned text (for labels and values)
   */
  async printColumns(
    left: string,
    right: string,
    width: number = 32
  ): Promise<void> {
    const spaces = width - left.length - right.length;
    const line = left + " ".repeat(Math.max(spaces, 1)) + right;
    await this.write(line + Commands.FEED_LINE);
  }

  /**
   * Feed paper lines
   */
  async feed(lines: number = 1): Promise<void> {
    await this.write(Commands.FEED_LINE.repeat(lines));
  }

  /**
   * Cut paper
   */
  async cut(): Promise<void> {
    await this.write(Commands.FEED_LINES_3);
    await this.write(Commands.CUT_PAPER);
  }

  /**
   * Initialize printer
   */
  async initialize(): Promise<void> {
    await this.write(Commands.INIT);
  }

  /**
   * Print QR Code
   */
  async printQRCode(data: string): Promise<void> {
    await this.write(Commands.ALIGN_CENTER);
    await this.write(Commands.QR_CODE(data));
    await this.feed(2);
    await this.write(Commands.ALIGN_LEFT);
  }

  /**
   * Print a test page
   */
  async printTestPage(): Promise<void> {
    await this.initialize();

    // Header - normal size
    await this.write(Commands.ALIGN_CENTER);
    await this.write(Commands.BOLD_ON);
    await this.write("PRINTER TEST");
    await this.write(Commands.FEED_LINE);
    await this.write(Commands.BOLD_OFF);
    await this.write(Commands.ALIGN_LEFT);
    await this.printLine();

    await this.write(Commands.ALIGN_CENTER);
    await this.write("Restaurant POS System");
    await this.write(Commands.FEED_LINE);
    await this.write(
      new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    );
    await this.write(Commands.FEED_LINE);
    await this.write(Commands.ALIGN_LEFT);
    await this.printLine();

    // Text formatting
    await this.write(Commands.BOLD_ON);
    await this.write("Text Formatting:");
    await this.write(Commands.FEED_LINE);
    await this.write(Commands.BOLD_OFF);

    await this.write("Normal Text");
    await this.write(Commands.FEED_LINE);

    await this.write(Commands.BOLD_ON);
    await this.write("Bold Text");
    await this.write(Commands.FEED_LINE);
    await this.write(Commands.BOLD_OFF);

    await this.write(Commands.UNDERLINE_ON);
    await this.write("Underlined Text");
    await this.write(Commands.FEED_LINE);
    await this.write(Commands.UNDERLINE_OFF);

    await this.printLine();

    // Alignment test
    await this.write(Commands.BOLD_ON);
    await this.write("Alignment Test:");
    await this.write(Commands.FEED_LINE);
    await this.write(Commands.BOLD_OFF);

    await this.write(Commands.ALIGN_LEFT);
    await this.write("Left Aligned");
    await this.write(Commands.FEED_LINE);

    await this.write(Commands.ALIGN_CENTER);
    await this.write("Center Aligned");
    await this.write(Commands.FEED_LINE);

    await this.write(Commands.ALIGN_RIGHT);
    await this.write("Right Aligned");
    await this.write(Commands.FEED_LINE);

    await this.write(Commands.ALIGN_LEFT);
    await this.printLine();

    // Column test
    await this.write(Commands.BOLD_ON);
    await this.write("Column Test:");
    await this.write(Commands.FEED_LINE);
    await this.write(Commands.BOLD_OFF);

    await this.printColumns("Item 1", "₹100.00");
    await this.printColumns("Item 2", "₹250.00");
    await this.printLine();
    await this.printColumns("Total", "₹350.00");

    await this.feed(2);
    await this.write(Commands.ALIGN_CENTER);
    await this.write(Commands.BOLD_ON);
    await this.write("Test Successful!");
    await this.write(Commands.FEED_LINE);
    await this.write(Commands.BOLD_OFF);
    await this.write(Commands.ALIGN_LEFT);

    await this.cut();
  }

  /**
   * Print invoice/receipt - Professional thermal printer format
   */
  async printInvoice(invoice: {
    outletName: string;
    outletAddress?: string;
    outletPhone?: string;
    invoiceNumber: string;
    date: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      total: number;
    }>;
    subtotal: number;
    tax?: number;
    discount?: number;
    total: number;
    paymentMethod?: string;
    customerName?: string;
  }): Promise<void> {
    await this.initialize();
    await this.write(Commands.LINE_SPACING_NARROW);

    // Header
    await this.write(Commands.ALIGN_CENTER);
    await this.write(Commands.BOLD_ON);
    await this.write(invoice.outletName.substring(0, 32) + "\n");
    await this.write(Commands.BOLD_OFF);

    if (invoice.outletAddress) {
      // Auto-wrap address to fit 32 character width
      const addressLines = this.wrapText(invoice.outletAddress, 32);
      for (const line of addressLines) {
        await this.write(line + "\n");
      }
    }
    if (invoice.outletPhone) {
      await this.write("Ph: " + invoice.outletPhone + "\n");
    }
    await this.write(Commands.ALIGN_LEFT);
    await this.write(Commands.HORIZONTAL_LINE + "\n");

    // Invoice type
    await this.write(Commands.ALIGN_CENTER);
    await this.write(Commands.BOLD_ON);
    await this.write("TAX INVOICE\n");
    await this.write(Commands.BOLD_OFF);
    await this.write(Commands.ALIGN_LEFT);
    await this.write(Commands.HORIZONTAL_LINE + "\n");

    // Invoice details
    await this.write("Invoice: " + invoice.invoiceNumber + "\n");

    // Format date properly - handle various date formats
    let formattedDateTime;
    try {
      const dateObj =
        typeof invoice.date === "string"
          ? new Date(invoice.date)
          : invoice.date;
      if (dateObj && !isNaN(dateObj.getTime())) {
        formattedDateTime = dateObj.toLocaleString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      } else {
        // Fallback to current date if parsing fails
        formattedDateTime = new Date().toLocaleString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      }
    } catch (error) {
      console.error("Date parsing error:", error);
      formattedDateTime = new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
    await this.write("Date: " + formattedDateTime + "\n");
    if (invoice.customerName) {
      await this.write(
        "Customer: " + invoice.customerName.substring(0, 22) + "\n"
      );
    }
    await this.write(Commands.HORIZONTAL_LINE + "\n");

    // Items header - full width utilization (32 chars)
    await this.write("Item              Qty  Price\n");
    await this.write(Commands.DOTTED_LINE + "\n");

    // Items with full width spacing - 18+1+4+1+8 = 32 chars
    for (const item of invoice.items) {
      // Wrap item names that are too long (18 chars max for item)
      const itemLines = this.wrapText(item.name, 18);
      const qty = ("x" + item.quantity).padStart(4);
      const price = ("Rs" + item.price.toFixed(0)).padStart(8);

      // Print first line with qty and price - total = 18+1+4+1+8 = 32 chars
      const firstLine = itemLines[0] || "";
      await this.write(firstLine.padEnd(18) + " " + qty + " " + price + "\n");

      // Print additional lines for wrapped item names (no qty/price)
      for (let i = 1; i < itemLines.length; i++) {
        await this.write(itemLines[i] + "\n");
      }
    }

    await this.write(Commands.HORIZONTAL_LINE + "\n");

    // Totals with full width alignment (32 chars total)
    const subtotalStr = "Rs" + invoice.subtotal.toFixed(0);
    await this.write("Subtotal:".padEnd(24) + subtotalStr.padStart(8) + "\n");

    if (invoice.tax && invoice.tax > 0) {
      const taxStr = "Rs" + invoice.tax.toFixed(0);
      await this.write("Tax:".padEnd(24) + taxStr.padStart(8) + "\n");
    }

    if (invoice.discount && invoice.discount > 0) {
      const discStr = "Rs" + invoice.discount.toFixed(0);
      await this.write(
        "Discount:".padEnd(24) + ("-" + discStr).padStart(8) + "\n"
      );
    }

    await this.write(Commands.DOUBLE_LINE + "\n");

    // Grand total with full width alignment
    const totalStr = "Rs" + invoice.total.toFixed(0);
    await this.write(Commands.BOLD_ON);
    await this.write(Commands.SIZE_DOUBLE_HEIGHT);
    await this.write("TOTAL:".padEnd(24) + totalStr.padStart(8) + "\n");
    await this.write(Commands.BOLD_OFF);
    await this.write(Commands.SIZE_NORMAL);
    await this.write(Commands.DOUBLE_LINE + "\n");

    if (invoice.paymentMethod) {
      await this.write(
        "Payment: " + invoice.paymentMethod.toUpperCase() + "\n"
      );
    }

    // Footer
    await this.write("\n");
    await this.write(Commands.ALIGN_CENTER);
    await this.write("Thank you for visiting!\n");
    await this.write("Please come again\n");
    await this.write(Commands.ALIGN_LEFT);

    await this.feed(2);
    await this.cut();
  }

  /**
   * Print KOT (Kitchen Order Ticket) - Clean thermal printer format
   */
  async printKOT(kot: {
    outletName: string;
    orderNumber: string;
    tableNumber?: string;
    date: string;
    items: Array<{
      name: string;
      quantity: number;
      notes?: string;
    }>;
    isHold?: boolean;
  }): Promise<void> {
    await this.initialize();
    await this.write(Commands.LINE_SPACING_NARROW);

    // Header
    await this.write(Commands.ALIGN_CENTER);
    if (kot.isHold) {
      await this.write(Commands.BOLD_ON);
      await this.write("** HOLD ORDER **\n");
      await this.write(Commands.BOLD_OFF);
    }
    await this.write(Commands.SIZE_NORMAL);
    await this.write("KITCHEN ORDER\n");
    await this.write(Commands.ALIGN_LEFT);
    await this.write(Commands.HORIZONTAL_LINE + "\n");

    // Order details
    await this.write("KOT: " + kot.orderNumber + "\n");
    if (kot.tableNumber) {
      await this.write("Table: " + kot.tableNumber + "\n");
    }

    // Format date properly - handle various date formats
    let formattedDateTime;
    try {
      const dateObj =
        typeof kot.date === "string" ? new Date(kot.date) : kot.date;
      if (dateObj && !isNaN(dateObj.getTime())) {
        formattedDateTime = dateObj.toLocaleString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      } else {
        // Fallback to current date if parsing fails
        formattedDateTime = new Date().toLocaleString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      }
    } catch (error) {
      console.error("Date parsing error:", error);
      formattedDateTime = new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
    await this.write("Time: " + formattedDateTime + "\n");

    if (kot.isHold) {
      await this.write(Commands.BOLD_ON);
      await this.write("Status: ON HOLD\n");
      await this.write(Commands.BOLD_OFF);
    }
    await this.write(Commands.HORIZONTAL_LINE + "\n");

    // Items header
    await this.write("Item                     Qty\n");
    await this.write(Commands.DOTTED_LINE + "\n");

    // Items list with wrapped names
    for (const item of kot.items) {
      // Wrap long item names to multiple lines
      const itemLines = this.wrapText(item.name, 24);
      const qty = String(item.quantity).padStart(3);

      // Print first line with quantity
      const firstLine = itemLines[0] || "";
      await this.write(firstLine.padEnd(24) + " " + qty + "\n");

      // Print additional lines for wrapped text
      for (let i = 1; i < itemLines.length; i++) {
        await this.write(itemLines[i] + "\n");
      }

      // Notes if any
      if (item.notes) {
        await this.write("  * " + item.notes.substring(0, 29) + "\n");
      }
    }

    await this.write(Commands.HORIZONTAL_LINE + "\n");

    // Footer
    await this.write(Commands.ALIGN_CENTER);
    await this.write(kot.outletName.substring(0, 32) + "\n");
    if (kot.isHold) {
      await this.write(Commands.BOLD_ON);
      await this.write("** ORDER ON HOLD **\n");
      await this.write(Commands.BOLD_OFF);
    }
    await this.write(Commands.ALIGN_LEFT);

    await this.feed(2);
    await this.cut();
  }
}

// Singleton instance
export const bluetoothPrinter = new BluetoothPrinterService();
