/**
 * Bluetooth Thermal Printer Service for Mobile Devices
 * Supports 58mm thermal printers like Shreyans SC588
 * Uses Web Bluetooth API (Chrome Android) and ESC/POS commands
 */

// ESC/POS Commands for thermal printers
const ESC = '\x1B';
const GS = '\x1D';

const Commands = {
  // Initialize printer
  INIT: `${ESC}@`,
  
  // Text formatting
  BOLD_ON: `${ESC}E1`,
  BOLD_OFF: `${ESC}E0`,
  UNDERLINE_ON: `${ESC}-1`,
  UNDERLINE_OFF: `${ESC}-0`,
  DOUBLE_WIDTH: `${GS}!0x11`,
  NORMAL_WIDTH: `${GS}!0x00`,
  
  // Alignment
  ALIGN_LEFT: `${ESC}a0`,
  ALIGN_CENTER: `${ESC}a1`,
  ALIGN_RIGHT: `${ESC}a2`,
  
  // Text size
  SIZE_NORMAL: `${GS}!0x00`,
  SIZE_DOUBLE_HEIGHT: `${GS}!0x01`,
  SIZE_DOUBLE_WIDTH: `${GS}!0x10`,
  SIZE_DOUBLE: `${GS}!0x11`,
  SIZE_TRIPLE: `${GS}!0x22`,
  
  // Line spacing
  LINE_SPACING_DEFAULT: `${ESC}2`,
  LINE_SPACING_NARROW: `${ESC}30`,
  
  // Paper cutting
  CUT_PAPER: `${GS}V0`,
  CUT_PAPER_PARTIAL: `${GS}V1`,
  
  // Feed
  FEED_LINE: '\n',
  FEED_LINES_3: '\n\n\n',
  
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
    
    return `${GS}(k${String.fromCharCode(4, 0)}149${String.fromCharCode(qrSize, 0)}` +
           `${GS}(k${String.fromCharCode(3, 0)}149${String.fromCharCode(errorLevel)}` +
           `${GS}(k${String.fromCharCode(pl + 3, ph)}149${String.fromCharCode(80, 48)}${data}` +
           `${GS}(k${String.fromCharCode(3, 0)}149${String.fromCharCode(81, 48)}`;
  },
  
  // Line
  HORIZONTAL_LINE: '--------------------------------',
  DOUBLE_LINE: '================================',
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
  
  // Standard Bluetooth service UUID for serial port
  private readonly SERVICE_UUID = '000018f0-0000-1000-8000-00805f9b34fb';
  private readonly CHARACTERISTIC_UUID = '00002af1-0000-1000-8000-00805f9b34fb';

  /**
   * Check if Web Bluetooth is supported
   */
  isSupported(): boolean {
    if (typeof navigator === 'undefined') return false;
    return 'bluetooth' in navigator;
  }

  /**
   * Connect to a Bluetooth thermal printer
   */
  async connect(): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('Web Bluetooth is not supported on this device. Please use Chrome on Android.');
    }

    try {
      // Request Bluetooth device
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: [this.SERVICE_UUID] },
          { namePrefix: 'BlueTooth Printer' },
          { namePrefix: 'Printer' },
          { namePrefix: 'POS' },
          { namePrefix: 'Thermal' },
          { namePrefix: 'RPP' },
          { namePrefix: 'MTP' },
        ],
        optionalServices: [this.SERVICE_UUID],
      });

      if (!this.device.gatt) {
        throw new Error('GATT not available');
      }

      // Connect to GATT server
      const server = await this.device.gatt.connect();
      
      // Get service
      const service = await server.getPrimaryService(this.SERVICE_UUID);
      
      // Get characteristic
      this.characteristic = await service.getCharacteristic(this.CHARACTERISTIC_UUID);
      
      console.log('✅ Bluetooth printer connected:', this.device.name);
    } catch (error) {
      console.error('❌ Bluetooth connection failed:', error);
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
      console.log('Bluetooth printer disconnected');
    }
  }

  /**
   * Check if printer is connected
   */
  isConnected(): boolean {
    return this.device?.gatt?.connected ?? false;
  }

  /**
   * Send raw data to printer
   */
  private async write(data: string | Uint8Array): Promise<void> {
    if (!this.characteristic) {
      throw new Error('Printer not connected. Please connect first.');
    }

    const bytes = typeof data === 'string' ? this.encoder.encode(data) : data;
    
    // Split into chunks of 512 bytes (Bluetooth MTU limit)
    const chunkSize = 512;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, i + chunkSize);
      await this.characteristic.writeValue(chunk);
      // Small delay between chunks
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  /**
   * Print text with formatting
   */
  async printText(text: string, options?: {
    bold?: boolean;
    underline?: boolean;
    align?: 'left' | 'center' | 'right';
    size?: 'normal' | 'double' | 'triple';
  }): Promise<void> {
    let output = '';

    // Apply formatting
    if (options?.bold) output += Commands.BOLD_ON;
    if (options?.underline) output += Commands.UNDERLINE_ON;
    
    if (options?.align === 'center') output += Commands.ALIGN_CENTER;
    else if (options?.align === 'right') output += Commands.ALIGN_RIGHT;
    else output += Commands.ALIGN_LEFT;
    
    if (options?.size === 'double') output += Commands.SIZE_DOUBLE;
    else if (options?.size === 'triple') output += Commands.SIZE_TRIPLE;
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
  async printLine(type: 'single' | 'double' = 'single'): Promise<void> {
    await this.write(type === 'double' ? Commands.DOUBLE_LINE : Commands.HORIZONTAL_LINE);
    await this.write(Commands.FEED_LINE);
  }

  /**
   * Print left-right aligned text (for labels and values)
   */
  async printColumns(left: string, right: string, width: number = 32): Promise<void> {
    const spaces = width - left.length - right.length;
    const line = left + ' '.repeat(Math.max(spaces, 1)) + right;
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
    await this.write('PRINTER TEST');
    await this.write(Commands.FEED_LINE);
    await this.write(Commands.BOLD_OFF);
    await this.write(Commands.ALIGN_LEFT);
    await this.printLine();
    
    await this.write(Commands.ALIGN_CENTER);
    await this.write('Restaurant POS System');
    await this.write(Commands.FEED_LINE);
    await this.write(new Date().toLocaleString('en-IN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    }));
    await this.write(Commands.FEED_LINE);
    await this.write(Commands.ALIGN_LEFT);
    await this.printLine();
    
    // Text formatting
    await this.write(Commands.BOLD_ON);
    await this.write('Text Formatting:');
    await this.write(Commands.FEED_LINE);
    await this.write(Commands.BOLD_OFF);
    
    await this.write('Normal Text');
    await this.write(Commands.FEED_LINE);
    
    await this.write(Commands.BOLD_ON);
    await this.write('Bold Text');
    await this.write(Commands.FEED_LINE);
    await this.write(Commands.BOLD_OFF);
    
    await this.write(Commands.UNDERLINE_ON);
    await this.write('Underlined Text');
    await this.write(Commands.FEED_LINE);
    await this.write(Commands.UNDERLINE_OFF);
    
    await this.printLine();
    
    // Alignment test
    await this.write(Commands.BOLD_ON);
    await this.write('Alignment Test:');
    await this.write(Commands.FEED_LINE);
    await this.write(Commands.BOLD_OFF);
    
    await this.write(Commands.ALIGN_LEFT);
    await this.write('Left Aligned');
    await this.write(Commands.FEED_LINE);
    
    await this.write(Commands.ALIGN_CENTER);
    await this.write('Center Aligned');
    await this.write(Commands.FEED_LINE);
    
    await this.write(Commands.ALIGN_RIGHT);
    await this.write('Right Aligned');
    await this.write(Commands.FEED_LINE);
    
    await this.write(Commands.ALIGN_LEFT);
    await this.printLine();
    
    // Column test
    await this.write(Commands.BOLD_ON);
    await this.write('Column Test:');
    await this.write(Commands.FEED_LINE);
    await this.write(Commands.BOLD_OFF);
    
    await this.printColumns('Item 1', '₹100.00');
    await this.printColumns('Item 2', '₹250.00');
    await this.printLine();
    await this.printColumns('Total', '₹350.00');
    
    await this.feed(2);
    await this.write(Commands.ALIGN_CENTER);
    await this.write(Commands.BOLD_ON);
    await this.write('Test Successful!');
    await this.write(Commands.FEED_LINE);
    await this.write(Commands.BOLD_OFF);
    await this.write(Commands.ALIGN_LEFT);
    
    await this.cut();
  }

  /**
   * Print invoice/receipt
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

    // Header - Normal size, not double
    await this.printText(invoice.outletName, { bold: true, align: 'center' });
    if (invoice.outletAddress) {
      await this.write(Commands.ALIGN_CENTER);
      await this.write(invoice.outletAddress.substring(0, 32));
      await this.write(Commands.FEED_LINE);
    }
    if (invoice.outletPhone) {
      await this.write(Commands.ALIGN_CENTER);
      await this.write(`Phone: ${invoice.outletPhone}`);
      await this.write(Commands.FEED_LINE);
    }
    await this.write(Commands.ALIGN_LEFT);
    await this.printLine();

    // Invoice details - compact
    await this.write(`Invoice: ${invoice.invoiceNumber}`);
    await this.write(Commands.FEED_LINE);
    await this.write(`Date: ${invoice.date}`);
    await this.write(Commands.FEED_LINE);
    if (invoice.customerName) {
      await this.write(`Customer: ${invoice.customerName}`);
      await this.write(Commands.FEED_LINE);
    }
    await this.printLine();

    // Items header
    await this.write(Commands.BOLD_ON);
    await this.write('Item Name         Qty  Price ');
    await this.write(Commands.FEED_LINE);
    await this.write(Commands.BOLD_OFF);
    await this.printLine();
    
    // Items
    for (const item of invoice.items) {
      // Item name (max 32 chars on 58mm)
      const itemName = item.name.substring(0, 30);
      await this.write(itemName);
      await this.write(Commands.FEED_LINE);
      
      // Quantity, price and total on same line
      const qtyStr = `${item.quantity}x`;
      const priceStr = `₹${item.price.toFixed(2)}`;
      const totalStr = `₹${item.total.toFixed(2)}`;
      
      // Right align total
      const line = `  ${qtyStr} ${priceStr}`;
      const spaces = 32 - line.length - totalStr.length;
      await this.write(line + ' '.repeat(Math.max(spaces, 1)) + totalStr);
      await this.write(Commands.FEED_LINE);
    }
    
    await this.printLine();

    // Totals - right aligned
    const subtotalLine = 'Subtotal:';
    const subtotalValue = `₹${invoice.subtotal.toFixed(2)}`;
    await this.write(subtotalLine + ' '.repeat(32 - subtotalLine.length - subtotalValue.length) + subtotalValue);
    await this.write(Commands.FEED_LINE);
    
    if (invoice.tax) {
      const taxLine = 'Tax:';
      const taxValue = `₹${invoice.tax.toFixed(2)}`;
      await this.write(taxLine + ' '.repeat(32 - taxLine.length - taxValue.length) + taxValue);
      await this.write(Commands.FEED_LINE);
    }
    
    if (invoice.discount) {
      const discLine = 'Discount:';
      const discValue = `-₹${invoice.discount.toFixed(2)}`;
      await this.write(discLine + ' '.repeat(32 - discLine.length - discValue.length) + discValue);
      await this.write(Commands.FEED_LINE);
    }
    
    await this.printLine('double');
    
    // Grand total - bold
    await this.write(Commands.BOLD_ON);
    const totalLine = 'TOTAL:';
    const totalValue = `₹${invoice.total.toFixed(2)}`;
    await this.write(totalLine + ' '.repeat(32 - totalLine.length - totalValue.length) + totalValue);
    await this.write(Commands.FEED_LINE);
    await this.write(Commands.BOLD_OFF);
    
    await this.printLine('double');

    if (invoice.paymentMethod) {
      await this.write(`Payment: ${invoice.paymentMethod}`);
      await this.write(Commands.FEED_LINE);
    }

    // Footer
    await this.feed(1);
    await this.write(Commands.ALIGN_CENTER);
    await this.write(Commands.BOLD_ON);
    await this.write('Thank you for your visit!');
    await this.write(Commands.FEED_LINE);
    await this.write(Commands.BOLD_OFF);
    await this.write('Please visit again');
    await this.write(Commands.FEED_LINE);
    await this.write(Commands.ALIGN_LEFT);
    
    await this.cut();
  }

  /**
   * Print KOT (Kitchen Order Ticket)
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
  }): Promise<void> {
    await this.initialize();

    // Header - Double size only for KOT title
    await this.write(Commands.ALIGN_CENTER);
    await this.write(Commands.SIZE_DOUBLE);
    await this.write(Commands.BOLD_ON);
    await this.write('KITCHEN ORDER');
    await this.write(Commands.FEED_LINE);
    await this.write(Commands.SIZE_NORMAL);
    await this.write(Commands.BOLD_OFF);
    await this.write(Commands.ALIGN_LEFT);
    await this.printLine('double');

    // Order details - Compact
    await this.write(`KOT: ${kot.orderNumber}`);
    await this.write(Commands.FEED_LINE);
    
    if (kot.tableNumber) {
      await this.write(Commands.BOLD_ON);
      await this.write(`Table No: ${kot.tableNumber}`);
      await this.write(Commands.FEED_LINE);
      await this.write(Commands.BOLD_OFF);
    }
    
    await this.write(`Time: ${kot.date}`);
    await this.write(Commands.FEED_LINE);
    await this.printLine('double');

    // Items - Clear and readable
    await this.write(Commands.BOLD_ON);
    await this.write('Item                      QTY');
    await this.write(Commands.FEED_LINE);
    await this.write(Commands.BOLD_OFF);
    await this.printLine();
    
    for (const item of kot.items) {
      // Item name
      const itemName = item.name.substring(0, 26);
      const qtyStr = String(item.quantity);
      const spaces = 32 - itemName.length - qtyStr.length;
      
      await this.write(itemName + ' '.repeat(Math.max(spaces, 1)) + qtyStr);
      await this.write(Commands.FEED_LINE);
      
      // Notes if any
      if (item.notes) {
        await this.write(`  Note: ${item.notes.substring(0, 28)}`);
        await this.write(Commands.FEED_LINE);
      }
    }

    await this.printLine('double');
    
    // Footer
    await this.write(Commands.ALIGN_CENTER);
    await this.write(kot.outletName);
    await this.write(Commands.FEED_LINE);
    await this.write(Commands.ALIGN_LEFT);
    
    await this.cut();
  }
}

// Singleton instance
export const bluetoothPrinter = new BluetoothPrinterService();
