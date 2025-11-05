# Fieldnotes Back-End - Team Onboarding Guide

**Sprint 2: Back-End Development with Mock Data**  
**Team Size:** 5 developers  
**Timeline:** 2 days  
**Branch:** `back-end-setup`

---

## 🎯 Project Overview

**Fieldnotes** is a FOSS read-it-later web application. This sprint focuses on:
- Creating REST API with Express.js
- Using mock data (no database yet - that's Sprint 3)
- Integrating front-end with back-end
- Each developer writing tests for 10% code coverage

---

## 🏗️ Current Architecture

### Tech Stack
- **Back-End:** Node.js 20.x, Express.js 5.1.0
- **Front-End:** React 19.2.0 with Vite (ports: FE 7002, BE 7001)
- **Testing:** Mocha, Chai, c8 for coverage
- **Auth:** JWT (jsonwebtoken), bcryptjs
- **Database:** MongoDB (Mongoose) - configured but NOT used in Sprint 2

### Project Structure
```
back-end/
├── index.js                 # Express server entry point
├── package.json             # Dependencies
├── .env.example             # Environment variable template
├── README.md               # Complete API documentation
├── SPRINT_CHECKLIST.md     # Task breakdown
├── routes/
│   ├── index.js            # Main router (mounts all routes)
│   ├── articles.js         # ✅ COMPLETE - 8 endpoints
│   ├── feeds.js            # ✅ COMPLETE - 6 endpoints
│   ├── tags.js             # ✅ COMPLETE - 6 endpoints
│   ├── highlights.js       # ✅ COMPLETE - 5 endpoints
│   ├── users.js            # ✅ COMPLETE - 5 endpoints
│   ├── auth.js             # ✅ COMPLETE - 5 endpoints
│   └── extract.js          # Future content extraction endpoint
├── data/
│   ├── mockArticles.js     # 21 article objects
│   ├── mockFeeds.js        # 8 RSS feeds
│   ├── mockTags.js         # 10 tags
│   ├── mockHighlights.js   # 5 highlights/annotations
│   └── mockUsers.js        # 2 users with hashed passwords
├── test/                   # ⚠️ NEEDS TESTS - YOUR JOB
│   └── (empty - you create test files)
└── controllers/            # Empty (for future)
```

---

## ✅ What's Already Done

### All API Routes Implemented (36 endpoints total)
- Articles API - 8 endpoints with filtering (status, tag, favorite, untagged)
- Feeds API - 6 endpoints
- Tags API - 6 endpoints
- Highlights API - 5 endpoints  
- Users API - 5 endpoints
- Auth API - 5 endpoints with JWT

### Mock Data Created
- All data structures in `back-end/data/` folder
- Follows future MongoDB schema design
- Ready for Sprint 3 database migration

### Documentation Complete
- README.md has full API documentation
- Setup instructions for development
- Troubleshooting guide
- SPRINT_CHECKLIST.md with task breakdown

---

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone <repo-url>
cd back-end
npm install
```

### 2. Environment Setup (Optional for Sprint 2)
```bash
cp .env.example .env
# MongoDB not needed for Sprint 2 - server works with mock data
```

### 3. Start Server
```bash
# Development mode (auto-restart)
npm run dev

# Should see: "Server is running on http://localhost:7001"
# MongoDB connection error is EXPECTED and OK - we're using mock data
```

### 4. Test API Works
```bash
# In another terminal
curl http://localhost:7001/api
curl http://localhost:7001/api/articles
```

---

## 👥 Team Assignments

### Person 1: Articles API Testing
**Routes:** `routes/articles.js` (8 endpoints)  
**Your Tasks:**
1. Create `test/articles.test.js`
2. Write tests for all 8 endpoints (GET, POST, PUT, DELETE, PATCH)
3. Test query parameters: `?status=inbox`, `?tag=javascript`, `?favorite=true`, `?untagged=true`
4. Test error cases (404, 400)
5. Achieve **10% code coverage** for articles routes
6. Help with HomePage/InboxPage front-end integration

**Test Template:**
```javascript
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index');
const { expect } = chai;

chai.use(chaiHttp);

describe('Articles API', () => {
  describe('GET /api/articles', () => {
    it('should return all articles', (done) => {
      chai.request(app)
        .get('/api/articles')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
  });
});
```

---

### Person 2: Feeds API Testing
**Routes:** `routes/feeds.js` (6 endpoints)  
**Your Tasks:**
1. Create `test/feeds.test.js`
2. Write tests for all 6 endpoints
3. Test `GET /api/feeds/:id/articles` (feed-to-articles relationship)
4. Test filtering and sorting
5. Achieve **10% code coverage** for feeds routes
6. Help with FeedsPage front-end integration

**Key Endpoints:**
- `GET /api/feeds` - Get all feeds
- `POST /api/feeds` - Create feed
- `PUT /api/feeds/:id` - Update feed
- `DELETE /api/feeds/:id` - Delete feed
- `GET /api/feeds/:id/articles` - Get articles from feed

---

### Person 3: Tags & Highlights API Testing
**Routes:** `routes/tags.js`, `routes/highlights.js` (11 endpoints)  
**Your Tasks:**
1. Create `test/tags.test.js` 
2. Create `test/highlights.test.js`
3. Test tag-article relationships
4. Test highlight creation with position tracking
5. Test `GET /api/tags/:id/articles` endpoint
6. Achieve **10% code coverage** for both routes
7. **Create API service layer:** `front-end/src/services/api.js`

**API Service Example:**
```javascript
// front-end/src/services/api.js
const API_BASE_URL = 'http://localhost:7001/api';

export const articlesAPI = {
  getAll: async (filters = {}) => {
    const query = new URLSearchParams(filters);
    const res = await fetch(`${API_BASE_URL}/articles?${query}`);
    return res.json();
  },
  
  getById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/articles/${id}`);
    return res.json();
  },
  
  create: async (article) => {
    const res = await fetch(`${API_BASE_URL}/articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(article)
    });
    return res.json();
  }
};

// Export similar objects for: feedsAPI, tagsAPI, usersAPI, authAPI, highlightsAPI
```

---

### Person 4: Users & Auth API Testing
**Routes:** `routes/users.js`, `routes/auth.js` (10 endpoints)  
**Your Tasks:**
1. Create `test/users.test.js`
2. Create `test/auth.test.js`
3. Test JWT token generation and verification
4. Test password hashing with bcrypt
5. Test authentication flows (register → login → verify)
6. Achieve **10% code coverage** for both routes
7. **Update pages to use API** instead of mock data

**Pages to Update:**
- Remove `import { mockArticles } from '../data/mockArticles'`
- Replace with `import { articlesAPI } from '../services/api'`
- Use `useEffect` to fetch data:
```javascript
// Before (Sprint 1)
import { mockArticles } from '../data/mockArticles';
const [articles, setArticles] = useState(mockArticles);

// After (Sprint 2)
import { articlesAPI } from '../services/api';
const [articles, setArticles] = useState([]);

useEffect(() => {
  const fetchArticles = async () => {
    const response = await articlesAPI.getAll({ status: 'inbox' });
    setArticles(response.data);
  };
  fetchArticles();
}, []);
```

---

### Person 5: Integration Testing & Server Setup
**Routes:** Integration scenarios  
**Your Tasks:**
1. Create `test/integration.test.js`
2. Test full user flows (e.g., create article → tag it → highlight text → mark read)
3. Verify server starts without critical errors
4. Test CORS configuration
5. Help team debug integration issues
6. Achieve **10% code coverage** for integration tests
7. Generate final coverage report for team

**Integration Test Example:**
```javascript
describe('User Article Flow', () => {
  it('should create article, tag it, and mark as favorite', (done) => {
    // 1. Create article
    chai.request(app)
      .post('/api/articles')
      .send({ title: 'Test', url: 'https://test.com' })
      .end((err, res) => {
        const articleId = res.body.data.id;
        
        // 2. Tag the article
        chai.request(app)
          .put(`/api/articles/${articleId}`)
          .send({ tags: ['javascript'] })
          .end((err, res) => {
            
            // 3. Mark as favorite
            chai.request(app)
              .patch(`/api/articles/${articleId}/favorite`)
              .send({ isFavorite: true })
              .end((err, res) => {
                expect(res.body.data.isFavorite).to.be.true;
                done();
              });
          });
      });
  });
});
```

---

## 📊 Testing Requirements

### Each Developer Must:
- Write tests for assigned routes
- Achieve **minimum 10% code coverage** for your routes
- All your tests must pass
- Run `npm run coverage` to verify

### Commands
```bash
# Install test dependencies (if needed)
npm install --save-dev mocha chai chai-http c8

# Run all tests
npm test

# Check code coverage
npm run coverage

# View detailed HTML report
# Opens coverage/index.html in browser
```

### Coverage Goal
- **Individual:** Each person 10%+
- **Team Total:** 50%+ (5 developers × 10%)

### Where to Check Your Coverage
```bash
npm run coverage

# Look for your file in the output:
File                  | % Stmts | % Branch | % Funcs | % Lines
----------------------|---------|----------|---------|--------
routes/articles.js    | 15.2%   | 12.5%    | 20.0%   | 15.2%  ← Person 1
routes/feeds.js       | 12.8%   | 10.3%    | 15.0%   | 12.8%  ← Person 2
routes/tags.js        | 11.5%   | 10.1%    | 12.0%   | 11.5%  ← Person 3
routes/highlights.js  | 10.2%   | 8.7%     | 10.0%   | 10.2%  ← Person 3
routes/users.js       | 13.4%   | 11.2%    | 15.0%   | 13.4%  ← Person 4
routes/auth.js        | 14.1%   | 12.0%    | 16.0%   | 14.1%  ← Person 4
```

---

## 🔌 API Endpoints Reference

### Base URL
`http://localhost:7001/api`

### Articles (Person 1)
```
GET    /api/articles              Get all articles (supports filtering)
GET    /api/articles/:id          Get single article
POST   /api/articles              Create article
PUT    /api/articles/:id          Update article
DELETE /api/articles/:id          Delete article
PATCH  /api/articles/:id/status   Update status
PATCH  /api/articles/:id/progress Update reading progress
PATCH  /api/articles/:id/favorite Toggle favorite

Query params: ?status=inbox&tag=javascript&favorite=true&untagged=true
```

### Feeds (Person 2)
```
GET    /api/feeds                 Get all feeds
GET    /api/feeds/:id             Get single feed
POST   /api/feeds                 Create feed
PUT    /api/feeds/:id             Update feed
DELETE /api/feeds/:id             Delete feed
GET    /api/feeds/:id/articles    Get articles from feed
```

### Tags (Person 3)
```
GET    /api/tags                  Get all tags
GET    /api/tags/:id              Get single tag
POST   /api/tags                  Create tag
PUT    /api/tags/:id              Update tag
DELETE /api/tags/:id              Delete tag
GET    /api/tags/:id/articles     Get articles with tag

Query params: ?sort=popular|alphabetical|recent
```

### Highlights (Person 3)
```
GET    /api/highlights                    Get all highlights
GET    /api/highlights/article/:articleId Get highlights for article
POST   /api/highlights                    Create highlight
PUT    /api/highlights/:id                Update highlight
DELETE /api/highlights/:id                Delete highlight
```

### Users (Person 4)
```
GET    /api/users/profile/:id     Get user profile
PUT    /api/users/profile/:id     Update profile
PUT    /api/users/password/:id    Change password
GET    /api/users/stats/:id       Get reading stats
DELETE /api/users/:id              Delete account
```

### Auth (Person 4)
```
POST   /api/auth/register         Register user (returns JWT)
POST   /api/auth/login            Login (returns JWT)
POST   /api/auth/verify           Verify JWT token
POST   /api/auth/refresh          Refresh JWT token
POST   /api/auth/logout           Logout user
```

---

## 🧪 Testing Best Practices

### Test Structure
```javascript
describe('Feature', () => {
  describe('Endpoint', () => {
    it('should do something', (done) => {
      // Arrange
      const testData = { ... };
      
      // Act
      chai.request(app)
        .post('/api/endpoint')
        .send(testData)
        .end((err, res) => {
          // Assert
          expect(res).to.have.status(201);
          expect(res.body.success).to.be.true;
          done();
        });
    });
  });
});
```

### What to Test
✅ **Success cases:** Valid requests return correct data  
✅ **Validation:** Invalid data returns 400 error  
✅ **Not found:** Non-existent IDs return 404  
✅ **Query params:** Filtering works correctly  
✅ **Response structure:** JSON has `success`, `data`, `message` fields  

### Common Assertions
```javascript
// Status codes
expect(res).to.have.status(200);
expect(res).to.have.status(201);  // Created
expect(res).to.have.status(404);  // Not found
expect(res).to.have.status(400);  // Bad request

// Response structure
expect(res.body).to.have.property('success', true);
expect(res.body.data).to.be.an('array');
expect(res.body.data).to.be.an('object');
expect(res.body.data).to.have.property('id');

// Array checks
expect(res.body.data).to.have.lengthOf(21);
expect(res.body.count).to.equal(21);
```

---

## 🐛 Common Issues & Solutions

### Issue: Server won't start
```
Error: listen EADDRINUSE: address already in use :::7001
```
**Solution:**
```bash
# Kill process on port 7001
lsof -i :7001
kill -9 <PID>
```

### Issue: MongoDB connection error
```
MongoDB connection error: MongooseServerSelectionError
```
**Solution:** This is EXPECTED for Sprint 2! Ignore it - server still works with mock data.

### Issue: Tests fail with "app is not a function"
**Solution:** Make sure `index.js` exports the app:
```javascript
// At bottom of index.js
module.exports = app;
```

### Issue: CORS error in front-end
```
Access to fetch blocked by CORS policy
```
**Solution:** Verify `index.js` has:
```javascript
const cors = require('cors');
app.use(cors());
```

### Issue: Coverage not counting my tests
**Solution:**
- Tests must be in `test/` folder
- Files must end with `.test.js`
- Run `npm run coverage` not just `npm test`

---

## 📚 Key Files to Read

### Must Read (Start Here)
1. `README.md` - Complete API documentation
2. `SPRINT_CHECKLIST.md` - Your task breakdown
3. `routes/articles.js` - Example of completed route
4. `data/mockArticles.js` - Example mock data structure

### Reference When Needed
- `routes/index.js` - See how routes are mounted
- `index.js` - Server setup and middleware
- `.env.example` - Environment variables

---

## ✅ Definition of Done

### Individual (You)
- [ ] Test file created for your assigned routes
- [ ] All tests pass (`npm test`)
- [ ] **10%+ code coverage** for your routes (`npm run coverage`)
- [ ] Code committed and pushed to branch
- [ ] Pull request created with description

### Team (All of Us)
- [ ] All 36 API endpoints tested
- [ ] Overall coverage ≥ 50%
- [ ] Front-end integrated (no mock data in front-end)
- [ ] Server runs without critical errors
- [ ] Documentation updated
- [ ] Demo ready

---

## 🆘 Getting Help

### Blocked on Something?
1. Check this document first
2. Check `README.md` in back-end folder
3. Check `SPRINT_CHECKLIST.md`
4. Ask in team Discord/Slack
5. Pair program with teammate

### Useful Commands
```bash
# See what tests exist
ls test/

# Run specific test file
npm test -- --grep "Articles"

# Check which routes exist
ls routes/

# View mock data
cat data/mockArticles.js

# Check server is running
curl http://localhost:7001/health
```

---

## 🎯 Sprint Success Criteria

- ✅ All routes responding with mock data
- ✅ Each developer achieves 10%+ coverage
- ✅ Overall coverage ≥ 50%
- ✅ Front-end uses API (no mock data)
- ✅ All tests passing
- ✅ Demo ready

**You've got this! Let's ship it! 🚀**

---

## 📋 Quick Checklist for LLM Agents

If you're an LLM helping a team member:

- [ ] They've read this document
- [ ] They know their assignment (Person 1-5)
- [ ] Server is running (`npm run dev`)
- [ ] They've created their test file
- [ ] They understand 10% coverage requirement
- [ ] They know how to run `npm test` and `npm run coverage`
- [ ] They've read the example tests in this doc
- [ ] They know where to get help

**Key Points to Emphasize:**
1. MongoDB errors are OK - we're using mock data
2. Each person needs 10% coverage individually (not 10% total)
3. Test file must be in `test/` folder and end with `.test.js`
4. All routes are already implemented - just need tests
5. Front-end integration means removing mock data and using API calls

---

**Last Updated:** November 5, 2025  
**Sprint:** 2 (Back-End Development)  
**Status:** Routes complete, tests needed, front-end integration pending
