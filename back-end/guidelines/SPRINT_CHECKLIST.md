# Back-End Development Sprint Checklist

## Overview

This sprint focuses on creating API routes with mock data and integrating the front-end with the back-end. Data persistence will be handled in the Database Integration sprint.

## Required Tasks

### 1. API Routes Implementation

#### Articles API

- [] `GET /api/articles` - Retrieve all articles (with filtering support)
- [ ] `GET /api/articles/:id` - Retrieve single article by ID
- [ ] `POST /api/articles` - Create new article
- [ ] `PUT /api/articles/:id` - Update article
- [ ] `DELETE /api/articles/:id` - Delete article
- [ ] `PATCH /api/articles/:id/status` - Update article status
- [ ] `PATCH /api/articles/:id/progress` - Update reading progress
- [ ] `PATCH /api/articles/:id/favorite` - Toggle favorite status

#### Feeds API

- [ ] `GET /api/feeds` - Retrieve all feeds
- [ ] `GET /api/feeds/:id` - Retrieve single feed
- [ ] `POST /api/feeds` - Create new feed
- [ ] `PUT /api/feeds/:id` - Update feed
- [ ] `DELETE /api/feeds/:id` - Delete feed
- [ ] `GET /api/feeds/:id/articles` - Get articles from specific feed

#### Tags API

- [ ] `GET /api/tags` - Retrieve all tags
- [ ] `GET /api/tags/:id` - Retrieve single tag
- [ ] `POST /api/tags` - Create new tag
- [ ] `PUT /api/tags/:id` - Update tag
- [ ] `DELETE /api/tags/:id` - Delete tag
- [ ] `GET /api/tags/:id/articles` - Get articles with specific tag

#### Users API

- [ ] `POST /api/users/register` - User registration
- [ ] `POST /api/users/login` - User login
- [ ] `GET /api/users/profile` - Get user profile
- [ ] `PUT /api/users/profile` - Update user profile
- [ ] `DELETE /api/users/account` - Delete user account

#### Highlights/Annotations API

- [ ] `GET /api/highlights` - Retrieve all highlights
- [ ] `GET /api/highlights/:articleId` - Get highlights for specific article
- [ ] `POST /api/highlights` - Create new highlight
- [ ] `PUT /api/highlights/:id` - Update highlight
- [ ] `DELETE /api/highlights/:id` - Delete highlight

#### Authentication API

- [ ] `POST /api/auth/login` - User login with JWT
- [ ] `POST /api/auth/register` - User registration with JWT
- [ ] `POST /api/auth/refresh` - Refresh JWT token
- [ ] `POST /api/auth/logout` - User logout
- [ ] `GET /api/auth/verify` - Verify JWT token

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
- [ ] Write unit tests for all 6 Feeds endpoints
- [ ] Test feed creation, updates, deletion
- [ ] Test GET /api/feeds/:id/articles
- [ ] Test filtering and sorting
- [ ] Achieve 10%+ coverage for `routes/feeds.js`
- [ ] Run `npm run coverage` to verify your coverage

#### Anas: Tags & Highlights API Tests
- [ ] Write unit tests for Tags endpoints (6 endpoints)
- [ ] Write unit tests for Highlights endpoints (5 endpoints)
- [ ] Test tag-article relationships
- [ ] Test highlight creation with position tracking
- [ ] Achieve 10%+ coverage for `routes/tags.js` and `routes/highlights.js`
- [ ] Run `npm run coverage` to verify your coverage

#### Saad: Users & Auth API Tests
- [ ] Write unit tests for Users endpoints (5 endpoints)
- [ ] Write unit tests for Auth endpoints (5 endpoints)
- [ ] Test JWT token generation and verification
- [ ] Test password hashing/comparison with bcrypt
- [ ] Test authentication error cases
- [ ] Achieve 10%+ coverage for `routes/users.js` and `routes/auth.js`
- [ ] Run `npm run coverage` to verify your coverage

#### Zeba: Integration Tests & Coverage Verification
- [ ] Write integration tests for full API flows
- [ ] Test article creation → tagging → highlighting → reading
- [ ] Test user registration → login → profile update
- [ ] Verify all team members hit 10%+ coverage
- [ ] Generate final coverage report
- [ ] Achieve 10%+ coverage for integration scenarios
- [ ] Run `npm run coverage` to verify overall coverage

#### Team Testing Goals
- [ ] All tests pass with `npm test`
- [ ] Overall project coverage ≥ 50% (5 developers × 10% each)
- [ ] No failing tests in main branch
- [ ] Coverage report committed to repo

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
