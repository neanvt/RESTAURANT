# Menu Print Feature Implementation

## Overview

Added a feature to print the current available menu items with outlet logo, similar to the attached menu design.

## Backend Changes

### 1. API Endpoint

**File**: `backend/src/controllers/reportController.ts`

- Added `getMenuPrintData()` function
- Fetches outlet information including logo, address, and contact details
- Retrieves all active and available menu items grouped by category
- Returns structured data for printing

**Route**: `GET /api/reports/menu-print`
**File**: `backend/src/routes/reportRoutes.ts`

### API Response Structure

```json
{
  "success": true,
  "data": {
    "outlet": {
      "name": "Business Name",
      "logo": "logo_url",
      "address": { "street", "city", "state", "pincode" },
      "contact": { "phone", "whatsapp" },
      "operatingHours": {}
    },
    "categories": [
      {
        "categoryId": "id",
        "categoryName": "Category Name",
        "categoryIcon": "📦",
        "items": [
          {
            "id": "item_id",
            "name": "Item Name",
            "price": 100
          }
        ]
      }
    ],
    "totalItems": 50
  }
}
```

## Frontend Changes

### 1. API Client

**File**: `frontend/src/lib/api/reports.ts`

- Added `getMenuPrintData()` method to fetch menu data from backend

### 2. Menu Print Page

**File**: `frontend/src/app/(dashboard)/menu-print/page.tsx`

- Created new page for menu printing
- Features:
  - Displays outlet logo and information at the top
  - Shows menu items grouped by category in a 2-column grid
  - Each item has checkboxes for selection
  - Items show name and price (₹ symbol)
  - Print button in header (hidden when printing)
  - Responsive design for screen and optimized for print

### 3. Navigation

**File**: `frontend/src/app/(dashboard)/more/page.tsx`

- Added "Print Menu" button in More tab
- Icon: Menu (📋)
- Color: Green (bg-green-100 text-green-600)
- Description: "Print available menu items"

## Print Features

### Print Layout

- **Page Size**: A4
- **Margins**: 0.5cm
- **Header**:
  - Outlet logo (centered, 128x128px)
  - Outlet name (large, bold)
  - Full address and contact details
  - Orange border accent (4px)
- **Menu Title Section**:
  - "MENU" and "ITEMS" text
  - Orange background
- **Items Grid**:
  - 2-column layout
  - Categories as section headers with icons
  - Checkboxes for item selection
  - Item names on left, prices on right
  - Border separators between items
- **Footer**:
  - Operating hours note
  - Minimum order disclaimer
  - Orange border accent

### Print Optimizations

- Hides navigation and print button
- Color-accurate printing (print-color-adjust: exact)
- Page break avoidance for headers
- Visible checkboxes in print
- Clean white background

## Usage

1. Navigate to **More** tab
2. Click on **Print Menu** option
3. Review the menu on screen
4. Click **Print Menu** button in the header
5. Use browser's print dialog to print or save as PDF

## Design Matching

The implementation matches the attached menu image with:

- ✅ Logo at top center
- ✅ Business name and address
- ✅ "MENU ITEMS" heading
- ✅ 2-column grid layout
- ✅ Checkboxes for items
- ✅ Item names and prices
- ✅ Category grouping
- ✅ Contact information
- ✅ Operating hours section
- ✅ Minimum order disclaimer

## Technical Details

### Authentication

- Requires user to be logged in
- Uses current outlet from `x-outlet-id` header
- Automatically includes access token

### Filters

- Only shows **active** items (`isActive: true`)
- Only shows **available** items (`isAvailable: true`)
- Groups by active categories
- Sorts categories by display order
- Sorts items alphabetically within categories

## Future Enhancements (Optional)

- Add QR code for WhatsApp ordering
- Include item descriptions
- Add item images
- Customizable layout options
- Multiple language support
- Export as PDF directly
- Include popular items badge
- Add nutritional information
