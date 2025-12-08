# Fieldnotes: The Read Later App

[![log github events](https://github.com/agile-students-fall2025/4-final-random_grandeeism/actions/workflows/event-logger.yml/badge.svg)](https://github.com/agile-students-fall2025/4-final-random_grandeeism/actions/workflows/event-logger.yml)

## Product Vision Statement

In the current internet age there is a incomprehensible and immense amount of interesting content to peruse yet theres little time to read or consume in the moment upon encountering something new to read, and its liable to be forgotten. **Fieldnotes** is a mobile web app that can be used to save articles, podcasts, youtube videos to be resurfaced for later (optional offline) reading and annotating.

## Team Members

- [Zeba Shafi](https://github.com/Zeba-Shafi)
- [Sheik Anas Ally Ozeer](https://github.com/anas-ozeer)
- [Saad Sifar](https://github.com/one-loop)
- [Shaurya Srivastava](https://github.com/shauryasr04)
- [Jeffrey Chen](https://github.com/shauryasr04)
- [Our team norms and values](CONTRIBUTING.md#team-norms)

## How this project came to be

After the shutdown of the FOSS project Omnivore, we found ourselves searching for a tool that could truly respect both our reading habits and our data. That search quickly turned into a desire to build our own **FOSS “read it later” app**—not just as a replacement, but as a way to preserve the philosophy behind these tools: empowering readers to **capture, curate, and revisit** meaningful content on their own terms. Read-it-later apps have always existed at the intersection of **attention, agency, and knowledge management**, helping people reclaim the web from the endless scroll. For more reading on the power of the read-it-later app, check out [this article](https://medium.com/praxis-blog/the-secret-power-of-read-it-later-apps-6c75cc37ef42) by Tiago Forte, one of the most prominent experts on productivity in our highly distractable and overwhelming digital age.
Therefore for our  
[Agile Software Development and DevOps](https://knowledge.kitchen/content/courses/agile-development-and-devops/syllabus/) course taught at NYU by [Professor Amos Bloomberg](https://knowledge.kitchen/me/cv/), we decided to work on **Fieldnotes**. We hope that our project proves as useful to you in actively, and thoughfully reading in the face of the immense information landscape of the digital age.

## Setup Instructions

### Prerequisites

- Node.js v18.x or higher
- npm
- MongoDB Atlas account (for production) or use mock data mode

### Quick Start (Recommended)

Both back-end and front-end can be started with `npm start`:

**Back-End:**
```bash
cd back-end
npm install
npm start    # Runs in development mode by default
```

**Front-End:**
```bash
cd front-end
npm install
npm start    # Starts Vite dev server with HMR
```

This is the recommended setup for both **development** and **deployment**.

### Detailed Setup

#### Back-End Setup

1. Navigate to the back-end directory:
   ```bash
   cd back-end
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update with your MongoDB URI and JWT secret
   - See [back-end/README.md](back-end/README.md) for detailed configuration

4. Start the server:
   ```bash
   npm start              # Standard start (development mode by default)
   npm run dev            # Development with auto-restart
   NODE_ENV=production npm start  # Production mode
   ```

5. The back-end runs on `http://localhost:7001` by default.

**Environment Modes:**
- `development` (default) - Local development with detailed logging
- `production` - Deployment mode (set via `NODE_ENV=production`)
- `test` - Automatically used during test runs

#### Front-End Setup

1. Navigate to the front-end directory:
   ```bash
   cd front-end
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start         # Starts Vite dev server
   npm run dev       # Same as npm start
   npm run build     # Build for production
   npm run preview   # Preview production build
   ```

4. The front-end runs on `http://localhost:5173` by default.

### Key Features

- **Article Management**: Save, organize, and read articles with status tracking (inbox, continue, daily, rediscovery, archived)
- **Tag System**: Organize articles with custom tags and intelligent tag management
- **Highlighting & Annotations**: Highlight text passages and add notes with color-coded highlights
- **Export Notes**: Export article notes and highlights in multiple formats (Markdown, PDF, Plain Text)
- **Reading Progress**: Track reading progress with automatic completion detection
- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **Content Extraction**: Automatic content extraction from URLs with metadata parsing
- **Responsive Design**: Mobile-first responsive design with theme support (light/dark)

## API Endpoints

### Articles API
- `GET /api/articles` - Retrieve all articles (supports filtering by status, tag, favorite, untagged)
- `GET /api/articles/:id` - Retrieve a single article by ID
- `POST /api/articles` - Create a new article
- `PUT /api/articles/:id` - Update an article
- `DELETE /api/articles/:id` - Delete an article
- `PATCH /api/articles/:id/status` - Update article status
- `PATCH /api/articles/:id/progress` - Update reading progress
- `PATCH /api/articles/:id/favorite` - Toggle favorite status
- `POST /api/articles/:id/tags` - Add tag to article
- `DELETE /api/articles/:id/tags/:tagId` - Remove tag from article

### Authentication API
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Verify JWT token
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout

### Feeds API
- `GET /api/feeds` - Retrieve all feeds (supports filtering by category, status)
- `GET /api/feeds/:id` - Retrieve a single feed by ID
- `POST /api/feeds` - Create a new feed
- `PUT /api/feeds/:id` - Update a feed
- `DELETE /api/feeds/:id` - Delete a feed
- `GET /api/feeds/:id/articles` - Get articles from a specific feed

### Tags API
- `GET /api/tags` - Retrieve all tags (supports sorting by popular)
- `GET /api/tags/:id` - Retrieve a single tag by ID
- `POST /api/tags` - Create a new tag
- `PUT /api/tags/:id` - Update a tag
- `DELETE /api/tags/:id` - Delete a tag
- `GET /api/tags/:id/articles` - Get articles with a specific tag

### Users API
- `GET /api/users/profile/:id` - Get user profile
- `PUT /api/users/profile/:id` - Update user profile
- `PUT /api/users/password/:id` - Change user password
- `GET /api/users/stats/:id` - Get user reading statistics
- `DELETE /api/users/:id` - Delete user account

### Highlights API
- `GET /api/highlights` - Retrieve all highlights (supports filtering by user, article)
- `GET /api/highlights/:id` - Retrieve a single highlight by ID
- `POST /api/highlights` - Create a new highlight
- `PUT /api/highlights/:id` - Update a highlight
- `DELETE /api/highlights/:id` - Delete a highlight

### Content Extraction API
- `POST /api/extract` - Extract metadata and content from a URL

_All API endpoints return JSON responses with consistent error handling and status codes._

## Environment Variables

The following environment variables are required in the `back-end/.env` file:

- `PORT`: Port number for the back-end server (default: 7001)
- `NODE_ENV`: Set to `development` or `production`
- `MONGODB_URI`: MongoDB Atlas connection string (required for production)
- `USE_MOCK_DB`: Set to `true` for mock data or `false` for MongoDB Atlas
- `FRONTEND_URL`: URL of the front-end application for CORS (default: http://localhost:5173)
- `JWT_SECRET`: Secret key for signing JWT tokens
- `JWT_EXPIRES_IN`: JWT token expiration time (default: 7d)

### Example `.env` file:
```env
# Server Configuration
PORT=7001
NODE_ENV=development

# Database Configuration - MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fieldnotes?retryWrites=true&w=majority
USE_MOCK_DB=false

# Front-End URL (for CORS)
FRONTEND_URL=http://localhost:5173

# JWT Authentication
JWT_SECRET=your-super-secret-and-long-string-for-signing-tokens-change-in-production
JWT_EXPIRES_IN=7d
```

**Note**: The `.env` file is not included in version control for security reasons.

## Testing Procedures

### Back-End Testing

1. Navigate to the back-end directory:
   ```bash
   cd back-end
   ```

2. Run all tests:
   ```bash
   npm test
   ```

3. Check code coverage (currently **64.35%** overall, **72.88%** routes - exceeds 10% requirement):
   ```bash
   npm run coverage
   ```

4. Run integrity verification tests:
   ```bash
   npm run verify:integrity
   ```

### Test Coverage Summary (Last Updated: December 7, 2025)

**✅ All Tests Passing: 260 tests in ~1 second**

- **Total Coverage**: 64.35% statements, 63.37% branches
- **Routes Coverage**: 72.88% with 100% function coverage
- **Test Suites**: 
  - Articles API: 23 tests
  - Auth API: 58 tests (registration, login, token verification, refresh, logout)
  - Feeds API: 30 tests
  - Highlights API: 22 tests
  - Tags API: 28 tests (including normalization bug fixes)
  - Users API: 25 tests
  - Stacks API: 5 tests
  - RSS Service: 21 tests
  - Integration Tests: 48 tests

**Detailed Coverage by Module:**
- Routes (All API endpoints): 72.88% - All route functions tested
- Utils (Helper functions): 26.11% - Core utilities tested
- Overall: Significantly exceeds Sprint 2's 10% minimum requirement

### Available Test Scripts
- `npm test` - Run all tests with mock data
- `npm run coverage` - Generate detailed coverage report (saved to `coverage/`)
- `npm run verify:integrity` - Verify DAO layer integrity
- `npm run verify:parity` - Check data consistency

## Technical Implementation

### Back-End Architecture
- **Framework**: Express.js with Node.js
- **Database**: MongoDB Atlas (cloud) with Mongoose ODM
- **Authentication**: JWT-based with bcrypt password hashing (12 rounds)
- **Data Validation**: express-validator middleware for comprehensive input validation
- **Testing**: Custom integration test suite with 100% success rate

### Database Integration
- **MongoDB Atlas**: Cloud-hosted MongoDB database
- **Mongoose ODM**: Object Document Mapping for MongoDB
- **DAO Factory Pattern**: Switches between Mock and MongoDB implementations
- **Environment Variables**: Secure credential management with dotenv
- **Data Validation**: XSS protection and input sanitization

### Security Features
- **JWT Authentication**: 7-day token expiration with secure signing
- **Password Hashing**: bcrypt with 12-round salting
- **Input Validation**: Comprehensive validation schemas for all endpoints
- **XSS Protection**: Input sanitization with .escape() and .trim()
- **Environment Security**: .env files excluded from version control

### API Features
- **RESTful Design**: Standard HTTP methods and status codes
- **Error Handling**: Consistent JSON error responses with proper status codes
- **Input Validation**: Request body validation for all POST/PUT endpoints
- **Authentication Middleware**: Protected routes with JWT verification
- **CORS Configuration**: Supports cross-origin requests from front-end

## Troubleshooting

### Common Issues

**Server does not start**
- Check if all dependencies are installed: `npm install`
- Verify `.env` file exists in `/back-end/` directory
- Ensure port 7001 is not already in use

**API requests fail with CORS errors**
- Verify `FRONTEND_URL` in `.env` matches your front-end URL
- Check that both servers are running (backend: 7001, frontend: 5173/5174)
- Restart both servers after changing CORS configuration

**Tests fail unexpectedly**
- Run `npm run verify:integrity` to check DAO layer
- Ensure you're in the `/back-end/` directory when running tests
- Check that mock data files exist in `/back-end/data/`

**Front-end cannot connect to backend**
- Verify backend is running: `curl http://localhost:7001/health`
- Check API base URL in `/front-end/src/services/api.js`
- Ensure no firewall is blocking port 7001

**Database connection issues**
- Verify `MONGODB_URI` in `.env` file is correct
- Check MongoDB Atlas cluster is running and accessible
- Test connection: MongoDB connection status shown at `/health` endpoint
- Fallback to mock data: set `USE_MOCK_DB=true` in `.env`

**Authentication errors**
- Ensure `JWT_SECRET` is set in `.env` file
- Check token expiration with `JWT_EXPIRES_IN` setting
- Verify user credentials are correct for login/registration

## Want to contribute?

 Read our rules about [contributing](CONTRIBUTING.md#contributing-rules) as well as instructions on [setting up the local development environment](CONTRIBUTING.md#instructions-for-setting-up-the-local-environment) and [building and testing](CONTRIBUTING.md#build-and-test-instructions)
