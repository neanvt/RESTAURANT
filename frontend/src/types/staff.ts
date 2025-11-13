export type StaffRole =
  | "primary_admin"
  | "secondary_admin"
  | "staff"
  | "waiter"
  | "kitchen";
export type StaffStatus = "invited" | "joined" | "suspended";

export interface Staff {
  _id: string;
  phone: string;
  name: string;
  email?: string;
  role: StaffRole;
  outlets: string[];
  currentOutlet?: string;
  permissions: string[];
  invitedBy?: {
    _id: string;
    name: string;
    phone: string;
  };
  status: StaffStatus;
  lastActive?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffActivity {
  _id: string;
  user: {
    _id: string;
    name: string;
    phone: string;
    role: StaffRole;
  };
  outlet: string;
  action: string;
  actionType:
    | "order_created"
    | "order_updated"
    | "item_created"
    | "item_updated"
    | "invoice_generated"
    | "customer_added"
    | "kot_generated"
    | "expense_added"
    | "login"
    | "logout";
  metadata: any;
  ipAddress: string;
  userAgent?: string;
  timestamp: string;
  createdAt: string;
}

export interface InviteStaffData {
  phone: string;
  name: string;
  role: StaffRole;
  permissions?: string[];
}

export interface UpdateStaffData {
  name?: string;
  role?: StaffRole;
  permissions?: string[];
  status?: StaffStatus;
}

export const STAFF_PERMISSIONS = [
  "manage_items",
  "manage_orders",
  "manage_customers",
  "view_reports",
  "manage_staff",
  "manage_outlets",
  "manage_expenses",
  "manage_inventory",
  "manage_kots",
] as const;

export const ROLE_LABELS: Record<StaffRole, string> = {
  primary_admin: "Primary Admin",
  secondary_admin: "Secondary Admin",
  staff: "Staff",
  waiter: "Waiter",
  kitchen: "Kitchen",
};

export const STATUS_LABELS: Record<StaffStatus, string> = {
  invited: "Invited",
  joined: "Joined",
  suspended: "Suspended",
};
