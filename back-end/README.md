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

Edit `.env` with your MongoDB Atlas connection string:

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://fieldnotes-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/fieldnotes?retryWrites=true&w=majority

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-minimum-32-characters-long

# Server Configuration
PORT=7001
USE_MOCK_DB=false
```

**⚠️ Security Notes:**
- Never commit `.env` to git (already in `.gitignore`)
- Use a strong, unique JWT_SECRET (at least 32 characters)
- Generate JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 4. Run the Server

**Development mode (with auto-restart):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

The server will start on `http://localhost:7001`

You should see:
```
✅ Connected to MongoDB Atlas
🗄️  Using MongoDB DAOs (USE_MOCK_DB=false)
Server is running on http://localhost:7001
```

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
│   Express   │────► Hash password (bcrypt)
│   Server    │────► Create user in MongoDB
└──────┬──────┘────► Generate JWT token
       │
       │ 2. Returns: { user, token }
       ▼
┌─────────────┐
│   Client    │────► Store token in localStorage
└──────┬──────┘
       │
       │ 3. All subsequent requests:
       │    Authorization: Bearer <token>
       ▼
┌─────────────┐
│  Middleware │────► Verify JWT signature
│    Auth     │────► Decode user ID from token
└──────┬──────┘────► Attach user to req.user
       │
       │ 4. If valid:
       ▼
┌─────────────┐
│   Route     │────► Access req.user.id
│  Handler    │────► Filter data by userId
└─────────────┘────► Return only user's data
```

### Authentication Endpoints

#### Register New User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123",
  "displayName": "John Doe" // optional
}

# Response:
{
  "success": true,
  "data": {
    "user": { "id": "...", "username": "johndoe", ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",  // or email
  "password": "securepassword123"
}

# Response:
{
  "success": true,
  "data": {
    "user": { "id": "...", "username": "johndoe", ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Verify Token
```bash
POST /api/auth/verify
Authorization: Bearer <token>

# Response:
{
  "success": true,
  "data": {
    "user": { "id": "...", "username": "johndoe", ... },
    "valid": true
  }
}
```

#### Refresh Token
```bash
POST /api/auth/refresh
Authorization: Bearer <old-token>

# Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // new token
  }
}
```

### Protected Route Example

```bash
# Get user's articles (requires authentication)
GET /api/articles
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Response: Only returns articles belonging to authenticated user
{
  "success": true,
  "count": 10,
  "data": [ ... ]
}

# Without token or invalid token:
{
  "success": false,
  "message": "Access token required"  // 401
}

# Trying to access another user's data:
{
  "success": false,
  "error": "Access denied: You can only view your own articles"  // 403
}
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

**Requirements:**
- Minimum 10% code coverage required for Sprint 2
- Coverage report saved to `coverage/` directory
- View HTML report: `coverage/index.html`

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

- ✅ Express server setup
- ✅ MongoDB connection configured
- ✅ CORS enabled
- ✅ Basic routing structure
- ✅ Articles API (all endpoints with mock data)
- ⏳ Feeds API (pending)
- ⏳ Tags API (pending)
- ⏳ Users/Auth API (pending)
- ⏳ Highlights API (pending)
- ⏳ Test suite (pending)
- ⏳ Database integration (next sprint)

## Sprint Goals

This sprint focuses on:

1. Creating all API routes with mock data
2. Integrating front-end with back-end
3. Writing unit tests (10%+ coverage)
4. Ensuring full front-end ↔ back-end communication

**Note:** Data does not need to persist yet. Database integration comes in Sprint 3.

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Mocha Testing Framework](https://mochajs.org/)
- [Chai Assertion Library](https://www.chaijs.com/)
- [MongoDB Atlas Setup](https://www.mongodb.com/cloud/atlas)

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for team guidelines and workflow.

## License

See [LICENSE.md](../LICENSE.md)
