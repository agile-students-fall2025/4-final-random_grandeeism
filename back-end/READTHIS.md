# Backend Onboarding – READTHIS.md

Welcome! This document gets you productive fast with the backend. It explains the architecture (models → DAO → routes → scripts → tests) and the critical rule: **do NOT hand-edit runtime data files – always use provided scripts.**

---
## 1. High-Level Architecture
```
client (front-end) ↔ REST API (Express) ↔ DAO Factory ↔ (Mock Data | MongoDB) ↔ Models
                                              ↘ Scripts (integrity / refresh / parity)
                                              ↘ Tests (Mocha + Chai + c8 coverage)
```
Key layers:
- **Models**: Plain JS/Mongoose schema definitions (in `lib/models/`).
- **DAO Factory**: Chooses mock DAOs or MongoDB DAOs at runtime based on `USE_MOCK_DB` (`lib/daoFactory.js`).
- **DAOs**: Data access methods for each entity (`lib/*Dao.mock.js` / `lib/*Dao.mongo.js`). Share a common interface.
- **Routes**: Express route handlers under `routes/` implement the API contract.
- **Scripts**: Utility maintenance scripts in `scripts/` (data refresh & integrity checks).
- **Tests**: Mocha/Chai in `test/` with coverage via `c8`.
- **Utilities**: Reusable helpers (e.g. `utils/contentExtractor.js`).

---
## 2. Environment Setup
1. Copy `.env.example` → `.env` and adjust values.
2. Required variables:
   - `PORT` (default 7001)
   - `DB_CONNECTION_STRING` (Mongo URI or leave unused for mock mode)
   - `JWT_SECRET` (choose a long random string)
   - `FRONTEND_URL` (CORS origin, e.g. `http://localhost:7002`)
3. Decide data source mode:
   - Mock (default): omit setting `USE_MOCK_DB` or set `USE_MOCK_DB=true`.
   - Mongo: set `USE_MOCK_DB=false` AND provide `DB_CONNECTION_STRING`.

Run development server:
```bash
npm install
npm run dev
```
Server starts with nodemon for hot reload.

---
## 3. Models (`lib/models/`)
Entities: `Article`, `Feed`, `Highlight`, `Tag`, `User` (+ `index.js` export aggregator).
- In mock mode, models are plain JS objects shaped similarly to Mongoose docs.
- In Mongo mode, each file typically defines a Mongoose schema + model.
Design goals:
- Uniform field naming across mock & mongo.
- Avoid leaking persistence details to routes; rely on DAO interface.

### Common Fields (indicative – verify in code)
- `Article`: id, title, url, feedId, tagIds[], highlightIds[], createdAt
- `Feed`: id, name, url, articleIds[], createdAt
- `Highlight`: id, articleId, text, createdAt
- `Tag`: id, name, articleIds[]
- `User`: id, email, passwordHash, roles[], createdAt

---
## 4. DAO Layer
Factory: `lib/daoFactory.js`
- Picks implementation based on `process.env.USE_MOCK_DB !== 'false'`.
- Exported DAOs: `articlesDao`, `feedsDao`, `tagsDao`, `usersDao`, `highlightsDao`.
- Provides helpers:
  - `isUsingMockDB()` → boolean
  - `resetMockData()` → resets in-memory data (only in mock mode)

### Standard Interface (all DAOs should implement)
```
getAll(filters?) -> Promise<Array>
getById(id) -> Promise<Object|null>
create(data) -> Promise<Object>
update(id, data) -> Promise<Object|null>
delete(id) -> Promise<boolean>
reset() -> void (mock only)
```
### Entity-Specific Examples
- Articles: filtering by status/tag, etc.
- Feeds: `getArticlesByFeedId(feedId)`
- Tags: `getArticlesByTagId(tagId)`
- Users: `getByEmail(email)`, password hashing utilities.
- Highlights: `getByArticleId(articleId)`

### Switching Sources
- Keep mock mode for fast local dev & deterministic tests.
- Use Mongo mode for integration validation (ensure test data seed strategy—not manual edits).

---
## 5. Routes (`routes/`)
Files: `articles.js`, `auth.js`, `extract.js`, `feeds.js`, `highlights.js`, `tags.js`, `users.js`, plus `index.js` to mount.
Pattern:
1. Validate input (basic checks – consider enhancing with schema validation later).
2. Call DAO.
3. Normalize response shape per `guidelines/API-CONTRACT.md`.
4. Handle errors with consistent status codes (4xx client, 5xx server).

### Sample Flow (Articles GET)
- Request hits `routes/articles.js` → uses `articlesDao.getAll()` → maps output → sends JSON.

Authentication:
- `auth.js` likely manages login/token issuance using `jsonwebtoken` & `bcryptjs`.
- Protect routes by verifying JWT (middleware not shown—confirm implementation before extending).

`extract.js`:
- Likely delegates to `utils/contentExtractor.js` for parsing/storing highlights.

---
## 6. Utilities
`utils/contentExtractor.js`: Core logic for parsing article content / generating highlights. When extending, keep pure functions testable and avoid side-effects.

---
## 7. Data Management – CRITICAL RULE
Directories:
- `baseData/` – Canonical seed data (never edited manually unless performing an intentional large migration).
- `data/` – Runtime copy used by mock DAOs.

Scripts enforce integrity:
- `scripts/refreshDataFromBase.js` (copies/refreshes data for tests/dev before running test suite – triggered via `pretest` script).
- `scripts/verifyDataParity.js` (ensures `data/` matches `baseData/` structure/keys).
- `scripts/verifyIntegrity.js` (checks referential integrity: IDs, cross-links).

✅ **Do NOT manually modify any files in `data/`**. Regenerate via script so tests remain reproducible.

If you need new seed content:
1. Edit `baseData/*` (after team consensus).
2. Run:
```bash
node scripts/refreshDataFromBase.js
node scripts/verifyIntegrity.js
```
3. Commit changes.

---
## 8. Scripts (`scripts/`)
| Script | Purpose | When to Run |
|--------|---------|-------------|
| `refreshDataFromBase.js` | Sync `data/` from `baseData/` | Before tests / after changing base data |
| `verifyDataParity.js` | Ensure shape parity | After adding new fields or records |
| `verifyIntegrity.js` | Cross-reference & relationship integrity | CI + local sanity |

Convenience npm scripts (from `package.json`):
```bash
npm run verify:integrity
npm run verify:parity
```

---
## 9. Testing & Coverage
Frameworks: **Mocha + Chai + Chai-HTTP**.
Location: `test/` (one file per major entity + integration tests).
Important configuration:
- `.mocharc.json` (default options)
- Pre-test hook: `pretest` runs `refreshDataFromBase.js` ensuring a clean deterministic dataset.

Run tests:
```bash
npm test
```
Generate coverage (c8 HTML report under `coverage/`):
```bash
npm run coverage
```
Open `coverage/index.html` in a browser to inspect.

### Writing New Tests
1. Use DAO factory toggling: keep `USE_MOCK_DB=true` for unit tests.
2. For integration tests against Mongo, explicitly set `USE_MOCK_DB=false` and seed DB (create a seeding script—avoid manual writes).
3. Use `chai-http` to hit routes; assert on shape defined in `API-CONTRACT.md`.
4. Prefer resetting mock data via `resetMockData()` rather than mutating internal arrays.

---
## 10. Running in Different Modes
Mock (fast dev):
```bash
USE_MOCK_DB=true npm run dev
```
Mongo (real persistence):
```bash
USE_MOCK_DB=false DB_CONNECTION_STRING='<your_uri>' npm run dev
```
Check the console for: "🔧 Using Mock DAOs" or "🗄️  Using MongoDB DAOs".

---
## 11. Authentication Essentials
- `JWT_SECRET` must be long & unpredictable.
- Token lifetime controlled by `JWT_EXPIRES_IN` (default from example: 7d).
- Ensure CORS origin matches front-end or requests will fail preflight.

---
## 12. Content Extraction Workflow
1. Client submits URL/content to `extract` route.
2. Route delegates to `contentExtractor` utility.
3. DAO inserts new highlights + updates related article record.
4. Integrity script can later verify all highlight references are valid.

---
## 13. Contribution Workflow Checklist
1. Pull latest `master`.
2. Decide data mode (mock vs mongo).
3. Run integrity & parity checks:
   ```bash
   npm run verify:integrity
   npm run verify:parity
   ```
4. Implement changes (models → dao → route → tests). Keep interfaces stable.
5. Add / update tests (unit + integration if required).
6. Run coverage & ensure thresholds acceptable.
7. Commit with clear message (scope: component or feature).

---
## 14. Common Pitfalls & Solutions
| Pitfall | Symptom | Fix |
|---------|---------|-----|
| Forgetting to refresh data | Tests fail due to stale references | `npm test` (pretest hook) or manually run refresh script |
| Using Mongo without URI | Startup error on connection | Provide `DB_CONNECTION_STRING` |
| Manual edits in `data/` | Inconsistent test results | Revert & run refresh script |
| Missing JWT secret | Auth endpoints throw errors | Set `JWT_SECRET` in `.env` |
| CORS blocked | Browser preflight failure | Set correct `FRONTEND_URL` |

---
## 15. Extending the Backend Safely
When adding a new entity:
1. Create model file.
2. Implement mock DAO (in-memory arrays) + optional Mongo schema/DAO.
3. Update `daoFactory.js` to include new DAO if needed.
4. Add route file + mount in `routes/index.js`.
5. Add tests for DAO + route.
6. Update integrity script if cross-relations introduced.
7. Document new endpoint in `guidelines/API-CONTRACT.md`.

---
## 16. Quick Reference Commands
```bash
# Dev server (mock)
npm run dev

# Dev server (mongo)
USE_MOCK_DB=false npm run dev

# Test & coverage
npm test
npm run coverage

# Integrity & parity
npm run verify:integrity
npm run verify:parity

# Reset mock data programmatically (node REPL or script)
require('./lib/daoFactory').resetMockData();
```

---
## 17. Next Suggested Improvements (Optional)
- Add centralized validation (e.g. Zod or Joi) for route inputs.
- Introduce request logging (Morgan) & structured logs.
- Add ESLint config for the backend (if not already present) & CI hook.
- Implement seeding script for Mongo mode mirroring `baseData`.
- Add performance test harness for heavy DAO operations.

---
## 18. TL;DR
Use mock mode for speed. Never hand-edit `data/`; edit `baseData/` + run scripts. Keep DAO interfaces stable. Write tests before large refactors. Always verify integrity & parity prior to pushing.

Welcome aboard! 🚀 Feel free to enhance this file as the project evolves.
