/*
 * Data Integrity Verification Script
 * Run: node scripts/verifyIntegrity.js
 * Purpose: Ensures uniqueness of IDs and referential integrity across mock data.
 */

const { mockUsers } = require('../data/mockUsers');
const { mockFeeds } = require('../data/mockFeeds');
const { mockArticles } = require('../data/mockArticles');
const { mockTags } = require('../data/mockTags');
const { mockHighlights } = require('../data/mockHighlights');

function auditUniqueness(label, items, idSelector = i => i.id) {
  const seen = new Map();
  const duplicates = [];
  for (const item of items) {
    const id = idSelector(item);
    seen.set(id, (seen.get(id) || 0) + 1);
    if (seen.get(id) === 2) duplicates.push(id);
  }
  return { label, total: items.length, duplicates };
}

function verifyReferentialIntegrity() {
  const userIds = new Set(mockUsers.map(u => u.id));
  const feedIssues = mockFeeds.filter(f => !userIds.has(f.userId));

  const articleUserIssues = mockArticles.filter(a => !userIds.has(a.userId));
  const articleTagIds = new Set(mockTags.map(t => t.id));
  const articleTagIssues = [];
  for (const a of mockArticles) {
    for (const tagId of (a.tags || [])) {
      if (!articleTagIds.has(tagId)) articleTagIssues.push({ articleId: a.id, missingTagId: tagId });
    }
  }

  const highlightArticleIds = new Set(mockArticles.map(a => a.id));
  const highlightIssues = mockHighlights.filter(h => !userIds.has(h.userId) || !highlightArticleIds.has(h.articleId));

  return {
    feedsMissingUsers: feedIssues,
    articlesMissingUsers: articleUserIssues,
    articlesMissingTags: articleTagIssues,
    highlightsMissingRefs: highlightIssues
  };
}

function recomputeTagCounts() {
  const counts = new Map();
  for (const a of mockArticles) {
    for (const tagId of (a.tags || [])) {
      counts.set(tagId, (counts.get(tagId) || 0) + 1);
    }
  }
  return mockTags.map(t => ({ id: t.id, name: t.name, stored: t.articleCount, actual: counts.get(t.id) || 0 }));
}

function main() {
  console.log('\n=== Uniqueness Audit ===');
  const audits = [
    auditUniqueness('Users', mockUsers),
    auditUniqueness('Feeds', mockFeeds),
    auditUniqueness('Articles', mockArticles),
    auditUniqueness('Tags', mockTags),
    auditUniqueness('Highlights', mockHighlights)
  ];
  for (const a of audits) {
    console.log(`${a.label}: total=${a.total} duplicates=${a.duplicates.length ? a.duplicates.join(',') : 'None'}`);
  }

  console.log('\n=== Referential Integrity ===');
  const refs = verifyReferentialIntegrity();
  console.log(`Feeds with missing users: ${refs.feedsMissingUsers.length}`);
  console.log(`Articles with missing users: ${refs.articlesMissingUsers.length}`);
  console.log(`Article tag reference issues: ${refs.articlesMissingTags.length}`);
  console.log(`Highlights with missing refs: ${refs.highlightsMissingRefs.length}`);

  if (refs.articlesMissingTags.length) {
    console.table(refs.articlesMissingTags.slice(0, 10));
  }

  console.log('\n=== Tag Count Validation (stored vs actual) ===');
  const tagCounts = recomputeTagCounts();
  const mismatches = tagCounts.filter(t => t.stored !== t.actual);
  console.log(`Tags with mismatched articleCount: ${mismatches.length}`);
  if (mismatches.length) console.table(mismatches.slice(0, 15));

  // === Highlight Integrity Validation ===
  console.log('\n=== Highlight Text & Position Integrity ===');
  const { validateHighlightIntegrity } = require('./validateHighlightsIntegrity');
  try {
    validateHighlightIntegrity();
  } catch (e) {
    console.error('Highlight integrity validation failed:', e);
    process.exit(1);
  }

  // Determine overall integrity status BEFORE attempting any refresh.
  const duplicateProblems = audits.some(a => a.duplicates.length > 0);
  const referentialProblems = refs.feedsMissingUsers.length || refs.articlesMissingUsers.length || refs.articlesMissingTags.length || refs.highlightsMissingRefs.length;
  const tagCountProblems = mismatches.length > 0;

  const overallOk = !duplicateProblems && !referentialProblems && !tagCountProblems; // highlight failures already exited.

  if (!overallOk) {
    console.log('\n⚠️ Integrity issues detected. Refresh & parity verification skipped.');
    console.log(' - Duplicates present:', duplicateProblems);
    console.log(' - Referential issues present:', !!referentialProblems);
    console.log(' - Tag count mismatches present:', !!tagCountProblems);
    console.log('\nResolve the above issues, then re-run this script.');
    console.log('\nIntegrity check complete (FAILED).');
    return; // Do not refresh.
  }

  console.log('\n✅ All integrity checks passed. Proceeding to refresh data seeds...');
  // Perform refresh from baseData to data
  try {
    const { main: refreshMain } = require('./refreshDataFromBase');
    refreshMain();
  } catch (e) {
    console.error('❌ Refresh failed:', e);
    process.exit(1);
  }

  // After refresh, verify parity
  console.log('\n🔍 Verifying parity after refresh...');
  try {
    const { compareFiles } = require('./verifyDataParity');
    const parityFiles = [ 'mockArticles.js', 'mockFeeds.js', 'mockTags.js', 'mockUsers.js', 'mockHighlights.js' ];
    let allMatch = true;
    for (const file of parityFiles) {
      const result = compareFiles(file);
      if (result.match) {
        console.log(`  ✅ ${file} parity OK`);
      } else {
        allMatch = false;
        console.log(`  ❌ ${file} parity MISMATCH: ${result.reason}`);
      }
    }
    if (!allMatch) {
      console.error('\n❌ Post-refresh parity verification failed. Investigate discrepancies.');
      process.exit(1);
    }
  } catch (e) {
    console.error('❌ Parity verification script failed:', e);
    process.exit(1);
  }

  console.log('\n🎉 Integrity, refresh, and parity verification all succeeded.');
  console.log('\nIntegrity check complete (PASSED).');
}

// Run when executed directly
if (require.main === module) {
  main();
}

module.exports = { auditUniqueness, verifyReferentialIntegrity, recomputeTagCounts };

module.exports = { auditUniqueness, verifyReferentialIntegrity, recomputeTagCounts };
