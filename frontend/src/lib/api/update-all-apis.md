# API Files Token Update

The following files need to be updated to use `getAccessToken()` from `@/lib/auth-token`:

## Files with `localStorage.getItem("token")`:

- ✅ axios-config.ts - UPDATED
- ✅ reports.ts - UPDATED
- ✅ outlets.ts - UPDATED
- invoices.ts
- categories.ts
- staff.ts
- kots.ts
- orders.ts
- customers.ts
- items.ts

## Files with `localStorage.getItem("accessToken")`:

- printers.ts
- expenses.ts
- inventory.ts

All these files need:

1. Import: `import { getAccessToken } from "@/lib/auth-token";`
2. Replace: `localStorage.getItem("token")` or `localStorage.getItem("accessToken")` with `getAccessToken()`
