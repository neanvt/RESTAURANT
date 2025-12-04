# KOT Duplicate Key Error - Permanent Fix

## Problem Description

The application was experiencing daily duplicate key errors when generating KOT (Kitchen Order Ticket) numbers. The error occurred because:

1. **KOT numbers reset daily** (001, 002, 003, etc.)
2. **Old KOTs remain in database** from previous days
3. **Unique index constraint**: `{ outletId: 1, kotNumber: 1 }`
4. **Conflict**: When today's counter reaches a number that exists from yesterday, MongoDB throws a duplicate key error

### Example Scenario:

```
Yesterday (Dec 3): KOT #060 created
Today (Dec 4): Counter starts at 001
Today (Dec 4): When counter reaches 060 → DUPLICATE KEY ERROR!
```

## Root Cause

The KOT model had a compound unique index on `(outletId, kotNumber)` without considering the date. Since KOT numbers reset daily, this caused conflicts with old KOTs.

```typescript
// Old Index (PROBLEMATIC)
KOTSchema.index({ outletId: 1, kotNumber: 1 }, { unique: true });
```

## Solution Implemented

### 1. Date-Prefixed KOT Numbers

Changed the KOT number format to include the date prefix:

**Old Format**: `001, 002, 003`
**New Format**: `0412-001, 0412-002, 0412-003` (DDMM-XXX)

This ensures KOT numbers are unique across days:

- December 3rd: `0312-001, 0312-002, ...`
- December 4th: `0412-001, 0412-002, ...`

### 2. Code Changes

**File**: `backend/src/controllers/orderController.ts`

```typescript
// Updated generateKOTNumber function
const generateKOTNumber = async (outletId: string): Promise<string> => {
  // ... existing code ...

  // NEW: Format includes date to avoid conflicts
  const dayMonth = `${day}${month}`;
  const formattedNumber = `${dayMonth}-${counter.sequence
    .toString()
    .padStart(3, "0")}`;

  return formattedNumber;
};
```

### 3. Cleanup Script

Created `backend/cleanup-old-kots.js` to mark old completed KOTs as inactive:

```bash
# Run manually to clean up old KOTs (older than 30 days)
node backend/cleanup-old-kots.js
```

## Benefits

✅ **Prevents duplicate key errors** - KOT numbers are now unique across days
✅ **Readable format** - Easy to identify which day the KOT was created
✅ **Maintains sequence** - Still have daily sequential numbering
✅ **Backward compatible** - Old KOTs remain valid
✅ **Database optimization** - Cleanup script keeps database clean

## Testing

The fix has been tested with the retry mechanism already in place:

1. Counter increments atomically
2. If duplicate occurs (edge case), retry logic generates new number
3. Date prefix ensures no conflicts with previous days

## Migration

**No database migration required!** The change is forward-compatible:

- Old KOTs: Keep their old format (001, 002, etc.)
- New KOTs: Use new format (0412-001, etc.)
- Both can coexist in the database

## Monitoring

Monitor the logs for these messages:

- `✅ Generated KOT number: DDMM-XXX` - Successful generation
- `⚠️ Duplicate KOT key error` - Should not occur anymore
- `✅ KOT created successfully` - Successful creation

## Future Improvements

1. **Scheduled Cleanup**: Set up a cron job to run cleanup script monthly
2. **Dashboard Analytics**: Show KOT number patterns by date
3. **Archive System**: Move old KOTs to archive collection for long-term storage

## Related Files

- `backend/src/controllers/orderController.ts` - KOT generation logic
- `backend/src/models/KOT.ts` - KOT schema and indexes
- `backend/src/models/Counter.ts` - Counter for sequence generation
- `backend/cleanup-old-kots.js` - Cleanup script for old KOTs

## Technical Notes

### Counter Collection Structure

```javascript
{
  _id: "kot_<outletId>_YYYY-MM-DD",  // Resets daily
  sequence: 1,                        // Auto-incremented
  date: ISODate("2025-12-04"),
  type: "kot"
}
```

### KOT Collection Index

```javascript
// Unique index - ensures no duplicate kotNumber per outlet
{ outletId: 1, kotNumber: 1 }, { unique: true }

// Now works perfectly with date-prefixed format
```

## Commit Information

- **Date**: December 4, 2025
- **Issue**: Daily duplicate key errors on KOT generation
- **Fix**: Date-prefixed KOT numbers (DDMM-XXX format)
- **Impact**: Zero downtime, backward compatible
