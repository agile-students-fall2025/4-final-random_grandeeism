# Sprint 3: MongoDB + JWT Authentication - Planning Document

**Sprint Duration**: 1 Day (Monday)  
**Deadline**: Monday Night  
**Team Size**: 5 Members  
**Current Branch**: `sprint-3-mongodb-jwt-auth`

---

## Sprint Goals

- ✅ MongoDB Atlas setup and connection
- ✅ JWT authentication implementation
- ✅ Protected routes with authorization
- ✅ Data validation on all endpoints
- ✅ Environment variable configuration
- ✅ User preferences persistence to MongoDB

---

## Phase 1: Foundation Setup (2-3 hours)
**Priority**: CRITICAL - Must be done first  
**Dependencies**: None

### Task 1.1: MongoDB Atlas Setup & Connection
**Assignee**: **Team Member 1** (Database Lead)  
**Time**: 1.5 hours  
**Files to modify**:
- `back-end/.env.example`
- `back-end/index.js`
- `back-end/lib/daoFactory.js`

**Deliverables**:
1. Create MongoDB Atlas free tier account
2. Set up database cluster
3. Create database user with credentials
4. Whitelist IP addresses (0.0.0.0/0 for development)
5. Get connection string
6. Update `.env.example` with:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fieldnotes?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   PORT=7001
   USE_MOCK_DB=false
   ```
7. Uncomment MongoDB connection in `back-end/index.js`:
   ```javascript
   mongoose.connect(process.env.MONGODB_URI)
     .then(() => console.log('✅ Connected to MongoDB Atlas'))
     .catch((error) => console.error('❌ MongoDB connection error:', error));
   ```
8. Test connection with `npm start`
9. Share `.env` file in team messenger (DO NOT COMMIT)

**Acceptance Criteria**:
- [ ] MongoDB Atlas cluster running
- [ ] Connection successful from local machine
- [ ] Console shows "Connected to MongoDB Atlas"
- [ ] `.env` file shared with team via messenger

---

### Task 1.2: Install Required Dependencies
**Assignee**: **Team Member 1** (Database Lead)  
**Time**: 30 minutes  
**Files to modify**:
- `back-end/package.json`

**Deliverables**:
1. Install authentication packages:
   ```bash
   cd back-end
   npm install jsonwebtoken bcrypt express-validator
   ```
2. Verify existing packages:
   - `mongoose` (should already be installed)
   - `dotenv` (should already be installed)
3. Update `package.json` if needed
4. Commit changes

**Acceptance Criteria**:
- [ ] All packages installed successfully
- [ ] No dependency conflicts
- [ ] `package.json` updated and committed

---

### Task 1.3: DAO Factory Configuration
**Assignee**: **Team Member 1** (Database Lead)  
**Time**: 30 minutes  
**Files to modify**:
- `back-end/lib/daoFactory.js`

**Deliverables**:
1. Update DAO factory to default to MongoDB:
   ```javascript
   const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true';
   ```
2. Ensure all MongoDB DAOs are properly required
3. Test switching between Mock and MongoDB modes
4. Document usage in comments

**Acceptance Criteria**:
- [ ] DAO factory switches based on USE_MOCK_DB environment variable
- [ ] Default is MongoDB (USE_MOCK_DB=false)
- [ ] Mock mode still works for testing

---

## Phase 2: Authentication System (3-4 hours)
**Priority**: HIGH - Core security feature  
**Dependencies**: Phase 1 complete

### Task 2.1: JWT Middleware Implementation
**Assignee**: **Team Member 2** (Auth Lead)  
**Time**: 1.5 hours  
**Files to create/modify**:
- `back-end/middleware/auth.js` (CREATE NEW)
- `back-end/middleware/validation.js` (CREATE NEW)

**Deliverables**:
1. Create `back-end/middleware/auth.js`:
   ```javascript
   const jwt = require('jsonwebtoken');
   const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

   const authenticateToken = (req, res, next) => {
     const authHeader = req.headers['authorization'];
     const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

     if (!token) {
       return res.status(401).json({ 
         success: false, 
         message: 'Access token required' 
       });
     }

     jwt.verify(token, JWT_SECRET, (err, user) => {
       if (err) {
         return res.status(403).json({ 
           success: false, 
           message: 'Invalid or expired token' 
         });
       }
       req.user = user;
       next();
     });
   };

   const optionalAuth = (req, res, next) => {
     const authHeader = req.headers['authorization'];
     const token = authHeader && authHeader.split(' ')[1];

     if (token) {
       jwt.verify(token, JWT_SECRET, (err, user) => {
         if (!err) {
           req.user = user;
         }
       });
     }
     next();
   };

   module.exports = { authenticateToken, optionalAuth };
   ```

2. Create `back-end/middleware/validation.js`:
   ```javascript
   const { body, validationResult } = require('express-validator');

   const validateRegistration = [
     body('email').isEmail().normalizeEmail(),
     body('username').isLength({ min: 3, max: 30 }).trim().escape(),
     body('password').isLength({ min: 8 }),
     body('displayName').optional().isLength({ max: 100 }).trim()
   ];

   const validateLogin = [
     body('email').isEmail().normalizeEmail(),
     body('password').notEmpty()
   ];

   const handleValidationErrors = (req, res, next) => {
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
       return res.status(400).json({ 
         success: false, 
         errors: errors.array() 
       });
     }
     next();
   };

   module.exports = { 
     validateRegistration, 
     validateLogin, 
     handleValidationErrors 
   };
   ```

**Acceptance Criteria**:
- [ ] JWT middleware extracts and verifies tokens
- [ ] Returns 401 for missing tokens
- [ ] Returns 403 for invalid/expired tokens
- [ ] Attaches user data to req.user
- [ ] Validation middleware validates all input fields

---

### Task 2.2: Update Auth Routes with JWT
**Assignee**: **Team Member 2** (Auth Lead)  
**Time**: 2 hours  
**Files to modify**:
- `back-end/routes/auth.js`

**Deliverables**:
1. Update signup endpoint:
   - Hash password with bcrypt (10 salt rounds)
   - Validate input with express-validator
   - Create user in MongoDB
   - Generate JWT token
   - Return token + user data (without password)

2. Update login endpoint:
   - Validate credentials
   - Compare password with bcrypt
   - Generate JWT token (24h expiry)
   - Return token + user data

3. Add token refresh endpoint:
   ```javascript
   router.post('/refresh', authenticateToken, async (req, res) => {
     // Generate new token
   });
   ```

4. Add logout endpoint (optional - client-side only):
   ```javascript
   router.post('/logout', (req, res) => {
     res.json({ success: true, message: 'Logged out successfully' });
   });
   ```

**Acceptance Criteria**:
- [ ] Signup creates user and returns JWT
- [ ] Login validates credentials and returns JWT
- [ ] Passwords are hashed with bcrypt
- [ ] Tokens expire after 24 hours
- [ ] No passwords returned in responses
- [ ] All inputs validated

---

## Phase 3: Protected Routes (2-3 hours)
**Priority**: HIGH - Security implementation  
**Dependencies**: Phase 2 complete

### Task 3.1: Protect User Routes
**Assignee**: **Team Member 3** (Routes Lead)  
**Time**: 1 hour  
**Files to modify**:
- `back-end/routes/users.js`

**Deliverables**:
1. Add authentication middleware to all routes:
   ```javascript
   const { authenticateToken } = require('../middleware/auth');
   
   router.get('/profile/:id', authenticateToken, async (req, res) => {
     // Verify req.user.id matches :id or user is admin
   });
   
   router.put('/profile/:id', authenticateToken, async (req, res) => {
     // Verify req.user.id matches :id
   });
   ```

2. Add user ownership verification:
   - Users can only access/modify their own data
   - Check `req.user.id === req.params.id`

3. Add data validation to update endpoints

**Acceptance Criteria**:
- [ ] All routes require authentication
- [ ] Users can only access their own data
- [ ] Returns 403 if user tries to access other user's data
- [ ] Input validation on all updates

---

### Task 3.2: Protect Articles Routes
**Assignee**: **Team Member 4** (Routes Lead)  
**Time**: 1 hour  
**Files to modify**:
- `back-end/routes/articles.js`

**Deliverables**:
1. Add authentication to all routes:
   ```javascript
   router.get('/', authenticateToken, async (req, res) => {
     // Return only current user's articles
   });
   
   router.post('/', authenticateToken, validateArticle, handleValidationErrors, async (req, res) => {
     // Create article for current user
   });
   
   router.put('/:id', authenticateToken, async (req, res) => {
     // Verify article belongs to current user
   });
   
   router.delete('/:id', authenticateToken, async (req, res) => {
     // Verify article belongs to current user
   });
   ```

2. Filter queries by `userId`:
   ```javascript
   const articles = await articlesDao.getAll(req.user.id);
   ```

3. Add article ownership verification

**Acceptance Criteria**:
- [ ] All routes require authentication
- [ ] Users only see their own articles
- [ ] Users can only modify/delete their own articles
- [ ] Article creation includes userId

---

### Task 3.3: Protect Remaining Routes
**Assignee**: **Team Member 5** (Routes Lead)  
**Time**: 1.5 hours  
**Files to modify**:
- `back-end/routes/tags.js`
- `back-end/routes/highlights.js`
- `back-end/routes/feeds.js`
- `back-end/routes/stacks.js`

**Deliverables**:
1. Add authentication to all tag routes
2. Add authentication to all highlight routes
3. Add authentication to all feed routes
4. Add authentication to all stack routes
5. Filter all queries by `userId`
6. Add ownership verification to update/delete operations
7. Add data validation where needed

**Acceptance Criteria**:
- [ ] All routes require authentication
- [ ] All data filtered by userId
- [ ] Ownership verification on modifications
- [ ] Input validation on create/update

---

## Phase 4: Data Validation & Testing (2-3 hours)
**Priority**: MEDIUM - Quality assurance  
**Dependencies**: Phase 3 complete

### Task 4.1: Add Data Validation to All Endpoints
**Assignee**: **Team Member 3** (Validation Lead)  
**Time**: 1.5 hours  
**Files to modify**:
- All route files

**Deliverables**:
1. Create validation schemas for:
   - Article creation/update
   - Tag creation/update
   - Highlight creation/update
   - Feed creation/update
   - User profile update

2. Add validators to all POST/PUT endpoints:
   ```javascript
   router.post('/', 
     authenticateToken, 
     validateArticle, 
     handleValidationErrors, 
     async (req, res) => { ... }
   );
   ```

3. Test all validation rules:
   - Required fields
   - String lengths
   - Email formats
   - URL formats
   - Sanitization (trim, escape)

**Acceptance Criteria**:
- [ ] All endpoints have input validation
- [ ] Returns 400 for invalid data
- [ ] Proper error messages
- [ ] XSS protection (sanitization)

---

### Task 4.2: Integration Testing
**Assignee**: **Team Member 4** (Testing Lead)  
**Time**: 1.5 hours  
**Files to test**:
- All routes with MongoDB connection

**Deliverables**:
1. Test authentication flow:
   - [ ] Signup creates user in MongoDB
   - [ ] Login returns valid JWT
   - [ ] Token authentication works
   - [ ] Invalid tokens rejected

2. Test protected routes:
   - [ ] Requests without token return 401
   - [ ] Requests with invalid token return 403
   - [ ] Valid requests succeed

3. Test data isolation:
   - [ ] User A cannot see User B's articles
   - [ ] User A cannot modify User B's data

4. Test validation:
   - [ ] Invalid data returns 400
   - [ ] Valid data succeeds

5. Document test results in team chat

**Acceptance Criteria**:
- [ ] All auth tests pass
- [ ] All protected route tests pass
- [ ] Data isolation verified
- [ ] Validation tests pass

---

## Phase 5: Frontend Integration (1-2 hours)
**Priority**: MEDIUM - User experience  
**Dependencies**: Phase 4 complete

### Task 5.1: Update Frontend API Service
**Assignee**: **You** (Full-Stack Lead)  
**Time**: 1 hour  
**Files to modify**:
- `front-end/src/services/api.js`
- `front-end/src/contexts/AuthContext.jsx` (CREATE NEW)

**Deliverables**:
1. Add token storage:
   ```javascript
   const setAuthToken = (token) => {
     localStorage.setItem('authToken', token);
   };
   
   const getAuthToken = () => {
     return localStorage.getItem('authToken');
   };
   
   const clearAuthToken = () => {
     localStorage.removeItem('authToken');
   };
   ```

2. Update API request function to include token:
   ```javascript
   async function apiRequest(endpoint, options = {}) {
     const token = getAuthToken();
     const headers = {
       'Content-Type': 'application/json',
       ...(token && { 'Authorization': `Bearer ${token}` }),
       ...options.headers,
     };
     // ... rest of request
   }
   ```

3. Create AuthContext for global auth state
4. Update login/signup to store token
5. Add token refresh logic

**Acceptance Criteria**:
- [ ] Token stored in localStorage on login
- [ ] Token included in all API requests
- [ ] Token cleared on logout
- [ ] Auth state available globally

---

### Task 5.2: Update Login/Signup Pages
**Assignee**: **Team Member 5** (Frontend Lead)  
**Time**: 1 hour  
**Files to modify**:
- `front-end/src/pages/AuthPage.jsx`

**Deliverables**:
1. Update login handler to:
   - Call backend `/api/auth/login`
   - Store JWT token
   - Redirect to homepage on success
   - Show error on failure

2. Update signup handler to:
   - Call backend `/api/auth/signup`
   - Store JWT token
   - Redirect to homepage on success
   - Show validation errors

3. Add form validation
4. Add loading states
5. Add error handling

**Acceptance Criteria**:
- [ ] Login works with real API
- [ ] Signup creates user and logs in
- [ ] Tokens stored and used
- [ ] Error messages displayed
- [ ] Loading states shown

---

## Phase 6: Documentation & Deployment Prep (1 hour)
**Priority**: LOW - Final touches  
**Dependencies**: Phase 5 complete

### Task 6.1: Documentation
**Assignee**: **You** (Documentation Lead)  
**Time**: 30 minutes  
**Files to create/update**:
- `back-end/README.md`
- `.env.example`

**Deliverables**:
1. Update README with:
   - MongoDB Atlas setup instructions
   - Environment variable configuration
   - JWT authentication flow diagram
   - API authentication examples

2. Document all environment variables in `.env.example`

3. Add inline code comments for complex logic

**Acceptance Criteria**:
- [ ] Setup instructions clear
- [ ] All env vars documented
- [ ] Authentication flow documented

---

### Task 6.2: Final Testing & Code Review
**Assignee**: **All Team Members**  
**Time**: 30 minutes  

**Deliverables**:
1. Each team member tests another member's work
2. Code review in pairs
3. Fix any bugs found
4. Ensure no `.env` files committed
5. Run final integration test

**Acceptance Criteria**:
- [ ] All features working
- [ ] No console errors
- [ ] No `.env` in git
- [ ] Code reviewed

---

## Work Distribution Summary

### Team Member 1 (Database Lead) - 2.5 hours
- MongoDB Atlas setup
- Install dependencies
- DAO factory configuration

### Team Member 2 (Auth Lead) - 3.5 hours
- JWT middleware implementation
- Update auth routes with JWT

### Team Member 3 (Validation Lead) - 2.5 hours
- Protect user routes
- Add data validation to all endpoints

### Team Member 4 (Testing Lead) - 2.5 hours
- Protect articles routes
- Integration testing

### Team Member 5 (Frontend Lead) - 2.5 hours
- Protect remaining routes (tags, highlights, feeds, stacks)
- Update login/signup pages

### You (Full-Stack Lead) - 1.5 hours
- Update frontend API service
- Documentation

**Total Estimated Time**: 15 hours  
**Time per person**: ~3 hours  
**Buffer time**: 3 hours for debugging/meetings

---

## Critical Path

1. **MUST DO FIRST**: Phase 1 (Foundation) - 2-3 hours
2. **MUST DO SECOND**: Phase 2 (Authentication) - 3-4 hours
3. **PARALLEL WORK**: Phase 3 (Protected Routes) - 2-3 hours
4. **FINAL STEPS**: Phase 4-6 (Testing, Frontend, Docs) - 4-5 hours

---

## Risk Management

### High Risk Items:
- **MongoDB connection issues**: Have team member 1 set this up first thing
- **JWT token bugs**: Test thoroughly in Phase 4
- **Data validation complexity**: Start simple, add more validation later

### Contingency Plan:
- If MongoDB Atlas takes too long → Use local MongoDB temporarily
- If JWT has issues → Implement basic auth first, enhance later
- If time runs short → Skip Phase 6, focus on core functionality

---

## Definition of Done

✅ MongoDB Atlas connected and working  
✅ JWT authentication implemented  
✅ All routes protected with authentication  
✅ Data validation on all endpoints  
✅ Users can only access their own data  
✅ Frontend login/signup works  
✅ No `.env` files in version control  
✅ All tests pass  
✅ Code reviewed by at least one other team member  
✅ Documentation updated  

---

## Meeting Schedule (Monday)

- **9:00 AM**: Sprint planning meeting (30 min)
- **12:00 PM**: Mid-day sync (15 min)
- **3:00 PM**: Integration check (30 min)
- **6:00 PM**: Final testing & demo prep (1 hour)
- **7:00 PM**: Sprint review/demo

---

## Notes

- Commit frequently with descriptive messages
- Push to `sprint-3-mongodb-jwt-auth` branch
- Create PR when complete
- Test your own work before pushing
- Help teammates if you finish early
- Ask questions in team chat immediately if blocked
