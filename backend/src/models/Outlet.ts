import mongoose, { Schema, Document } from "mongoose";

export interface IOutlet extends Document {
  ownerId: mongoose.Types.ObjectId;
  businessName: string;
  logo?: string;
  businessType?: string;
  cuisineType?: string[];
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  contact: {
    phone: string;
    email?: string;
    whatsapp?: string;
  };
  gstDetails: {
    gstin?: string;
    isGstEnabled: boolean;
  };
  upiDetails: {
    upiId?: string;
    qrCodeUrl?: string;
  };
  socialMedia?: {
    googleMapsUrl?: string;
    swiggyUrl?: string;
    zomatoUrl?: string;
    website?: string;
    instagram?: string;
    facebook?: string;
  };
  operatingHours?: {
    monday?: { open: string; close: string; closed: boolean };
    tuesday?: { open: string; close: string; closed: boolean };
    wednesday?: { open: string; close: string; closed: boolean };
    thursday?: { open: string; close: string; closed: boolean };
    friday?: { open: string; close: string; closed: boolean };
    saturday?: { open: string; close: string; closed: boolean };
    sunday?: { open: string; close: string; closed: boolean };
  };
  tableManagement?: {
    enabled: boolean;
    totalTables: number;
    tablePrefix: string;
  };
  settings: {
    currency: string;
    language: string;
    timezone: string;
    taxRate: number;
    taxType?: string;
    serviceChargeEnabled: boolean;
    serviceChargeRate: number;
    kotPrinterEnabled: boolean;
    billPrinterEnabled: boolean;
    financialYearStart?: string; // Format: "YY-YY" e.g. "25-26" for 2025-2026
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OutletSchema: Schema = new Schema(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    businessName: {
      type: String,
      required: [true, "Business name is required"],
      trim: true,
    },
    logo: {
      type: String,
      default: null,
    },
    businessType: {
      type: String,
      trim: true,
    },
    cuisineType: [
      {
        type: String,
        trim: true,
      },
    ],
    address: {
      street: {
        type: String,
        required: [true, "Street address is required"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
      state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
      },
      pincode: {
        type: String,
        required: [true, "Pincode is required"],
        trim: true,
      },
      country: {
        type: String,
        required: true,
        default: "India",
        trim: true,
      },
    },
    contact: {
      phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
      whatsapp: {
        type: String,
        trim: true,
      },
    },
    gstDetails: {
      gstin: {
        type: String,
        trim: true,
        uppercase: true,
      },
      isGstEnabled: {
        type: Boolean,
        default: false,
      },
    },
    upiDetails: {
      upiId: {
        type: String,
        trim: true,
      },
      qrCodeUrl: {
        type: String,
      },
    },
    socialMedia: {
      googleMapsUrl: {
        type: String,
        trim: true,
      },
      swiggyUrl: {
        type: String,
        trim: true,
      },
      zomatoUrl: {
        type: String,
        trim: true,
      },
      website: {
        type: String,
        trim: true,
      },
      instagram: {
        type: String,
        trim: true,
      },
      facebook: {
        type: String,
        trim: true,
      },
    },
    operatingHours: {
      monday: {
        open: String,
        close: String,
        closed: { type: Boolean, default: false },
      },
      tuesday: {
        open: String,
        close: String,
        closed: { type: Boolean, default: false },
      },
      wednesday: {
        open: String,
        close: String,
        closed: { type: Boolean, default: false },
      },
      thursday: {
        open: String,
        close: String,
        closed: { type: Boolean, default: false },
      },
      friday: {
        open: String,
        close: String,
        closed: { type: Boolean, default: false },
      },
      saturday: {
        open: String,
        close: String,
        closed: { type: Boolean, default: false },
      },
      sunday: {
        open: String,
        close: String,
        closed: { type: Boolean, default: false },
      },
    },
    tableManagement: {
      enabled: {
        type: Boolean,
        default: false,
      },
      totalTables: {
        type: Number,
        default: 0,
        min: 0,
      },
      tablePrefix: {
        type: String,
        default: "T",
        trim: true,
      },
    },
    settings: {
      currency: {
        type: String,
        default: "INR",
      },
      language: {
        type: String,
        default: "en",
      },
      timezone: {
        type: String,
        default: "Asia/Kolkata",
      },
      taxRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      taxType: {
        type: String,
        trim: true,
      },
      serviceChargeEnabled: {
        type: Boolean,
        default: false,
      },
      serviceChargeRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      kotPrinterEnabled: {
        type: Boolean,
        default: false,
      },
      billPrinterEnabled: {
        type: Boolean,
        default: false,
      },
      financialYearStart: {
        type: String,
        default: "25-26", // Default to 2025-2026
        trim: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
OutletSchema.index({ ownerId: 1, isActive: 1 });
OutletSchema.index({ businessName: "text" });

// Virtual for full address
OutletSchema.virtual("fullAddress").get(function (this: IOutlet) {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.pincode}, ${this.address.country}`;
});

// Ensure virtuals are included in JSON
OutletSchema.set("toJSON", { virtuals: true });
OutletSchema.set("toObject", { virtuals: true });

export default mongoose.model<IOutlet>("Outlet", OutletSchema);
