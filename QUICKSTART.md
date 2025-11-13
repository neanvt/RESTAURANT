# Quick Start Guide - Restaurant POS System

Get your Restaurant POS system up and running in minutes!

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install Dependencies (2 minutes)

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Environment (1 minute)

**Backend (.env)**

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with minimum required values:

```env
# MongoDB (local or Atlas)
MONGODB_URI=mongodb://localhost:27017/restaurant-pos

# Redis (for job queues)
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Firebase Admin (get from Firebase Console > Project Settings > Service Accounts)
FIREBASE_PROJECT_ID=restopos-15a94
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCuqysLZOaiTZTq\nSxCzMZGgjaRXYQSzshYluKzVPEKWkjXymwdqyF2JVq96YeFZhv9LG6aQJ4a8BH25\nImX8MbSu1Bz4yi+6Ft/57J44zeTrQcnzxUsXnmnMrN0qldTDQPJ2RNtUqJ3EaEpn\nFdnO33ZAS+DmbYDL0BaR/ZxCPsQSOqqv0g/1BexB4iFgwmQkNQOP5Hq7fp+niLvW\nhA18phlP0avY0xx9R/nGmJhhdgwFlTgas7Tw78vkA1YQQN7XcASIVLxBqZTuytJX\nrDupeqPVFwnk1QNF561nK0ehGiZ4jINiRpLtRHqxki+egP5SahA3Kjp78RMssHGQ\nVuLhmBrVAgMBAAECggEACceovdcU+NJ6O5IfacElQ8WahY/3mO4oQk1wU/IvUkn2\nflKC3E5Cun1hjusrGH2wDq8KKPklmKJxvat45WGNGdrjkmSTvoooWVCP3WNd5XRG\nEAGkfjqO9vhY29kO1C3vRYL+euOEDeq++72j9+rYLqpw+cX417CbiuoV1Tm5dcG+\nfZQwYI1JedKlpORyG+xp9N+W/L8bMUIVi2pvciloEJyqAKhVdLsZhw0CGjyoVpgA\nzNsibVR8vAckei/3FIlEzGPJSTll868QZpw2s5BONLciIPV7wkXIf4Q7lGcmp2yU\ndMf1FvuBmbtrJBiZR8JkmpBh83a6l7KVkk3bFglw4QKBgQDVGgLNxNOVZ+ielqvh\nFPHt3kaSbsKce2X875Pc9VTbG2oCuKlNvzkL29llTdZ59bs/XwNVwOM1vHb34YNB\n66S6P5A+JU+SBuPW5bAsECWM9Q/fqnERxrtOLPOHHjsEPKQyI5hEQ4ArmTtGp7/9\nznulOJZArRu3392izVzxjGQgUQKBgQDR1IzPp0XWIPODcwz9MOv1IPUWbOOki/AK\ndPHfoVCZa5KOxGZa5PKxEnC0OmTkv/uAMLkbhNGYqjmyZmG2+lm5uLu5lYTwYLKw\nH2AvkQeqxh8su7DO8hJ4dg82VWdy+x1zgkDtCEF+wyfuwNgjMravk2LcV99vA30n\nOwLGijjVRQKBgDCL9muOFW2J+HJ4fLuQG/VGl+kwFmGzsu5GXfcOZMBtpF7uVpOB\npqtO8F2lt+Cc3IV5TbcxdBF/19Jsq4xO9H4BkQi3U0M/EpSYSuQe4Y8VHQKlP5D/\nJxiOIQR9HJDAh99sQHn8rqxAAkL8YD6f1Yc0NvaQ+SmQdFtsUWotw3mhAoGALOGr\n5NbAp1aQ/7LiOl32eo48HjnYT1/nTjVJby4QEWDjDkqQIi0KhDmPhd1fq1YtM3Q4\ng9xbAK6YfMJNcFgITSNoc/+5Wbk1P1rWthXtb+fEz0quPPWmYcHO6y5FXGC+IfDg\ndlLnv3d62STClnTIgrGh2cOp9RLn+DY1F8aE9YkCgYEAsFpnIAq9pKSf4sl4LFLp\nDq1jXAx5fKY+bYpJJKYaOS8o6j5h3+F9GT/PIQHaBa6OFYK7qHxfGXrq6/S+g1SS\n1ReSj3gkj/QZIY/KfPgeOrmTROwiGoVyrEPg+lcgxht1m84U1IfS07JE7yrW0pi6\nzWlYqz5be98yUOCROJTA/2Y=\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@restopos-15a94.iam.gserviceaccount.com

# OpenAI (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-YOUR_OPENAI_API_KEY_HERE

# Server Config
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**Frontend (.env.local)**

```bash
cd ../frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
# API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Firebase Config (get from Firebase Console > Project Settings > General)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDAVPvjZX1m5FD3qufBRUfrvWVrG4_b4wY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

### Step 3: Start Services (2 minutes)

**Terminal 1 - MongoDB**

```bash
# If using local MongoDB
mongod
```

**Terminal 2 - Redis**

```bash
# If using local Redis
redis-server
```

**Terminal 3 - Backend**

```bash
cd backend
npm run dev
```

**Terminal 4 - Frontend**

```bash
cd frontend
npm run dev
```

## 🎯 First Time Setup

### 1. Open the App

Navigate to: `http://localhost:3000`

### 2. Login with Phone OTP

- Enter phone number (format: +1234567890)
- Receive OTP via Firebase
- Login

### 3. Create Your First Outlet

- Navigate to Settings/Outlets
- Click "Add Outlet"
- Fill in business details
- Save

### 4. Add Categories & Items

- Go to Items section
- Create categories (Starters, Main Course, etc.)
- Add items with AI-generated images
- Set prices and details

### 5. Create Your First Order

- Click "New Order"
- Add items to cart
- Place order
- Generate KOT
- Create invoice

## 📦 Dependencies Required

### System Requirements

- Node.js 18+
- MongoDB 6.0+
- Redis 7.0+

### External Services

- **Firebase**: Phone authentication
  - Enable Phone Authentication in Firebase Console
  - Add your domain to authorized domains
- **OpenAI**: AI image generation
  - Get API key from OpenAI dashboard
  - Ensure you have credits

## 🔧 Troubleshooting

### MongoDB not connecting?

```bash
# Check if MongoDB is running
mongosh

# If not installed, install MongoDB:
# macOS: brew install mongodb-community
# Ubuntu: sudo apt install mongodb
# Windows: Download from mongodb.com
```

### Redis not connecting?

```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG

# If not installed, install Redis:
# macOS: brew install redis
# Ubuntu: sudo apt install redis
# Windows: Use WSL or download from redis.io
```

### Firebase authentication not working?

1. Enable Phone Authentication in Firebase Console
2. Add localhost to authorized domains
3. Verify credentials in .env file
4. Check Firebase quota limits

### OpenAI API errors?

1. Verify API key is correct
2. Check OpenAI account has credits
3. Test API key at: https://platform.openai.com
4. Use manual image upload as alternative

## 📱 Mobile Testing

1. Get your local IP address:

   ```bash
   # macOS/Linux
   ifconfig | grep inet

   # Windows
   ipconfig
   ```

2. Update frontend .env.local:

   ```env
   NEXT_PUBLIC_API_URL=http://YOUR_IP:5000/api
   ```

3. Update backend .env:

   ```env
   CORS_ORIGIN=http://YOUR_IP:3000
   ```

4. Access from mobile: `http://YOUR_IP:3000`

## 🎨 Sample Data

### Categories to Create

- 🍕 Fast Food
- 🍜 Main Course
- 🥗 Salads
- 🍰 Desserts
- ☕ Beverages
- 🍱 Starters

### Sample Items

- **Fast Food**: Burger (₹150), Pizza (₹299), Sandwich (₹99)
- **Beverages**: Coffee (₹50), Tea (₹30), Juice (₹60)
- **Desserts**: Ice Cream (₹80), Cake (₹120)

## 📊 Features to Test

1. ✅ **Authentication**: Phone OTP login
2. ✅ **Outlets**: Create and switch between outlets
3. ✅ **Items**: AI-generated images, categories
4. ✅ **Orders**: Cart, KOT, order flow
5. ✅ **Invoices**: Billing, discounts, QR codes
6. ✅ **Customers**: Database, order history
7. ✅ **Reports**: Dashboard, sales analytics
8. ✅ **Multi-device**: Test on mobile and desktop

## 🚦 System Status Check

Run these commands to verify everything is working:

```bash
# Check backend
curl http://localhost:5000/api/health
# Should return: {"status":"ok",...}

# Check MongoDB
mongosh --eval "db.runCommand({ping: 1})"
# Should return: { ok: 1 }

# Check Redis
redis-cli ping
# Should return: PONG
```

## 📖 Next Steps

After basic setup:

1. Review [`TESTING.md`](TESTING.md) for comprehensive testing guide
2. Check [`ARCHITECTURE.md`](ARCHITECTURE.md) for system design
3. See [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md) for roadmap

## 🆘 Need Help?

**Check Logs:**

- Backend: Check terminal running `npm run dev`
- Frontend: Check browser console (F12)
- MongoDB: Check MongoDB logs
- Redis: `redis-cli monitor`

**Common Commands:**

```bash
# Restart backend
cd backend && npm run dev

# Restart frontend
cd frontend && npm run dev

# Clear MongoDB
mongosh restaurant-pos --eval "db.dropDatabase()"

# Clear Redis
redis-cli FLUSHALL

# Check processes
# macOS/Linux: ps aux | grep node
# Windows: tasklist | findstr node
```

## 💡 Pro Tips

1. **Use MongoDB Compass** for visual database management
2. **Use Redis Commander** for Redis inspection
3. **Use Postman** for API testing
4. **Enable source maps** for easier debugging
5. **Keep terminals visible** to see logs in real-time

## 🎉 You're Ready!

Your Restaurant POS system is now running. Start by creating your first outlet and adding menu items!

For detailed testing instructions, see [`TESTING.md`](TESTING.md)
