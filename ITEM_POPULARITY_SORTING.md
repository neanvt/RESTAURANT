# Item Popularity Sorting Implementation

## Overview
Items on the order creation page are now sorted by order frequency (popularity) to speed up KOT and invoice generation. The sorting prioritizes items that are frequently ordered today, followed by last 7 days, then last 30 days, and finally alphabetically.

## Implementation Details

### Backend Changes

#### 1. Item Service (`backend/src/services/itemService.ts`)
- Added `getItemsWithPopularity()` method that uses MongoDB aggregation pipeline
- Calculates order frequency for three time periods:
  - Today: Items ordered today
  - Last 7 days: Items ordered in the past week
  - Last 30 days: Items ordered in the past month
- Creates a composite popularity score: `today * 1000 + last7Days * 100 + last30Days * 10`
- Sorts by popularity score (descending), then alphabetically
- Falls back to regular item fetching if popularity calculation fails

#### 2. Item Controller (`backend/src/controllers/itemController.ts`)
- Added `getItemsWithPopularity()` controller method
- Same filtering capabilities as regular getItems (category, availability, favorites, search)

#### 3. Routes (`backend/src/routes/itemRoutes.ts`)
- Added new route: `GET /api/items/with-popularity`
- Supports same query parameters as regular items endpoint

### Frontend Changes

#### 1. API Client (`frontend/src/lib/api/items.ts`)
- Added `getAllWithPopularity()` method
- Makes request to new popularity endpoint

#### 2. Item Store (`frontend/src/store/itemStore.ts`)
- Added `fetchItemsWithPopularity()` method
- Includes fallback to regular fetch if popularity sorting fails
- Maintains offline caching functionality

#### 3. Order Creation Page (`frontend/src/app/(dashboard)/orders/create/page.tsx`)
- Now uses `fetchItemsWithPopularity()` instead of `fetchItems()`
- Items are automatically sorted by popularity on page load

## Sorting Logic

The popularity score calculation prioritizes:
1. **Today's orders** (weight: 1000): Items ordered today get highest priority
2. **Last 7 days** (weight: 100): Recently popular items
3. **Last 30 days** (weight: 10): Generally popular items
4. **Alphabetical**: For items with same popularity score

### Example:
- Item A: 2 orders today, 5 orders in 7 days, 10 orders in 30 days
  - Score: (2 × 1000) + (5 × 100) + (10 × 10) = 2,600
- Item B: 0 orders today, 8 orders in 7 days, 15 orders in 30 days
  - Score: (0 × 1000) + (8 × 100) + (15 × 10) = 950

Item A will appear first despite Item B having more total orders.

## Benefits

1. **Faster KOT Generation**: Most frequently ordered items appear at the top
2. **Improved UX**: Staff can quickly find popular items
3. **Dynamic Sorting**: Adapts to daily and weekly ordering patterns
4. **Fallback Reliability**: Falls back to regular sorting if popularity fails
5. **Offline Support**: Maintains cached functionality for offline use

## Technical Notes

- Uses MongoDB aggregation pipeline for efficient calculation
- Excludes cancelled orders from popularity calculation
- Maintains all existing filtering capabilities (category, search, availability, favorites)
- Zero impact on other parts of the application
- Backward compatible - regular item fetching still available

## Testing

The implementation can be tested by:
1. Creating several orders with different items
2. Visiting the order creation page
3. Verifying that frequently ordered items appear first
4. Testing with category filters, search, and favorites

## Future Enhancements

Potential improvements could include:
- Cache popularity scores for better performance
- Add time-based weighting (recent orders worth more)
- Admin dashboard to view item popularity analytics
- Configurable time periods for popularity calculation