# Back-End Development Sprint Checklist

## Overview

This sprint focuses on creating API routes with mock data and integrating the front-end with the back-end. Data persistence will be handled in the Database Integration sprint.

## Required Tasks

### 1. API Routes Implementation

#### Articles API

- [ ] `GET /api/articles` - Retrieve all articles (with filtering support)
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

- [ ] Install and configure Mocha and Chai
- [ ] Install and configure c8 for coverage
- [ ] Write unit tests for article routes
- [ ] Write unit tests for feed routes
- [ ] Write unit tests for tag routes
- [ ] Write unit tests for user routes
- [ ] Write unit tests for auth routes
- [ ] Achieve minimum 10% code coverage
- [ ] Verify coverage with `npm run coverage`
- [ ] All tests pass with `npm test`

### 3. Front-End Integration

- [ ] Remove mock data imports from front-end
- [ ] Create API service layer in front-end
- [ ] Update HomePage to fetch from back-end
- [ ] Update SearchPage to fetch from back-end
- [ ] Update InboxPage to fetch from back-end
- [ ] Update DailyReadingPage to fetch from back-end
- [ ] Update ContinueReadingPage to fetch from back-end
- [ ] Update RediscoveryPage to fetch from back-end
- [ ] Update ArchivePage to fetch from back-end
- [ ] Update FeedsPage to fetch from back-end
- [ ] Update TagsPage to fetch from back-end
- [ ] Update FavoritesPage to fetch from back-end
- [ ] Test all forms POST to back-end correctly
- [ ] Test full integration (front-end ↔ back-end)

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

- ✅ **Must Have**: All dynamic routes responding with mock JSON data
- ✅ **Must Have**: Front-end fully integrated with back-end
- ✅ **Must Have**: 10%+ test coverage
- ⭐ **Nice to Have**: Higher test coverage (>20%)
- ⭐ **Nice to Have**: API documentation with examples
- ⭐ **Nice to Have**: Error handling for all routes

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

- [ ] All API routes implemented and returning mock data
- [ ] Front-end successfully communicates with back-end
- [ ] All tests pass
- [ ] Code coverage ≥ 10%
- [ ] Documentation updated
- [ ] Code reviewed and merged to main
- [ ] Demo-ready for stakeholder presentation
