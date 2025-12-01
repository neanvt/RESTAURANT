export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface Contact {
  phone: string;
  email?: string;
  whatsapp?: string;
}

export interface GstDetails {
  gstin?: string;
  isGstEnabled: boolean;
}

export interface UpiDetails {
  upiId?: string;
  qrCodeUrl?: string;
}

export interface OutletSettings {
  currency: string;
  taxRate: number;
  kotPrinterEnabled: boolean;
  billPrinterEnabled: boolean;
}

export interface Outlet {
  _id: string;
  ownerId: string;
  businessName: string;
  logo?: string;
  address: Address;
  contact: Contact;
  gstDetails: GstDetails;
  upiDetails: UpiDetails;
  settings: OutletSettings;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  fullAddress?: string;
}

export interface CreateOutletInput {
  businessName: string;
  logo?: string;
  address: Address;
  contact: Contact;
  gstDetails?: Partial<GstDetails>;
  upiDetails?: Partial<UpiDetails>;
  settings?: Partial<OutletSettings>;
}

export interface UpdateOutletInput extends Partial<CreateOutletInput> {
  isActive?: boolean;
}

export interface OutletStats {
  outlet: Outlet;
  stats: {
    totalItems: number;
    totalOrders: number;
    totalCustomers: number;
  };
}
