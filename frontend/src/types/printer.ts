export type PrinterType = "thermal" | "laser" | "inkjet";
export type ConnectionType = "usb" | "network" | "bluetooth";
export type PrinterStatus =
  | "online"
  | "offline"
  | "error"
  | "paper_out"
  | "maintenance";
export type PrintJobType = "kot" | "invoice" | "test";
export type PrintJobStatus =
  | "pending"
  | "printing"
  | "completed"
  | "failed"
  | "cancelled";

export interface PrinterSettings {
  cutPaper: boolean;
  cashDrawer: boolean;
  beep: boolean;
  copies: number;
  feedLines: number;
}

export interface Printer {
  _id: string;
  outlet: string;
  name: string;
  type: PrinterType;
  connectionType: ConnectionType;
  ipAddress?: string;
  port?: number;
  deviceId?: string;
  status: PrinterStatus;
  lastOnline?: Date | string;
  isDefault: boolean;
  printKOT: boolean;
  printInvoice: boolean;
  paperWidth: 58 | 80;
  characterWidth: number;
  settings: PrinterSettings;
  createdBy: {
    _id: string;
    name: string;
    phone: string;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreatePrinterInput {
  name: string;
  type: PrinterType;
  connectionType: ConnectionType;
  ipAddress?: string;
  port?: number;
  deviceId?: string;
  paperWidth: 58 | 80;
  printKOT: boolean;
  printInvoice: boolean;
  settings?: Partial<PrinterSettings>;
}

export interface UpdatePrinterInput {
  name?: string;
  type?: PrinterType;
  connectionType?: ConnectionType;
  ipAddress?: string;
  port?: number;
  deviceId?: string;
  status?: PrinterStatus;
  printKOT?: boolean;
  printInvoice?: boolean;
  paperWidth?: 58 | 80;
  settings?: Partial<PrinterSettings>;
}

export interface PrintJob {
  _id: string;
  outlet: string;
  printer: {
    _id: string;
    name: string;
    status: PrinterStatus;
  };
  type: PrintJobType;
  documentId?: string;
  status: PrintJobStatus;
  content: string;
  copies: number;
  retryCount: number;
  maxRetries: number;
  error?: string;
  printedAt?: Date | string;
  printedBy?: {
    _id: string;
    name: string;
  };
  createdBy: {
    _id: string;
    name: string;
    phone: string;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreatePrintJobInput {
  printerId?: string;
  type: PrintJobType;
  documentId?: string;
  content?: string;
  copies?: number;
}

export interface PrintJobFilters {
  printerId?: string;
  type?: PrintJobType;
  status?: PrintJobStatus;
  limit?: number;
}

export const PRINTER_TYPES: { value: PrinterType; label: string }[] = [
  { value: "thermal", label: "Thermal Printer" },
  { value: "laser", label: "Laser Printer" },
  { value: "inkjet", label: "Inkjet Printer" },
];

export const CONNECTION_TYPES: { value: ConnectionType; label: string }[] = [
  { value: "usb", label: "USB" },
  { value: "network", label: "Network (IP)" },
  { value: "bluetooth", label: "Bluetooth" },
];

export const PRINTER_STATUS_COLORS: Record<PrinterStatus, string> = {
  online: "bg-green-100 text-green-700",
  offline: "bg-gray-100 text-gray-700",
  error: "bg-red-100 text-red-700",
  paper_out: "bg-yellow-100 text-yellow-700",
  maintenance: "bg-blue-100 text-blue-700",
};

export const PRINT_JOB_STATUS_COLORS: Record<PrintJobStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  printing: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-700",
};
