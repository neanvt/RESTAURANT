# Restaurant POS System

A comprehensive mobile-first Progressive Web Application (PWA) for restaurant point-of-sale management with AI-powered features, multi-outlet support, and extensive reporting capabilities.

## 🚀 Features

- **Multi-Outlet Management**: Manage multiple restaurant locations from a single system
- **AI-Powered**: Generate menu item images and descriptions using OpenAI
- **Mobile-First PWA**: Works offline and installable on mobile devices
- **Real-time Orders**: Kitchen Order Ticket (KOT) system with order tracking
- **Inventory Management**: Track stock levels and get low-stock alerts
- **Reports & Analytics**: Comprehensive sales, items, and order reports
- **Customer Management**: Track regular customers and order history
- **Expense Tracking**: Monitor daily expenses and profitability
- **Multiple Payment Methods**: Cash, UPI, PhonePe, Google Pay, Card
- **Thermal Printer Support**: Print KOTs and invoices

## 📋 Prerequisites

- Node.js 20 LTS or higher
- MongoDB 7.0 or higher
- Redis (optional, for caching)
- npm 9.0 or higher

## 🏗️ Project Structure

```
restaurant-pos/
├── frontend/          # Next.js 14 PWA Application
├── backend/           # Express.js API Server
├── shared/            # Shared types and utilities
├── docs/              # Documentation
└── scripts/           # Utility scripts
```

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd restaurant-pos
```

### 2. Install dependencies

```bash
npm run install:all
```

Or install separately:

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

### 3. Setup environment variables

#### Frontend (.env.local)

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local` and configure:

- API URL
- Firebase configuration (for authentication)

#### Backend (.env)

```bash
cd backend
cp .env.example .env
```

Edit `.env` and configure:

- MongoDB connection string
- JWT secrets
- Firebase Admin SDK credentials
- OpenAI API key
- SMTP settings

### 4. Setup MongoDB

```bash
# Start MongoDB locally
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in backend/.env
```

### 5. Setup Firebase (for authentication)

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Phone Authentication
3. Get your Firebase config and add to frontend/.env.local
4. Download Service Account key for backend and add credentials to backend/.env

## 🚀 Running the Application

### Development Mode

```bash
# Run both frontend and backend
npm run dev

# Or run separately
npm run dev:frontend  # Frontend on http://localhost:3000
npm run dev:backend   # Backend on http://localhost:5000
```

### Production Mode

```bash
# Build both applications
npm run build

# Start production servers
npm run start
```

### Using PM2 (Production)

```bash
cd backend
npm run build
pm2 start ecosystem.config.js
```

## 📱 PWA Installation

1. Open the app in Chrome/Edge on mobile or desktop
2. Click the install prompt or use browser menu "Install App"
3. The app will work offline after installation

## 🧪 Testing

```bash
# Run all tests
npm test

# Run frontend tests
npm run test:frontend

# Run backend tests
npm run test:backend
```

## 📚 Documentation

- [Architecture](ARCHITECTURE.md) - System architecture and technical specifications
- [Implementation Plan](IMPLEMENTATION_PLAN.md) - Detailed development roadmap
- [UI Specifications](UI_SPECIFICATIONS.md) - Design system and UI guidelines
- [API Documentation](docs/API.md) - API endpoints and usage
- [Setup Guide](docs/SETUP.md) - Detailed setup instructions
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment guide

## 🔑 Default Credentials

For development/testing, you can create a user via OTP authentication:

- Phone: Any valid phone number
- OTP: Sent via Firebase Auth SMS

## 📦 Tech Stack

### Frontend

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS + shadcn/ui
- Zustand (State Management)
- React Hook Form + Zod
- PWA Support (next-pwa)

### Backend

- Node.js + Express.js
- TypeScript
- MongoDB + Mongoose
- Redis (Caching)
- JWT Authentication
- Firebase Admin SDK
- OpenAI API
- Bull (Job Queue)

## 🔧 Development Scripts

```bash
# Frontend
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Backend
cd backend
npm run dev          # Start development server with nodemon
npm run build        # Build TypeScript
npm run start        # Start production server
npm test             # Run tests
```

## 📈 Features Roadmap

### Phase 1 ✅ (Current)

- [x] Project setup and configuration
- [x] Basic folder structure
- [x] Development environment

### Phase 2 (In Progress)

- [ ] Authentication system
- [ ] Multi-outlet management
- [ ] Item management with AI
- [ ] Order and KOT system

### Phase 3 (Planned)

- [ ] Billing and invoicing
- [ ] Customer management
- [ ] Reports and analytics
- [ ] Expense tracking
- [ ] Printer integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**

   - Ensure MongoDB is running
   - Check connection string in `.env`

2. **Firebase Authentication Error**

   - Verify Firebase configuration
   - Check service account credentials

3. **Port Already in Use**

   - Change PORT in `.env` files
   - Kill process using the port

4. **Dependencies Installation Fails**
   - Clear npm cache: `npm cache clean --force`
   - Delete `node_modules` and reinstall

## 📞 Support

For issues and questions:

- Create an issue on GitHub
- Check documentation in `docs/` folder
- Review implementation plan for feature details

## 🎯 Next Steps

1. Install dependencies: `npm run install:all`
2. Configure environment variables
3. Setup MongoDB and Firebase
4. Start development: `npm run dev`
5. Access frontend at http://localhost:3000
6. Access backend API at http://localhost:5000/api

---

**Version:** 1.0.0  
**Last Updated:** 2025-01-07
