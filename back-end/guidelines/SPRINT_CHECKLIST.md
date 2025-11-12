# Back-End Development Sprint Checklist

## Overview

This sprint focuses on creating API routes with mock data and integrating the front-end with the back-end. Data persistence will be handled in the Database Integration sprint.

> NOTE (updated 2025-11-11): The checklist below has been updated to reflect endpoints actually implemented in code (routes in `back-end/routes`). Some checklist items were marked complete at a high level but not updated granularly; the detailed items below now mirror the source files. Where implementation paths differ from the checklist, a brief note is added.

## Required Tasks

### 1. API Routes Implementation

#### Articles API

- [x] `GET /api/articles` - Retrieve all articles (with filtering support)
- [x] `GET /api/articles/:id` - Retrieve single article by ID
- [x] `POST /api/articles` - Create new article
- [x] `PUT /api/articles/:id` - Update article
- [x] `DELETE /api/articles/:id` - Delete article
- [x] `PATCH /api/articles/:id/status` - Update article status
- [x] `PATCH /api/articles/:id/progress` - Update reading progress
- [x] `PATCH /api/articles/:id/favorite` - Toggle favorite status
- [x] `POST /api/articles/:id/tags` - Add tag to article (implemented)
- [x] `DELETE /api/articles/:id/tags/:tagId` - Remove tag from article (implemented)

#### Feeds API

- [x] `GET /api/feeds` - Retrieve all feeds
- [x] `GET /api/feeds/:id` - Retrieve single feed
- [x] `POST /api/feeds` - Create new feed
- [x] `PUT /api/feeds/:id` - Update feed
- [x] `DELETE /api/feeds/:id` - Delete feed
- [x] `GET /api/feeds/:id/articles` - Get articles from specific feed

#### Tags API

- [x] `GET /api/tags` - Retrieve all tags
- [x] `GET /api/tags/:id` - Retrieve single tag
- [x] `POST /api/tags` - Create new tag
- [x] `PUT /api/tags/:id` - Update tag
- [x] `DELETE /api/tags/:id` - Delete tag
- [x] `GET /api/tags/:id/articles` - Get articles with specific tag

#### Users API

- [x] `GET /api/users/profile/:id` - Get user profile (implemented as `/profile/:id`)
- [x] `PUT /api/users/profile/:id` - Update user profile (implemented as `/profile/:id`)
- [x] `PUT /api/users/password/:id` - Change password (implemented)
- [x] `GET /api/users/stats/:id` - Get user reading statistics (implemented)
- [x] `DELETE /api/users/:id` - Delete user account (implemented)

NOTE: Registration/login are implemented under the Auth routes (`/api/auth/register`, `/api/auth/login`) rather than `POST /api/users/register` per the original checklist. See Auth API section below.

#### Highlights/Annotations API

- [x] `GET /api/highlights` - Retrieve all highlights
- [x] `GET /api/highlights/article/:articleId` - Get highlights for specific article (implemented as `/article/:articleId`)
- [x] `POST /api/highlights` - Create new highlight
- [x] `PUT /api/highlights/:id` - Update highlight
- [x] `DELETE /api/highlights/:id` - Delete highlight

NOTE: The implemented path for per-article highlights uses `/article/:articleId` under `/api/highlights`. The checklist expected `GET /api/highlights/:articleId` — both are functionally similar but should be reconciled in docs.

#### Authentication API

- [x] `POST /api/auth/register` - User registration with JWT
- [x] `POST /api/auth/login` - User login with JWT
- [x] `POST /api/auth/verify` - Verify JWT token
- [x] `POST /api/auth/refresh` - Refresh JWT token
- [x] `POST /api/auth/logout` - User logout

NOTE: Auth is implemented and uses `mockUsers` (no persistent DB write on register). Tokens are JWTs signed with `process.env.JWT_SECRET` (dev fallback present). Refresh tokens are stateless (no revocation list).

### 2. Testing Requirements

**IMPORTANT: Each developer must write tests achieving 10% code coverage for their assigned routes.**

#### Shaurya: Articles API Tests

- [x] Install and configure Mocha, Chai, and chai-http
- [x] Write unit tests for all 8 Articles endpoints
- [x] Test query parameters (status, tag, favorite, untagged)
- [x] Test error cases (404, 400, 500)
- [x] Achieve 10%+ coverage for `routes/articles.js`
- [x] Run `npm run coverage` to verify your coverage

#### Jeffrey: Feeds API Tests

- [x] Write unit tests for all 6 Feeds endpoints
- [x] Test feed creation, updates, deletion
- [x] Test GET /api/feeds/:id/articles
- [x] Test filtering and sorting
- [x] Achieve 10%+ coverage for `routes/feeds.js`
- [x] Run `npm run coverage` to verify your coverage

#### Anas: Tags & Highlights API Tests

- [x] Write unit tests for Tags endpoints (6 endpoints)
- [x] Write unit tests for Highlights endpoints (5 endpoints)
- [x] Test tag-article relationships
- [x] Test highlight creation with position tracking
- [x] Achieve 10%+ coverage for `routes/tags.js` and `routes/highlights.js`
- [x] Run `npm run coverage` to verify your coverage

#### Saad: Users & Auth API Tests

- [x] Write unit tests for Users endpoints (5 endpoints)
- [x] Write unit tests for Auth endpoints (5 endpoints)
- [x] Test JWT token generation and verification
- [x] Test password hashing/comparison with bcrypt
- [x] Test authentication error cases
- [x] Achieve 10%+ coverage for `routes/users.js` and `routes/auth.js`
- [x] Run `npm run coverage` to verify your coverage

#### Zeba: Integration Tests & Coverage Verification

- [x] Write integration tests for full API flows
- [x] Test article creation → tagging → highlighting → reading
- [x] Test user registration → login → profile update
- [x] Verify all team members hit 10%+ coverage
- [x] Generate final coverage report
- [x] Achieve 10%+ coverage for integration scenarios
- [x] Run `npm run coverage` to verify overall coverage

#### Team Testing Goals

- [ ] All tests pass with `npm test`
- [ ] Overall project coverage ≥ 50% (5 developers × 10% each)
- [ ] No failing tests in main branch
- [ ] Coverage report committed to repo

## Pre-Integration: Backend readiness checklist (required before front-end integration)

Complete these tasks before switching the front-end from local/mock imports to the live API. They make the back-end swappable and tests reliable for CI.

- [x] Decide mocking strategy — in-memory mocks, DAO adapter, or mongodb-memory-server for tests
- [ ] Add DAO abstraction (`lib/daoFactory.js`)
	- Quick tip: the factory should return `articlesDao`, `feedsDao`, `tagsDao`, `usersDao`, `highlightsDao` based on `process.env.USE_MOCK_DB`.
	- Recommendation: keep the DAO API small and consistent (getAll, getById, create, update, delete, query) so routes and tests are simple.
- [ ] Create mock implementation (`lib/*Dao.mock.js`)
	- Quick tip: implement array-backed DAOs and seed them from `data/mock*.js`. Export a `reset()` helper for tests.
	- Recommendation: make mock DAOs deterministic and provide simple helpers to populate common test states.
- [ ] Implement production DAO (`lib/*Dao.mongo.js`)
	- Quick tip: implement minimal Mongoose models and map DAO functions to Mongoose calls.
	- Recommendation: implement mongo DAO after mock DAO so the route/DAO contract is stable.
- [ ] Test strategy for DAOs
	- Quick tip: unit tests should stub the DAO (fast) and integration tests should use `mongodb-memory-server` (ephemeral DB) in CI.
	- Recommendation: prefer DAO stubs for most unit tests; reserve a small integration suite for end-to-end DB validation.
- [ ] Document and seed
	- Quick tip: add `back-end/README-mocking.md` describing `USE_MOCK_DB`, how to seed mock data, and how to run tests in mock vs mongo mode.
	- Recommendation: add `npm run seed:mock` and `npm run seed:mongo` scripts to simplify developer setup.
- [ ] CI hooks for tests & coverage
	- Quick tip: CI should run unit tests (mock DAO or stubs) and a short integration job against `mongodb-memory-server` to validate the mongo DAO.
	- Recommendation: cache node_modules, run `npm test` and `npm run coverage`, and fail the job on coverage regressions.

See the API contract for canonical endpoints and payloads: [`back-end/guidelines/API-CONTRACT.md`](API-CONTRACT.md)

### 3. Front-End Integration

**Anas & Saad lead this effort with support from all team members**

#### Create API Service Layer (Anas)

- [ ] Create `front-end/src/services/api.js`
- [ ] Implement articlesAPI functions (getAll, getById, create, update, delete)
- [ ] Implement feedsAPI functions
- [ ] Implement tagsAPI functions
- [ ] Implement usersAPI functions
- [ ] Implement authAPI functions
- [ ] Implement highlightsAPI functions
- [ ] Add error handling and loading states
- [ ] Document API service usage

#### Update Pages to Use API (Saad)

- [ ] Remove all mock data imports from pages
- [ ] Update HomePage to fetch from back-end
- [ ] Update InboxPage to fetch from back-end  
- [ ] Update FavoritesPage to fetch from back-end
- [ ] Update ArchivePage to fetch from back-end
- [ ] Update TagsPage to fetch from back-end
- [ ] Update FeedsPage to fetch from back-end
- [ ] Update AddLinkModal to POST to back-end
- [ ] Test all CRUD operations work end-to-end

#### Integration Testing (All Team)

- [ ] Server runs on `http://localhost:7001`
- [ ] Front-end runs on `http://localhost:7002`
- [ ] CORS configured correctly
- [ ] All pages load data from API
- [ ] Forms submit data to API
- [ ] No console errors
- [ ] Test full user flows (add article → tag → favorite → read)

### 4. Documentation

- [ ] Update main `README.md` with back-end setup instructions
- [ ] Document all API endpoints (request/response formats)
- [ ] Document environment variables needed
- [ ] Document testing procedures
- [ ] Add troubleshooting section
- [ ] Ensure instructions are clear for new developers

### 5. Security & Configuration

- [ ] Verify `.env` is in `.gitignore`
- [ ] Create `.env.example` with template variables
- [ ] Never commit actual `.env` file
- [ ] Submit `.env` to course staff via Discord
- [ ] Implement basic JWT authentication structure
- [ ] Add input validation middleware
- [ ] Add error handling middleware

### 6. Code Quality

- [ ] Follow team coding standards
- [ ] Use meaningful variable and function names
- [ ] Add comments for complex logic
- [ ] Follow feature branch workflow
- [ ] Create pull requests for all changes
- [ ] Get peer code reviews
- [ ] Address review feedback

## Sprint Goals

### Must Have (Required)
- ✅ All API routes implemented and responding with mock JSON data
- ✅ Front-end fully integrated with back-end (no mock data in front-end)
- ✅ **Each developer achieves 10% code coverage** for their assigned routes
- ✅ Overall project coverage ≥ 50% (5 developers × 10%)
- ✅ All tests pass with `npm test`
- ✅ Server starts without errors (`npm run dev`)

### Nice to Have (Bonus)
- ⭐ Individual developer coverage >15%
- ⭐ Overall project coverage >60%
- ⭐ API documentation with Postman collection
- ⭐ Comprehensive error handling for all routes
- ⭐ Input validation middleware
- ⭐ Request logging

## Notes

- Data does **not** need to persist yet (hard-coded responses or mockaroo proxying is fine)
- Real database integration comes in Sprint 3 (Database Integration)
- Focus on API design and structure
- Ensure front-end/back-end communication works correctly

## Testing Commands

```bash
# Run all tests
npm test

# Check code coverage
npm run coverage

# Run in development mode
npm run dev

# Run in production mode
npm start
```

## Definition of Done

- [ ] All 36 API endpoints implemented and returning mock data
- [ ] Front-end successfully communicates with back-end
- [ ] All mock data removed from front-end (using API calls instead)
- [ ] **Each developer has 10%+ code coverage** for their routes
- [ ] Overall code coverage ≥ 50%
- [ ] All tests pass with `npm test`
- [ ] No console errors when running front-end/back-end
- [ ] Documentation updated (README.md, API docs)
- [ ] `.env.example` created and documented
- [ ] Code reviewed and merged to main
- [ ] Demo-ready for stakeholder presentation

## Individual Developer Responsibilities

### Shaurya: Articles API
- Routes: `routes/articles.js` (8 endpoints)
- Tests: `test/articles.test.js`
- Coverage: 10%+ on articles routes
- Front-end: HomePage, InboxPage integration

### Jeffrey: Feeds API
- Routes: `routes/feeds.js` (6 endpoints)
- Tests: `test/feeds.test.js`
- Coverage: 10%+ on feeds routes
- Front-end: FeedsPage integration

### Anas: Tags & Highlights API
- Routes: `routes/tags.js`, `routes/highlights.js` (11 endpoints)
- Tests: `test/tags.test.js`, `test/highlights.test.js`
- Coverage: 10%+ on tags and highlights routes
- Front-end: API service layer creation

### Saad: Users & Auth API
- Routes: `routes/users.js`, `routes/auth.js` (10 endpoints)
- Tests: `test/users.test.js`, `test/auth.test.js`
- Coverage: 10%+ on users and auth routes
- Front-end: Page integration (TagsPage, others)

### Zeba: Integration & Enhancement
- Tests: `test/integration.test.js`
- Coverage: 10%+ on integration flows
- Responsibilities: Server setup, CORS, final testing, help team with bugs
