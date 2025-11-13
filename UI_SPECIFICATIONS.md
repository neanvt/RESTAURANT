# Restaurant POS System - UI Specifications

## Overview

This document provides detailed UI/UX specifications based on the actual application screenshots and design patterns.

## Design System

### Color Palette

```css
/* Primary Colors */
--primary-blue: #0066ff;
--primary-blue-light: #e8f1ff;
--primary-blue-dark: #0052cc;

/* Secondary Colors */
--secondary-green: #10b981;
--secondary-red: #ef4444;
--secondary-orange: #f59e0b;
--secondary-purple: #8b5cf6;

/* Neutral Colors */
--white: #ffffff;
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
--black: #000000;

/* Status Colors */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;

/* Background Colors */
--bg-primary: #ffffff;
--bg-secondary: #f9fafb;
--bg-accent: #f3f4f6;
```

### Typography

```css
/* Font Family */
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
  "Helvetica", "Arial", sans-serif;

/* Font Sizes */
--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-base: 1rem; /* 16px */
--text-lg: 1.125rem; /* 18px */
--text-xl: 1.25rem; /* 20px */
--text-2xl: 1.5rem; /* 24px */
--text-3xl: 1.875rem; /* 30px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Spacing

```css
/* Spacing Scale */
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem; /* 48px */
--space-16: 4rem; /* 64px */
```

### Border Radius

```css
--radius-sm: 0.375rem; /* 6px */
--radius-md: 0.5rem; /* 8px */
--radius-lg: 0.75rem; /* 12px */
--radius-xl: 1rem; /* 16px */
--radius-2xl: 1.5rem; /* 24px */
--radius-full: 9999px;
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

## Component Specifications

### 1. Navigation Header

**Mobile (Top Bar)**

```
┌─────────────────────────────────────┐
│ ←  Page Title          [Icon] [Icon] │
└─────────────────────────────────────┘
```

- Height: 56px
- Background: White
- Border bottom: 1px solid #E5E7EB
- Back button: 24x24px icon, left aligned with 16px padding
- Title: Text-lg, font-semibold, centered or left-aligned
- Action icons: 24x24px, right aligned with 16px padding

### 2. Bottom Navigation

```
┌─────────────────────────────────────┐
│  🏠      📦      ➕      📊      ☰  │
│ Home   Items   Order  Reports  More  │
└─────────────────────────────────────┘
```

- Height: 64px
- Background: White
- Shadow: 0 -2px 10px rgba(0,0,0,0.05)
- Icons: 24x24px
- Labels: Text-xs
- Active state: Primary blue color
- Inactive state: Gray-500

### 3. Card Component

**Standard Card**

```css
.card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}
```

**Featured Card (Outlet/Member)**

```css
.featured-card {
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  color: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

### 4. Button Styles

**Primary Button**

```css
.btn-primary {
  background: #0066ff;
  color: white;
  border-radius: 12px;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 102, 255, 0.2);
}
```

**Secondary Button**

```css
.btn-secondary {
  background: white;
  color: #0066ff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 600;
}
```

**Destructive Button**

```css
.btn-danger {
  background: #ef4444;
  color: white;
  border-radius: 12px;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 600;
}
```

### 5. Input Fields

**Text Input**

```css
.input-field {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 16px;
  background: white;
  transition: border-color 0.2s;
}

.input-field:focus {
  border-color: #0066ff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
}
```

**Label**

```css
.input-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
  display: block;
}

.input-label.required::after {
  content: " *";
  color: #ef4444;
}
```

### 6. Item Card (Menu Items)

```
┌───────────────────┐
│   [   Image   ]   │ ← Rounded corners, aspect ratio 1:1
│                   │
│   Item Name       │ ← Font-medium, text-base
│   ₹Price          │ ← Font-semibold, text-lg
│                   │
│   [  +  Qty  - ]  │ ← Quantity controls (when selected)
└───────────────────┘
```

**Specifications:**

- Width: Responsive grid (2 columns on mobile, 3+ on tablet)
- Image: Square with rounded corners (12px radius)
- Price badge: Top right corner, background overlay
- Padding: 12px
- Shadow: Subtle (shadow-sm)
- Add button: Circular, 40x40px, primary blue

### 7. Category Filter Tabs

```
┌─────────────────────────────────────┐
│ [ALL] Favourite  Chaat  Fast Food   │ ← Horizontal scroll
└─────────────────────────────────────┘
```

- Height: 48px
- Horizontal scroll enabled
- Active tab: Blue background, white text, bold
- Inactive tab: Gray background, dark text
- Border radius: 8px
- Padding: 8px 16px
- Gap: 8px between tabs

### 8. Search Bar

```css
.search-bar {
  display: flex;
  align-items: center;
  background: #f9fafb;
  border-radius: 12px;
  padding: 12px 16px;
  margin: 16px;
}

.search-icon {
  width: 20px;
  height: 20px;
  color: #9ca3af;
  margin-right: 8px;
}

.search-input {
  border: none;
  background: transparent;
  font-size: 16px;
  flex: 1;
  outline: none;
}
```

### 9. Modal/Dialog

**Bottom Sheet Style (Mobile)**

```
┌─────────────────────────────────────┐
│                                     │
│              Handle Bar             │ ← Drag handle
│                                     │
│          Modal Title                │
│                                     │
│          Content Area               │
│                                     │
│    [Cancel]        [Confirm]        │
│                                     │
└─────────────────────────────────────┘
```

- Border radius: 24px (top corners only)
- Handle bar: 40x4px, gray-300, centered
- Max height: 90vh
- Background: White
- Shadow: Large elevation

### 10. Status Tags

```css
/* Joined Status */
.status-joined {
  color: #0066ff;
  background: #e8f1ff;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

/* Default Badge */
.badge-default {
  background: #e8f1ff;
  color: #0066ff;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

/* Offline Badge */
.badge-offline {
  background: #fee2e2;
  color: #ef4444;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}
```

### 11. Avatar/Initial Circle

```css
.avatar-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
}
```

### 12. List Item

```
┌─────────────────────────────────────┐
│ [Icon]  Title                    › │
│         Subtitle                    │
└─────────────────────────────────────┘
```

```css
.list-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
}

.list-item:active {
  background: #f9fafb;
}

.list-item-icon {
  width: 24px;
  height: 24px;
  margin-right: 12px;
  color: #6b7280;
}

.list-item-chevron {
  margin-left: auto;
  color: #d1d5db;
}
```

## Screen Layouts

### Home Dashboard

```
┌─────────────────────────────────────┐
│  ← Dashboard             🔔 👤     │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────┐ ┌──────────────┐ │
│  │ Today's Sale │ │ Total Orders │ │
│  │   ₹2,500    │ │     25       │ │
│  └──────────────┘ └──────────────┘ │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Yesterday: ₹2,200 (+13.6%) │   │
│  └─────────────────────────────┘   │
│                                     │
│  Quick Actions                      │
│  ┌────────┐ ┌────────┐ ┌────────┐  │
│  │  New   │ │ View   │ │ Hold   │  │
│  │ Order  │ │  KOT   │ │ Orders │  │
│  └────────┘ └────────┘ └────────┘  │
│                                     │
│  Recent Orders                      │
│  ┌─────────────────────────────┐   │
│  │ #101 - ₹250 - 2 mins ago   │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### Add Order Screen

```
┌─────────────────────────────────────┐
│  ← Add Order        ⚙️  Add Details │
├─────────────────────────────────────┤
│  🔍 Search                          │
├─────────────────────────────────────┤
│ [ALL] Favourite Chaat Fast Food ... │
├─────────────────────────────────────┤
│  Category Name                      │
│                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │ Item │ │ Item │ │ Item │       │
│  │ ₹30  │ │ ₹50  │ │ ₹60  │       │
│  └──────┘ └──────┘ └──────┘       │
│                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │ Item │ │ Item │ │ Item │       │
│  │ ₹40  │ │ ₹30  │ │ ₹80  │       │
│  └──────┘ └──────┘ └──────┘       │
│                                     │
└─────────────────────────────────────┘
```

### Invoice Preview

```
┌─────────────────────────────────────┐
│  Preview                    ⬆️  ✕  │
├─────────────────────────────────────┤
│         [   Business Logo   ]       │
│                                     │
│         BUSINESS NAME               │
│    Address, Phone Number            │
│ ─────────────────────────────────── │
│         Tax Invoice                 │
│                                     │
│ Cash Sale         Date: 07/11/2025  │
│                   Time: 02:56 pm    │
│                   Invoice no: 191   │
│ ─────────────────────────────────── │
│ Item Name         Price    Amount   │
│ Qty                                 │
│ ─────────────────────────────────── │
│ Aloo Chat         30.00    30.00   │
│ x1                                  │
│ ─────────────────────────────────── │
│ Subtotal                   :  30.00 │
│ Total                      :  30.00 │
│                                     │
│    [    QR Code for Payment    ]    │
│                                     │
│      Scan this QR code to pay       │
│ ─────────────────────────────────── │
│       Terms & Conditions            │
│  Thank you for doing business...    │
│                                     │
│                                     │
│  [ Close ]        [ Print & Close ] │
└─────────────────────────────────────┘
```

### Menu/Settings Screen

```
┌─────────────────────────────────────┐
│  ← Menu                             │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │ 🏢 SWADIKA              ›    │  │ ← Featured card
│  │ +91 8630344043               │  │
│  ├───────────────────────────────┤  │
│  │ 👑 Gold Member          ›    │  │
│  └───────────────────────────────┘  │
│                                     │
│  👥 Regular Customers          ›    │
│  💬 WhatsApp Marketing         ›    │
│  ☁️  Sync / Use on other...   ⚪   │ ← Toggle
│  👥 Manage Staff               ›    │
│  🖨️  Printer                    ›    │
│  🎧 Support                    ›    │
│  🚪 Logout                          │
│                                     │
│         table                       │
│         2.0.1                       │
└─────────────────────────────────────┘
```

### Business Details Form

```
┌─────────────────────────────────────┐
│  ← Business Details                 │
├─────────────────────────────────────┤
│  Business name                      │
│  ┌─────────────────────────────┐   │
│  │ SWADIKA                     │   │
│  └─────────────────────────────┘   │
│                                     │
│  Phone Number *                     │
│  ┌──────┬──────────────────────┐   │
│  │ +91  │ 8630344043          │   │
│  └──────┴──────────────────────┘   │
│                                     │
│  Logo                               │
│  ┌─────────────────────────────┐   │
│  │    [   Logo Image   ]       │   │
│  │                         🗑️ 🔗│   │
│  └─────────────────────────────┘   │
│                                     │
│  Outlet Address                     │
│  ┌─────────────────────────────┐   │
│  │ SOWC COMPLEX, SUKRITI,      │   │
│  │ MATHURA                     │   │
│  └─────────────────────────────┘   │
│                                     │
│  UPI ID                             │
│  ┌─────────────────────────────┐   │
│  │ paytmqr28100505011ha6f7... │   │
│  └─────────────────────────────┘   │
│  ⓘ This will be used to print...   │
│                                     │
│  [ Cancel ]    [ Update Details ]   │
└─────────────────────────────────────┘
```

### Add Menu Item Form

```
┌─────────────────────────────────────┐
│  ← Add Menu Item                    │
├─────────────────────────────────────┤
│  Item Name *                        │
│  ┌─────────────────────────────┐   │
│  │ Tap to Enter                │   │
│  └─────────────────────────────┘   │
│                                     │
│  Item Image                         │
│  ┌─────────────────────────────┐   │
│  │         📷                  │   │
│  │   Upload Item Image     ✨  │   │ ← AI icon
│  └─────────────────────────────┘   │
│                                     │
│  Item Category                      │
│  ┌─────────────────────────────┐   │
│  │ Tap To Select            ⌄  │   │
│  └─────────────────────────────┘   │
│                                     │
│  Sale Price                         │
│  ┌──────────────────┬──────────┐   │
│  │ Tap to Enter     │Without   │   │
│  │                  │Tax ⌄     │   │
│  └──────────────────┴──────────┘   │
│                                     │
│  Tax Percentage                     │
│  ┌─────────────────────────────┐   │
│  │ None                     ⌄  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ☑️ Make this item's tax the...     │
│  ☐ Mark this item as favourite      │
│                                     │
│  [ Save & New ]    [ Save Item ]    │
└─────────────────────────────────────┘
```

### Order Reports

```
┌─────────────────────────────────────┐
│  ← Order Reports           📄  📊  │
├─────────────────────────────────────┤
│  ┌────────┐ ┌─────────────────────┐ │
│  │Custom⌄│ │06/11/2025 TO 07/...│ │
│  └────────┘ └─────────────────────┘ │
│                                     │
│  ┌────────────┐ ┌─────────────────┐ │
│  │Customers👥│ │Payment Type 🏛️  │ │
│  └────────────┘ └─────────────────┘ │
│                                     │
│  ┌──────────────┐ ┌──────────────┐  │
│  │  22          │ │  ₹2,020      │  │
│  │  No of Txns  │ │  Total Sale  │  │
│  └──────────────┘ └──────────────┘  │
│                                     │
│  #170                               │
│  06 NOV 2025                        │
│  Total            Type              │
│  ₹120            Cash     🖨️ ⬆️ 🗑️ │
│  ───────────────────────────────    │
│  #171                               │
│  06 NOV 2025                        │
│  Total            Type              │
│  ₹30             UPI      🖨️ ⬆️ 🗑️ │
│  ───────────────────────────────    │
└─────────────────────────────────────┘
```

### Item Reports

```
┌─────────────────────────────────────┐
│  ← Item Reports            📄  📊  │
├─────────────────────────────────────┤
│  ┌────────┐ ┌─────────────────────┐ │
│  │Custom⌄│ │06/11/2025 TO 07/...│ │
│  └────────┘ └─────────────────────┘ │
│                                     │
│  ┌────────────┐                     │
│  │Customers👥│                     │
│  └────────────┘                     │
│                                     │
│  Aloo Chat                          │
│  Order Quantity    Order Amount     │
│  1                 ₹30              │
│  ───────────────────────────────    │
│  Bhelpuri                           │
│  Order Quantity    Order Amount     │
│  3                 ₹150             │
│  ───────────────────────────────    │
│  Burger                             │
│  Order Quantity    Order Amount     │
│  1                 ₹50              │
│  ───────────────────────────────    │
└─────────────────────────────────────┘
```

### Printer Selection Modal

```
┌─────────────────────────────────────┐
│  Choose a Printer to Print      🔄 │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │ SR588                       │   │
│  │                Default Offline│  │
│  │                             │   │
│  │ ⚠️ Default printer unavail...│   │
│  │    Make sure it's ON & has  │   │
│  │    paper. Refresh after...  │   │
│  └─────────────────────────────┘   │
│                                     │
│  No Devices Available?          ⌄  │
│  Please click on 'Use New Dev...    │
│                                     │
│  ☐ Set as default printer           │
│                                     │
│  [ Skip & Save ]  [ Use New Device ]│
└─────────────────────────────────────┘
```

### Add Regular Customer

```
┌─────────────────────────────────────┐
│  ← Add Regular Customer             │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │ 📱 Fetch Customer Details    │   │
│  │    Directly From Your...  ✕ │   │
│  └─────────────────────────────┘   │
│                                     │
│  Phone Number *                     │
│  ┌─────────────────────────────┐   │
│  │ +91                         │   │
│  └─────────────────────────────┘   │
│                                     │
│  Name                               │
│  ┌─────────────────────────────┐   │
│  │ Tap to Enter                │   │
│  └─────────────────────────────┘   │
│                                     │
│  Loyalty Discount                   │
│  ┌─────────────────────────────┐   │
│  │ Tap to Enter              % │   │
│  └─────────────────────────────┘   │
│  ⓘ Discount will be applied on...  │
│                                     │
│                                     │
│         [Keyboard]                  │
│                                     │
└─────────────────────────────────────┘
```

### Manage Staff

```
┌─────────────────────────────────────┐
│  ← Manage Staff                     │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │ 👤 Check Staff Activity   › │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ⓐ  Admin                    │   │
│  │    7088970099               │   │
│  │    Primary Admin            │   │
│  │                             │   │
│  │    JOINED                   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Ⓗ  Hemant                   │   │
│  │    8218699051               │   │
│  │    Secondary Admin          │   │
│  │                             │   │
│  │    JOINED      Remove User  │   │
│  └─────────────────────────────┘   │
│                                     │
│           [ Invite Staff ]          │
└─────────────────────────────────────┘
```

## Interaction Patterns

### Touch Targets

- Minimum touch target: 44x44px
- Spacing between touchable elements: 8px minimum
- Buttons: 48px height minimum

### Gestures

- **Pull to refresh**: On list screens (orders, items)
- **Swipe**: Horizontal swipe on list items for quick actions
- **Long press**: On items for quick edit/delete
- **Pinch to zoom**: On item images

### Loading States

- Skeleton screens for initial load
- Spinner for button actions
- Progress bar for file uploads
- Shimmer effect for image loading

### Empty States

```
┌─────────────────────────────────────┐
│                                     │
│         [   Illustration   ]        │
│                                     │
│         No Items Found              │
│    Add your first item to begin     │
│                                     │
│        [  Add Item Button  ]        │
│                                     │
└─────────────────────────────────────┘
```

### Error States

```
┌─────────────────────────────────────┐
│  ⚠️                                  │
│  Something went wrong               │
│  Unable to load data. Please try    │
│  again.                             │
│                                     │
│        [  Try Again Button  ]       │
└─────────────────────────────────────┘
```

### Success Feedback

- Toast messages: Bottom sheet style, 4 second duration
- Success icon with animation
- Haptic feedback on important actions

## Responsive Breakpoints

```css
/* Mobile First */
@media (min-width: 640px) {
  /* sm */
  /* 2 column grid for items */
}

@media (min-width: 768px) {
  /* md */
  /* Show sidebar, 3 column grid */
}

@media (min-width: 1024px) {
  /* lg */
  /* 4 column grid, expanded view */
}

@media (min-width: 1280px) {
  /* xl */
  /* Desktop optimized layout */
}
```

## Animations

### Page Transitions

```css
.page-enter {
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

### Button Press

```css
.button:active {
  transform: scale(0.96);
  transition: transform 0.1s;
}
```

### Card Hover (Desktop)

```css
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
}
```

## Accessibility

### Focus States

```css
:focus-visible {
  outline: 2px solid #0066ff;
  outline-offset: 2px;
}
```

### Color Contrast

- Text on white: Minimum 4.5:1 ratio
- Text on colored backgrounds: Minimum 4.5:1 ratio
- Large text (18px+): Minimum 3:1 ratio

### Screen Reader Support

- All interactive elements have `aria-label`
- Form fields have associated labels
- Status messages use `role="status"`
- Loading states use `aria-busy="true"`

## Print Styles

### KOT Receipt (Thermal 58mm)

```
    07/11/2025 04:52 pm
         KOT - 1
       Table No 2
---------------------------------
Item                         QTY
---------------------------------
Mayonnaise Sandwich            3
---------------------------------
```

### Tax Invoice (Thermal 58mm)

```
      [Business Logo]

      BUSINESS NAME
  Address, City, State
    Phone: 8630344043
---------------------------------
      Tax Invoice

Cash Sale         Date: 07/11/25
                  Time: 04:52 pm
               Invoice no: 191
---------------------------------
Item Name      Price    Amount
Qty
---------------------------------
Mayonnaise      60.00   180.00
Sandwich
x3
---------------------------------
Subtotal          :     180.00
Total             :     180.00

    [QR Code for Payment]

   Scan this QR code to pay
---------------------------------
    Terms & Conditions
Thank you for doing business
          with us.
```

## Component Library References

### Recommended UI Libraries

1. **shadcn/ui** - For base components (already planned)
2. **Recharts** - For analytics charts
3. **qrcode.react** - For QR code generation
4. **react-hot-toast** - For toast notifications
5. **react-spring** - For smooth animations

## Implementation Notes

1. **Mobile-First Development**: Start with mobile layouts, then scale up
2. **Touch-Friendly**: All interactive elements minimum 44px height
3. **Performance**: Keep bundle size under 500KB initial load
4. **Offline UI**: Clear indicators when offline, queue sync
5. **Print-Optimized**: Thermal printer-specific CSS
6. **Dark Mode Ready**: CSS variables for easy theme switching

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-07  
**Next Review:** 2025-02-07
