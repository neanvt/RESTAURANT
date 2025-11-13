# Restaurant POS - Remaining Phases Implementation Plan

## Overview

This document outlines the detailed implementation plan for completing all remaining features of the Restaurant POS system, based on UI reference screenshots and requirements.

---

## Phase 9: Staff Management & Multi-User System

### Analysis from Screenshots

- **Manage Staff page** shows user list with roles (Primary Admin, Secondary Admin)
- Each staff member has name, phone number, role, and status (JOINED)
- "Check Staff Activity" link at top
- "Remove User" button for non-primary admins
- "Invite Staff" button at bottom

### Backend Implementation

#### 9.1 Staff Model Extension

```typescript
// backend/src/models/User.ts - Extend existing model
interface IUser {
  phone: string;
  name: string;
  role: "primary_admin" | "secondary_admin" | "staff" | "waiter";
  outlets: mongoose.Types.ObjectId[];
  permissions: string[];
  invitedBy?: mongoose.Types.ObjectId;
  status: "invited" | "joined" | "suspended";
  lastActive?: Date;
  createdAt: Date;
}
```

#### 9.2 Staff Activity Model

```typescript
// backend/src/models/StaffActivity.ts
interface IStaffActivity {
  user: mongoose.Types.ObjectId;
  outlet: mongoose.Types.ObjectId;
  action: string; // 'order_created', 'item_updated', 'invoice_generated'
  metadata: any;
  ipAddress: string;
  timestamp: Date;
}
```

#### 9.3 API Endpoints

```typescript
POST   /api/staff/invite              // Invite new staff member
GET    /api/staff                      // List all staff
GET    /api/staff/:id                  // Get staff details
PUT    /api/staff/:id                  // Update staff role/permissions
DELETE /api/staff/:id                  // Remove staff member
GET    /api/staff/:id/activity         // Get staff activity log
GET    /api/staff/activity             // Get all staff activity
```

### Frontend Implementation

#### 9.4 Staff Management Pages

- [`frontend/src/app/(dashboard)/staff/page.tsx`](<frontend/src/app/(dashboard)/staff/page.tsx:1>) - Staff list
- [`frontend/src/app/(dashboard)/staff/invite/page.tsx`](<frontend/src/app/(dashboard)/staff/invite/page.tsx:1>) - Invite form
- [`frontend/src/app/(dashboard)/staff/activity/page.tsx`](<frontend/src/app/(dashboard)/staff/activity/page.tsx:1>) - Activity log

#### 9.5 Components

- [`StaffList.tsx`](frontend/src/components/staff/StaffList.tsx:1) - Staff member cards
- [`InviteStaffForm.tsx`](frontend/src/components/staff/InviteStaffForm.tsx:1) - Invitation form
- [`StaffActivityLog.tsx`](frontend/src/components/staff/StaffActivityLog.tsx:1) - Activity timeline
- [`RoleSelector.tsx`](frontend/src/components/staff/RoleSelector.tsx:1) - Role management

---

## Phase 10: Expense & Inventory Management

### Backend Implementation

#### 10.1 Expense Model

```typescript
// backend/src/models/Expense.ts
interface IExpense {
  outlet: mongoose.Types.ObjectId;
  category:
    | "ingredients"
    | "utilities"
    | "salary"
    | "rent"
    | "maintenance"
    | "other";
  amount: number;
  description: string;
  date: Date;
  paidTo: string;
  paymentMethod: "cash" | "upi" | "card" | "bank_transfer";
  receipt?: string; // Image URL
  createdBy: mongoose.Types.ObjectId;
}
```

#### 10.2 Inventory Model

```typescript
// backend/src/models/Inventory.ts
interface IInventory {
  outlet: mongoose.Types.ObjectId;
  item: mongoose.Types.ObjectId;
  currentStock: number;
  unit: "kg" | "litre" | "piece" | "packet";
  minStockLevel: number;
  maxStockLevel: number;
  lastRestocked: Date;
  alerts: boolean;
}
```

#### 10.3 API Endpoints

```typescript
// Expenses
POST   /api/expenses                   // Create expense
GET    /api/expenses                   // List expenses with filters
GET    /api/expenses/:id               // Get expense details
PUT    /api/expenses/:id               // Update expense
DELETE /api/expenses/:id               // Delete expense
GET    /api/expenses/summary           // Expense summary by category

// Inventory
GET    /api/inventory                  // List inventory items
GET    /api/inventory/:itemId          // Get item inventory
PUT    /api/inventory/:itemId          // Update stock levels
POST   /api/inventory/restock          // Record restock
GET    /api/inventory/alerts           // Get low stock alerts
```

### Frontend Implementation

#### 10.4 Expense Management Pages

- [`frontend/src/app/(dashboard)/expenses/page.tsx`](<frontend/src/app/(dashboard)/expenses/page.tsx:1>) - Expense list
- [`frontend/src/app/(dashboard)/expenses/create/page.tsx`](<frontend/src/app/(dashboard)/expenses/create/page.tsx:1>) - Add expense

#### 10.5 Inventory Pages

- [`frontend/src/app/(dashboard)/inventory/page.tsx`](<frontend/src/app/(dashboard)/inventory/page.tsx:1>) - Inventory overview

#### 10.6 Components

- [`ExpenseForm.tsx`](frontend/src/components/expenses/ExpenseForm.tsx:1)
- [`ExpenseList.tsx`](frontend/src/components/expenses/ExpenseList.tsx:1)
- [`ExpenseChart.tsx`](frontend/src/components/expenses/ExpenseChart.tsx:1)
- [`InventoryTable.tsx`](frontend/src/components/inventory/InventoryTable.tsx:1)
- [`LowStockAlert.tsx`](frontend/src/components/inventory/LowStockAlert.tsx:1)

---

## Phase 11: Printer Integration with Status Monitoring

### Analysis from Screenshots

- **Printer selection modal** shows:
  - Printer name (SR588)
  - Status badges: "Default" and "Offline"
  - Error message: "Default printer unavailable. Make sure it's ON & has paper"
  - "Set as default printer" checkbox
  - "Skip & Save" and "Use New Device" buttons
  - Expandable "No Devices Available?" section

### Backend Implementation

#### 11.1 Printer Model

```typescript
// backend/src/models/Printer.ts
interface IPrinter {
  outlet: mongoose.Types.ObjectId;
  name: string;
  type: "thermal" | "laser" | "inkjet";
  connectionType: "network" | "usb" | "bluetooth";
  ipAddress?: string;
  port?: number;
  isDefault: boolean;
  status: "online" | "offline" | "error";
  lastPrintedAt?: Date;
  paperStatus: "ok" | "low" | "out";
}
```

#### 11.2 Print Service

```typescript
// backend/src/services/printerService.ts
-detectPrinters() -
  printKOT(orderId, printerId) -
  printInvoice(invoiceId, printerId) -
  checkPrinterStatus(printerId) -
  setPaperStatus(printerId, status);
```

#### 11.3 API Endpoints

```typescript
GET    /api/printers                   // List printers
POST   /api/printers/detect            // Detect available printers
POST   /api/printers                   // Add printer
PUT    /api/printers/:id               // Update printer settings
DELETE /api/printers/:id               // Remove printer
GET    /api/printers/:id/status        // Check printer status
POST   /api/printers/:id/test          // Print test page
POST   /api/printers/:id/print-kot     // Print KOT
POST   /api/printers/:id/print-invoice // Print invoice
```

### Frontend Implementation

#### 11.4 Printer Management Pages

- [`frontend/src/app/(dashboard)/printers/page.tsx`](<frontend/src/app/(dashboard)/printers/page.tsx:1>) - Printer list

#### 11.5 Components

- [`PrinterSelector.tsx`](frontend/src/components/printer/PrinterSelector.tsx:1) - Modal for selecting printer
- [`PrinterStatus.tsx`](frontend/src/components/printer/PrinterStatus.tsx:1) - Status indicator (already exists, enhance)
- [`PrinterSetup.tsx`](frontend/src/components/printer/PrinterSetup.tsx:1) - Setup wizard
- [`PrintButton.tsx`](frontend/src/components/printer/PrintButton.tsx:1) - Enhanced print button

#### 11.6 Print Templates

- KOT template with timestamp, table number, items
- Invoice template with business logo, QR code, itemized list

---

## Phase 12: Enhanced Business Settings

### Analysis from Screenshots

- **Business Details form** includes:
  - Business name
  - Phone number with country code (+91)
  - Logo upload with preview
  - Outlet address
  - UPI ID
  - Business Type dropdown (Food & Beverages)
  - Business Category dropdown (Road Side Stall, etc.)
  - GSTIN Number
  - Google Profile Link
  - Swiggy Link
  - Zomato Link
  - Delete Outlet button (red)
  - Cancel and Update Details buttons

### Backend Implementation

#### 12.1 Extend Outlet Model

```typescript
// backend/src/models/Outlet.ts - Add fields
interface IOutlet {
  // Existing fields...
  businessType: "food_beverages" | "retail" | "services" | "other";
  businessCategory: string; // 'Road Side Stall', 'Restaurant', 'Cafe', etc.
  gstin?: string;
  googleProfileLink?: string;
  swiggyLink?: string;
  zomatoLink?: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
}
```

#### 12.2 API Endpoints

```typescript
PUT    /api/outlets/:id/business-details  // Update extended business details
DELETE /api/outlets/:id                    // Delete outlet (with safeguards)
GET    /api/outlets/business-categories    // Get business category options
```

### Frontend Implementation

#### 12.3 Enhanced Outlet Pages

- Update [`frontend/src/app/(dashboard)/outlets/[id]/edit/page.tsx`](<frontend/src/app/(dashboard)/outlets/[id]/edit/page.tsx:1>)
- Add business type and category selection
- Add social media links section
- Add GSTIN field with validation

#### 12.4 Components

- [`BusinessDetailsForm.tsx`](frontend/src/components/outlets/BusinessDetailsForm.tsx:1) - Enhanced form
- [`SocialLinksForm.tsx`](frontend/src/components/outlets/SocialLinksForm.tsx:1) - Social media section
- [`DeleteOutletDialog.tsx`](frontend/src/components/outlets/DeleteOutletDialog.tsx:1) - Confirmation dialog

---

## Phase 13: Advanced Customer Features

### Analysis from Screenshots

- **Add Regular Customer form**:

  - Blue info banner: "Fetch Customer Details Directly From Your Contacts"
  - Phone Number field with +91 prefix
  - Name field
  - Loyalty Discount field with % symbol
  - Info text: "Discount will be applied on orders of this customer"

- **Customer Marketing page**:
  - Illustration with heading "Keep track of your best customers"
  - WhatsApp Marketing and Offers card
  - Loyalty Discounts card
  - Business Insights and Growth card
  - "Add Regular Customer" button

### Backend Implementation

#### 13.1 Extend Customer Model

```typescript
// backend/src/models/Customer.ts - Add fields
interface ICustomer {
  // Existing fields...
  loyaltyDiscount: number; // Percentage
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: Date;
  tier: "regular" | "gold" | "platinum";
  marketingPreferences: {
    whatsapp: boolean;
    sms: boolean;
    email: boolean;
  };
  notes?: string;
}
```

#### 13.2 Marketing Campaign Model

```typescript
// backend/src/models/MarketingCampaign.ts
interface IMarketingCampaign {
  outlet: mongoose.Types.ObjectId;
  type: "whatsapp" | "sms" | "email";
  name: string;
  message: string;
  targetAudience: "all" | "gold_members" | "inactive" | "high_spenders";
  scheduledAt?: Date;
  status: "draft" | "scheduled" | "sent";
  sentTo: number;
  opened: number;
  createdBy: mongoose.Types.ObjectId;
}
```

#### 13.3 API Endpoints

```typescript
// Customer enhancements
POST   /api/customers/import-contacts    // Import from phone contacts
PUT    /api/customers/:id/loyalty        // Update loyalty discount
GET    /api/customers/analytics          // Customer analytics

// Marketing
POST   /api/marketing/campaigns          // Create campaign
GET    /api/marketing/campaigns          // List campaigns
POST   /api/marketing/send-whatsapp      // Send WhatsApp messages
POST   /api/marketing/send-offers        // Send promotional offers
GET    /api/marketing/insights           // Get marketing insights
```

### Frontend Implementation

#### 13.4 Customer Enhancement Pages

- Update [`frontend/src/app/(dashboard)/customers/create/page.tsx`](<frontend/src/app/(dashboard)/customers/create/page.tsx:1>)
- Add loyalty discount field
- Add contact import functionality

#### 13.5 Marketing Pages

- [`frontend/src/app/(dashboard)/marketing/page.tsx`](<frontend/src/app/(dashboard)/marketing/page.tsx:1>) - Marketing dashboard
- [`frontend/src/app/(dashboard)/marketing/whatsapp/page.tsx`](<frontend/src/app/(dashboard)/marketing/whatsapp/page.tsx:1>) - WhatsApp campaigns
- [`frontend/src/app/(dashboard)/marketing/campaigns/page.tsx`](<frontend/src/app/(dashboard)/marketing/campaigns/page.tsx:1>) - Campaign list

#### 13.6 Components

- [`CustomerImport.tsx`](frontend/src/components/customers/CustomerImport.tsx:1) - Contact import
- [`LoyaltyDiscountForm.tsx`](frontend/src/components/customers/LoyaltyDiscountForm.tsx:1)
- [`MarketingDashboard.tsx`](frontend/src/components/marketing/MarketingDashboard.tsx:1)
- [`WhatsAppCampaignForm.tsx`](frontend/src/components/marketing/WhatsAppCampaignForm.tsx:1)
- [`CustomerTierBadge.tsx`](frontend/src/components/customers/CustomerTierBadge.tsx:1)

---

## Phase 14: AI Menu Scanning

### Analysis from Screenshots

- **Scan Menu modal**:
  - Title: "Scan Menu to Add Items via AI"
  - Two options:
    1. "Capture photo of menu" (camera icon)
    2. "Upload manually" (upload icon)
  - Cancel button

### Backend Implementation

#### 14.1 AI Menu Processing

```typescript
// backend/src/services/aiMenuService.ts
interface MenuScanResult {
  items: Array<{
    name: string;
    price: number;
    category?: string;
    description?: string;
    confidence: number;
  }>;
  metadata: {
    restaurantName?: string;
    cuisine?: string;
  };
}

Functions:
- scanMenuImage(imageBuffer: Buffer): Promise<MenuScanResult>
- processWithOpenAI(image: Buffer): Promise<MenuScanResult>
- extractMenuItems(ocrText: string): Promise<Item[]>
- bulkCreateItems(items: Item[], outletId: string)
```

#### 14.2 API Endpoints

```typescript
POST / api / items / scan - menu; // Upload menu image for scanning
POST / api / items / process - scan - result; // Process and create items from scan
GET / api / items / scan - history; // Get scan history
```

### Frontend Implementation

#### 14.3 Menu Scanning Components

- [`MenuScanModal.tsx`](frontend/src/components/items/MenuScanModal.tsx:1) - Scan interface
- [`MenuScanResult.tsx`](frontend/src/components/items/MenuScanResult.tsx:1) - Review scanned items
- [`BulkItemImport.tsx`](frontend/src/components/items/BulkItemImport.tsx:1) - Import confirmation

#### 14.4 Integration

- Add scan button to items list page
- Camera capture integration
- File upload with drag & drop
- Progress indicator for processing
- Review and edit scanned items before import

---

## Phase 15: Premium Features

### Analysis from Screenshots

- **Gold Member** card in More menu
- **Sync / Use on other devices** toggle switch

### Backend Implementation

#### 15.1 Subscription Model

```typescript
// backend/src/models/Subscription.ts
interface ISubscription {
  outlet: mongoose.Types.ObjectId;
  plan: "free" | "gold" | "platinum";
  features: string[];
  startDate: Date;
  endDate: Date;
  status: "active" | "expired" | "cancelled";
  paymentHistory: Array<{
    amount: number;
    date: Date;
    method: string;
    transactionId: string;
  }>;
}
```

#### 15.2 Sync Service

```typescript
// backend/src/services/syncService.ts
- syncData(outletId: string, deviceId: string)
- resolveConflicts(localData: any, remoteData: any)
- generateSyncToken(userId: string)
```

#### 15.3 API Endpoints

```typescript
POST   /api/subscription/upgrade         // Upgrade to Gold
GET    /api/subscription/status          // Check subscription status
POST   /api/sync/enable                  // Enable device sync
POST   /api/sync/data                    // Sync data
GET    /api/sync/devices                 // List synced devices
DELETE /api/sync/devices/:id             // Remove device
```

### Frontend Implementation

#### 15.4 Premium Pages

- [`frontend/src/app/(dashboard)/premium/page.tsx`](<frontend/src/app/(dashboard)/premium/page.tsx:1>) - Upgrade page
- [`frontend/src/app/(dashboard)/settings/sync/page.tsx`](<frontend/src/app/(dashboard)/settings/sync/page.tsx:1>) - Sync settings

#### 15.5 Components

- [`PremiumBadge.tsx`](frontend/src/components/premium/PremiumBadge.tsx:1)
- [`UpgradeDialog.tsx`](frontend/src/components/premium/UpgradeDialog.tsx:1)
- [`SyncToggle.tsx`](frontend/src/components/settings/SyncToggle.tsx:1)
- [`DeviceList.tsx`](frontend/src/components/settings/DeviceList.tsx:1)

---

## Phase 16: All Missing Pages Creation

### 16.1 Settings Page

```typescript
// frontend/src/app/(dashboard)/settings/page.tsx
Sections:
- Account Settings
- Business Preferences
- Notification Settings
- Payment Methods
- Tax Configuration
- Receipt Customization
- Language & Currency
```

### 16.2 Support Page

```typescript
// frontend/src/app/(dashboard)/support/page.tsx
Features:
- FAQ section
- Contact support form
- Video tutorials
- Help documentation
- Version information
```

### 16.3 Complete Order Flow Pages

```typescript
// frontend/src/app/(dashboard)/orders/page.tsx - Enhanced
- All orders tab
- Open orders tab
- Hold orders tab
- Completed orders tab
- Filters by date, payment method, customer

// frontend/src/app/(dashboard)/orders/create/page.tsx - Enhanced
- Item selection with images
- Category filters (ALL, Favourite, specific categories)
- Search functionality
- Quantity controls
- Table number selection
- Order notes
- KOT generation
- Hold order option
```

### 16.4 Enhanced Reports

```typescript
// Existing reports enhanced with:
- PDF export with business branding
- Excel export with proper formatting
- Date range presets (Today, Yesterday, This Week, This Month, Custom)
- Customer filter dropdown
- Payment type filter
- Print/Share/Delete actions per transaction
```

---

## Phase 17: UI/UX Polish & Mobile Optimization

### 17.1 Design System Refinement

- [ ] Consistent spacing and typography
- [ ] Color scheme finalization
- [ ] Icon set standardization
- [ ] Loading states for all actions
- [ ] Empty states with illustrations
- [ ] Error states with helpful messages

### 17.2 Mobile Optimizations

- [ ] Bottom sheet modals for mobile
- [ ] Swipe gestures (swipe to delete, pull to refresh)
- [ ] Touch-friendly controls (minimum 44x44px)
- [ ] Optimized images for mobile bandwidth
- [ ] Lazy loading for lists
- [ ] Virtual scrolling for large lists

### 17.3 Animations & Transitions

- [ ] Page transitions
- [ ] Tab switching animations
- [ ] Modal entrance/exit animations
- [ ] List item animations
- [ ] Success/error feedback animations
- [ ] Skeleton loaders

### 17.4 Accessibility

- [ ] ARIA labels for all interactive elements
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] High contrast mode
- [ ] Focus indicators
- [ ] Proper heading hierarchy

### 17.5 Performance

- [ ] Code splitting
- [ ] Image optimization
- [ ] Bundle size optimization
- [ ] Caching strategy
- [ ] Service worker optimization
- [ ] Database query optimization

---

## Phase 18: Testing & Quality Assurance

### 18.1 Unit Testing

```bash
# Frontend tests
- Component rendering tests
- Hook behavior tests
- Store state management tests
- Utility function tests

# Backend tests
- Service layer tests
- Model validation tests
- Utility function tests
- Helper function tests
```

### 18.2 Integration Testing

```bash
# API endpoint tests
- Authentication flow
- CRUD operations
- File uploads
- Payment processing
- Report generation
- Printer integration
```

### 18.3 E2E Testing

```bash
# Critical user flows
- Complete order to invoice flow
- Staff management flow
- Customer management flow
- Report generation flow
- Settings update flow
```

### 18.4 Testing Checklist

- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile device testing (iOS, Android)
- [ ] Tablet testing
- [ ] PWA installation testing
- [ ] Offline mode testing
- [ ] Performance testing (Lighthouse scores)
- [ ] Security testing (OWASP top 10)
- [ ] Load testing (concurrent users)

---

## Phase 19: Documentation

### 19.1 User Documentation

- [ ] User manual with screenshots
- [ ] Video tutorials for key features
- [ ] FAQ section
- [ ] Troubleshooting guide
- [ ] Feature glossary

### 19.2 Technical Documentation

- [ ] API documentation (Swagger/OpenAPI)
- [ ] Database schema documentation
- [ ] Architecture diagrams
- [ ] Deployment guide
- [ ] Development setup guide
- [ ] Contributing guidelines

### 19.3 Administrator Documentation

- [ ] Server management guide
- [ ] Backup and recovery procedures
- [ ] Monitoring setup
- [ ] Security best practices
- [ ] Update procedures

---

## Phase 20: Deployment Setup

### 20.1 Production Environment

```bash
# Infrastructure
- VPS or cloud server (AWS, DigitalOcean, etc.)
- MongoDB Atlas or self-hosted MongoDB
- Redis cloud or self-hosted Redis
- CDN for static assets
- SSL certificates (Let's Encrypt)
```

### 20.2 CI/CD Pipeline

```yaml
# GitHub Actions workflow
- Automated testing on PR
- Build and deploy on merge to main
- Environment-specific deployments
- Rollback procedures
- Health checks
```

### 20.3 Monitoring & Logging

```bash
# Production monitoring
- PM2 monitoring
- Application logs (Winston)
- Error tracking (Sentry - optional)
- Performance monitoring (New Relic - optional)
- Uptime monitoring (UptimeRobot)
```

### 20.4 Backup Strategy

```bash
# Automated backups
- Daily database backups
- Weekly full backups
- Backup retention policy
- Backup testing procedures
- Disaster recovery plan
```

---

## Implementation Timeline

### Week 1-2: Core Missing Features

- [ ] Phase 9: Staff Management
- [ ] Phase 10: Expense & Inventory
- [ ] Phase 11: Printer Integration

### Week 3-4: Advanced Features

- [ ] Phase 12: Enhanced Business Settings
- [ ] Phase 13: Advanced Customer Features
- [ ] Phase 14: AI Menu Scanning
- [ ] Phase 15: Premium Features

### Week 5: Page Completion

- [ ] Phase 16: All Missing Pages

### Week 6-7: Polish & Testing

- [ ] Phase 17: UI/UX Polish
- [ ] Phase 18: Testing & QA

### Week 8: Documentation & Deployment

- [ ] Phase 19: Documentation
- [ ] Phase 20: Deployment

---

## Priority Matrix

### High Priority (Must Have)

1. Staff Management
2. Printer Integration with KOT/Invoice
3. Enhanced Business Settings
4. All missing pages (Orders, Settings, Support)
5. Testing & Bug Fixes

### Medium Priority (Should Have)

1. Expense Management
2. Inventory Tracking
3. Advanced Customer Features
4. AI Menu Scanning
5. Report Enhancements

### Low Priority (Nice to Have)

1. Premium Features (Gold Member)
2. Device Sync
3. WhatsApp Marketing
4. Advanced Analytics

---

## Technical Debt to Address

1. **Type Safety**: Ensure all API responses are properly typed
2. **Error Handling**: Consistent error handling across all endpoints
3. **Loading States**: Add loading indicators for all async operations
4. **Validation**: Client and server-side validation for all forms
5. **Security**: Rate limiting, input sanitization, CSRF protection
6. **Performance**: Query optimization, caching, lazy loading
7. **Accessibility**: ARIA labels, keyboard navigation, screen readers

---

## Success Criteria

### Functionality

- [ ] All features from screenshots implemented
- [ ] All user flows working end-to-end
- [ ] No critical bugs
- [ ] Offline mode working
- [ ] Print functionality working

### Performance

- [ ] Lighthouse score > 90
- [ ] Page load time < 3s
- [ ] API response time < 200ms
- [ ] Database queries optimized

### Quality

- [ ] Test coverage > 80%
- [ ] No security vulnerabilities
- [ ] Accessible (WCAG AA)
- [ ] Cross-browser compatible
- [ ] Mobile responsive

---

**Document Version:** 1.0  
**Created:** 2025-11-08  
**Last Updated:** 2025-11-08
