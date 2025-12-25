# Staff Login Issues - Troubleshooting Guide

## Problem

Invited staff members are getting **401 (Unauthorized)** errors when trying to log in with the default password, followed by **429 (Too Many Requests)** errors after multiple failed attempts.

## Default Password

The default password for all invited staff is: **`Utkranti@123`**

## Diagnosis Steps

### Step 1: Verify Staff Account

Run the diagnostic script to check if the password is correctly set:

```bash
cd backend
node verify-staff-password.js <phone_number>
```

Example:

```bash
node verify-staff-password.js 9876543210
```

This script will:

- ✅ Show user details (name, role, status, etc.)
- ✅ Check if password is set
- ✅ Verify if password matches the default
- ✅ Automatically reset password if needed

### Step 2: Check Login Credentials

Make sure the staff member is using the correct identifier:

- **Phone number**: `9876543210` (10 digits, without country code)
- **Password**: `Utkranti@123` (case-sensitive)

### Step 3: Rate Limit Reset

If you see 429 errors, the IP address has been rate-limited. Wait 15 minutes or clear the rate limit:

```bash
# Restart the backend server to clear in-memory rate limits
cd backend
npm run dev
# or for production
pm2 restart all
```

### Step 4: Common Issues and Solutions

#### Issue 1: User Not Found (401)

**Symptoms**: "Invalid identifier or password" error

**Solutions**:

1. Verify the phone number is correct (10 digits)
2. Check if user exists in database:

```bash
node verify-staff-password.js <phone_number>
```

#### Issue 2: Wrong Password (401)

**Symptoms**: User exists but password doesn't match

**Solutions**:

1. Run the verification script to check and reset password:

```bash
node verify-staff-password.js <phone_number>
```

2. The script will automatically detect and fix password issues

#### Issue 3: No Password Set (400)

**Symptoms**: "No password set for this account. Use OTP login." error

**Solutions**:

1. Run the verification script which will set the default password:

```bash
node verify-staff-password.js <phone_number>
```

#### Issue 4: Rate Limiting (429)

**Symptoms**: "Too many requests" error

**Solutions**:

1. Wait 15 minutes for the rate limit to reset
2. Or restart the backend server:

```bash
pm2 restart all
```

## Backend Logs to Check

When staff tries to login, check backend logs for:

```bash
cd backend/logs
tail -f combined.log
```

Look for:

- `📱 Looking up user with identifier: <phone>`
- `✅ User found: <userId>`
- `❌ User not found`
- `❌ Invalid credentials`

## Manual Password Reset

If you need to manually reset a staff member's password:

```bash
cd backend
node set-user-password.js <phone_number> <new_password>
```

Example:

```bash
node set-user-password.js 9876543210 Utkranti@123
```

## Testing Login Flow

### Test with cURL:

```bash
curl -X POST https://restaurant-backend-rho.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "9876543210",
    "password": "Utkranti@123"
  }'
```

Expected successful response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "phone": "9876543210",
      "name": "Staff Name",
      "role": "staff",
      "requirePasswordChange": true
    },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

## Quick Fix Commands

### 1. Verify and Fix Staff Password

```bash
cd backend
node verify-staff-password.js <phone_number>
```

### 2. Reset Rate Limit (Restart Server)

```bash
pm2 restart restaurant-backend
```

### 3. Check Server Logs

```bash
pm2 logs restaurant-backend --lines 50
```

## Prevention

To avoid this issue in the future:

1. **Test After Inviting**: Always test login immediately after inviting a staff member
2. **Inform Staff**: Send the default password to staff members via SMS/WhatsApp
3. **Monitor Logs**: Set up log monitoring to catch authentication issues early
4. **Rate Limit Adjustment**: Consider increasing rate limits for login attempts in production

## Support

If issues persist after trying these steps:

1. Check MongoDB connection
2. Verify backend environment variables
3. Check if bcrypt is properly installed
4. Review backend error logs in detail
