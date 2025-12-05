const { mockHighlights } = require('../data/mockHighlights');
const { mockArticles } = require('../baseData/mockArticles');

function validateHighlightIntegrity() {
  let allValid = true;
  
  console.log('=== Validating Highlight Positions ===');
  for (const h of mockHighlights) {
    const article = mockArticles.find(a => a.id === h.articleId);
    if (!article) {
      console.error(`❌ Highlight ${h.id}: Article ${h.articleId} not found.`);
      allValid = false;
      continue;
    }
    const content = article.content || '';
    const { start, end } = h.position;
    if (typeof start !== 'number' || typeof end !== 'number' || start < 0 || end > content.length || start > end) {
      console.error(`❌ Highlight ${h.id}: Invalid position [${start}, ${end}] for article ${h.articleId} (content length ${content.length}).`);
      allValid = false;
      continue;
    }
    const expectedText = content.substring(start, end);
    if (h.text !== expectedText) {
      console.error(`❌ Highlight ${h.id}: Text mismatch. Expected "${expectedText}", got "${h.text}".`);
      allValid = false;
    }
  }
  
  if (allValid) {
    console.log('✅ All highlight positions are valid.');
  }
  
  console.log('\n=== Validating hasAnnotations Attributes ===');
  
  // Build a map of articleId -> count of highlights
  const highlightCounts = {};
  for (const h of mockHighlights) {
    highlightCounts[h.articleId] = (highlightCounts[h.articleId] || 0) + 1;
  }
  
  // Check each article's hasAnnotations attribute
  for (const article of mockArticles) {
    const actualHighlightCount = highlightCounts[article.id] || 0;
    const shouldHaveAnnotations = actualHighlightCount > 0;
    const hasAnnotationsValue = article.hasAnnotations;
    
    if (shouldHaveAnnotations && !hasAnnotationsValue) {
      console.error(`❌ Article ${article.id} ("${article.title}"): Has ${actualHighlightCount} highlight(s) but hasAnnotations is ${hasAnnotationsValue}`);
      allValid = false;
    } else if (!shouldHaveAnnotations && hasAnnotationsValue) {
      console.error(`❌ Article ${article.id} ("${article.title}"): Has no highlights but hasAnnotations is ${hasAnnotationsValue}`);
      allValid = false;
    }
  }
  
  if (allValid) {
    console.log('✅ All articles have correct hasAnnotations attributes.');
    console.log('\n✅ All validations passed!');
  } else {
    console.error('\n❌ Validation failed. Please fix the issues above.');
    process.exit(1);
  }
}

if (require.main === module) {
  validateHighlightIntegrity();
}

module.exports = { validateHighlightIntegrity };