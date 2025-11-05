# Future Enhancements TODO

## Content Extraction Feature (Sprint 3+)

### Overview
Implement automatic content extraction when users add articles via URL. This will auto-populate title, author, content, and reading time instead of requiring manual entry.

### Dependencies to Install
```bash
npm install @mozilla/readability jsdom axios
```

### Files to Update

#### 1. `routes/articles.js`
- Look for `POST /api/articles` route
- See detailed TODO comment in function
- Add extraction logic before creating article object

#### 2. `routes/extract.js`
- Complete endpoint for standalone extraction
- Replace mock logic with real Mozilla Readability implementation
- See detailed TODO comment at top of route

### Implementation Steps

1. **Install packages** (when ready to implement)
   ```bash
   cd back-end
   npm install @mozilla/readability jsdom axios
   ```

2. **Import libraries** in routes that need extraction:
   ```javascript
   const { Readability } = require('@mozilla/readability');
   const { JSDOM } = require('jsdom');
   const axios = require('axios');
   ```

3. **Add extraction function**:
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
