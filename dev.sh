#!/bin/bash

# Development Environment Setup Script

echo "🛠️ Setting up development environment..."

# Switch to development configuration
echo "📝 Switching to development configuration..."
cp config.dev.yml config.yml
cp config.dev.yml admin/config.yml

echo "✅ Development configuration applied"
echo ""
echo "🚀 Starting development servers..."

# Start the CMS proxy server in the background
echo "📡 Starting CMS proxy server on port 8081..."
node cms-proxy.js &
CMS_PID=$!

# Wait a moment for the proxy to start
sleep 2

# Start the main server
echo "🌐 Starting main server on port 8000..."
node server.js &
SERVER_PID=$!

echo ""
echo "✅ Development environment is ready!"
echo ""
echo "🔗 Access your site:"
echo "  - Main site: http://localhost:8000"
echo "  - Admin: http://localhost:8000/admin"
echo "  - CMS Proxy: http://localhost:8081"
echo ""
echo "🛑 To stop servers, press Ctrl+C or run:"
echo "  pkill -f 'node server.js'"
echo "  pkill -f 'node cms-proxy.js'"

# Wait for user to stop
wait $SERVER_PID $CMS_PID
