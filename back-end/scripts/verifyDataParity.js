/**
 * Verify that baseData/ and data/ contain the same content
 * (ignoring header comments and formatting differences)
 */

const fs = require('fs');
const path = require('path');

function normalizeData(obj) {
  // Convert Date objects to ISO strings for comparison
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  if (Array.isArray(obj)) {
    return obj.map(normalizeData);
  }
  if (obj && typeof obj === 'object') {
    const normalized = {};
    for (const key of Object.keys(obj).sort()) {
      normalized[key] = normalizeData(obj[key]);
    }
    return normalized;
  }
  return obj;
}

function compareFiles(filename) {
  const basePath = path.join(__dirname, '..', 'baseData', filename);
  const dataPath = path.join(__dirname, '..', 'data', filename);

  // Clear require cache to get fresh data
  delete require.cache[require.resolve(basePath)];
  delete require.cache[require.resolve(dataPath)];

  const baseData = require(basePath);
  const dataData = require(dataPath);

  // Get the exported array (e.g., mockArticles, mockTags, etc.)
  const baseKey = Object.keys(baseData)[0];
  const dataKey = Object.keys(dataData)[0];

  if (baseKey !== dataKey) {
    return { match: false, reason: `Export key mismatch: ${baseKey} vs ${dataKey}` };
  }

  const baseArray = normalizeData(baseData[baseKey]);
  const dataArray = normalizeData(dataData[dataKey]);

  // Compare lengths
  if (baseArray.length !== dataArray.length) {
    return { 
      match: false, 
      reason: `Length mismatch: baseData=${baseArray.length}, data=${dataArray.length}` 
    };
  }

  // Deep comparison
  const baseStr = JSON.stringify(baseArray, null, 2);
  const dataStr = JSON.stringify(dataArray, null, 2);

  if (baseStr !== dataStr) {
    // Find first difference
    const baseLines = baseStr.split('\n');
    const dataLines = dataStr.split('\n');
    for (let i = 0; i < Math.min(baseLines.length, dataLines.length); i++) {
      if (baseLines[i] !== dataLines[i]) {
        return {
          match: false,
          reason: `Content differs at line ${i + 1}:\nbaseData: ${baseLines[i]}\ndata:     ${dataLines[i]}`
        };
      }
    }
    return { match: false, reason: 'Content differs' };
  }

  return { match: true };
}

function main() {
  console.log('🔍 Verifying baseData/ and data/ parity...\n');

  const files = [
    'mockArticles.js',
    'mockFeeds.js',
    'mockTags.js',
    'mockUsers.js',
    'mockHighlights.js'
  ];

  let allMatch = true;

  for (const file of files) {
    const result = compareFiles(file);
    if (result.match) {
      console.log(`✅ ${file.padEnd(20)} - Content matches`);
    } else {
      console.log(`❌ ${file.padEnd(20)} - MISMATCH`);
      console.log(`   ${result.reason}\n`);
      allMatch = false;
    }
  }

  console.log('\n' + '='.repeat(60));
  if (allMatch) {
    console.log('✅ All files match! baseData/ and data/ are consistent.');
    process.exit(0);
  } else {
    console.log('❌ Mismatches found. Please sync baseData/ and data/.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { compareFiles, normalizeData };
