# Fieldnotes Back-End

Express.js REST API for the Fieldnotes read-it-later application.

## Tech Stack

- **Express.js** v5.1.0 - Web framework
- **MongoDB** with Mongoose v8.19.2 - Database
- **JWT** - Authentication
- **Mocha & Chai** - Testing
- **c8** - Code coverage

## Prerequisites

- Node.js v18.x or higher
- npm
- MongoDB (Atlas cloud or local Docker instance)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and update with your values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=7001
NODE_ENV=development
DB_CONNECTION_STRING=mongodb://admin:secret@localhost:27017/fieldnotes?authSource=admin
JWT_SECRET=your-super-secret-and-long-string-for-signing-tokens
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:7002
```

**For MongoDB Atlas (cloud):**

```env
DB_CONNECTION_STRING=mongodb+srv://<username>:<password>@cluster0.mongodb.net/fieldnotes
```

**For Local Docker MongoDB:**

```bash
# Start MongoDB in Docker
docker run --name mongodb_fieldnotes -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=secret \
  -d mongo:latest
```

Then use:

```env
DB_CONNECTION_STRING=mongodb://admin:secret@localhost:27017/fieldnotes?authSource=admin
```

### 3. Run the Server

**Development mode (with auto-restart):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

The server will start on `http://localhost:7001`

## Running the Server

### Development Mode

Start the server with automatic restart on file changes:

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
