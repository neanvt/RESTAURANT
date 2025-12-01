# How to Get Your Outlet ID for Testing

## Method 1: From Dashboard (Easiest)

1. Login to dashboard: `http://localhost:3000`
2. Open browser DevTools (F12 or Cmd+Option+I)
3. Go to Console tab
4. Run this command:

```javascript
JSON.parse(localStorage.getItem("auth-storage")).state.currentOutlet._id;
```

5. Copy the outlet ID that appears

## Method 2: From Menu Print Page

1. Go to: `http://localhost:3000/menu-print`
2. Open DevTools Console
3. Right-click the left QR code → "Inspect Element"
4. Look at the `src` attribute - it contains `outletId=XXXXXX`
5. Copy the ID after `outletId=`

## Method 3: Direct API Call

```bash
# Get your access token first
TOKEN="your_access_token_here"

# Call the outlets API
curl -H "Authorization: Bearer $TOKEN" http://localhost:5005/api/outlets
```

## Test URL Format

Once you have the outlet ID, use this format:

```
http://localhost:3000/menu-select?outletId=673c1234567890abcdef1234
```

## Mobile Testing

Replace `localhost:3000` with your computer's IP:

```
http://192.168.1.XXX:3000/menu-select?outletId=673c1234567890abcdef1234
```

To find your IP on Mac:

```bash
ipconfig getifaddr en0
```

## Permanent Test Link

You can also add this to your `.env.local`:

```
NEXT_PUBLIC_DEFAULT_OUTLET_ID=your_outlet_id_here
```

Then update the code to use it as fallback when no outlet ID is provided.
