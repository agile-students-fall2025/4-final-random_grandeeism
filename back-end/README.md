# Fieldnotes Back-End

Express.js REST API for the Fieldnotes read-it-later application with JWT authentication and MongoDB Atlas integration.

## 📚 Documentation & Guidelines

For detailed project documentation, see the `guidelines/` folder:

- **[TEAM_ONBOARDING.md](guidelines/TEAM_ONBOARDING.md)** - Complete onboarding guide for new team members and LLM agents. Includes project overview, architecture, individual assignments, testing requirements, and code examples.

- **[SPRINT_CHECKLIST.md](guidelines/SPRINT_CHECKLIST.md)** - Sprint 2 task breakdown with individual developer assignments. Tracks progress on routes, testing, and front-end integration.

- **[TODO-CONTENT-EXTRACTION.md](guidelines/TODO-CONTENT-EXTRACTION.md)** - Implementation guide for content extraction feature (Mozilla Readability). Explains how to activate real content extraction in Sprint 3+.

- **[IMPLEMENTATION-SUMMARY.md](guidelines/IMPLEMENTATION-SUMMARY.md)** - Summary of completed content extraction implementation using utility function pattern. Includes architecture decisions and testing instructions.

## Tech Stack

- **Express.js** v5.1.0 - Web framework
- **MongoDB Atlas** with Mongoose v8.19.2 - Cloud database
- **JWT (jsonwebtoken)** - Authentication & authorization
- **bcrypt** - Password hashing
- **express-validator** - Input validation
- **Mocha & Chai** - Testing
- **c8** - Code coverage

## Prerequisites

- Node.js v18.x or higher
- npm
- MongoDB Atlas account (free tier available)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. MongoDB Atlas Setup

**Create a MongoDB Atlas cluster (5 minutes):**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up/login and create a new project
3. Click "Build a Database" → Choose **M0 Free** tier
4. Select cloud provider (AWS recommended) and region
5. Create cluster (takes 3-5 minutes)

**Configure database access:**

1. Go to **Database Access** (Security section)
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Username: `fieldnotes-user` (or your choice)
5. Click **Autogenerate Secure Password** and **copy it**
6. Set privileges to **Read and write to any database**
7. Click **Add User**

**Configure network access:**

1. Go to **Network Access** (Security section)
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (adds 0.0.0.0/0)
   - For production: Add specific IPs instead
4. Click **Confirm**

**Get connection string:**

1. Go to **Database** → Click **Connect** on your cluster
2. Choose **Connect your application**
3. Driver: **Node.js**, Version: **6.7 or later**
4. Copy the connection string:
   ```
   mongodb+srv://fieldnotes-user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password from step 2
6. Add `/fieldnotes` after `.net` to specify database name:
   ```
   mongodb+srv://fieldnotes-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/fieldnotes?retryWrites=true&w=majority
   ```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration. See `.env.example` for all available options:

```env
# Server Configuration
PORT=7001

# Database Configuration
# For development with mock data (no MongoDB required):
USE_MOCK_DB=true

# For production with MongoDB Atlas:
# USE_MOCK_DB=false
# MONGODB_URI=mongodb+srv://fieldnotes-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/fieldnotes?retryWrites=true&w=majority

# JWT Authentication
# ⚠️ CRITICAL: Generate a secure secret for production!
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-change-in-production-minimum-32-characters-long

# CORS (Optional)
FRONTEND_URL=http://localhost:5173
```

**⚠️ Security Notes:**
- **Never commit `.env` to git** (already in `.gitignore`)
- **Use a strong, unique JWT_SECRET** (at least 32 characters)
- **Generate JWT_SECRET**: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- **Change default JWT_SECRET** before deploying to production
- **Use different secrets** for development and production environments

**All Environment Variables:**

See `.env.example` for complete documentation of all environment variables including:
- `PORT` - Server port (default: 7001)
- `MONGODB_URI` - MongoDB Atlas connection string
- `USE_MOCK_DB` - Use mock data instead of MongoDB (true/false)
- `JWT_SECRET` - Secret key for signing JWT tokens

### 4. Run the Server

**Standard start (for both development and production):**

```bash
npm start
```

This will:
- Run in `development` mode by default (unless `NODE_ENV` is set)
- Connect to MongoDB (unless `USE_MOCK_DB=true`)
- Start server on port specified in `.env` (default: 7001)

**Development mode (with auto-restart on file changes):**

```bash
npm run dev
```

**Production deployment:**

```bash
# Set NODE_ENV to production before starting
NODE_ENV=production npm start
```

The server will start on `http://localhost:7001`

You should see:
```
🚀 Starting server in development mode
✅ Connected to MongoDB Atlas
🗄️  Using MongoDB DAOs (USE_MOCK_DB=false)
Server is running on http://localhost:7001
```

**Environment Modes:**
- `development` (default) - Used for local development
- `production` - Used for deployment (set via `NODE_ENV=production`)
- `test` - Automatically set during test runs

## Authentication Flow

### JWT Authentication Architecture

All API routes (except `/api/auth/register` and `/api/auth/login`) require a valid JWT token.

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 1. POST /api/auth/register
       │    { username, email, password }
       ▼
┌─────────────┐
│   Express   │────► Validate input (express-validator)
│   Server    │────► Check if user exists (username/email)
│             │────► Hash password (bcrypt, 10 salt rounds)
│             │────► Create user in MongoDB/Mock DB
└──────┬──────┘────► Generate JWT token (signed with JWT_SECRET)
       │
       │ 2. Returns: { success: true, data: { user, token } }
       ▼
┌─────────────┐
│   Client    │────► Store token in localStorage
│             │────► Store user data in localStorage
└──────┬──────┘
       │
       │ 3. All subsequent requests:
       │    Authorization: Bearer <token>
       │    Content-Type: application/json
       ▼
┌─────────────┐
│  Middleware │────► Extract token from Authorization header
│ authenticate│────► Verify JWT signature with JWT_SECRET
│    Token    │────► Check token expiration
│             │────► Decode user ID and username from token
└──────┬──────┘────► Attach decoded user to req.user
       │
       │ 4. If valid:
       ▼
┌─────────────┐
│   Route     │────► Access req.user.id (from token)
│  Handler    │────► Filter data by userId
│             │────► Return only user's data
└─────────────┘
       │
       │ 5. If invalid/expired:
       ▼
┌─────────────┐
│   Client    │────► Receive 401/403 error
│             │────► Redirect to login or refresh token
└─────────────┘
```

### Authentication Flow Steps

1. **Registration/Login**: User provides credentials → Server validates → Hashes password → Creates/verifies user → Generates JWT token
2. **Token Storage**: Client stores token in `localStorage` or memory
3. **Authenticated Requests**: Client includes token in `Authorization: Bearer <token>` header
4. **Token Verification**: Middleware verifies token signature and expiration
5. **Request Processing**: Route handler accesses `req.user.id` to filter user-specific data
6. **Token Refresh**: Client can call `/api/auth/refresh` to get a new token before expiration

### Authentication Endpoints

#### Register New User

**Endpoint**: `POST /api/auth/register`  
**Authentication**: Not required (public endpoint)  
**Validation**: Email format, username (3-30 chars), password (8+ chars)

**Request:**
```bash
curl -X POST http://localhost:7001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword123",
    "displayName": "John Doe"
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "displayName": "John Doe",
      "preferences": { ... },
      "stats": { ... }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsInVzZXJuYW1lIjoiam9obmRvZSIsImlhdCI6MTY0NzA4NzMyLCJleHAiOjE2NDc2OTM1MzJ9..."
  },
  "message": "User registered successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields or validation failed
- `409 Conflict`: Username or email already exists
- `500 Internal Server Error`: Server error

---

#### Login

**Endpoint**: `POST /api/auth/login`  
**Authentication**: Not required (public endpoint)  
**Note**: The `username` field accepts either username or email

**Request:**
```bash
curl -X POST http://localhost:7001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securepassword123"
  }'
```

**Or with email:**
```bash
curl -X POST http://localhost:7001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john@example.com",
    "password": "securepassword123"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "lastLogin": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

**Error Responses:**
- `400 Bad Request`: Missing username or password
- `401 Unauthorized`: Invalid credentials (generic message to prevent user enumeration)
- `500 Internal Server Error`: Server error

---

#### Verify Token

**Endpoint**: `POST /api/auth/verify`  
**Authentication**: Required (Bearer token)

**Request:**
```bash
curl -X POST http://localhost:7001/api/auth/verify \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com"
    },
    "valid": true
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Token missing
- `403 Forbidden`: Invalid or expired token
- `404 Not Found`: User not found (token valid but user deleted)
- `500 Internal Server Error`: Server error

---

#### Refresh Token

**Endpoint**: `POST /api/auth/refresh`  
**Authentication**: Required (Bearer token)  
**Purpose**: Get a new token with extended expiration without re-authenticating

**Request:**
```bash
curl -X POST http://localhost:7001/api/auth/refresh \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // new token with fresh expiration
  },
  "message": "Token refreshed successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Token missing
- `403 Forbidden`: Invalid or expired token
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

---

#### Logout

**Endpoint**: `POST /api/auth/logout`  
**Authentication**: Optional (token not validated)  
**Note**: This is a stateless logout. Client should delete token from storage.

**Request:**
```bash
curl -X POST http://localhost:7001/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Protected Route Example

All protected routes require the `Authorization: Bearer <token>` header. The middleware automatically verifies the token and attaches user information to `req.user`.

**Example: Get User's Articles**

```bash
curl -X GET http://localhost:7001/api/articles \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": "507f1f77bcf86cd799439012",
      "title": "My Article",
      "userId": "507f1f77bcf86cd799439011",
      "status": "inbox"
    }
  ]
}
```

**Error Responses:**

**Missing Token (401):**
```json
{
  "success": false,
  "message": "Access token required"
}
```

**Invalid/Expired Token (403):**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

**How It Works:**
1. Client sends request with `Authorization: Bearer <token>` header
2. `authenticateToken` middleware extracts and verifies the token
3. If valid, middleware decodes token and sets `req.user = { id: "...", username: "..." }`
4. Route handler uses `req.user.id` to filter data for the authenticated user
5. Response contains only data belonging to that user

### Front-End Integration Example

**JavaScript/React Example:**

```javascript
// Store token after login/register
const response = await fetch('http://localhost:7001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'johndoe', password: 'password123' })
});

const data = await response.json();
if (data.success) {
  localStorage.setItem('authToken', data.data.token);
  localStorage.setItem('authUser', JSON.stringify(data.data.user));
}

// Use token in subsequent requests
const token = localStorage.getItem('authToken');
const articles = await fetch('http://localhost:7001/api/articles', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## API Routes

### Authentication Routes (Public)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Authentication Routes (Protected)
- `POST /api/auth/verify` - Verify JWT token
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout user

### Protected Routes (Require Authentication)
All routes below require `Authorization: Bearer <token>` header:

#### Articles
- `GET /api/articles` - Get user's articles
- `GET /api/articles/:id` - Get specific article
- `POST /api/articles` - Create article
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article
- `PATCH /api/articles/:id/status` - Update status
- `PATCH /api/articles/:id/progress` - Update progress
- `PATCH /api/articles/:id/favorite` - Toggle favorite
- `POST /api/articles/:id/tags` - Add tag
- `DELETE /api/articles/:id/tags/:tagId` - Remove tag

#### Tags
- `GET /api/tags` - Get user's tags
- `GET /api/tags/:id` - Get specific tag
- `POST /api/tags` - Create tag
- `PUT /api/tags/:id` - Update tag
- `DELETE /api/tags/:id` - Delete tag
- `GET /api/tags/:id/articles` - Get articles with tag

#### Highlights
- `GET /api/highlights` - Get user's highlights
- `GET /api/highlights/article/:articleId` - Get article highlights
- `POST /api/highlights` - Create highlight
- `PUT /api/highlights/:id` - Update highlight
- `DELETE /api/highlights/:id` - Delete highlight

#### Feeds
- `GET /api/feeds` - Get user's feeds
- `GET /api/feeds/:id` - Get specific feed
- `POST /api/feeds` - Create feed
- `PUT /api/feeds/:id` - Update feed
- `DELETE /api/feeds/:id` - Delete feed
- `GET /api/feeds/:id/articles` - Get feed articles
- `POST /api/feeds/:id/extract` - Extract from feed
- `POST /api/feeds/extract/all` - Extract from all feeds

#### Users
- `GET /api/users/profile/:id` - Get user profile
- `PUT /api/users/profile/:id` - Update profile
- `PUT /api/users/password/:id` - Change password
- `GET /api/users/stats/:id` - Get user stats
- `DELETE /api/users/:id` - Delete account

## Data Validation

All routes use `express-validator` for input validation:

- **Registration**: Email format, username length (3-30), password length (8+)
- **Articles**: Title required, URL format validation
- **Tags**: Name length (max 50), color hex format
- **Highlights**: Text required, article ownership verified
- **Feeds**: URL format validation

Invalid data returns `400 Bad Request` with detailed error messages.

## Running the Server

```bash
npm run dev
```

This uses `nodemon` to watch for file changes and automatically restart the server. Best for active development.

**What happens:**
- Server starts on `http://localhost:7001`
- Watches all `.js` files for changes
- Automatically restarts when files are modified
- MongoDB connection is established (or shows error if not connected)
- All API routes are available at `/api/*`

**To test the server is running:**

```bash
# In another terminal
curl http://localhost:7001/health

# Or visit in browser: http://localhost:7001/api
```

### Production Mode

Start the server without file watching:

```bash
npm start
```

Use this for:
- Production deployment
- When you don't need auto-restart
- Running in containers/cloud

### Background Mode (Optional)

To run the server in the background:

```bash
# Start in background
npm start &

# View running processes
ps aux | grep node

# Stop the server
pkill -f "node index.js"
```

## Testing

### Run Unit Tests

Execute all test suites:

```bash
npm test
```

This runs Mocha tests and displays results.

### Run Tests with Coverage

Generate code coverage report:

```bash
npm run coverage
```

**Current Coverage (Last Updated: December 7, 2025):**

| File | Statements | Branches | Functions | Lines |
|------|-----------|----------|-----------|-------|
| **All files** | **64.35%** | **63.37%** | **37.5%** | **64.35%** |
| index.js | 67.24% | 16.66% | 100% | 67.24% |
| **routes/** | **72.88%** | **64.76%** | **100%** | **72.88%** |
| articles.js | 70.65% | 56.03% | 100% | 70.65% |
| auth.js | 68.32% | 70.37% | 100% | 68.32% |
| extract.js | 44.82% | 100% | 100% | 44.82% |
| feeds.js | 78.31% | 66.66% | 100% | 78.31% |
| highlights.js | 75.84% | 69.87% | 100% | 75.84% |
| stacks.js | 100% | 75% | 100% | 100% |
| tags.js | 72.79% | 64.58% | 100% | 72.79% |
| users.js | 79.49% | 69.76% | 100% | 79.49% |
| **utils/** | **26.11%** | **40%** | **16.66%** | **26.11%** |
| contentExtractor.js | 20% | 100% | 0% | 20% |
| readingTime.js | 0% | 0% | 0% | 0% |
| youtubeUtils.js | 58.62% | 37.5% | 50% | 58.62% |

**Summary:**
- ✅ **Routes coverage: 72.88%** - All route functions are tested (100%)
- ⚠️ Utils coverage: 26.11% - Utility functions have lower coverage
- 📊 Overall: 64.35% statement coverage
- 📁 Coverage report saved to `coverage/` directory
- 🌐 View detailed HTML report: `coverage/index.html`

**Note:** Sprint 2 requirement of 10% coverage exceeded. Routes have excellent coverage with all functions tested.

### Manual API Testing

Use the provided bash script for quick API testing:

```bash
# Make script executable (first time only)
chmod +x test-api.sh

# Run API tests
./test-api.sh
```

Or test endpoints manually with curl:

```bash
# Test health endpoint
curl http://localhost:7001/health

# Get all articles
curl http://localhost:7001/api/articles

# Get articles by status
curl http://localhost:7001/api/articles?status=inbox

# Get single article
curl http://localhost:7001/api/articles/1
```

## Troubleshooting

### Server won't start

**MongoDB connection error:**
```
MongoDB connection error: MongooseServerSelectionError
```

**This is expected for Sprint 2!** The server will still work because you're using mock data, not the database.

**Why this happens:**
- MongoDB isn't installed/running yet
- Sprint 2 uses mock data from `back-end/data/` files
- Database connection will be needed in Sprint 3

**Solutions:**
1. **Ignore the error** - Server still works with mock data
2. **Optional:** Set up MongoDB for Sprint 3 preparation:
   - Check if MongoDB is running: `docker ps`
   - Verify `DB_CONNECTION_STRING` in `.env`

**Port already in use:**
```
Error: listen EADDRINUSE: address already in use :::7001
```

**Solutions:**
```bash
# Find process using port 7001
lsof -i :7001

# Kill the process
kill -9 <PID>

# Or change port in .env file
PORT=7002
```

### Tests fail

**No tests found:**
- Ensure test files are in `test/` directory
- Test files must end with `.test.js`

**Coverage below 10%:**
- Add more test cases
- Run `npm run coverage` to see which files need tests

## API Endpoints

### Base URL

- Development: `http://localhost:7001/api`

### Articles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/articles` | Get all articles (supports filtering) |
| GET | `/api/articles/:id` | Get single article by ID |
| POST | `/api/articles` | Create new article |
| PUT | `/api/articles/:id` | Update article |
| DELETE | `/api/articles/:id` | Delete article |
| PATCH | `/api/articles/:id/status` | Update article status |
| PATCH | `/api/articles/:id/progress` | Update reading progress |
| PATCH | `/api/articles/:id/favorite` | Toggle favorite status |

#### Query Parameters (GET /api/articles)

- `status` - Filter by status (inbox, daily, continue, rediscovery, archived)
- `tag` - Filter by tag name
- `untagged` - Filter articles with no tags (true/false)
- `favorite` - Filter favorites (true/false)

#### Examples

```bash
# Get all articles
curl http://localhost:7001/api/articles

# Get articles in inbox
curl http://localhost:7001/api/articles?status=inbox

# Get favorite articles
curl http://localhost:7001/api/articles?favorite=true

# Get single article
curl http://localhost:7001/api/articles/1

# Create new article
curl -X POST http://localhost:7001/api/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Article",
    "url": "https://example.com",
    "author": "John Doe",
    "source": "Example Site",
    "tags": ["web", "development"]
  }'

# Update article status
curl -X PATCH http://localhost:7001/api/articles/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "daily"}'

# Toggle favorite
curl -X PATCH http://localhost:7001/api/articles/1/favorite \
  -H "Content-Type: application/json" \
  -d '{"isFavorite": true}'
```

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server and database health status |

## Project Structure

```
back-end/
├── routes/              # API route handlers
│   ├── index.js        # Main router
│   └── articles.js     # Articles routes
├── controllers/         # Business logic (future use)
├── middleware/          # Custom middleware
├── test/               # Test files
├── index.js            # App entry point
├── package.json        # Dependencies
├── .env                # Environment variables (not in git)
├── .env.example        # Environment template
```

## Running Tests

The project uses Mocha and Chai for testing with c8 for code coverage.

### Execute Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run coverage
```

### Writing Tests

Tests should be placed in the `test/` directory. Example:

```javascript
// test/articles.test.js
const request = require('supertest');
const app = require('../index');
const { expect } = require('chai');

describe('GET /api/articles', () => {
  it('should return all articles', (done) => {
    request(app)
      .get('/api/articles')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.success).to.be.true;
        expect(res.body.data).to.be.an('array');
        done();
      });
  });
});
```

### Coverage Requirements

- Minimum code coverage: **10%**
- Target coverage: **20%+**

## Development Workflow

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Run tests: `npm test`
4. Check coverage: `npm run coverage`
5. Commit and push
6. Create a Pull Request
7. Get peer review
8. Merge after approval

## Security Notes

- **Never commit `.env` files** - They contain sensitive credentials
- The `.env` file is in `.gitignore` to prevent accidental commits
- Use `.env.example` as a template for required variables
- Submit your `.env` to course staff via Discord (not in git)

## Troubleshooting

### Port Already in Use

If port 7001 is already in use:

```bash
# Find process using port 7001
lsof -i :7001  # Mac/Linux
netstat -ano | findstr :7001  # Windows

# Kill the process or change PORT in .env
```

### MongoDB Connection Error

```bash
# Check if MongoDB is running
docker ps  # If using Docker

# Restart MongoDB container
docker restart mongodb_fieldnotes

# Check connection string in .env
```

### Module Not Found Errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Tests Failing

```bash
# Ensure server is not running on test port
# Check that all dependencies are installed
npm install

# Run tests with verbose output
npm test -- --reporter spec
```

## Current Development Status

### Test Results (Last Updated: December 7, 2025)

**✅ All Tests Passing: 260 tests in 992ms**

Test suites breakdown:
- ✅ Articles API: 23 tests
- ✅ Auth API: 58 tests (registration, login, token verification, refresh, logout)
- ✅ Feeds API: 30 tests
- ✅ Highlights API: 22 tests (helpers + route integration)
- ✅ Tags API: 28 tests (including tag normalization bug fixes)
- ✅ Users API: 25 tests
- ✅ Stacks API: 5 tests
- ✅ RSS Feed Extraction API: 9 tests
- ✅ RSS Service: 12 tests
- ✅ Integration Tests: 48 tests (article lifecycle, auth flow, feed/article management, tag management, error handling, filtering, highlights)

### Feature Completion Status

- ✅ Express server setup
- ✅ MongoDB connection configured (Atlas + mock mode)
- ✅ CORS enabled
- ✅ JWT Authentication & Authorization
- ✅ Articles API (complete with mock + MongoDB DAOs)
- ✅ Feeds API (complete with RSS extraction)
- ✅ Tags API (complete with normalization)
- ✅ Users/Auth API (complete)
- ✅ Highlights API (complete with annotations)
- ✅ Stacks API (complete)
- ✅ Test suite (260 tests, comprehensive coverage)
- ✅ Database integration (MongoDB Atlas + mock DAOs)


## Complete Environment Variables Summary

All environment variables (including those that are optional) are documented in `.env.example`. Please still refer to the .env.example for a basic requirement in the .env file. Here's a quick reference of all variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `7001` | Server port number |
| `NODE_ENV` | No | `development` | Environment mode |
| `MONGODB_URI` | Conditional | - | MongoDB connection string (required if `USE_MOCK_DB=false`) |
| `USE_MOCK_DB` | No | `false` | Use mock data (`true`) or MongoDB (`false`) |
| `JWT_SECRET` | Yes | `dev-secret...` | Secret key for JWT signing (⚠️ change in production!) |
| `JWT_EXPIRES_IN` | No | `7d` | Token expiration time |
| `FRONTEND_URL` | No | - | CORS origin (optional) |

**Quick Setup:**
1. Copy `.env.example` to `.env`
2. For development with mock data: Set `USE_MOCK_DB=true`
3. For production: Set `USE_MOCK_DB=false` and provide `MONGODB_URI`
4. Generate a secure `JWT_SECRET` for production

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Mocha Testing Framework](https://mochajs.org/)
- [Chai Assertion Library](https://www.chaijs.com/)
- [MongoDB Atlas Setup](https://www.mongodb.com/cloud/atlas)
- [JWT.io - JWT Debugger](https://jwt.io/) - Debug and verify JWT tokens

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for team guidelines and workflow.

## License

See [LICENSE.md](../LICENSE.md)
