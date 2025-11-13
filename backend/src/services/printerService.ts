import Printer, { IPrinter } from "../models/Printer";
import PrintJob, { IPrintJob } from "../models/PrintJob";
import KOT from "../models/KOT";
import Invoice from "../models/Invoice";

// ESC/POS Commands
const ESC = "\x1B";
const GS = "\x1D";

export class PrinterService {
  /**
   * Create new printer
   */
  async createPrinter(data: {
    outletId: string;
    name: string;
    type: string;
    connectionType: string;
    ipAddress?: string;
    port?: number;
    deviceId?: string;
    paperWidth: number;
    printKOT: boolean;
    printInvoice: boolean;
    settings?: any;
    createdBy: string;
  }): Promise<IPrinter> {
    const printer = await Printer.create({
      outlet: data.outletId,
      name: data.name,
      type: data.type,
      connectionType: data.connectionType,
      ipAddress: data.ipAddress,
      port: data.port,
      deviceId: data.deviceId,
      paperWidth: data.paperWidth,
      characterWidth: data.paperWidth === 80 ? 48 : 32,
      printKOT: data.printKOT,
      printInvoice: data.printInvoice,
      settings: data.settings,
      createdBy: data.createdBy,
    });

    return printer;
  }

  /**
   * Get all printers for outlet
   */
  async getPrinters(outletId: string): Promise<IPrinter[]> {
    const printers = await Printer.find({ outlet: outletId })
      .populate("createdBy", "name phone")
      .sort({ isDefault: -1, createdAt: -1 });

    return printers;
  }

  /**
   * Get printer by ID
   */
  async getPrinterById(id: string, outletId: string): Promise<IPrinter | null> {
    const printer = await Printer.findOne({
      _id: id,
      outlet: outletId,
    }).populate("createdBy", "name phone");

    return printer;
  }

  /**
   * Update printer
   */
  async updatePrinter(
    id: string,
    outletId: string,
    data: Partial<IPrinter>
  ): Promise<IPrinter | null> {
    const printer = await Printer.findOneAndUpdate(
      { _id: id, outlet: outletId },
      { $set: data },
      { new: true, runValidators: true }
    ).populate("createdBy", "name phone");

    return printer;
  }

  /**
   * Delete printer
   */
  async deletePrinter(id: string, outletId: string): Promise<boolean> {
    const result = await Printer.deleteOne({ _id: id, outlet: outletId });
    return result.deletedCount > 0;
  }

  /**
   * Update printer status
   */
  async updatePrinterStatus(
    id: string,
    outletId: string,
    status: string
  ): Promise<IPrinter | null> {
    const printer = await Printer.findOneAndUpdate(
      { _id: id, outlet: outletId },
      { $set: { status } },
      { new: true }
    );

    return printer;
  }

  /**
   * Set default printer
   */
  async setDefaultPrinter(
    id: string,
    outletId: string
  ): Promise<IPrinter | null> {
    const printer = await Printer.findOneAndUpdate(
      { _id: id, outlet: outletId },
      { $set: { isDefault: true } },
      { new: true }
    );

    return printer;
  }

  /**
   * Get default printer for outlet
   */
  async getDefaultPrinter(outletId: string): Promise<IPrinter | null> {
    const printer = await Printer.findOne({
      outlet: outletId,
      isDefault: true,
      status: { $ne: "offline" },
    });

    return printer;
  }

  /**
   * Generate ESC/POS commands for text
   */
  private escPosText(
    text: string,
    options: {
      align?: "left" | "center" | "right";
      bold?: boolean;
      size?: "normal" | "large";
      underline?: boolean;
    } = {}
  ): string {
    let commands = "";

    // Alignment
    if (options.align === "center") {
      commands += `${ESC}a1`;
    } else if (options.align === "right") {
      commands += `${ESC}a2`;
    } else {
      commands += `${ESC}a0`;
    }

    // Text size
    if (options.size === "large") {
      commands += `${GS}!${String.fromCharCode(0x11)}`; // 2x height and width
    } else {
      commands += `${GS}!${String.fromCharCode(0x00)}`;
    }

    // Bold
    if (options.bold) {
      commands += `${ESC}E1`;
    }

    // Underline
    if (options.underline) {
      commands += `${ESC}-1`;
    }

    commands += text + "\n";

    // Reset
    commands += `${ESC}E0${ESC}-0`;

    return commands;
  }

  /**
   * Generate separator line
   */
  private escPosSeparator(width: number, char: string = "-"): string {
    return this.escPosText(char.repeat(width), { align: "center" });
  }

  /**
   * Generate KOT print content
   */
  async generateKOTPrintContent(kotId: string): Promise<string> {
    const kot = await KOT.findById(kotId)
      .populate("outletId", "businessName")
      .populate("order")
      .populate("items.item", "name");

    if (!kot) {
      throw new Error("KOT not found");
    }

    const outlet = kot.outletId as any;
    let content = "";

    // Initialize printer
    content += `${ESC}@`; // Initialize

    // Header
    content += this.escPosText(outlet.businessName || "Restaurant", {
      align: "center",
      bold: true,
      size: "large",
    });
    content += this.escPosText("KITCHEN ORDER TICKET", {
      align: "center",
      bold: true,
    });
    content += this.escPosSeparator(48);

    // KOT Details
    content += this.escPosText(`KOT #: ${kot.kotNumber}`, { bold: true });
    content += this.escPosText(
      `Date: ${new Date(kot.createdAt).toLocaleString("en-IN")}`,
      {}
    );
    content += this.escPosText(`Table: ${kot.tableNumber || "Takeaway"}`, {});
    content += this.escPosSeparator(48);

    // Items
    content += this.escPosText("ITEMS", { bold: true, align: "center" });
    content += this.escPosSeparator(48);

    for (const item of kot.items) {
      const itemName = (item.item as any).name;
      const qty = item.quantity;
      content += this.escPosText(`${qty}x ${itemName}`, { size: "large" });

      if (item.notes) {
        content += this.escPosText(`   Note: ${item.notes}`, {});
      }
    }

    content += this.escPosSeparator(48);

    // Footer
    if (kot.notes) {
      content += this.escPosText("Special Instructions:", { bold: true });
      content += this.escPosText(kot.notes, {});
      content += this.escPosSeparator(48);
    }

    content += this.escPosText("Thank You!", { align: "center" });

    // Feed and cut
    content += `${ESC}d3`; // Feed 3 lines
    content += `${GS}V${String.fromCharCode(66)}${String.fromCharCode(0)}`; // Cut paper

    return content;
  }

  /**
   * Generate Invoice print content
   */
  async generateInvoicePrintContent(invoiceId: string): Promise<string> {
    const invoice = await Invoice.findById(invoiceId)
      .populate("outletId")
      .populate("order")
      .populate("items.item", "name price");

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    const outlet = invoice.outletId as any;
    let content = "";

    // Initialize printer
    content += `${ESC}@`;

    // Header
    content += this.escPosText(outlet.businessName || "Restaurant", {
      align: "center",
      bold: true,
      size: "large",
    });

    if (outlet.address) {
      content += this.escPosText(outlet.address, { align: "center" });
    }

    if (outlet.phone) {
      content += this.escPosText(`Ph: ${outlet.phone}`, { align: "center" });
    }

    if (outlet.gstin) {
      content += this.escPosText(`GSTIN: ${outlet.gstin}`, { align: "center" });
    }

    content += this.escPosSeparator(48, "=");

    // Invoice Details
    content += this.escPosText(`Invoice #: ${invoice.invoiceNumber}`, {
      bold: true,
    });
    content += this.escPosText(
      `Date: ${new Date(invoice.createdAt).toLocaleString("en-IN")}`,
      {}
    );

    if (invoice.customer) {
      content += this.escPosText(`Customer: ${invoice.customer.name}`, {});
      if (invoice.customer.phone) {
        content += this.escPosText(`Phone: ${invoice.customer.phone}`, {});
      }
    }

    content += this.escPosSeparator(48);

    // Items header
    content += this.escPosText("Item              Qty   Rate    Amount", {
      bold: true,
    });
    content += this.escPosSeparator(48);

    // Items
    for (const item of invoice.items) {
      const itemName = (item.item as any).name.substring(0, 15).padEnd(15);
      const qty = item.quantity.toString().padStart(3);
      const rate = item.price.toFixed(2).padStart(7);
      const amount = item.total.toFixed(2).padStart(8);

      content += this.escPosText(`${itemName} ${qty} ${rate} ${amount}`, {});
    }

    content += this.escPosSeparator(48);

    // Totals
    const subTotal = `Subtotal:`.padStart(40);
    content += this.escPosText(
      `${subTotal} ${invoice.subtotal.toFixed(2).padStart(8)}`,
      {}
    );

    if (invoice.taxAmount && invoice.taxAmount > 0) {
      const taxLabel = `Tax:`.padStart(40);
      content += this.escPosText(
        `${taxLabel} ${invoice.taxAmount.toFixed(2).padStart(8)}`,
        {}
      );
    }

    if (invoice.discount && invoice.discount.amount > 0) {
      const discLabel = `Discount:`.padStart(40);
      content += this.escPosText(
        `${discLabel} -${invoice.discount.amount.toFixed(2).padStart(7)}`,
        {}
      );
    }

    content += this.escPosSeparator(48, "=");

    const totalLabel = `TOTAL:`.padStart(40);
    content += this.escPosText(
      `${totalLabel} ${invoice.total.toFixed(2).padStart(8)}`,
      { bold: true, size: "large" }
    );

    content += this.escPosSeparator(48, "=");

    // Payment method
    content += this.escPosText(`Payment: ${invoice.paymentMethod}`, {
      align: "center",
    });

    // Footer
    content += this.escPosText("Thank You! Visit Again!", {
      align: "center",
      bold: true,
    });

    // Feed and cut
    content += `${ESC}d3`;
    content += `${GS}V${String.fromCharCode(66)}${String.fromCharCode(0)}`;

    return content;
  }

  /**
   * Create print job
   */
  async createPrintJob(data: {
    outletId: string;
    printerId?: string;
    type: "kot" | "invoice" | "test";
    documentId?: string;
    content?: string;
    copies?: number;
    createdBy: string;
  }): Promise<IPrintJob> {
    let printer: IPrinter | null = null;

    // Get printer
    if (data.printerId) {
      printer = await this.getPrinterById(data.printerId, data.outletId);
    } else {
      printer = await this.getDefaultPrinter(data.outletId);
    }

    if (!printer) {
      throw new Error("No printer available");
    }

    // Generate print content if not provided
    let content = data.content || "";
    if (!content) {
      if (data.type === "kot" && data.documentId) {
        content = await this.generateKOTPrintContent(data.documentId);
      } else if (data.type === "invoice" && data.documentId) {
        content = await this.generateInvoicePrintContent(data.documentId);
      } else {
        throw new Error("Print content is required");
      }
    }

    const printJob = await PrintJob.create({
      outlet: data.outletId,
      printer: printer._id,
      type: data.type,
      documentId: data.documentId,
      content,
      copies: data.copies || printer.settings.copies,
      createdBy: data.createdBy,
    });

    return printJob;
  }

  /**
   * Get print jobs with filters
   */
  async getPrintJobs(
    outletId: string,
    filters?: {
      printerId?: string;
      type?: string;
      status?: string;
      limit?: number;
    }
  ): Promise<IPrintJob[]> {
    const query: any = { outlet: outletId };

    if (filters?.printerId) query.printer = filters.printerId;
    if (filters?.type) query.type = filters.type;
    if (filters?.status) query.status = filters.status;

    const printJobs = await PrintJob.find(query)
      .populate("printer", "name status")
      .populate("createdBy", "name phone")
      .sort({ createdAt: -1 })
      .limit(filters?.limit || 50);

    return printJobs;
  }

  /**
   * Update print job status
   */
  async updatePrintJobStatus(
    id: string,
    outletId: string,
    status: string,
    error?: string
  ): Promise<IPrintJob | null> {
    const update: any = { status };

    if (status === "failed" && error) {
      update.error = error;
      update.$inc = { retryCount: 1 };
    }

    if (status === "completed") {
      update.printedAt = new Date();
    }

    const printJob = await PrintJob.findOneAndUpdate(
      { _id: id, outlet: outletId },
      update,
      { new: true }
    );

    return printJob;
  }

  /**
   * Retry failed print job
   */
  async retryPrintJob(id: string, outletId: string): Promise<IPrintJob | null> {
    const printJob = await PrintJob.findOne({ _id: id, outlet: outletId });

    if (!printJob) {
      return null;
    }

    if (printJob.retryCount >= printJob.maxRetries) {
      throw new Error("Maximum retry attempts exceeded");
    }

    printJob.status = "pending";
    printJob.error = undefined;
    await printJob.save();

    return printJob;
  }

  /**
   * Cancel print job
   */
  async cancelPrintJob(
    id: string,
    outletId: string
  ): Promise<IPrintJob | null> {
    const printJob = await PrintJob.findOneAndUpdate(
      { _id: id, outlet: outletId, status: "pending" },
      { $set: { status: "cancelled" } },
      { new: true }
    );

    return printJob;
  }
}

export default new PrinterService();
