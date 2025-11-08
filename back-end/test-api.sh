#!/bin/bash
# Quick API test script
# Usage: bash test-api.sh

BASE_URL="http://localhost:7001/api"

echo "🧪 Testing Fieldnotes API..."
echo ""

# Test 1: Get all articles
echo "1️⃣ GET /api/articles"
curl -s $BASE_URL/articles | head -20
echo ""
echo ""

# Test 2: Get single article
echo "2️⃣ GET /api/articles/1"
curl -s $BASE_URL/articles/1
echo ""
echo ""

# Test 3: Filter by status
echo "3️⃣ GET /api/articles?status=inbox"
curl -s "$BASE_URL/articles?status=inbox" | head -20
echo ""
echo ""

# Test 4: Get all feeds
echo "4️⃣ GET /api/feeds"
curl -s $BASE_URL/feeds | head -20
echo ""
echo ""

# Test 5: Health check
echo "5️⃣ GET /health"
curl -s http://localhost:7001/health
echo ""
echo ""

echo "✅ Tests complete!"
