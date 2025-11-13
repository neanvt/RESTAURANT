# Visual Component Reference Guide

**Quick visual reference for implementing Angular components from Next.js app**

---

## Bottom Navigation Component

```
┌─────────────────────────────────────────────────────┐
│  Home    Items      [+]      Reports    More        │
│   🏠      🍴     ╱      ╲      📊        ☰          │
│                │ Large  │                           │
│                │ Circle │                           │
│                 ╲      ╱                            │
└─────────────────────────────────────────────────────┘
```

**CSS Classes:**

- Container: `fixed bottom-0 left-0 right-0 bg-white border-t h-16`
- Regular items: `flex-1 flex flex-col items-center`
- Center FAB: `w-14 h-14 rounded-full bg-blue-600 -mt-6`
- Active state: `text-blue-600`
- Inactive state: `text-gray-600`

---

## Dashboard Cards

### Printer Status Card

```
┌──────────────────────────────────────┐
│  🖨️  Your printer is offline   Offline ⟳ │
└──────────────────────────────────────┘
```

**Classes:** `bg-white border rounded-lg p-3 flex items-center justify-between`

### Quick Action Buttons (3-pack)

```
┌────────┐  ┌────────┐  ┌────────┐
│   ✓    │  │   🕐   │  │   🍴   │
│        │  │        │  │        │
│ Closed │  │On Hold │  │  Add   │
│ Orders │  │ Orders │  │ Items  │
└────────┘  └────────┘  └────────┘
```

**Classes:**

- Button: `w-16 h-16 rounded-full bg-blue-600 shadow-lg`
- Label: `text-xs text-gray-700 mt-2`

### Business Overview Card

```
┌──────────────────────────────────────┐
│  🏪                                   │
│                                       │
│  Today's sales    │  Today's orders  │
│  ₹ 0.00           │      0           │
│  ₹ 0.00 (Yest.)   │  0 (Yest.)      │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │ Top selling items & more insights!│ │
│  └─────────────────────────────────┘ │
└──────────────────────────────────────┘
```

**Classes:** `bg-gradient-to-br from-blue-50 to-white rounded-lg border p-4`

---

## Order Creation - Item Card

```
┌─────────────────┐
│ ┌─────────────┐ │  ← Image container (h-40)
│ │   IMAGE     │ │
│ │             │ │
│ │  ₹99        │ │  ← Price badge (top-left)
│ │             │ │
│ │  [-][2][+]  │ │  ← Quantity controls (bottom-center)
│ └─────────────┘ │     or [+] button if not in cart
│                 │
│  Item Name      │  ← Name (p-3)
└─────────────────┘
```

**CSS Structure:**

```html
<div class="bg-white rounded-lg border overflow-hidden">
  <!-- Image Container -->
  <div class="relative h-40 bg-gray-100">
    <img />

    <!-- Price Badge (top-left) -->
    <div class="absolute top-2 left-2 bg-white/95 px-2 py-1 rounded-md">
      <span class="text-sm font-bold text-blue-600">₹99</span>
    </div>

    <!-- Quantity Controls (bottom-center) -->
    <div class="absolute bottom-2 left-1/2 transform -translate-x-1/2">
      <div class="flex bg-blue-600 rounded-full">
        <button class="w-10 h-10">-</button>
        <span class="px-4">2</span>
        <button class="w-10 h-10">+</button>
      </div>
    </div>

    <!-- OR Add Button (bottom-right) -->
    <button
      class="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-blue-600"
    >
      +
    </button>
  </div>

  <!-- Name -->
  <div class="p-3">
    <h3>Item Name</h3>
  </div>
</div>
```

---

## Category Filter (Horizontal Scroll)

```
┌────────────────────────────────────────────────┐
│ [★ Fav] [All Items] [Starters] [Main Course] → │
└────────────────────────────────────────────────┘
```

**CSS Classes:**

- Container: `flex gap-2 overflow-x-auto hide-scrollbar`
- Chip: `px-4 py-2 rounded-full border whitespace-nowrap`
- Active: `bg-blue-600 text-white border-blue-600`
- Inactive: `bg-white text-gray-700 border-gray-300`

---

## Cart Summary (Fixed Bottom)

```
┌──────────────────────────────────────┐
│ Total Amount              ₹298       │
│ 2 items                              │
│                                      │
│ [  KOT  ] [ HOLD  ] [   BILL   ]   │
└──────────────────────────────────────┘
```

**CSS Structure:**

```html
<div class="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
  <div class="px-3 py-2">
    <!-- Total -->
    <div class="flex justify-between mb-2">
      <div>
        <div class="text-xs text-gray-600">Total Amount</div>
        <div class="text-lg font-bold text-blue-600">₹298</div>
      </div>
      <div class="text-xs text-gray-600">2 items</div>
    </div>

    <!-- Buttons -->
    <div class="grid grid-cols-3 gap-2">
      <button class="border">KOT</button>
      <button class="border">HOLD</button>
      <button class="bg-blue-600 text-white">BILL</button>
    </div>
  </div>
</div>
```

---

## Floating Action Buttons (Order Create Page)

```
                              ┌────┐
                              │ 👤 │  ← Customer details
                              └────┘

                              ┌────┐
                              │ 🧾 │  ← Bill summary
                              └────┘
```

**Position:** `fixed bottom-32 right-4 flex flex-col gap-3`
**Button:** `w-14 h-14 rounded-full shadow-2xl border-2`
**Active:** `bg-blue-600 text-white border-blue-600`
**Inactive:** `bg-white text-gray-700 border-gray-200`

---

## Modal Pattern (Outlet Selector)

```
┌────────────────────────────────────┐
│  Select an Outlet              ⟳  │  ← Header
├────────────────────────────────────┤
│  ┌──────────────────────────────┐ │
│  │ 🏪 You Are Logged In With    │ │  ← User info
│  │    9876543210                │ │
│  └──────────────────────────────┘ │
│                                    │
│  My Outlets                        │
│  ┌──────────────────────────────┐ │
│  │ [Logo] SWADIKA          ✓ ⚙️ │ │  ← Active outlet
│  │        SYNC ON               │ │     (blue border)
│  └──────────────────────────────┘ │
│  ┌──────────────────────────────┐ │
│  │ [Logo] Branch 2           ⚙️ │ │  ← Inactive outlet
│  │        SYNC ON               │ │     (gray border)
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │     Create New Outlet        │ │  ← Primary button
│  └──────────────────────────────┘ │
│  ┌──────────────────────────────┐ │
│  │          Logout              │ │  ← Secondary button
│  └──────────────────────────────┘ │
└────────────────────────────────────┘
```

**CSS Classes:**

- Modal: `fixed inset-0 flex items-center justify-center z-50`
- Backdrop: `absolute inset-0 bg-black/50`
- Content: `relative bg-white rounded-2xl max-w-md w-full p-6`
- Outlet card (active): `border-2 border-blue-500 bg-blue-50 rounded-lg p-4`
- Outlet card (inactive): `border-2 border-gray-200 bg-white rounded-lg p-4`

---

## Stats Card (Reports Page)

```
┌────────────────────┐
│  🛒        ↑ 15%  │  ← Icon + Trend
│                    │
│      25           │  ← Main number
│    Orders         │  ← Label
│  Yesterday: 20    │  ← Comparison
└────────────────────┘
```

**CSS Structure:**

```html
<div class="bg-white rounded-lg border p-4">
  <!-- Header -->
  <div class="flex items-center justify-between mb-2">
    <div class="p-2 bg-blue-100 rounded-lg">
      <Icon class="h-5 w-5 text-blue-600" />
    </div>
    <div class="flex items-center text-xs font-medium text-green-600">
      <TrendingUp class="h-3 w-3 mr-1" />
      15%
    </div>
  </div>

  <!-- Value -->
  <div class="text-2xl font-bold text-gray-900">25</div>
  <div class="text-xs text-gray-600">Orders</div>
  <div class="text-xs text-gray-500 mt-1">Yesterday: 20</div>
</div>
```

---

## Items List - Item Card

```
┌─────────────────────────────────────────┐
│  ┌────┐  Item Name         ₹99  [Edit] │
│  │IMG │  ⭐ Unavailable                │  ← Left: Image
│  └────┘                                 │     Middle: Info
│                                         │     Right: Edit button
│  ─────────────────────────────────────  │
│  [⭐]        [👁]         [🗑]          │  ← Action buttons
└─────────────────────────────────────────┘
```

**CSS Structure:**

- Container: `bg-white rounded-lg shadow-sm border`
- Top row: `flex items-center gap-4 p-3`
- Image: `w-20 h-20 rounded-lg overflow-hidden`
- Action row: `flex gap-2 px-3 pb-3 border-t pt-3`
- Buttons: `flex-1` (equal width)

---

## Search Input with Icon

```
┌─────────────────────────────────┐
│  🔍  Search items...            │
└─────────────────────────────────┘
```

**CSS:**

```html
<div class="relative">
  <Icon
    class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
  />
  <input
    class="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
  />
</div>
```

---

## Badge Components

### Price Badge

```
┌────────┐
│ ₹99.00 │  ← Blue text, white bg, shadow
└────────┘
```

**CSS:** `text-sm font-bold text-blue-600 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md shadow-md`

### Status Badge (Online)

```
┌────────┐
│ Online │  ← Green bg, green text
└────────┘
```

**CSS:** `text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-700`

### Status Badge (Offline)

```
┌─────────┐
│ Offline │  ← Gray bg, gray text
└─────────┘
```

**CSS:** `text-xs px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-600`

---

## Loading States

### Spinner

```html
<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
```

### Skeleton Card

```html
<div class="h-24 animate-pulse rounded-lg bg-gray-200"></div>
```

### Loading Button

```html
<button disabled class="opacity-50 cursor-not-allowed">
  <Loader2 class="mr-2 h-4 w-4 animate-spin" />
  Loading...
</button>
```

---

## Empty State

```
┌──────────────────────────────────┐
│                                  │
│          🍽️                      │  ← Large emoji
│                                  │
│      No items found              │  ← Bold text
│  Add your first menu item        │  ← Light text
│                                  │
└──────────────────────────────────┘
```

**CSS:**

```html
<div
  class="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center"
>
  <div class="text-6xl mb-4">🍽️</div>
  <h3 class="text-lg font-semibold text-gray-900">No items found</h3>
  <p class="mt-2 text-sm text-gray-500">
    Add your first menu item to get started
  </p>
</div>
```

---

## Color Reference

### Primary Colors

- Blue 600: `#0066ff` (Buttons, active states)
- Blue 700: `#0052cc` (Hover states)
- Blue 50: `#e6f0ff` (Light backgrounds)

### Status Colors

- Green 600: `#10b981` (Success)
- Green 100: `#d1fae5` (Success light)
- Yellow 600: `#f59e0b` (Warning)
- Red 600: `#ef4444` (Error, delete)
- Red 100: `#fee2e2` (Error light)

### Neutral Colors

- Gray 50: `#f9fafb` (Page background)
- Gray 100: `#f3f4f6` (Card hover)
- Gray 200: `#e5e7eb` (Borders)
- Gray 600: `#4b5563` (Secondary text)
- Gray 900: `#111827` (Primary text)

---

## Spacing Quick Reference

- `gap-2` = 8px
- `gap-3` = 12px
- `gap-4` = 16px
- `p-3` = 12px
- `p-4` = 16px
- `px-4 py-3` = 16px horizontal, 12px vertical
- `mb-3` = 12px margin bottom
- `mt-4` = 16px margin top

---

## Border Radius Reference

- `rounded-md` = 6px
- `rounded-lg` = 8px
- `rounded-xl` = 12px
- `rounded-2xl` = 16px
- `rounded-full` = 9999px (circle)

---

## Z-Index Layers

- Bottom nav: `z-50`
- Modals: `z-50`
- Floating buttons: `z-40`
- Header (sticky): `z-10`
- Cards: `z-0` (default)

---

**Note:** All measurements assume default Tailwind CSS configuration with 1rem = 16px
