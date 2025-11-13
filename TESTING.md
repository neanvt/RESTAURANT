# Testing Guide - Restaurant POS System

This guide will help you set up and test all implemented features of the Restaurant POS system.

## Prerequisites

Before testing, ensure you have:

- Node.js (v18 or higher)
- MongoDB (running locally or connection string)
- Redis (for job queues)
- Firebase project (for authentication)
- OpenAI API key (for AI image generation)

## Initial Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env file with your credentials:
# - MONGODB_URI
# - REDIS_HOST, REDIS_PORT
# - FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL
# - OPENAI_API_KEY
# - JWT_SECRET

# Start the backend server
npm run dev
```

The backend should now be running on `http://localhost:5000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Edit .env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
# NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
# NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

# Start the frontend development server
npm run dev
```

The frontend should now be running on `http://localhost:3000`

## Testing Workflow

### Phase 1: Authentication Testing

1. **Open the app**: Navigate to `http://localhost:3000`
2. **Phone OTP Login**:
   - Enter a valid phone number (format: +1234567890)
   - Click "Send OTP"
   - Enter the OTP received via Firebase
   - Click "Verify & Login"
3. **Expected Result**: Successfully logged in and redirected to dashboard

### Phase 2: Outlet Management Testing

1. **Create First Outlet**:

   - Navigate to Settings/Outlets
   - Click "Add Outlet"
   - Fill in details:
     - Business Name
     - Outlet Name
     - Address, Phone, Email
     - GSTIN (if applicable)
     - UPI ID for payments
   - Upload logo (optional)
   - Click "Create Outlet"

2. **Switch Between Outlets**:

   - Create multiple outlets
   - Use outlet switcher to change active outlet
   - Verify data is scoped to selected outlet

3. **Expected Result**: Outlets created and switching works correctly

### Phase 3: Category & Item Management Testing

1. **Create Categories**:

   - Navigate to Items section
   - Click "Manage Categories"
   - Add categories: "Starters", "Main Course", "Beverages", etc.
   - Test edit and delete functionality

2. **Create Items**:

   - Click "Add Item"
   - Fill in item details:
     - Name, Price
     - Select Category
     - Description
     - Tax rate (if applicable)
   - **AI Image Generation**:
     - Check "Generate AI Image"
     - Wait for image generation
     - OR upload manual image
   - Mark as favorite (optional)
   - Click "Create Item"

3. **Test Item Management**:

   - View items list
   - Filter by category
   - Search items
   - Edit items
   - Toggle availability

4. **Expected Result**: Categories and items created with images

### Phase 4: Order & KOT System Testing

1. **Create Order**:

   - Navigate to Orders
   - Click "New Order"
   - Add items to cart (use +/- buttons)
   - Add customer details (optional)
   - Add table number (optional)
   - Add order notes (optional)
   - Click "Place Order"

2. **Generate KOT**:

   - Open the created order
   - Click "Generate KOT"
   - Verify KOT appears in KOT list

3. **KOT Management**:

   - Navigate to KOTs
   - View active KOTs
   - Mark items as "Preparing"
   - Mark items as "Ready"
   - Complete KOT

4. **Order Status Flow**:

   - Draft → KOT Generated → Completed
   - Test Hold/Resume functionality
   - Test Cancel order

5. **Expected Result**: Orders flow through kitchen process correctly

### Phase 5: Billing & Invoice System Testing

1. **Create Invoice from Order**:

   - Open a completed order
   - Click "Create Invoice"
   - Fill in customer details (optional)
   - Apply discount:
     - Percentage discount
     - Fixed amount discount
   - Select payment method
   - Add notes (optional)
   - Click "Create Invoice"

2. **View Invoice**:

   - Navigate to invoice detail
   - Verify all details correct
   - Check UPI QR code display (for UPI payments)
   - Test print functionality

3. **Invoice Management**:

   - View invoices list
   - Filter by payment status
   - Filter by payment method
   - Mark pending invoices as paid
   - Export/Download invoices

4. **Expected Result**: Invoices generated with correct calculations and QR codes

### Phase 6: Customer Management Testing

1. **Create Customer**:

   - Navigate to Customers
   - Click "Add Customer"
   - Fill in details:
     - Name, Phone (required)
     - Email, Address
     - Birthday, Anniversary
     - Tags (VIP, Regular, etc.)
     - Notes
   - Click "Create Customer"

2. **Customer Profile**:

   - View customer details
   - Check statistics:
     - Total orders
     - Total spent
     - Average order value
   - View recent orders
   - Edit customer info

3. **Customer Search**:

   - Search by name, phone, or email
   - Filter by active/inactive
   - Quick phone search during order creation

4. **Expected Result**: Customer database built with order history

### Phase 7: Reports & Analytics Testing

1. **Dashboard Overview**:

   - Navigate to Reports
   - View today's statistics
   - Compare with yesterday
   - Check month-to-date revenue

2. **Item Sales Report**:

   - Click "Item Sales Report"
   - Set date range
   - View top selling items
   - Check quantity sold and revenue
   - Export to CSV

3. **Additional Reports**:

   - Category Sales Report
   - Payment Method Analysis
   - Customer Analytics

4. **Expected Result**: Accurate reports with export functionality

## API Testing (Optional)

Use Postman or curl to test API endpoints:

### Authentication

```bash
# Send OTP
POST http://localhost:5000/api/auth/send-otp
Content-Type: application/json

{
  "phoneNumber": "+1234567890"
}

# Verify OTP
POST http://localhost:5000/api/auth/verify-otp
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "otp": "123456"
}
```

### Protected Endpoints

Add JWT token to headers:

```bash
Authorization: Bearer <your_jwt_token>
X-Current-Outlet: <outlet_id>
```

## Common Issues & Solutions

### 1. MongoDB Connection Error

- Ensure MongoDB is running: `mongod`
- Check connection string in .env
- Verify network connectivity

### 2. Redis Connection Error

- Start Redis: `redis-server`
- Check REDIS_HOST and REDIS_PORT in .env

### 3. Firebase Authentication Error

- Verify Firebase credentials in .env
- Check Firebase project settings
- Ensure phone authentication is enabled in Firebase Console

### 4. OpenAI API Error

- Verify OPENAI_API_KEY in .env
- Check API quota/limits
- Test with manual image upload as fallback

### 5. CORS Error

- Verify CORS_ORIGIN in backend .env matches frontend URL
- Clear browser cache
- Check browser console for specific error

### 6. Image Upload Error

- Check uploads directory exists in backend
- Verify file permissions
- Check file size limits

## Performance Testing

### Load Testing

1. Create multiple orders simultaneously
2. Generate multiple KOTs
3. Create invoices in bulk
4. Monitor response times

### Data Volume Testing

1. Create 100+ items
2. Generate 50+ orders per day
3. Test search and filter performance
4. Check report generation speed

## Security Testing

1. **Authentication**:

   - Try accessing protected routes without token
   - Test expired token handling
   - Verify token refresh mechanism

2. **Authorization**:

   - Test outlet data isolation
   - Verify user can only access their outlets
   - Check role-based permissions

3. **Input Validation**:
   - Test with invalid phone numbers
   - Try SQL injection in search fields
   - Test XSS in text fields

## Mobile Testing

1. Open app on mobile devices
2. Test touch interactions
3. Verify responsive layout
4. Check mobile-specific features

## Browser Compatibility

Test on:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Feature Checklist

Use this checklist to track testing progress:

- [ ] User authentication (OTP)
- [ ] Outlet creation and management
- [ ] Category management
- [ ] Item creation with AI images
- [ ] Manual image upload
- [ ] Order creation
- [ ] Cart management
- [ ] KOT generation
- [ ] KOT status updates
- [ ] Order completion
- [ ] Invoice creation
- [ ] Discount application
- [ ] UPI QR code generation
- [ ] Payment recording
- [ ] Customer creation
- [ ] Customer search
- [ ] Dashboard statistics
- [ ] Sales reports
- [ ] Item sales report
- [ ] Report export (CSV)
- [ ] Multi-outlet switching
- [ ] Data isolation per outlet

## Reporting Issues

When reporting issues, include:

1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Screenshots/videos
5. Browser/device information
6. Console errors (if any)

## Next Steps After Testing

Once testing is complete:

1. Document any bugs found
2. Note feature improvements needed
3. Gather user feedback
4. Plan remaining phases:
   - Expense & Inventory Management
   - Printer Integration
   - UI/UX Optimization
   - Testing & QA
   - Documentation
   - Deployment

## Support

For questions or issues during testing:

- Check console logs (backend and frontend)
- Review error messages
- Verify environment configuration
- Test API endpoints directly
