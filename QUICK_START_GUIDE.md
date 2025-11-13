# Quick Start Guide - Restaurant POS System

## Prerequisites

- Node.js 16+ installed
- MongoDB running locally or connection string
- Redis running (optional, for caching)

## Step 1: Start Backend Server

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not done)
npm install

# Start the backend server
npm run dev
```

**Expected Output:**

```
Server running on port 5005
MongoDB Connected: <your-mongodb-uri>
```

## Step 2: Start Frontend Server

Open a **new terminal window**:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not done)
npm install

# Start the frontend server
npm run dev
```

**Expected Output:**

```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- Local:        http://localhost:3000
```

## Step 3: Access the Application

Open your browser and go to:

```
http://localhost:3000
```

## Current Issue: Connection Refused

The error `ERR_CONNECTION_REFUSED` means the backend server (port 5005) is not running.

### Solution:

1. **Check if backend is running**: Look for a terminal with `Server running on port 5005`
2. **If not running**: Follow Step 1 above to start the backend
3. **Check MongoDB**: Ensure MongoDB is running and connection string is correct in `backend/.env`

## Environment Setup

### Backend `.env` file:

```env
PORT=5005
MONGODB_URI=mongodb://localhost:27017/restaurant-pos
JWT_SECRET=your-jwt-secret-here
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your-openai-key (optional)
```

### Frontend `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5005/api
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
# ... other Firebase config
```

## Troubleshooting

### Backend won't start

- **MongoDB not running**: Start MongoDB service
- **Port 5005 in use**: Change PORT in backend/.env
- **Dependencies missing**: Run `npm install` in backend directory

### Frontend won't start

- **Port 3000 in use**: Frontend will use next available port
- **Dependencies missing**: Run `npm install` in frontend directory

### API Connection Issues

- **Backend not running**: Start backend server first
- **Wrong API URL**: Check NEXT_PUBLIC_API_URL in frontend/.env.local
- **CORS errors**: Backend has CORS enabled for localhost:3000

## Development Workflow

### Running Both Servers:

You need **TWO terminal windows**:

**Terminal 1 (Backend)**:

```bash
cd backend && npm run dev
```

**Terminal 2 (Frontend)**:

```bash
cd frontend && npm run dev
```

### Using PM2 (Optional):

To run both servers with one command:

```bash
# From project root
npm run dev
```

This uses PM2 to manage both processes.

## Authentication Setup

For testing without Firebase, see:

- [`DEVELOPMENT_AUTH_BYPASS.md`](DEVELOPMENT_AUTH_BYPASS.md) - Quick testing
- [`FIREBASE_SETUP_INSTRUCTIONS.md`](FIREBASE_SETUP_INSTRUCTIONS.md) - Production setup

## Common Commands

```bash
# Backend
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server

# Frontend
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server

# Both (from root)
npm run dev          # Start both with PM2
npm run stop         # Stop all PM2 processes
```

## Next Steps

1. ✅ Start backend server (Terminal 1)
2. ✅ Start frontend server (Terminal 2)
3. ✅ Open http://localhost:3000
4. 📱 The app will redirect to /login (expected without auth setup)
5. 🔐 Set up authentication (see DEVELOPMENT_AUTH_BYPASS.md)

## Need Help?

- **Backend Logs**: Check backend/logs/error.log
- **Frontend Errors**: Check browser console (F12)
- **Network Issues**: Check browser Network tab (F12)

## Project Status

✅ **Backend**: Fully implemented with all endpoints
✅ **Frontend**: 65+ pages, complete UI
✅ **Phase 17**: UI/UX Polish complete
⏳ **Next**: Authentication setup for testing

---

**Current Error**: Backend server not running
**Solution**: Run `cd backend && npm run dev` in a new terminal
