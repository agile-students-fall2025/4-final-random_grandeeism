# Back-end API Contract (minimal)

This document defines the minimal HTTP API contract the front-end and other services should rely on while the back-end implementation (mock or persistent) evolves.

Guiding principles
- Keep responses consistent: { success: boolean, data?: any, error?: string, message?: string }
- Use appropriate HTTP status codes (200/201/202/400/401/404/409/408/500)
- Keep the `data` shape stable for front-end consumption
- API is versioned by path if breaking changes are required (e.g., `/api/v1/...`)

Base URL
- All endpoints are mounted under `/api`

Contents
- Articles
- Feeds
- Tags
- Users
- Highlights
- Auth
- Extract

---

## Data shapes (canonical)

Article
```
{
  id: string,
  title: string,
  url: string,
  canonicalUrl?: string,
  content?: string,       // sanitized HTML when available
  text?: string,          // plain-text content or excerpt
  excerpt?: string,
  author?: string,
  leadImage?: string,
  feedId?: string,
  tags?: string[],
  status?: string,        // inbox|archive|reading|... 
  isFavorite?: boolean,
  readProgress?: number,  // 0-100
  publishedAt?: string,   // ISO timestamp
  createdAt?: string,
  updatedAt?: string
}
```

Feed
```
{
  id: string,
  name: string,
  url: string,
  category?: string,
  status?: string,
  lastFetched?: string,
  createdAt?: string
}
```

Tag
```
{ id: string, name: string, color?: string, articleCount?: number }
```

User (public view)
```
{ id: string, username: string, displayName?: string, avatar?: string, preferences?: object }
```

Highlight
```
{ id: string, articleId: string, userId: string, text: string, annotations?: { title?: string, note?: string } , color?: string, position?: { start: number, end: number } }
```

---

## Standard response examples

Success (200)
```
{ "success": true, "data": ... }
```

Created (201)
```
{ "success": true, "data": ..., "message": "Created" }
```

Error (example)
```
{ "success": false, "error": "Invalid URL" }
```

---

## Endpoints

Note: examples show the intended path and minimal request/response shapes. Fill optional fields as available.

### Articles

- GET /api/articles
  - Query params: status, tag, favorite=true, untagged=true, page, limit
  - Response 200: { success: true, count: number, data: Article[] }

- GET /api/articles/:id
  - Response 200: { success: true, data: Article }
  - 404 when not found

- POST /api/articles
  - Body: { url: string, title?: string, tags?: string[], status?: string }
  - Response 201: { success: true, data: Article }
  - 400 for validation errors

- PUT /api/articles/:id
  - Body: partial Article fields to update
  - Response 200: { success: true, data: Article }
  - 404 if not found

- DELETE /api/articles/:id
  - Response 200: { success: true, message: 'Article deleted successfully' }

- PATCH /api/articles/:id/status
  - Body: { status: 'inbox'|'archive'|... }

- PATCH /api/articles/:id/progress
  - Body: { progress: number }

- PATCH /api/articles/:id/favorite
  - Body: { isFavorite: boolean }

- POST /api/articles/:id/tags
  - Body: { tagId: string }
  - Response 200: { success: true, data: Article }

- DELETE /api/articles/:id/tags/:tagId
  - Response 200: { success: true, data: Article }

### Feeds

- GET /api/feeds
  - Query params: category, status
  - Response 200: { success: true, count, data: Feed[] }

- GET /api/feeds/:id
  - Response 200: { success: true, data: Feed }

- POST /api/feeds
  - Body: { name, url, category?, refreshFrequency? }
  - Response 201: { success: true, data: Feed }

- PUT /api/feeds/:id
  - Response 200: { success: true, data: Feed }

- DELETE /api/feeds/:id
  - Response 200

- GET /api/feeds/:id/articles
  - Response 200: { success: true, feed: { id, name, category }, count, data: Article[] }

- POST /api/feeds/:id/fetch (optional)
  - Trigger an immediate fetch of the feed (useful for front-end testing)
  - Response 202: { success: true, message: 'Fetch enqueued' }

### Tags

- GET /api/tags
  - Query: sort=popular|alphabetical|recent

- GET /api/tags/:id

- POST /api/tags
  - Body: { name, color?, description? }

- PUT /api/tags/:id

- DELETE /api/tags/:id

- GET /api/tags/:id/articles

### Users

- POST /api/users/register  (implemented under `/api/auth/register` currently)
- POST /api/users/login     (implemented under `/api/auth/login` currently)

- GET /api/users/profile/:id
  - Response: { success: true, data: User }

- PUT /api/users/profile/:id

- PUT /api/users/password/:id

- GET /api/users/stats/:id

- DELETE /api/users/:id

### Highlights

- GET /api/highlights
  - Query params: userId

- GET /api/highlights/article/:articleId

- POST /api/highlights
  - Body: { articleId, userId, text, position: { start, end }, annotations?: { title?, note? }, color? }

- PUT /api/highlights/:id

- DELETE /api/highlights/:id

### Auth

- POST /api/auth/register
  - Body: { username, email, password, displayName? }
  - Response 201: { success: true, data: { user, token } }

- POST /api/auth/login
  - Body: { username, password }
  - Response 200: { success: true, data: { user, token } }

- POST /api/auth/verify
  - Header: Authorization: Bearer <token>

- POST /api/auth/refresh

- POST /api/auth/logout

### Extract

- POST /api/extract
  - Body: { url: string }
  - Response 200: { success: true, data: { title, author, content, text, excerpt, leadImage, canonicalUrl, lang, source } }
  - Errors: 400 (invalid url), 404 (not extractable), 408 (timeout), 500

---

## Versioning and backward compatibility
- If a breaking change is required, add a new path prefix `/api/v2/...` and maintain `/api/v1/...` for at least one release.

## Testing & contract verification
- Front-end teams should add simple integration tests that exercise the endpoints using example payloads in this doc.
- Back-end should provide a mock mode (`USE_MOCK_DB=true`) so front-end CI can run against stable responses.

---

If you want, I can add an OpenAPI (YAML) spec generated from this contract to `back-end/guidelines/openapi.yaml` so clients can auto-generate types and mock servers.
