#!/bin/bash

echo "🚀 Starting Product Catalog Development Environment"
echo "=================================================="

# Kill any existing processes
echo "Stopping any existing servers..."
pkill -f "python3 -m http.server" 2>/dev/null || true
pkill -f "node cms-backend" 2>/dev/null || true
sleep 2

# Build initial data
echo "Building product data..."
npm run build

# Start backend server
echo "Starting CMS backend on port 8001..."
node cms-backend.js &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend server
echo "Starting frontend server on port 8000..."
python3 -m http.server 8000 &
FRONTEND_PID=$!

echo ""
echo "✅ Development environment ready!"
echo "📱 Frontend: http://localhost:8000"
echo "⚙️  Admin Panel: http://localhost:8000/admin/"
echo "🔧 Backend API: http://localhost:8001"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to handle cleanup
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    pkill -f "python3 -m http.server" 2>/dev/null || true
    pkill -f "node cms-backend" 2>/dev/null || true
    echo "👋 Servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
