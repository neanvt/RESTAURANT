# Image Loading Fix Summary

## Issue

Images were failing to load with a 400 Bad Request error:

```
GET http://localhost:3000/_next/image?url=%2Fuploads%2Foptimized-outlet-logo-1762656658275-310784253.jpg&w=1200&q=75 400 (Bad Request)
```

## Root Cause

The backend API returns relative paths for uploaded images (e.g., `/uploads/filename.jpg`), but Next.js Image component needs the full URL to load images from external sources.

Some components were correctly prepending the API URL (`${process.env.NEXT_PUBLIC_API_URL}`), but two files were missing this:

1. `frontend/src/app/(dashboard)/outlets/page.tsx` - Line 140
2. `frontend/src/app/(dashboard)/settings/business/page.tsx` - Line 184

## Solution Applied

### File 1: Outlets Page

**Location**: `frontend/src/app/(dashboard)/outlets/page.tsx`

**Before:**

```tsx
<Image
  src={outlet.logo}
  alt={outlet.businessName}
  fill
  className="object-cover"
/>
```

**After:**

```tsx
<Image
  src={`${process.env.NEXT_PUBLIC_API_URL}${outlet.logo}`}
  alt={outlet.businessName}
  fill
  className="object-cover"
/>
```

### File 2: Business Settings Page

**Location**: `frontend/src/app/(dashboard)/settings/business/page.tsx`

**Before:**

```tsx
const displayLogo = logoPreview || currentOutlet.logo;
```

**After:**

```tsx
const displayLogo =
  logoPreview ||
  (currentOutlet.logo
    ? `${process.env.NEXT_PUBLIC_API_URL}${currentOutlet.logo}`
    : null);
```

## Next.js Image Configuration

The `next.config.js` already has the correct remote patterns configured:

```javascript
images: {
  remotePatterns: [
    {
      protocol: "http",
      hostname: "localhost",
      port: "5005",
      pathname: "/uploads/**",
    },
    {
      protocol: "https",
      hostname: "firebasestorage.googleapis.com",
      pathname: "/**",
    },
  ],
  formats: ["image/avif", "image/webp"],
}
```

This allows Next.js to optimize images from:

- Local backend: `http://localhost:5005/uploads/**`
- Firebase Storage: `https://firebasestorage.googleapis.com/**`

## Files Already Correctly Implemented

These files were already using the correct pattern:

1. ✅ `frontend/src/components/outlets/OutletSelectorModal.tsx` - Line 171
2. ✅ `frontend/src/app/(dashboard)/dashboard/page.tsx` - Line 77
3. ✅ `frontend/src/app/(dashboard)/invoices/[id]/page.tsx` - Line 150

## Environment Variable

The API URL is configured in `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5005
```

## Testing Checklist

After this fix, test the following:

- [ ] Outlet logos display correctly on outlets list page
- [ ] Outlet logo displays in business settings page
- [ ] Outlet logo displays in outlet selector modal
- [ ] Outlet logo displays on dashboard
- [ ] Logo upload and preview work correctly
- [ ] No 400 errors in browser console for images

## Technical Notes

### Why This Pattern Works

1. Backend returns relative path: `/uploads/optimized-outlet-logo-xxx.jpg`
2. Frontend prepends API URL: `http://localhost:5005/uploads/optimized-outlet-logo-xxx.jpg`
3. Next.js Image component validates against `remotePatterns` in config
4. Next.js optimizes and serves the image through `/_next/image` endpoint

### Image Optimization

Next.js automatically:

- Converts images to WebP/AVIF format
- Generates multiple sizes for responsive images
- Lazy loads images
- Caches optimized versions

## Solution Applied - Backend Fix (CRITICAL)

### File 3: Outlet Controller
**Location**: `backend/src/controllers/outletController.ts`

**Before (Line 373):**
```typescript
const logoPath = `/uploads/${req.file.filename}`;
```

**After:**
```typescript
const logoPath = `/uploads/outlets/${req.file.filename}`;
```

**Explanation**:
- The upload middleware saves files to `backend/uploads/outlets/` (line 10 in upload.ts)
- But the controller was saving paths without the `outlets` subdirectory
- This caused 404 errors because the actual file location didn't match the saved path

## Additional Fix: Favicon
Created `frontend/public/favicon.ico` to eliminate the favicon 404 error.

## IMPORTANT: Restart Required

**YOU MUST RESTART THE BACKEND SERVER** for the controller changes to take effect:

```bash
# Stop the backend if running
# Then restart it
cd backend
npm run dev
```

## Status: ✅ FIXED (Pending Backend Restart)

All fixes have been applied. After restarting the backend server:
1. Upload a new logo to test the fix
2. Existing logos with old paths will need to be re-uploaded
3. All new uploads will work correctly

### Testing After Restart
1. Go to outlets page or business settings
2. Upload a new outlet logo
3. Verify the image loads without 404 errors
4. Check browser console - should see no errors

## Migration Note
Outlets with existing logos saved before this fix will have incorrect paths in the database. Options:
1. Re-upload logos (Recommended for few outlets)
2. Run a database migration script to update paths (For many outlets)
