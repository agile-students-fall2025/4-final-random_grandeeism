#!/bin/bash

# Test script to verify tag deletion removes tags from articles

BASE_URL="http://localhost:7001/api"

echo "🧪 Testing tag deletion with article cleanup..."
echo ""

# Get all tags
echo "1️⃣ Fetching tags..."
TAGS=$(curl -s "$BASE_URL/tags")
echo "   Tags fetched"
echo ""

# Get all articles
echo "2️⃣ Fetching articles..."
ARTICLES=$(curl -s "$BASE_URL/articles")
echo "   Articles fetched"
echo ""

# Find a tag that's used (let's try tag "1" which is commonly used)
TAG_ID="1"
echo "3️⃣ Testing with tag ID: $TAG_ID"
echo ""

# Get articles with this tag before deletion
echo "4️⃣ Checking articles with tag $TAG_ID before deletion..."
BEFORE=$(curl -s "$BASE_URL/articles?tag=$TAG_ID")
echo "$BEFORE" | grep -o '"id"' | wc -l | xargs echo "   Found articles with this tag:"
echo ""

# Delete the tag
echo "5️⃣ Deleting tag $TAG_ID..."
DELETE_RESULT=$(curl -s -X DELETE "$BASE_URL/tags/$TAG_ID")
echo "   Delete response: $DELETE_RESULT"
echo ""

# Check if articles still have the tag
echo "6️⃣ Verifying articles no longer have the deleted tag..."
AFTER=$(curl -s "$BASE_URL/articles")

# Check if any article still references the deleted tag
if echo "$AFTER" | grep -q "\"$TAG_ID\""; then
    echo "   ❌ FAILED: Some articles still have references to the deleted tag!"
    echo ""
    echo "   Articles with tag $TAG_ID:"
    echo "$AFTER" | grep -B2 -A2 "\"$TAG_ID\""
else
    echo "   ✅ SUCCESS: No articles have references to the deleted tag!"
fi

echo ""
echo "🎉 Test complete!"
