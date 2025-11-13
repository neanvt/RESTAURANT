# Angular Implementation Checklist

**Project:** Restaurant POS System Migration  
**Target:** Angular 20 + .NET 9 WebAPI  
**Status:** Ready to implement

---

## Phase 1: Setup & Configuration ⏳

### Project Initialization

- [ ] Create Angular 20 project with routing
- [ ] Install Angular Material
- [ ] Install required dependencies (RxJS, etc.)
- [ ] Configure Tailwind CSS or use Angular Material theming
- [ ] Set up environment files (development, production)
- [ ] Configure proxy for API calls

### Project Structure

- [ ] Create folder structure
  - [ ] `src/app/core/` (services, guards, interceptors)
  - [ ] `src/app/shared/` (shared components, pipes, directives)
  - [ ] `src/app/features/` (feature modules)
  - [ ] `src/app/models/` (TypeScript interfaces)
  - [ ] `src/assets/` (images, icons)

### Core Services

- [ ] Create `AuthService` with JWT handling
- [ ] Create `HttpInterceptor` for token injection
- [ ] Create `AuthGuard` for route protection
- [ ] Create `ErrorInterceptor` for global error handling
- [ ] Create `ApiService` for HTTP calls

---

## Phase 2: Authentication Module ⏳

### Login Component

- [ ] Create login component
- [ ] Implement password login form
- [ ] Add form validation
- [ ] Style according to UI specs
- [ ] Handle authentication state

### Signup Component

- [ ] Create signup component (✅ Already created in Swadika/client)
- [ ] Form fields: name, phone, email, password, confirmPassword
- [ ] Add validation (phone 10-digit, password match)
- [ ] Connect to `/api/auth/signup` endpoint
- [ ] Navigate to dashboard on success

<!-- ### Verify OTP Component

- [ ] Create OTP verification component
- [ ] 6-digit OTP input
- [ ] Resend OTP functionality
- [ ] Timer countdown
- [ ] Error handling -->

### Auth Routes

- [ ] `/auth/login` route
- [ ] `/auth/signup` route
- [ ] `/auth/verify` route
- [ ] Redirect logic (authenticated → dashboard)

---

## Phase 3: Layout Components ⏳

### Bottom Navigation

- [ ] Create `BottomNavComponent`
- [ ] 5 navigation items (Home, Items, Add, Reports, More)
- [ ] Active state styling
- [ ] Center FAB elevation
- [ ] Hide on specific routes (/orders/create, /kots)
- [ ] Router integration

### Header Component

- [ ] Create sticky header component
- [ ] Outlet selector button
- [ ] Logo/avatar display
- [ ] Back button (for sub-pages)

### Outlet Selector Modal

- [ ] Create modal component
- [ ] Fetch outlets from API
- [ ] Display outlets with logos
- [ ] Active outlet indication
- [ ] Switch outlet functionality
- [ ] Edit outlet button
- [ ] Create new outlet button
- [ ] Logout button
- [ ] Refresh functionality

---

## Phase 4: Dashboard Page 🎯 HIGH PRIORITY

### Dashboard Component

- [ ] Create dashboard component
- [ ] Fetch dashboard stats from API
- [ ] Auto-refresh every 30 seconds
- [ ] Refresh on visibility change

### Dashboard Sections

- [ ] Printer status card
  - [ ] Status indicator (online/offline)
  - [ ] Toggle functionality
  - [ ] Refresh button
- [ ] Quick actions buttons (3)
  - [ ] Closed Orders → `/orders?status=completed`
  - [ ] On Hold Orders → `/orders?status=on_hold`
  - [ ] Add Items → `/items/create`
- [ ] Business overview card
  - [ ] Today's sales and orders
  - [ ] Yesterday comparison
  - [ ] Store icon
  - [ ] Link to reports
- [ ] Stats cards
  - [ ] Paid invoices today
  - [ ] Month to date revenue
- [ ] More actions section
  - [ ] Create new order
  - [ ] View kitchen orders
  - [ ] Manage customers

---

## Phase 5: Order Creation Page 🎯 HIGH PRIORITY

### Create Order Component

- [ ] Create order creation component
- [ ] Header with back button and cart count
- [ ] Search bar for items
- [ ] Category filter (horizontal scroll)

### Item Display

- [ ] Fetch items from API
- [ ] Filter by category
- [ ] Filter by favourite
- [ ] Search functionality
- [ ] 2-column grid layout
- [ ] Item cards
  - [ ] Image with aspect ratio 5:4
  - [ ] Price badge (top-left)
  - [ ] Add button (if not in cart)
  - [ ] Quantity controls (if in cart)
  - [ ] Item name

### Cart Management

- [ ] Cart state management
- [ ] Add item to cart
- [ ] Update quantity (+/-)
- [ ] Remove item from cart
- [ ] Calculate subtotal, tax, total

### Floating Components

- [ ] Customer details FAB
  - [ ] Toggle visibility
  - [ ] Floating card with form
  - [ ] Fields: name, phone, table, notes
- [ ] Bill summary FAB
  - [ ] Toggle visibility
  - [ ] Show subtotal, tax, total

### Cart Summary (Fixed Bottom)

- [ ] Display total and item count
- [ ] KOT button → generate KOT
- [ ] HOLD button → hold order
- [ ] BILL button → generate bill and invoice

### Modals

- [ ] KOT Preview Modal
  - [ ] Display order details
  - [ ] Print KOT button
  - [ ] Print Bill button
  - [ ] Close and reset cart
- [ ] Invoice Preview Modal
  - [ ] Display invoice details
  - [ ] QR code display
  - [ ] Print invoice button
  - [ ] Share button

---

## Phase 6: Items Management 🎯 HIGH PRIORITY

### Items List Component

- [ ] Create items list component
- [ ] Header with "Add Item" button
- [ ] Search bar
- [ ] Category filter
- [ ] Fetch items from API

### Item Cards

- [ ] List view layout
- [ ] Thumbnail (80x80px)
- [ ] Item name and price
- [ ] Availability badge
- [ ] Favourite star indicator
- [ ] Edit button
- [ ] Action buttons row
  - [ ] Toggle favourite (star)
  - [ ] Toggle availability (eye/eye-off)
  - [ ] Delete (trash, red)

### Create Item Component

- [ ] Create item form
- [ ] Fields: name, price, category, description, tax
- [ ] Image upload
- [ ] AI image generation option
- [ ] Save and navigate back

### Edit Item Component

- [ ] Edit item form (reuse create form)
- [ ] Pre-fill with existing data
- [ ] Update functionality

### Empty State

- [ ] Display when no items
- [ ] Emoji and text
- [ ] "Add item" prompt

---

## Phase 7: Reports & Analytics

### Reports Dashboard

- [ ] Create reports component
- [ ] Live indicator (pulsing dot)
- [ ] Last updated timestamp
- [ ] Auto-refresh every 30 seconds

### Stats Cards

- [ ] Today's orders with trend
- [ ] Today's revenue with trend
- [ ] Month to date revenue

### Report Links

- [ ] Sales Report
- [ ] Item Sales Report (highlighted)
- [ ] Order Report
- [ ] Category Report
- [ ] Payment Methods Report

### Detail Reports

- [ ] Sales report page
- [ ] Item sales report page
- [ ] Category report page
- [ ] Payment methods page
- [ ] Charts and graphs (optional)

---

## Phase 8: More Menu & Navigation

### More Page Component

- [ ] Create more page component
- [ ] Header with title and subtitle

### Menu Cards (12 items)

- [ ] Outlets
- [ ] Manage Staff
- [ ] Customers
- [ ] Orders
- [ ] Kitchen (KOT)
- [ ] Invoices
- [ ] Expenses
- [ ] Inventory
- [ ] Printers
- [ ] Analytics
- [ ] Categories
- [ ] Settings

### Logout

- [ ] Logout card with confirmation
- [ ] Clear auth state
- [ ] Navigate to login

---

## Phase 9: Additional Pages (Medium Priority)

### Orders List

- [ ] Orders list component
- [ ] Filter by status
- [ ] Filter by date range
- [ ] Search functionality
- [ ] View order details

### Order Details

- [ ] Order detail page
- [ ] Order items list
- [ ] Customer information
- [ ] Order status
- [ ] Actions (complete, cancel)

### KOT Management

- [ ] KOT list page
- [ ] Filter by status
- [ ] Mark as preparing/completed
- [ ] Print KOT

### Invoices

- [ ] Invoices list
- [ ] Filter by status, date
- [ ] View invoice details
- [ ] Print/share invoice

### Customers

- [ ] Customer list
- [ ] Add customer
- [ ] Edit customer
- [ ] View customer orders

### Outlets

- [ ] Outlets list
- [ ] Create outlet
- [ ] Edit outlet
- [ ] Upload logo

### Categories

- [ ] Categories list
- [ ] Add category
- [ ] Edit category
- [ ] Delete category

---

## Phase 10: Shared Components Library

### Button Component

- [ ] Primary variant
- [ ] Outline variant
- [ ] Ghost variant
- [ ] Circular FAB variant
- [ ] Loading state
- [ ] Disabled state

### Card Component

- [ ] Standard card
- [ ] Gradient card
- [ ] Stat card
- [ ] Clickable card

### Input Component

- [ ] Text input
- [ ] Search input with icon
- [ ] Textarea
- [ ] Number input
- [ ] Select dropdown

### Badge Component

- [ ] Status badge (online/offline)
- [ ] Price badge
- [ ] Count badge

### Modal Component

- [ ] Reusable modal wrapper
- [ ] Backdrop
- [ ] Close button
- [ ] Header/footer slots

### Loading Components

- [ ] Spinner
- [ ] Skeleton loader
- [ ] Progress bar

### Empty State Component

- [ ] Reusable empty state
- [ ] Customizable icon/emoji
- [ ] Title and description

---

## Phase 11: Services & State Management

### Item Service

- [ ] Fetch items
- [ ] Create item
- [ ] Update item
- [ ] Delete item
- [ ] Toggle favourite
- [ ] Toggle availability

### Order Service

- [ ] Fetch orders
- [ ] Create order
- [ ] Update order
- [ ] Generate KOT
- [ ] Hold order
- [ ] Resume order
- [ ] Cancel order

### Outlet Service

- [ ] Fetch outlets
- [ ] Fetch current outlet
- [ ] Select outlet
- [ ] Create outlet
- [ ] Update outlet

### Category Service

- [ ] Fetch categories
- [ ] Create category
- [ ] Update category
- [ ] Delete category

### Report Service

- [ ] Fetch dashboard stats
- [ ] Fetch sales report
- [ ] Fetch item sales report

### Customer Service

- [ ] Fetch customers
- [ ] Create customer
- [ ] Update customer

---

## Phase 12: PWA & Performance

### PWA Configuration

- [ ] Create manifest.json
- [ ] Add app icons (192x192, 512x512)
- [ ] Configure service worker
- [ ] Add to home screen prompt

### Caching Strategy

- [ ] Cache static assets
- [ ] Cache API responses (short-term)
- [ ] Offline page

### Performance Optimizations

- [ ] Lazy load feature modules
- [ ] Image optimization
- [ ] Code splitting
- [ ] Bundle size optimization

---

## Phase 13: Testing

### Unit Tests

- [ ] Auth service tests
- [ ] Order service tests
- [ ] Components tests (critical ones)

### Integration Tests

- [ ] Login flow
- [ ] Order creation flow
- [ ] Item management flow

### E2E Tests

- [ ] Complete user journey
- [ ] Multi-outlet switching
- [ ] Order to invoice flow

---

## Phase 14: Deployment

### Build Configuration

- [ ] Production environment setup
- [ ] API URL configuration
- [ ] Firebase configuration
- [ ] Build optimization

### Deployment Steps

- [ ] Build Angular app (`ng build --prod`)
- [ ] Deploy to hosting (IIS/Azure/Vercel)
- [ ] Configure HTTPS
- [ ] Configure CORS on API

### Post-Deployment

- [ ] Smoke testing
- [ ] Performance monitoring
- [ ] Error tracking (Sentry/AppInsights)
- [ ] Analytics setup

---

## Quality Checklist

### Responsiveness

- [ ] Mobile (320px - 640px)
- [ ] Tablet (640px - 1024px)
- [ ] Desktop (1024px+)

### Accessibility

- [ ] ARIA labels
- [ ] Keyboard navigation
- [ ] Color contrast (WCAG AA)
- [ ] Screen reader support

### Browser Compatibility

- [ ] Chrome (latest)
- [ ] Safari (iOS)
- [ ] Firefox (latest)
- [ ] Edge (latest)

### Performance

- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Lighthouse score > 90

---

## Documentation

- [ ] Update README.md
- [ ] API documentation
- [ ] Component documentation
- [ ] Deployment guide
- [ ] User manual

---

## Priority Matrix

### 🔴 Critical (Week 1-2)

- Phase 1: Setup & Configuration
- Phase 2: Authentication Module
- Phase 3: Layout Components
- Phase 4: Dashboard Page

### 🟡 High Priority (Week 3-4)

- Phase 5: Order Creation Page
- Phase 6: Items Management
- Phase 10: Shared Components (parallel)

### 🟢 Medium Priority (Week 5-6)

- Phase 7: Reports & Analytics
- Phase 8: More Menu & Navigation
- Phase 9: Additional Pages

### 🔵 Low Priority (Week 7-8)

- Phase 11: Services optimization
- Phase 12: PWA & Performance
- Phase 13: Testing
- Phase 14: Deployment

---

## Notes

- ✅ = Completed
- ⏳ = In Progress
- 🎯 = High Priority
- 🔴 = Blocked/Issue

**Last Updated:** 11 November 2025
