#!/bin/bash

# Authentication Flow Testing Script
# Tests JWT authentication, protected routes, and data isolation

BASE_URL="http://localhost:7001"
echo "🧪 Testing Fieldnotes Authentication Flow"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Register User A
echo "📝 Test 1: Register User A"
echo "-------------------------"
RESPONSE_A=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser_a",
    "email": "usera@test.com",
    "password": "password123",
    "displayName": "Test User A"
  }')

TOKEN_A=$(echo $RESPONSE_A | grep -o '"token":"[^"]*' | cut -d'"' -f4)
USER_A_ID=$(echo $RESPONSE_A | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN_A" ]; then
  echo -e "${GREEN}✅ User A registered successfully${NC}"
  echo "   User ID: $USER_A_ID"
  echo "   Token: ${TOKEN_A:0:50}..."
else
  echo -e "${RED}❌ Failed to register User A${NC}"
  echo "   Response: $RESPONSE_A"
fi
echo ""

# Test 2: Register User B
echo "📝 Test 2: Register User B"
echo "-------------------------"
RESPONSE_B=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser_b",
    "email": "userb@test.com",
    "password": "password456",
    "displayName": "Test User B"
  }')

TOKEN_B=$(echo $RESPONSE_B | grep -o '"token":"[^"]*' | cut -d'"' -f4)
USER_B_ID=$(echo $RESPONSE_B | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN_B" ]; then
  echo -e "${GREEN}✅ User B registered successfully${NC}"
  echo "   User ID: $USER_B_ID"
  echo "   Token: ${TOKEN_B:0:50}..."
else
  echo -e "${RED}❌ Failed to register User B${NC}"
  echo "   Response: $RESPONSE_B"
fi
echo ""

# Test 3: Login User A
echo "📝 Test 3: Login User A"
echo "----------------------"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser_a",
    "password": "password123"
  }')

LOGIN_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$LOGIN_TOKEN" ]; then
  echo -e "${GREEN}✅ User A logged in successfully${NC}"
  echo "   Token matches: $([ "$LOGIN_TOKEN" != "$TOKEN_A" ] && echo 'New token issued' || echo 'Same token')"
else
  echo -e "${RED}❌ Login failed${NC}"
  echo "   Response: $LOGIN_RESPONSE"
fi
echo ""

# Test 4: Verify Token
echo "📝 Test 4: Verify JWT Token"
echo "--------------------------"
VERIFY_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/verify" \
  -H "Authorization: Bearer $TOKEN_A")

if echo $VERIFY_RESPONSE | grep -q '"valid":true'; then
  echo -e "${GREEN}✅ Token verified successfully${NC}"
else
  echo -e "${RED}❌ Token verification failed${NC}"
  echo "   Response: $VERIFY_RESPONSE"
fi
echo ""

# Test 5: Access protected route WITHOUT token (should fail)
echo "📝 Test 5: Access Protected Route WITHOUT Token"
echo "----------------------------------------------"
NO_TOKEN_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET "$BASE_URL/api/articles")
HTTP_CODE=$(echo "$NO_TOKEN_RESPONSE" | grep "HTTP_CODE" | cut -d':' -f2)

if [ "$HTTP_CODE" = "401" ]; then
  echo -e "${GREEN}✅ Correctly rejected (401 Unauthorized)${NC}"
else
  echo -e "${RED}❌ Should have returned 401, got: $HTTP_CODE${NC}"
fi
echo ""

# Test 6: Access protected route WITH invalid token (should fail)
echo "📝 Test 6: Access Protected Route WITH Invalid Token"
echo "---------------------------------------------------"
INVALID_TOKEN_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET "$BASE_URL/api/articles" \
  -H "Authorization: Bearer invalid.token.here")
HTTP_CODE=$(echo "$INVALID_TOKEN_RESPONSE" | grep "HTTP_CODE" | cut -d':' -f2)

if [ "$HTTP_CODE" = "403" ]; then
  echo -e "${GREEN}✅ Correctly rejected (403 Forbidden)${NC}"
else
  echo -e "${RED}❌ Should have returned 403, got: $HTTP_CODE${NC}"
fi
echo ""

# Test 7: Create article for User A
echo "📝 Test 7: User A Creates Article"
echo "--------------------------------"
ARTICLE_A=$(curl -s -X POST "$BASE_URL/api/articles" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "User A Article",
    "url": "https://example.com/article-a",
    "status": "inbox"
  }')

ARTICLE_A_ID=$(echo $ARTICLE_A | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -n "$ARTICLE_A_ID" ]; then
  echo -e "${GREEN}✅ Article created for User A${NC}"
  echo "   Article ID: $ARTICLE_A_ID"
else
  echo -e "${RED}❌ Failed to create article${NC}"
  echo "   Response: $ARTICLE_A"
fi
echo ""

# Test 8: Create article for User B
echo "📝 Test 8: User B Creates Article"
echo "--------------------------------"
ARTICLE_B=$(curl -s -X POST "$BASE_URL/api/articles" \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "User B Article",
    "url": "https://example.com/article-b",
    "status": "inbox"
  }')

ARTICLE_B_ID=$(echo $ARTICLE_B | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -n "$ARTICLE_B_ID" ]; then
  echo -e "${GREEN}✅ Article created for User B${NC}"
  echo "   Article ID: $ARTICLE_B_ID"
else
  echo -e "${RED}❌ Failed to create article${NC}"
  echo "   Response: $ARTICLE_B"
fi
echo ""

# Test 9: User A gets articles (should only see their own)
echo "📝 Test 9: Data Isolation - User A Gets Articles"
echo "-----------------------------------------------"
USER_A_ARTICLES=$(curl -s -X GET "$BASE_URL/api/articles" \
  -H "Authorization: Bearer $TOKEN_A")

ARTICLE_COUNT=$(echo $USER_A_ARTICLES | grep -o '"count":[0-9]*' | cut -d':' -f2)

if echo $USER_A_ARTICLES | grep -q "User A Article"; then
  if echo $USER_A_ARTICLES | grep -q "User B Article"; then
    echo -e "${RED}❌ User A can see User B's articles (SECURITY ISSUE)${NC}"
  else
    echo -e "${GREEN}✅ User A only sees their own articles${NC}"
    echo "   Article count: $ARTICLE_COUNT"
  fi
else
  echo -e "${YELLOW}⚠️  User A's article not found${NC}"
fi
echo ""

# Test 10: User B gets articles (should only see their own)
echo "📝 Test 10: Data Isolation - User B Gets Articles"
echo "------------------------------------------------"
USER_B_ARTICLES=$(curl -s -X GET "$BASE_URL/api/articles" \
  -H "Authorization: Bearer $TOKEN_B")

ARTICLE_COUNT=$(echo $USER_B_ARTICLES | grep -o '"count":[0-9]*' | cut -d':' -f2)

if echo $USER_B_ARTICLES | grep -q "User B Article"; then
  if echo $USER_B_ARTICLES | grep -q "User A Article"; then
    echo -e "${RED}❌ User B can see User A's articles (SECURITY ISSUE)${NC}"
  else
    echo -e "${GREEN}✅ User B only sees their own articles${NC}"
    echo "   Article count: $ARTICLE_COUNT"
  fi
else
  echo -e "${YELLOW}⚠️  User B's article not found${NC}"
fi
echo ""

# Test 11: User A tries to access User B's article (should fail)
echo "📝 Test 11: Cross-User Access - User A Tries to Access User B's Article"
echo "----------------------------------------------------------------------"
CROSS_ACCESS=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET "$BASE_URL/api/articles/$ARTICLE_B_ID" \
  -H "Authorization: Bearer $TOKEN_A")
HTTP_CODE=$(echo "$CROSS_ACCESS" | grep "HTTP_CODE" | cut -d':' -f2)

if [ "$HTTP_CODE" = "403" ]; then
  echo -e "${GREEN}✅ Access correctly denied (403 Forbidden)${NC}"
elif [ "$HTTP_CODE" = "404" ]; then
  echo -e "${GREEN}✅ Article not found (404) - acceptable${NC}"
else
  echo -e "${RED}❌ Should have been denied, got: $HTTP_CODE${NC}"
fi
echo ""

# Test 12: User A tries to update User B's article (should fail)
echo "📝 Test 12: Cross-User Modification - User A Tries to Update User B's Article"
echo "---------------------------------------------------------------------------"
UPDATE_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X PUT "$BASE_URL/api/articles/$ARTICLE_B_ID" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"title": "Hacked!"}')
HTTP_CODE=$(echo "$UPDATE_RESPONSE" | grep "HTTP_CODE" | cut -d':' -f2)

if [ "$HTTP_CODE" = "403" ]; then
  echo -e "${GREEN}✅ Update correctly denied (403 Forbidden)${NC}"
elif [ "$HTTP_CODE" = "404" ]; then
  echo -e "${GREEN}✅ Article not found (404) - acceptable${NC}"
else
  echo -e "${RED}❌ Should have been denied, got: $HTTP_CODE${NC}"
fi
echo ""

# Test 13: Create tag for User A
echo "📝 Test 13: User A Creates Tag"
echo "-----------------------------"
TAG_A=$(curl -s -X POST "$BASE_URL/api/tags" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"name": "user-a-tag", "color": "#FF5733"}')

TAG_A_ID=$(echo $TAG_A | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -n "$TAG_A_ID" ]; then
  echo -e "${GREEN}✅ Tag created for User A${NC}"
  echo "   Tag ID: $TAG_A_ID"
else
  echo -e "${RED}❌ Failed to create tag${NC}"
fi
echo ""

# Test 14: User B tries to access User A's tag (should fail)
echo "📝 Test 14: Cross-User Tag Access"
echo "--------------------------------"
TAG_ACCESS=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET "$BASE_URL/api/tags/$TAG_A_ID" \
  -H "Authorization: Bearer $TOKEN_B")
HTTP_CODE=$(echo "$TAG_ACCESS" | grep "HTTP_CODE" | cut -d':' -f2)

if [ "$HTTP_CODE" = "403" ] || [ "$HTTP_CODE" = "404" ]; then
  echo -e "${GREEN}✅ Cross-user tag access denied${NC}"
else
  echo -e "${RED}❌ Should have been denied, got: $HTTP_CODE${NC}"
fi
echo ""

# Test 15: Input validation
echo "📝 Test 15: Input Validation"
echo "---------------------------"
INVALID_EMAIL=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "email": "not-an-email", "password": "pass123"}')
HTTP_CODE=$(echo "$INVALID_EMAIL" | grep "HTTP_CODE" | cut -d':' -f2)

if [ "$HTTP_CODE" = "400" ]; then
  echo -e "${GREEN}✅ Invalid email rejected (400 Bad Request)${NC}"
else
  echo -e "${RED}❌ Should have rejected invalid email, got: $HTTP_CODE${NC}"
fi
echo ""

# Summary
echo "=========================================="
echo "🏁 Test Suite Complete"
echo "=========================================="
echo ""
echo "Summary:"
echo "- Authentication: Register, Login, Token Verification"
echo "- Authorization: Token required for protected routes"
echo "- Data Isolation: Users can only access their own data"
echo "- Cross-User Protection: Cannot access/modify other users' data"
echo "- Input Validation: Invalid data rejected with 400"
echo ""
echo "Check the results above for any ❌ failures"
