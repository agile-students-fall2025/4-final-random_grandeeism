#!/bin/bash

# Comprehensive Tag Deletion Testing Suite
# Tests tag deletion functionality from multiple angles

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     COMPREHENSIVE TAG DELETION TEST SUITE                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Store initial timestamps
TAGS_BEFORE=$(stat -f '%Sm' data/mockTags.js)
ARTICLES_BEFORE=$(stat -f '%Sm' data/mockArticles.js)

echo "📋 Initial File Timestamps:"
echo "   mockTags.js:     $TAGS_BEFORE"
echo "   mockArticles.js: $ARTICLES_BEFORE"
echo ""

# Test 1: New tag deletion
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: New Tag Deletion (DAO Level)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
node test-tag-deletion-verification.js
TEST1=$?
echo ""

# Test 2: Existing tag deletion
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: Existing Mock Tag Deletion (DAO Level)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
node test-existing-tag-deletion.js
TEST2=$?
echo ""

# Test 3: API integration
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 3: Tag Deletion via API (Integration)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
node test-api-tag-deletion.js
TEST3=$?
echo ""

# Check file timestamps
TAGS_AFTER=$(stat -f '%Sm' data/mockTags.js)
ARTICLES_AFTER=$(stat -f '%Sm' data/mockArticles.js)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 4: Data Persistence Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Final File Timestamps:"
echo "   mockTags.js:     $TAGS_AFTER"
echo "   mockArticles.js: $ARTICLES_AFTER"
echo ""

TEST4=0
if [ "$TAGS_BEFORE" = "$TAGS_AFTER" ] && [ "$ARTICLES_BEFORE" = "$ARTICLES_AFTER" ]; then
    echo "✅ PASS: No data files modified during testing"
else
    echo "❌ FAIL: Data files were modified"
    TEST4=1
fi
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                      TEST SUMMARY                              ║"
echo "╠════════════════════════════════════════════════════════════════╣"

if [ $TEST1 -eq 0 ]; then
    echo "║ ✅ Test 1: New Tag Deletion (DAO).................... PASSED ║"
else
    echo "║ ❌ Test 1: New Tag Deletion (DAO).................... FAILED ║"
fi

if [ $TEST2 -eq 0 ]; then
    echo "║ ✅ Test 2: Existing Tag Deletion (DAO)............... PASSED ║"
else
    echo "║ ❌ Test 2: Existing Tag Deletion (DAO)............... FAILED ║"
fi

if [ $TEST3 -eq 0 ]; then
    echo "║ ✅ Test 3: Tag Deletion via API (Integration)........ PASSED ║"
else
    echo "║ ❌ Test 3: Tag Deletion via API (Integration)........ FAILED ║"
fi

if [ $TEST4 -eq 0 ]; then
    echo "║ ✅ Test 4: Data Persistence Check.................... PASSED ║"
else
    echo "║ ❌ Test 4: Data Persistence Check.................... FAILED ║"
fi

echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Exit with failure if any test failed
if [ $TEST1 -ne 0 ] || [ $TEST2 -ne 0 ] || [ $TEST3 -ne 0 ] || [ $TEST4 -ne 0 ]; then
    echo "❌ SOME TESTS FAILED"
    exit 1
else
    echo "🎉 ALL TESTS PASSED!"
    exit 0
fi
