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
[Agile Software Development and DevOps](https://knowledge.kitchen/content/courses/agile-development-and-devops/syllabus/) course taught at NYU by [Professor Amos Bloomberg](https://knowledge.kitchen/me/cv/), we decided to work on **fieldnotes.** We hope that our project proves as useful to you in actively, and thoughfully reading in the face of the immense information landscape of the digital age.

## Setup Instructions

### Start at the Root Directory - run this to install all dependencies
```bash
npm install
```

### Back-End Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/agile-students-fall2025/4-final-random_grandeeism.git
   cd 4-final-random_grandeeism
   ```

2. Install back-end dependencies:
   ```bash
   cd back-end
   npm install
   ```

3. Create a `.env` file in the back-end directory and configure the environment variables (see the "Environment Variables" section below).

4. Start the back-end development server:
   ```bash
   npm start
   ```
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

5. The back-end will run on `http://localhost:7001` by default.

### Front-End Setup

1. Install front-end dependencies:
   ```bash
   cd front-end
   npm install
   ```

2. Start the front-end development server:
   ```bash
   npm run dev
   ```

3. The front-end will run on `http://localhost:5173` by default.

### Key Features

- **Export Notes**: Users can export their article notes and highlights in multiple formats (Markdown, PDF, Plain Text) directly to their device. PDF generation is handled client-side using jsPDF library for a seamless experience.

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
- `USE_MOCK_DB`: Set to `true` for mock data or `false` for MongoDB
- `FRONTEND_URL`: URL of the front-end application for CORS (default: http://localhost:5174)
- `JWT_SECRET`: Secret key for signing JWT tokens
- `JWT_EXPIRES_IN`: JWT token expiration time (default: 7d)

### Example `.env` file:
```env
# Server Configuration
PORT=7001
NODE_ENV=development

# Database Configuration - Using Mock Data
USE_MOCK_DB=true

# Front-End URL (for CORS)
FRONTEND_URL=http://localhost:5174

# JWT Authentication
JWT_SECRET=your-super-secret-and-long-string-for-signing-tokens
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

3. Check code coverage (currently **78.08%** - exceeds 10% requirement):
   ```bash
   npm run coverage
   ```

4. Run integrity verification tests:
   ```bash
   npm run verify:integrity
   ```

### Test Coverage Summary
- **Total Coverage**: 78.08% (requirement: ≥10%)
- **220 passing tests** covering all API endpoints
- **Unit tests** use Mocha and Chai frameworks
- **Integration tests** verify full API functionality
- **Mock DAOs** provide consistent test data

### Available Test Scripts
- `npm test` - Run all tests
- `npm run coverage` - Generate coverage report
- `npm run verify:integrity` - Verify DAO layer integrity
- `npm run verify:parity` - Check data consistency

## Technical Implementation

### Back-End Architecture
- **Framework**: Express.js (version 5.1.0)
- **Database**: Mock DAOs (in-memory) with MongoDB support
- **Authentication**: JWT-based with bcrypt password hashing
- **Testing**: Mocha + Chai with C8 coverage reporting
- **Code Coverage**: 78.08% (exceeds 10% requirement)

### Data Access Layer
- **DAO Factory Pattern**: Switches between Mock and MongoDB implementations
- **Mock Data**: Consistent test data from `/back-end/data/` directory
- **In-Memory Operations**: Full CRUD operations without persistence

### API Features
- **RESTful Design**: Standard HTTP methods and status codes
- **Error Handling**: Consistent JSON error responses
- **Input Validation**: Request body validation for all endpoints
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
- Verify backend is running: `curl http://localhost:7001/api/articles`
- Check API base URL in `/front-end/src/services/api.js`
- Ensure no firewall is blocking port 7001

## Want to contribute?

 Read our rules about [contributing](CONTRIBUTING.md#contributing-rules) as well as instructions on [setting up the local development environment](CONTRIBUTING.md#instructions-for-setting-up-the-local-environment) and [building and testing](CONTRIBUTING.md#build-and-test-instructions)
