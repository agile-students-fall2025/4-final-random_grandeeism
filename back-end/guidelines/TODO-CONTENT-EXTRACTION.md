# Content Extraction Implementation Guide

## Status: Structure Complete ✅ (Sprint 2) | Real Extraction Pending (Sprint 3+)

### Overview
Content extraction allows users to save web articles by simply pasting a URL. The extraction logic is implemented in a reusable utility function that returns clean article data.

**Current State:** 
- ✅ Utility function created (`utils/contentExtractor.js`)
- ✅ Route updated to use utility (`routes/extract.js`)
- ✅ Error handling implemented
- ⏳ Real extraction disabled (returns mock data until dependencies installed)

### Implementation Architecture
The content extraction uses a **utility function** pattern:
- **Route** (`routes/extract.js`): Handles HTTP requests, validation, error responses
- **Utility** (`utils/contentExtractor.js`): Contains extraction logic, reusable across the app
- **Separation of concerns**: Business logic separated from route handling

### Dependencies to Install (Sprint 3+)
```bash
cd back-end
npm install @mozilla/readability jsdom axios
```

### Files Already Updated

#### ✅ `utils/contentExtractor.js` (NEW)
- Contains `extractContent(url)` function
- Handles fetching, parsing, and extracting article data
- Returns consistent data structure
- Has mock mode (current) and real mode (commented out)

#### ✅ `routes/extract.js` (UPDATED)
- Uses `extractContent()` from utility
- Validates URL format
- Handles errors properly
- Clean, simple route handler

### Enabling Real Content Extraction (Sprint 3+)

**To activate real extraction (only 2 steps!):**

1. **Install dependencies:**
   ```bash
   cd back-end
   npm install @mozilla/readability jsdom axios
   ```

2. **Uncomment code in `utils/contentExtractor.js`:**
   - Find the `extractContent()` function
   - Uncomment the real implementation (lines with `/*` and `*/`)
   - Comment out or remove the mock data section
   
   That's it! The extraction will work immediately.

### How It Works (Technical Details)

The extraction process:
   ```javascript
   async function extractContentFromUrl(url) {
     try {
       // Fetch webpage
       const response = await axios.get(url, {
         headers: { 'User-Agent': 'Mozilla/5.0' },
         timeout: 10000
       });
       
       // Parse with JSDOM
       const dom = new JSDOM(response.data, { url });
       
       // Extract with Readability
       const reader = new Readability(dom.window.document);
       const article = reader.parse();
       
       if (!article) {
         throw new Error('Could not extract content');
       }
       
       // Calculate reading time
       const wordsPerMinute = 200;
       const wordCount = article.textContent.split(/\s+/).length;
       const readingTime = Math.ceil(wordCount / wordsPerMinute);
       
       return {
         title: article.title,
         content: article.textContent,
         excerpt: article.excerpt,
         author: article.byline || 'Unknown',
         readingTime: `${readingTime} min`,
         source: new URL(url).hostname.replace('www.', '')
       };
     } catch (error) {
       console.error('Extraction failed:', error.message);
       return null;
     }
   }
   ```

4. **Use in POST /api/articles**:
   ```javascript
   router.post('/', async (req, res) => {
     try {
       // If URL provided but no title, try extraction
       if (req.body.url && !req.body.title) {
         const extracted = await extractContentFromUrl(req.body.url);
         if (extracted) {
           // Merge extracted data with user-provided data
           req.body = { ...extracted, ...req.body };
         }
       }
       
       // Continue with article creation...
     }
   });
   ```

5. **Update front-end AddLinkModal** to:
   - Call `/api/extract` when user pastes URL
   - Show loading state during extraction
   - Pre-fill form with extracted data
   - Allow user to edit before saving
   - Have fallback to manual entry if extraction fails

### Error Handling

Content extraction can fail for various reasons:
- ❌ Paywall/login-required sites
- ❌ Sites that block scrapers (403/401 errors)
- ❌ JavaScript-heavy single-page apps
- ❌ Network timeouts
- ❌ Invalid URLs

**Always provide fallback to manual entry!**

### Testing

```bash
# Test extraction endpoint
curl -X POST http://localhost:7001/api/extract \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/article"}'

# Test article creation with extraction
curl -X POST http://localhost:7001/api/articles \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/article"}'
```

### Performance Considerations

- Extraction can take 2-10 seconds depending on page size
- Show loading indicator in UI
- Consider adding timeout (10s recommended)
- Cache extracted content if same URL requested multiple times
- Run extraction in background if possible

### Alternative Approach (Future)

If Mozilla Readability doesn't work well, consider:
- **Paid APIs**: Mercury Parser, Diffbot, Extract API
- **Browser automation**: Puppeteer (heavier but more reliable)
- **RSS feeds**: If article has RSS, use that instead

### Priority

⏳ **Low Priority** - Implement after:
1. ✅ All routes completed
2. ✅ Tests written (10%+ coverage)
3. ✅ Front-end integrated with back-end
4. ✅ Core functionality working end-to-end

This is a "nice-to-have" enhancement, not a sprint requirement.

### References

- [Mozilla Readability GitHub](https://github.com/mozilla/readability)
- [JSDOM Documentation](https://github.com/jsdom/jsdom)
- See code comments in `routes/articles.js` and `routes/extract.js`
