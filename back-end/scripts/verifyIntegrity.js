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

  console.log('\nIntegrity check complete.');
}

if (require.main === module) {
  main();
}

module.exports = { auditUniqueness, verifyReferentialIntegrity, recomputeTagCounts };
