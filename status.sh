#!/bin/bash

echo "🔍 Product Catalog Status Check"
echo "==============================="

# Check if backend is running
if curl -s http://localhost:8001/api/collections/products/entries >/dev/null 2>&1; then
    echo "✅ Backend API (port 8001): Running"
    PRODUCTS=$(curl -s http://localhost:8001/api/collections/products/entries | jq length 2>/dev/null || echo "unknown")
    echo "   📦 Products in API: $PRODUCTS"
else
    echo "❌ Backend API (port 8001): Not running"
fi

# Check if frontend is running
if curl -s http://localhost:8000 >/dev/null 2>&1; then
    echo "✅ Frontend (port 8000): Running"
else
    echo "❌ Frontend (port 8000): Not running"
fi

# Check product files
PRODUCT_FILES=$(ls _products/*.md 2>/dev/null | wc -l)
echo "📁 Product markdown files: $PRODUCT_FILES"

# Check generated JSON
if [ -f "_data/products.json" ]; then
    JSON_PRODUCTS=$(jq length _data/products.json 2>/dev/null || echo "error")
    echo "📄 Products in JSON: $JSON_PRODUCTS"
else
    echo "❌ products.json not found"
fi

echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://localhost:8000"
echo "   Admin Panel: http://localhost:8000/admin/"
echo "   Backend API: http://localhost:8001"
