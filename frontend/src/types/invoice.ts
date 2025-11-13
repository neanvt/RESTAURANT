export interface InvoiceItem {
  item: {
    _id: string;
    name: string;
    price: number;
    taxRate?: number;
  };
  quantity: number;
  price: number;
  taxAmount: number;
  total: number;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  outlet: {
    _id: string;
    name: string;
    businessName: string;
    address?: string;
    phone?: string;
    email?: string;
    gstin?: string;
    upiId?: string;
    logo?: {
      url: string;
    };
  };
  order: string;
  customer?: {
    name: string;
    phone?: string;
    address?: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discount: {
    type: "percentage" | "fixed";
    value: number;
    amount: number;
  };
  total: number;
  paymentMethod: "cash" | "upi" | "card" | "phonepe" | "googlepay";
  paymentStatus: "pending" | "paid" | "refunded";
  upiQRCode?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceDTO {
  orderId: string;
  customer?: {
    name: string;
    phone?: string;
    address?: string;
  };
  discount?: {
    type: "percentage" | "fixed";
    value: number;
  };
  paymentMethod: "cash" | "upi" | "card" | "phonepe" | "googlepay";
  notes?: string;
}

export interface UpdatePaymentStatusDTO {
  paymentStatus: "pending" | "paid" | "refunded";
}

export interface InvoiceFilters {
  paymentStatus?: "pending" | "paid" | "refunded";
  paymentMethod?: "cash" | "upi" | "card" | "phonepe" | "googlepay";
  startDate?: string;
  endDate?: string;
  customerName?: string;
  search?: string;
}

export interface SalesSummary {
  totalSales: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  cashSales: number;
  upiSales: number;
  cardSales: number;
  phonepeSales: number;
  googlepaySales: number;
  totalDiscount: number;
  totalTax: number;
  averageOrderValue: number;
}

export interface InvoiceListResponse {
  invoices: Invoice[];
  total: number;
  page: number;
  pages: number;
}
