# Restaurant POS System - Implementation Plan

## Overview

This document provides a detailed step-by-step implementation plan for building the Restaurant POS system based on the architecture defined in [`ARCHITECTURE.md`](ARCHITECTURE.md).

## Project Structure

```
restaurant-pos/
├── frontend/                       # Next.js PWA Application
│   ├── public/
│   │   ├── icons/                 # PWA icons
│   │   ├── manifest.json          # PWA manifest
│   │   └── sw.js                  # Service worker
│   ├── src/
│   │   ├── app/                   # Next.js 14 App Router
│   │   │   ├── (auth)/           # Auth group
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── verify/
│   │   │   │       └── page.tsx
│   │   │   ├── (dashboard)/      # Protected routes group
│   │   │   │   ├── layout.tsx    # Dashboard layout with nav
│   │   │   │   ├── page.tsx      # Home dashboard
│   │   │   │   ├── items/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── create/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── edit/
│   │   │   │   │           └── page.tsx
│   │   │   │   ├── orders/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── new/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── customers/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── create/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── reports/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── sales/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── items/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── orders/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── expenses/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── create/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── inventory/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── outlets/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── create/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── page.tsx
│   │   │   │   │       └── edit/
│   │   │   │   │           └── page.tsx
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx
│   │   │   ├── api/              # API routes (if needed)
│   │   │   │   └── health/
│   │   │   │       └── route.ts
│   │   │   ├── layout.tsx        # Root layout
│   │   │   ├── globals.css       # Global styles
│   │   │   └── not-found.tsx
│   │   ├── components/
│   │   │   ├── ui/               # shadcn/ui components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   ├── toast.tsx
│   │   │   │   └── ...
│   │   │   ├── layout/
│   │   │   │   ├── BottomNav.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   ├── auth/
│   │   │   │   ├── OTPInput.tsx
│   │   │   │   ├── PhoneInput.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── outlets/
│   │   │   │   ├── OutletCard.tsx
│   │   │   │   ├── OutletForm.tsx
│   │   │   │   └── OutletSelector.tsx
│   │   │   ├── items/
│   │   │   │   ├── ItemCard.tsx
│   │   │   │   ├── ItemForm.tsx
│   │   │   │   ├── ItemGrid.tsx
│   │   │   │   ├── CategoryFilter.tsx
│   │   │   │   └── AIImageGenerator.tsx
│   │   │   ├── orders/
│   │   │   │   ├── OrderForm.tsx
│   │   │   │   ├── ItemSelector.tsx
│   │   │   │   ├── QuantityControl.tsx
│   │   │   │   ├── OrderSummary.tsx
│   │   │   │   ├── KOTPreview.tsx
│   │   │   │   └── HoldOrders.tsx
│   │   │   ├── billing/
│   │   │   │   ├── InvoiceForm.tsx
│   │   │   │   ├── InvoicePreview.tsx
│   │   │   │   ├── PaymentMethodSelector.tsx
│   │   │   │   ├── QRCodeDisplay.tsx
│   │   │   │   └── PrintButton.tsx
│   │   │   ├── customers/
│   │   │   │   ├── CustomerList.tsx
│   │   │   │   ├── CustomerForm.tsx
│   │   │   │   ├── CustomerCard.tsx
│   │   │   │   └── CustomerSearch.tsx
│   │   │   ├── reports/
│   │   │   │   ├── DashboardCards.tsx
│   │   │   │   ├── SalesChart.tsx
│   │   │   │   ├── ItemReport.tsx
│   │   │   │   ├── OrderReport.tsx
│   │   │   │   ├── DateRangePicker.tsx
│   │   │   │   └── ExportButtons.tsx
│   │   │   ├── expenses/
│   │   │   │   ├── ExpenseList.tsx
│   │   │   │   ├── ExpenseForm.tsx
│   │   │   │   └── ExpenseCard.tsx
│   │   │   ├── inventory/
│   │   │   │   ├── InventoryList.tsx
│   │   │   │   └── LowStockAlert.tsx
│   │   │   └── printer/
│   │   │       ├── PrinterStatus.tsx
│   │   │       └── PrintPreview.tsx
│   │   ├── lib/
│   │   │   ├── api/
│   │   │   │   ├── client.ts         # Axios instance
│   │   │   │   ├── auth.ts           # Auth API calls
│   │   │   │   ├── outlets.ts        # Outlet API calls
│   │   │   │   ├── items.ts          # Item API calls
│   │   │   │   ├── orders.ts         # Order API calls
│   │   │   │   ├── customers.ts      # Customer API calls
│   │   │   │   ├── reports.ts        # Reports API calls
│   │   │   │   ├── expenses.ts       # Expense API calls
│   │   │   │   └── inventory.ts      # Inventory API calls
│   │   │   ├── utils/
│   │   │   │   ├── cn.ts             # Class name utility
│   │   │   │   ├── format.ts         # Formatting utilities
│   │   │   │   ├── validation.ts     # Validation schemas
│   │   │   │   └── constants.ts      # App constants
│   │   │   └── printer/
│   │   │       ├── printService.ts
│   │   │       ├── kotTemplate.ts
│   │   │       └── invoiceTemplate.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useOutlet.ts
│   │   │   ├── useItems.ts
│   │   │   ├── useOrders.ts
│   │   │   ├── useCustomers.ts
│   │   │   └── useToast.ts
│   │   ├── store/
│   │   │   ├── authStore.ts          # Zustand auth store
│   │   │   ├── outletStore.ts        # Zustand outlet store
│   │   │   ├── orderStore.ts         # Zustand order store
│   │   │   └── cartStore.ts          # Zustand cart store
│   │   ├── types/
│   │   │   ├── index.ts
│   │   │   ├── auth.ts
│   │   │   ├── outlet.ts
│   │   │   ├── item.ts
│   │   │   ├── order.ts
│   │   │   ├── customer.ts
│   │   │   └── report.ts
│   │   └── middleware.ts             # Next.js middleware for auth
│   ├── .env.local
│   ├── .env.example
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── components.json               # shadcn/ui config
│
├── backend/                           # Express.js API Server
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── outletController.ts
│   │   │   ├── categoryController.ts
│   │   │   ├── itemController.ts
│   │   │   ├── orderController.ts
│   │   │   ├── customerController.ts
│   │   │   ├── reportController.ts
│   │   │   ├── expenseController.ts
│   │   │   └── inventoryController.ts
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── otpService.ts
│   │   │   ├── outletService.ts
│   │   │   ├── itemService.ts
│   │   │   ├── aiImageService.ts
│   │   │   ├── orderService.ts
│   │   │   ├── kotService.ts
│   │   │   ├── invoiceService.ts
│   │   │   ├── customerService.ts
│   │   │   ├── reportService.ts
│   │   │   ├── exportService.ts
│   │   │   ├── expenseService.ts
│   │   │   ├── inventoryService.ts
│   │   │   └── printerService.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Outlet.ts
│   │   │   ├── Category.ts
│   │   │   ├── Item.ts
│   │   │   ├── Order.ts
│   │   │   ├── Customer.ts
│   │   │   ├── Expense.ts
│   │   │   ├── Inventory.ts
│   │   │   └── ReportCache.ts
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts
│   │   │   ├── errorHandler.ts
│   │   │   ├── validation.ts
│   │   │   ├── rateLimiter.ts
│   │   │   └── upload.ts
│   │   ├── routes/
│   │   │   ├── index.ts              # Main router
│   │   │   ├── authRoutes.ts
│   │   │   ├── outletRoutes.ts
│   │   │   ├── categoryRoutes.ts
│   │   │   ├── itemRoutes.ts
│   │   │   ├── orderRoutes.ts
│   │   │   ├── customerRoutes.ts
│   │   │   ├── reportRoutes.ts
│   │   │   ├── expenseRoutes.ts
│   │   │   └── inventoryRoutes.ts
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── redis.ts
│   │   │   ├── firebase.ts
│   │   │   ├── openai.ts
│   │   │   └── constants.ts
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   ├── validator.ts
│   │   │   ├── jwt.ts
│   │   │   ├── fileUpload.ts
│   │   │   └── helpers.ts
│   │   ├── types/
│   │   │   ├── index.d.ts
│   │   │   └── express.d.ts
│   │   ├── templates/
│   │   │   ├── invoice.html
│   │   │   ├── kot.html
│   │   │   └── email-otp.html
│   │   ├── jobs/                     # Bull queue jobs
│   │   │   ├── aiImageJob.ts
│   │   │   ├── reportCacheJob.ts
│   │   │   └── backupJob.ts
│   │   ├── app.ts                    # Express app setup
│   │   └── server.ts                 # Server entry point
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── uploads/                      # Temporary upload directory
│   ├── .env
│   ├── .env.example
│   ├── tsconfig.json
│   ├── package.json
│   └── ecosystem.config.js           # PM2 config
│
├── shared/                            # Shared types/utilities
│   ├── types/
│   │   └── index.ts
│   └── constants/
│       └── index.ts
│
├── docs/                              # Documentation
│   ├── API.md
│   ├── SETUP.md
│   └── DEPLOYMENT.md
│
├── scripts/                           # Utility scripts
│   ├── seed.ts                       # Database seeding
│   ├── backup.sh                     # Backup script
│   └── deploy.sh                     # Deployment script
│
├── .gitignore
├── README.md
├── ARCHITECTURE.md
├── IMPLEMENTATION_PLAN.md
└── package.json                       # Root package.json for workspaces
```

## Implementation Phases

### Phase 1: Project Setup & Foundation (Week 1)

#### 1.1 Initialize Project Structure

- [ ] Create monorepo structure with workspaces
- [ ] Setup frontend (Next.js 14 with TypeScript)
- [ ] Setup backend (Express.js with TypeScript)
- [ ] Configure ESLint, Prettier
- [ ] Setup Git repository with proper `.gitignore`

#### 1.2 Install Dependencies

**Frontend:**

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next-pwa": "^5.6.0",
    "zustand": "^4.4.0",
    "axios": "^1.6.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "tailwindcss": "^3.3.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-dropdown-menu": "^2.0.0",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.0",
    "lucide-react": "^0.292.0",
    "recharts": "^2.10.0",
    "qrcode.react": "^3.1.0",
    "jspdf": "^2.5.0",
    "html2canvas": "^1.4.0",
    "xlsx": "^0.18.0",
    "date-fns": "^2.30.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "typescript": "^5.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

**Backend:**

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "mongoose": "^8.0.0",
    "dotenv": "^16.3.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.0",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0",
    "firebase-admin": "^12.0.0",
    "openai": "^4.20.0",
    "multer": "^1.4.0",
    "sharp": "^0.33.0",
    "bull": "^4.12.0",
    "redis": "^4.6.0",
    "joi": "^17.11.0",
    "winston": "^3.11.0",
    "nodemailer": "^6.9.0",
    "puppeteer": "^21.6.0",
    "qrcode": "^1.5.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/node": "^20.0.0",
    "@types/cors": "^2.8.0",
    "@types/multer": "^1.4.0",
    "@types/bcrypt": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.0",
    "typescript": "^5.3.0",
    "ts-node": "^10.9.0",
    "nodemon": "^3.0.0",
    "jest": "^29.7.0",
    "supertest": "^6.3.0",
    "@types/jest": "^29.5.0",
    "@types/supertest": "^6.0.0"
  }
}
```

#### 1.3 Configure Development Environment

- [ ] Setup TypeScript configs for both frontend and backend
- [ ] Configure Tailwind CSS with custom design tokens
- [ ] Setup shadcn/ui
- [ ] Create environment variable templates
- [ ] Setup MongoDB locally or cloud instance
- [ ] Configure Firebase project for authentication

#### 1.4 Create Base Configurations

**next.config.js:**

```javascript
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

module.exports = withPWA({
  reactStrictMode: true,
  images: {
    domains: ["localhost", "your-domain.com"],
  },
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
});
```

**ecosystem.config.js:**

```javascript
module.exports = {
  apps: [
    {
      name: "restaurant-pos-api",
      script: "./dist/server.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
```

### Phase 2: Authentication System (Week 1-2)

#### 2.1 Backend Authentication

- [ ] Create [`User`](backend/src/models/User.ts) model with phone, role, outlets
- [ ] Implement [`authService`](backend/src/services/authService.ts) with JWT generation
- [ ] Create [`otpService`](backend/src/services/otpService.ts) with Firebase integration
- [ ] Implement [`authController`](backend/src/controllers/authController.ts) endpoints
- [ ] Create [`authMiddleware`](backend/src/middleware/authMiddleware.ts) for JWT verification
- [ ] Setup rate limiting for OTP requests
- [ ] Add email OTP as fallback option

#### 2.2 Frontend Authentication

- [ ] Create [`authStore`](frontend/src/store/authStore.ts) with Zustand
- [ ] Build [`PhoneInput`](frontend/src/components/auth/PhoneInput.tsx) component with validation
- [ ] Build [`OTPInput`](frontend/src/components/auth/OTPInput.tsx) component
- [ ] Create login page at [`/login`](<frontend/src/app/(auth)/login/page.tsx>)
- [ ] Create verify page at [`/verify`](<frontend/src/app/(auth)/verify/page.tsx>)
- [ ] Implement [`useAuth`](frontend/src/hooks/useAuth.ts) hook
- [ ] Create [`ProtectedRoute`](frontend/src/components/auth/ProtectedRoute.tsx) component
- [ ] Setup Next.js middleware for route protection

#### 2.3 Testing

- [ ] Test OTP generation and verification
- [ ] Test JWT token flow
- [ ] Test protected routes
- [ ] Test session persistence

### Phase 3: Multi-Outlet Management (Week 2)

#### 3.1 Backend Outlet System

- [ ] Create [`Outlet`](backend/src/models/Outlet.ts) model with business details
- [ ] Implement [`outletService`](backend/src/services/outletService.ts) CRUD operations
- [ ] Create [`outletController`](backend/src/controllers/outletController.ts)
- [ ] Add outlet-based data filtering middleware
- [ ] Implement image upload for outlet logos

#### 3.2 Frontend Outlet Management

- [ ] Create [`outletStore`](frontend/src/store/outletStore.ts)
- [ ] Build [`OutletSelector`](frontend/src/components/outlets/OutletSelector.tsx) component
- [ ] Build [`OutletForm`](frontend/src/components/outlets/OutletForm.tsx) with image upload
- [ ] Build [`OutletCard`](frontend/src/components/outlets/OutletCard.tsx) component
- [ ] Create outlets list page
- [ ] Create outlet create/edit pages
- [ ] Implement outlet switching functionality

### Phase 4: Category & Item Management (Week 3)

#### 4.1 Backend Categories & Items

- [ ] Create [`Category`](backend/src/models/Category.ts) model
- [ ] Create [`Item`](backend/src/models/Item.ts) model with inventory tracking
- [ ] Implement [`itemService`](backend/src/services/itemService.ts)
- [ ] Implement [`aiImageService`](backend/src/services/aiImageService.ts) with OpenAI
- [ ] Create [`categoryController`](backend/src/controllers/categoryController.ts)
- [ ] Create [`itemController`](backend/src/controllers/itemController.ts)
- [ ] Setup Bull queue for background AI image generation

#### 4.2 Frontend Item Management

- [ ] Build [`CategoryFilter`](frontend/src/components/items/CategoryFilter.tsx) component
- [ ] Build [`ItemCard`](frontend/src/components/items/ItemCard.tsx) with image
- [ ] Build [`ItemGrid`](frontend/src/components/items/ItemGrid.tsx) layout
- [ ] Build [`ItemForm`](frontend/src/components/items/ItemForm.tsx) with validation
- [ ] Build [`AIImageGenerator`](frontend/src/components/items/AIImageGenerator.tsx) component
- [ ] Create items list page with filtering
- [ ] Create item create/edit pages
- [ ] Implement favourite toggle
- [ ] Implement availability toggle

### Phase 5: Order & KOT System (Week 4)

#### 5.1 Backend Order Management

- [ ] Create [`Order`](backend/src/models/Order.ts) model with status flow
- [ ] Implement [`orderService`](backend/src/services/orderService.ts)
- [ ] Implement [`kotService`](backend/src/services/kotService.ts)
- [ ] Create [`orderController`](backend/src/controllers/orderController.ts)
- [ ] Add order number generation logic
- [ ] Implement order status transitions

#### 5.2 Frontend Order Interface

- [ ] Create [`orderStore`](frontend/src/store/orderStore.ts)
- [ ] Create [`cartStore`](frontend/src/store/cartStore.ts)
- [ ] Build [`ItemSelector`](frontend/src/components/orders/ItemSelector.tsx) with images
- [ ] Build [`QuantityControl`](frontend/src/components/orders/QuantityControl.tsx)
- [ ] Build [`OrderSummary`](frontend/src/components/orders/OrderSummary.tsx)
- [ ] Build [`KOTPreview`](frontend/src/components/orders/KOTPreview.tsx)
- [ ] Build [`HoldOrders`](frontend/src/components/orders/HoldOrders.tsx) list
- [ ] Create new order page
- [ ] Create order detail page
- [ ] Implement KOT generation
- [ ] Implement hold/resume functionality

### Phase 6: Billing & Invoice System (Week 5)

#### 6.1 Backend Billing

- [ ] Implement [`invoiceService`](backend/src/services/invoiceService.ts)
- [ ] Implement [`pdfService`](backend/src/services/exportService.ts) with Puppeteer
- [ ] Create invoice template HTML
- [ ] Add invoice number generation
- [ ] Implement QR code generation for UPI

#### 6.2 Frontend Billing Interface

- [ ] Build [`InvoiceForm`](frontend/src/components/billing/InvoiceForm.tsx)
- [ ] Build [`InvoicePreview`](frontend/src/components/billing/InvoicePreview.tsx)
- [ ] Build [`PaymentMethodSelector`](frontend/src/components/billing/PaymentMethodSelector.tsx)
- [ ] Build [`QRCodeDisplay`](frontend/src/components/billing/QRCodeDisplay.tsx)
- [ ] Build [`PrintButton`](frontend/src/components/billing/PrintButton.tsx)
- [ ] Create billing page
- [ ] Implement payment completion flow
- [ ] Add print functionality

### Phase 7: Customer Management (Week 5)

#### 7.1 Backend Customer System

- [ ] Create [`Customer`](backend/src/models/Customer.ts) model
- [ ] Implement [`customerService`](backend/src/services/customerService.ts)
- [ ] Create [`customerController`](backend/src/controllers/customerController.ts)
- [ ] Add customer search functionality
- [ ] Implement customer analytics

#### 7.2 Frontend Customer Interface

- [ ] Build [`CustomerSearch`](frontend/src/components/customers/CustomerSearch.tsx)
- [ ] Build [`CustomerForm`](frontend/src/components/customers/CustomerForm.tsx)
- [ ] Build [`CustomerCard`](frontend/src/components/customers/CustomerCard.tsx)
- [ ] Build [`CustomerList`](frontend/src/components/customers/CustomerList.tsx)
- [ ] Create customers list page
- [ ] Create customer create/edit pages
- [ ] Create customer detail page with order history

### Phase 8: Reports & Analytics (Week 6)

#### 8.1 Backend Reports

- [ ] Create [`ReportCache`](backend/src/models/ReportCache.ts) model
- [ ] Implement [`reportService`](backend/src/services/reportService.ts) with aggregations
- [ ] Implement [`exportService`](backend/src/services/exportService.ts) for PDF/Excel
- [ ] Create [`reportController`](backend/src/controllers/reportController.ts)
- [ ] Setup Redis caching for reports
- [ ] Create report cache job

#### 8.2 Frontend Reports Interface

- [ ] Build [`DashboardCards`](frontend/src/components/reports/DashboardCards.tsx)
- [ ] Build [`SalesChart`](frontend/src/components/reports/SalesChart.tsx) with Recharts
- [ ] Build [`ItemReport`](frontend/src/components/reports/ItemReport.tsx)
- [ ] Build [`OrderReport`](frontend/src/components/reports/OrderReport.tsx)
- [ ] Build [`DateRangePicker`](frontend/src/components/reports/DateRangePicker.tsx)
- [ ] Build [`ExportButtons`](frontend/src/components/reports/ExportButtons.tsx)
- [ ] Create dashboard home page
- [ ] Create sales report page
- [ ] Create items report page
- [ ] Create orders report page
- [ ] Implement PDF export
- [ ] Implement Excel export

### Phase 9: Expense & Inventory Management (Week 6)

#### 9.1 Backend Expense System

- [ ] Create [`Expense`](backend/src/models/Expense.ts) model
- [ ] Create [`Inventory`](backend/src/models/Inventory.ts) model
- [ ] Implement [`expenseService`](backend/src/services/expenseService.ts)
- [ ] Implement [`inventoryService`](backend/src/services/inventoryService.ts)
- [ ] Create [`expenseController`](backend/src/controllers/expenseController.ts)
- [ ] Create [`inventoryController`](backend/src/controllers/inventoryController.ts)

#### 9.2 Frontend Expense & Inventory

- [ ] Build [`ExpenseForm`](frontend/src/components/expenses/ExpenseForm.tsx)
- [ ] Build [`ExpenseList`](frontend/src/components/expenses/ExpenseList.tsx)
- [ ] Build [`InventoryList`](frontend/src/components/inventory/InventoryList.tsx)
- [ ] Build [`LowStockAlert`](frontend/src/components/inventory/LowStockAlert.tsx)
- [ ] Create expenses page
- [ ] Create inventory page

### Phase 10: Printer Integration (Week 7)

#### 10.1 Printer System

- [ ] Implement [`printerService`](backend/src/services/printerService.ts) for ESC/POS
- [ ] Create KOT print template
- [ ] Create invoice print template
- [ ] Add network printer support

#### 10.2 Frontend Printer Interface

- [ ] Build [`PrinterStatus`](frontend/src/components/printer/PrinterStatus.tsx)
- [ ] Build [`PrintPreview`](frontend/src/components/printer/PrintPreview.tsx)
- [ ] Implement print service
- [ ] Add offline status indication

### Phase 11: UI/UX & Mobile Optimization (Week 7)

#### 11.1 Layout Components

- [ ] Create [`BottomNav`](frontend/src/components/layout/BottomNav.tsx) for mobile
- [ ] Create [`Header`](frontend/src/components/layout/Header.tsx) component
- [ ] Create responsive [`Sidebar`](frontend/src/components/layout/Sidebar.tsx) for desktop
- [ ] Implement dashboard layout

#### 11.2 PWA Features

- [ ] Configure service worker for offline support
- [ ] Create PWA manifest
- [ ] Add install prompt
- [ ] Implement offline indicators
- [ ] Add push notification support (optional)

#### 11.3 Mobile Optimization

- [ ] Optimize touch targets (minimum 44x44px)
- [ ] Implement gesture controls
- [ ] Add haptic feedback
- [ ] Optimize images for mobile
- [ ] Test on various screen sizes

### Phase 12: Testing & Quality Assurance (Week 8)

#### 12.1 Backend Testing

- [ ] Write unit tests for services
- [ ] Write integration tests for API endpoints
- [ ] Test authentication flow
- [ ] Test data validation
- [ ] Test error handling
- [ ] Performance testing

#### 12.2 Frontend Testing

- [ ] Write component unit tests
- [ ] Write E2E tests with Playwright
- [ ] Test responsive design
- [ ] Test PWA functionality
- [ ] Test offline capabilities
- [ ] Cross-browser testing

#### 12.3 Security Testing

- [ ] SQL injection testing
- [ ] XSS testing
- [ ] CSRF testing
- [ ] Authentication testing
- [ ] Authorization testing
- [ ] File upload security testing

### Phase 13: Documentation (Week 8)

- [ ] Write API documentation
- [ ] Create setup guide
- [ ] Write deployment guide
- [ ] Create user manual
- [ ] Document database schema
- [ ] Create troubleshooting guide

### Phase 14: Deployment (Week 9)

#### 14.1 Server Setup

- [ ] Provision VPS server
- [ ] Install Node.js, MongoDB, Nginx
- [ ] Configure firewall
- [ ] Setup SSL certificates
- [ ] Configure domain DNS

#### 14.2 Application Deployment

- [ ] Build frontend for production
- [ ] Build backend for production
- [ ] Setup PM2 for process management
- [ ] Configure Nginx reverse proxy
- [ ] Setup environment variables
- [ ] Run database migrations
- [ ] Seed initial data

#### 14.3 Monitoring & Backup

- [ ] Setup PM2 monitoring
- [ ] Configure log rotation
- [ ] Setup automated backups
- [ ] Configure health checks
- [ ] Setup error tracking (optional)

## Development Guidelines

### Code Style

- Use TypeScript strict mode
- Follow Airbnb style guide
- Use functional components in React
- Implement proper error handling
- Add JSDoc comments for complex functions
- Use meaningful variable and function names

### Git Workflow

```bash
# Feature branch workflow
git checkout -b feature/feature-name
# Make changes
git add .
git commit -m "feat: add feature description"
git push origin feature/feature-name
# Create pull request
```

### Commit Message Convention

```
feat: new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

### API Response Format

```typescript
// Success Response
{
  success: true,
  data: any,
  message?: string
}

// Error Response
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

### Database Naming Conventions

- Collections: plural, camelCase (e.g., `orders`, `menuItems`)
- Fields: camelCase (e.g., `firstName`, `createdAt`)
- Boolean fields: use `is` or `has` prefix (e.g., `isActive`, `hasDiscount`)

## Quality Checklist

Before moving to the next phase, ensure:

- [ ] All code is typed with TypeScript
- [ ] All functions have proper error handling
- [ ] All API endpoints are tested
- [ ] All components are responsive
- [ ] All user inputs are validated
- [ ] All sensitive data is protected
- [ ] All database queries are optimized
- [ ] All images are optimized
- [ ] All dependencies are up to date
- [ ] All environment variables are documented

## Performance Targets

### Frontend

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: > 90
- Bundle Size: < 500KB (initial)

### Backend

- API Response Time: < 200ms (p95)
- Database Query Time: < 100ms (p95)
- Uptime: > 99.9%
- Concurrent Users: 100+

## Security Checklist

- [ ] All passwords hashed with bcrypt
- [ ] JWT tokens with short expiry
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Rate limiting on all endpoints
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] File upload validation
- [ ] Security headers configured
- [ ] Sensitive data encrypted
- [ ] Regular security updates

## Post-Launch Tasks

### Week 1 After Launch

- [ ] Monitor error logs daily
- [ ] Track performance metrics
- [ ] Gather user feedback
- [ ] Fix critical bugs
- [ ] Update documentation

### Week 2-4 After Launch

- [ ] Analyze usage patterns
- [ ] Optimize slow queries
- [ ] Implement quick wins from feedback
- [ ] Plan next iteration

### Monthly Tasks

- [ ] Review security logs
- [ ] Update dependencies
- [ ] Performance optimization
- [ ] Feature prioritization
- [ ] Cost optimization

## Support & Maintenance

### Regular Tasks

- Daily: Check logs, monitor uptime
- Weekly: Review performance, check backups
- Monthly: Update dependencies, review security
- Quarterly: Major updates, feature releases

### Emergency Contacts

- Database issues: [DB Admin contact]
- Server issues: [DevOps contact]
- Security issues: [Security team contact]
- Business issues: [Product owner contact]

---

## Quick Start Commands

```bash
# Install dependencies
npm install

# Frontend development
cd frontend
npm run dev

# Backend development
cd backend
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Deploy to production
npm run deploy
```

## Useful Resources

- Next.js Docs: https://nextjs.org/docs
- React Docs: https://react.dev
- Tailwind CSS: https://tailwindcss.com
- shadcn/ui: https://ui.shadcn.com
- MongoDB Docs: https://docs.mongodb.com
- OpenAI API: https://platform.openai.com/docs
- Firebase Auth: https://firebase.google.com/docs/auth

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-07  
**Next Review:** 2025-02-07
