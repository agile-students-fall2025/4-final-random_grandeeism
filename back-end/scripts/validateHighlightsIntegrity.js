const { mockHighlights } = require('../baseData/mockHighlights');
const { mockArticles } = require('../baseData/mockArticles');

function validateHighlightIntegrity() {
  let allValid = true;
  for (const h of mockHighlights) {
    const article = mockArticles.find(a => a.id === h.articleId);
    if (!article) {
      console.error(`Highlight ${h.id}: Article ${h.articleId} not found.`);
      allValid = false;
      continue;
    }
    const content = article.content || '';
    const { start, end } = h.position;
    if (typeof start !== 'number' || typeof end !== 'number' || start < 0 || end > content.length || start > end) {
      console.error(`Highlight ${h.id}: Invalid position [${start}, ${end}] for article ${h.articleId} (content length ${content.length}).`);
      allValid = false;
      continue;
    }
    const expectedText = content.substring(start, end);
    if (h.text !== expectedText) {
      console.error(`Highlight ${h.id}: Text mismatch. Expected "${expectedText}", got "${h.text}".`);
      allValid = false;
    }
  }
  if (allValid) {
    console.log('All highlights are valid.');
  } else {
    process.exit(1);
  }
}

if (require.main === module) {
  validateHighlightIntegrity();
}

module.exports = { validateHighlightIntegrity };