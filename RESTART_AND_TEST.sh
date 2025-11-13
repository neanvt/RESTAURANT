#!/bin/bash

# Restaurant POS - Complete Restart and Test Script
# This script stops servers, clears caches, and restarts everything fresh

echo "🔄 Restaurant POS - Complete Restart"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored messages
print_step() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Step 1: Clear frontend cache
echo "📦 Step 1: Clearing frontend cache..."
if [ -d "frontend/.next" ]; then
    rm -rf frontend/.next
    print_step "Cleared .next directory"
else
    print_warning ".next directory not found (already clean)"
fi

if [ -d "frontend/node_modules/.cache" ]; then
    rm -rf frontend/node_modules/.cache
    print_step "Cleared node_modules cache"
fi

echo ""

# Step 2: Check if servers are running
echo "🔍 Step 2: Checking for running servers..."

# Check backend (port 5005)
if lsof -Pi :5005 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_warning "Backend server is running on port 5005"
    echo "   Please stop it manually (Ctrl+C in backend terminal)"
else
    print_step "Port 5005 is available"
fi

# Check frontend (port 3000)
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_warning "Frontend server is running on port 3000"
    echo "   Please stop it manually (Ctrl+C in frontend terminal)"
else
    print_step "Port 3000 is available"
fi

echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1️⃣  Start Backend Server:"
echo "   ${YELLOW}cd backend && npm run dev${NC}"
echo ""
echo "2️⃣  Start Frontend Server (in new terminal):"
echo "   ${YELLOW}cd frontend && npm run dev${NC}"
echo ""
echo "3️⃣  Clear Browser Storage:"
echo "   Open DevTools (F12) → Console → Run:"
echo "   ${YELLOW}localStorage.clear(); sessionStorage.clear(); location.reload();${NC}"
echo ""
echo "4️⃣  Login Fresh:"
echo "   Navigate to: ${YELLOW}http://localhost:3000/login${NC}"
echo ""
echo "5️⃣  Test Authentication:"
echo "   After login, in console run: ${YELLOW}debugAuth()${NC}"
echo "   Should show: 🎫 accessToken: EXISTS"
echo ""
echo "6️⃣  Verify Dashboard:"
echo "   Dashboard at: ${YELLOW}http://localhost:3000/dashboard${NC}"
echo "   Should load without 401 errors"
echo ""
echo "═══════════════════════════════════════════════════════"
echo ""
print_step "Cleanup complete! Follow steps above to restart servers."
echo ""