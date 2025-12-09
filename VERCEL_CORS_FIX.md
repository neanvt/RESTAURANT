# CORS Fix for Vercel Deployment

## Issue Fixed

The application was experiencing CORS errors when trying to login from `https://swadika.foodstall.in` because:

1. The domain was not included in the `ALLOWED_ORIGINS` environment variable
2. Preflight OPTIONS requests were not being handled properly

## Changes Made

### 1. Updated `backend/vercel.json`

- Added `https://swadika.foodstall.in` to the `ALLOWED_ORIGINS` environment variable

### 2. Updated `backend/src/app.ts`

- Added explicit OPTIONS handler middleware **before** the CORS middleware to handle preflight requests
- This ensures all preflight OPTIONS requests get proper CORS headers

## Important: Vercel Dashboard Configuration

**⚠️ SECURITY WARNING:** The `vercel.json` file contains sensitive environment variables including private keys and secrets. These should **NOT** be stored in version control.

### Recommended Steps:

1. **Go to Vercel Dashboard:**

   - Navigate to your project: https://vercel.com/dashboard
   - Select your backend project (restaurant-backend-rho)

2. **Configure Environment Variables:**

   - Go to Settings → Environment Variables
   - Add/Update the following variable:
     ```
     ALLOWED_ORIGINS=https://restaurant-frontend-yvss.vercel.app,https://restaurant-frontend-bice.vercel.app,https://swadika.foodstall.in,http://localhost:3000,http://localhost:4200
     ```

3. **Remove Sensitive Data from vercel.json:**

   - After setting up environment variables in the dashboard, remove the `env` section from `vercel.json`
   - Keep only the configuration structure:
     ```json
     {
       "version": 2,
       "functions": {
         "src/server.ts": {
           "runtime": "@vercel/node@18.19.0",
           "maxDuration": 30
         }
       },
       "rewrites": [
         {
           "source": "/(.*)",
           "destination": "/src/server.ts"
         }
       ]
     }
     ```

4. **Redeploy:**
   - After updating environment variables in the Vercel dashboard
   - Redeploy your application (or push to trigger auto-deployment)

## How the Fix Works

### Preflight Request Flow:

```
1. Browser sends OPTIONS request to backend
2. New explicit OPTIONS handler intercepts and responds with:
   - Access-Control-Allow-Origin: (requesting origin)
   - Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
   - Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
   - Access-Control-Allow-Credentials: true
   - Status: 204 No Content

3. Browser receives preflight approval
4. Browser sends actual POST request (login)
5. CORS middleware validates origin and handles actual request
```

## Testing the Fix

1. **Deploy to Vercel:**

   ```bash
   cd backend
   vercel --prod
   ```

2. **Test from frontend:**

   - Clear browser cache and cookies
   - Navigate to https://swadika.foodstall.in
   - Try logging in
   - Check browser console - CORS errors should be gone

3. **Verify with curl:**

   ```bash
   # Test OPTIONS preflight
   curl -X OPTIONS https://restaurant-backend-rho.vercel.app/api/auth/login \
     -H "Origin: https://swadika.foodstall.in" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type,Authorization" \
     -v

   # Should return:
   # - HTTP 204
   # - Access-Control-Allow-Origin: https://swadika.foodstall.in
   # - Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
   ```

## Additional Notes

### Current Allowed Origins:

- https://restaurant-frontend-yvss.vercel.app
- https://restaurant-frontend-bice.vercel.app
- https://swadika.foodstall.in ⬅️ **NEWLY ADDED**
- http://localhost:3000 (development)
- http://localhost:4200 (development)

### To Add More Domains:

1. Update `ALLOWED_ORIGINS` in Vercel dashboard (comma-separated)
2. Alternatively, update the hardcoded list in `backend/src/app.ts` (lines 40-45)
3. Redeploy

## Troubleshooting

If CORS errors persist:

1. **Check Vercel Logs:**

   ```bash
   vercel logs
   ```

   Look for the console.log statements showing CORS requests

2. **Verify Environment Variable:**

   - In Vercel dashboard, check that `ALLOWED_ORIGINS` includes your domain
   - Make sure there are no typos or extra spaces

3. **Clear Browser Cache:**

   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
   - Or open in incognito mode

4. **Check Request Headers:**
   - Open browser DevTools → Network tab
   - Look at the failed request
   - Check if `Origin` header matches exactly what's in your allowed list

## Security Best Practices

✅ **DO:**

- Store sensitive data in Vercel dashboard environment variables
- Use specific domain names (not wildcards) in production
- Keep the allowed origins list as restrictive as possible

❌ **DON'T:**

- Commit sensitive keys to git
- Use `Access-Control-Allow-Origin: *` in production
- Allow unnecessary origins

## Next Steps

After deploying:

1. Test login from https://swadika.foodstall.in
2. Monitor Vercel logs for any CORS-related messages
3. Remove sensitive environment variables from `vercel.json` and commit the cleaned version
