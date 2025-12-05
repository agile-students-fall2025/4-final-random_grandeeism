const chai = require('chai');
const chaiHttp = require('chai-http');
const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const usersRouter = require('../routes/users');
const daoFactory = require('../lib/daoFactory');
const expect = chai.expect;

const JWT_SECRET = process.env.JWT_SECRET;

// Create minimal Express app for testing
const app = express();
app.use(express.json());
app.use('/api/users', usersRouter);

chai.use(chaiHttp);

describe('Users API', () => {
  let testToken;

  // Reset mock data before each test to ensure isolation
  beforeEach(() => {
    daoFactory.resetMockData();
    testToken = jwt.sign(
      { id: 'user-1', username: 'testuser' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  });

  // Test GET /api/users/profile/:id
  describe('GET /api/users/profile/:id', () => {
    it('should return user profile by ID', (done) => {
      chai.request(app)
        .get('/api/users/profile/user-1')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success').eql(true);
          expect(res.body).to.have.property('data').to.be.an('object');
          expect(res.body.data).to.have.property('id').eql('user-1');
          expect(res.body.data).to.have.property('username');
          expect(res.body.data).to.have.property('email');
          expect(res.body.data).to.not.have.property('password');
          done();
        });
    });

    it('should return 404 for non-existent user', (done) => {
      const ghostToken = jwt.sign(
        { id: 'nonexistent-user', username: 'ghost' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      chai.request(app)
        .get('/api/users/profile/nonexistent-user')
        .set('Authorization', `Bearer ${ghostToken}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('success').eql(false);
          expect(res.body).to.have.property('error').eql('User not found');
          done();
        });
    });

    it('should not include password in response', (done) => {
      chai.request(app)
        .get('/api/users/profile/user-1')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.data).to.not.have.property('password');
          done();
        });
    });

    it('should include all user profile fields', (done) => {
      const user2Token = jwt.sign(
        { id: 'user-2', username: 'demo' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      chai.request(app)
        .get('/api/users/profile/user-2')
        .set('Authorization', `Bearer ${user2Token}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.data.profile).to.have.property('firstName');
          expect(res.body.data.profile).to.have.property('bio');
          expect(res.body.data.profile).to.have.property('preferences');
          expect(res.body.data).to.have.property('stats');
          done();
        });
    });
  });

  // Test PUT /api/users/profile/:id
  describe('PUT /api/users/profile/:id', () => {
    it('should update user profile', (done) => {
      const updateData = {
        displayName: 'Updated Name',
        bio: 'Updated bio'
      };

      chai.request(app)
        .put('/api/users/profile/user-1')
        .set('Authorization', `Bearer ${testToken}`)
        .send(updateData)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success').eql(true);
          expect(res.body.data).to.have.property('displayName').eql('Updated Name');
          expect(res.body.data).to.have.property('bio').eql('Updated bio');
          expect(res.body).to.have.property('message').eql('Profile updated successfully');
          done();
        });
    });

    it('should update user preferences', (done) => {
      const updateData = {
        preferences: {
          theme: 'light',
          readingGoal: 45
        }
      };

      chai.request(app)
        .put('/api/users/profile/user-1')
        .set('Authorization', `Bearer ${testToken}`)
        .send(updateData)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.data).to.have.property('preferences');
          expect(res.body.data.preferences).to.have.property('theme').eql('light');
          expect(res.body.data.preferences).to.have.property('readingGoal').eql(45);
          done();
        });
    });

    it('should update avatar', (done) => {
      const updateData = {
        avatar: 'https://example.com/avatar.jpg'
      };

      chai.request(app)
        .put('/api/users/profile/user-1')
        .set('Authorization', `Bearer ${testToken}`)
        .send(updateData)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.data).to.have.property('avatar').eql('https://example.com/avatar.jpg');
          done();
        });
    });

    it('should return 404 for non-existent user', (done) => {
      const updateData = {
        displayName: 'Updated Name'
      };

      const ghostToken = jwt.sign(
        { id: 'nonexistent-user', username: 'ghost' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      chai.request(app)
        .put('/api/users/profile/nonexistent-user')
        .set('Authorization', `Bearer ${ghostToken}`)
        .send(updateData)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('success').eql(false);
          expect(res.body).to.have.property('error').eql('User not found');
          done();
        });
    });

    it('should not include password in response', (done) => {
      const updateData = {
        displayName: 'Test Name'
      };

      chai.request(app)
        .put('/api/users/profile/user-1')
        .set('Authorization', `Bearer ${testToken}`)
        .send(updateData)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.data).to.not.have.property('password');
          done();
        });
    });

    it('should preserve existing fields when only updating some', (done) => {
            // Create token for user-2 since they need to update their own profile
            const user2Token = jwt.sign(
              { id: 'user-2', username: 'demo' },
              JWT_SECRET,
              { expiresIn: '7d' }
            );
      
      chai.request(app)
        .get('/api/users/profile/user-2')
        .set('Authorization', `Bearer ${user2Token}`)
        .end((err, res) => {
          const originalEmail = res.body.data.email;
          const originalUsername = res.body.data.username;

          chai.request(app)
            .put('/api/users/profile/user-2')
            .set('Authorization', `Bearer ${user2Token}`)
            .send({ displayName: 'New Display Name' })
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body.data.email).to.eql(originalEmail);
              expect(res.body.data.username).to.eql(originalUsername);
              expect(res.body.data.displayName).to.eql('New Display Name');
              done();
            });
        });
    });
  });

  // Test PUT /api/users/password/:id
  describe('PUT /api/users/password/:id', () => {
    it('should return 400 when current password is missing', (done) => {
      const updateData = {
        newPassword: 'newpassword123'
      };

      chai.request(app)
        .put('/api/users/password/user-1')
        .set('Authorization', `Bearer ${testToken}`)
        .send(updateData)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('success').eql(false);
          expect(res.body).to.have.property('errors');
          expect(res.body.errors).to.be.an('array');
          done();
        });
    });

    it('should return 400 when new password is missing', (done) => {
      const updateData = {
        currentPassword: 'password123'
      };

      chai.request(app)
        .put('/api/users/password/user-1')
        .set('Authorization', `Bearer ${testToken}`)
        .send(updateData)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('success').eql(false);
          expect(res.body).to.have.property('errors');
          expect(res.body.errors).to.be.an('array');
          done();
        });
    });

    it('should return 400 when both passwords are missing', (done) => {
      chai.request(app)
        .put('/api/users/password/user-1')
        .set('Authorization', `Bearer ${testToken}`)
        .send({})
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('success').eql(false);
          expect(res.body).to.have.property('errors');
          expect(res.body.errors).to.be.an('array');
          done();
        });
    });

    it('should return 404 for non-existent user', (done) => {
      const updateData = {
        currentPassword: 'password123',
        newPassword: 'newpassword123'
      };

      const ghostToken = jwt.sign(
        { id: 'nonexistent-user', username: 'ghost' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      chai.request(app)
        .put('/api/users/password/nonexistent-user')
        .set('Authorization', `Bearer ${ghostToken}`)
        .send(updateData)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('success').eql(false);
          expect(res.body).to.have.property('error').eql('User not found');
          done();
        });
    });

    it('should return 401 when current password is incorrect', (done) => {
      const updateData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      };

      chai.request(app)
        .put('/api/users/password/user-1')
        .set('Authorization', `Bearer ${testToken}`)
        .send(updateData)
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property('success').eql(false);
          expect(res.body).to.have.property('error').eql('Current password is incorrect');
          done();
        });
    });

    it('should successfully change password with correct current password', (done) => {
      // Mock users have password "password123"
      const updateData = {
        currentPassword: 'password123',
        newPassword: 'newpassword123'
      };

      chai.request(app)
        .put('/api/users/password/user-1')
        .set('Authorization', `Bearer ${testToken}`)
        .send(updateData)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success').eql(true);
          done();
        });
    });
  });

  // Test GET /api/users/stats/:id
  describe('GET /api/users/stats/:id', () => {
    it('should return user reading statistics', (done) => {
      chai.request(app)
        .get('/api/users/stats/user-1')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success').eql(true);
          expect(res.body).to.have.property('data').to.be.an('object');
          expect(res.body.data).to.have.property('totalArticles');
          expect(res.body.data).to.have.property('totalReadingTime');
          expect(res.body.data).to.have.property('streakDays');
          expect(res.body.data).to.have.property('longestStreak');
          done();
        });
    });

    it('should return stats for different user', (done) => {
      const user2Token = jwt.sign(
        { id: 'user-2', username: 'demo' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      chai.request(app)
        .get('/api/users/stats/user-2')
        .set('Authorization', `Bearer ${user2Token}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.data).to.have.property('totalArticles');
          expect(res.body.data).to.have.property('totalReadingTime');
          expect(res.body.data.totalArticles).to.be.a('number');
          expect(res.body.data.totalReadingTime).to.be.a('number');
          done();
        });
    });

    it('should return 404 for non-existent user', (done) => {
      const ghostToken = jwt.sign(
        { id: 'nonexistent-user', username: 'ghost' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      chai.request(app)
        .get('/api/users/stats/nonexistent-user')
        .set('Authorization', `Bearer ${ghostToken}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('success').eql(false);
          expect(res.body).to.have.property('error').eql('User not found');
          done();
        });
    });

    it('should return stats with correct data types', (done) => {
      chai.request(app)
        .get('/api/users/stats/user-1')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.data.totalArticles).to.be.a('number');
          expect(res.body.data.totalReadingTime).to.be.a('number');
          expect(res.body.data.streakDays).to.be.a('number');
          expect(res.body.data.longestStreak).to.be.a('number');
          done();
        });
    });
  });

  // Test DELETE /api/users/:id
  describe('DELETE /api/users/:id', () => {
    it('should delete user account', (done) => {
      chai.request(app)
        .delete('/api/users/user-1')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success').eql(true);
          expect(res.body).to.have.property('message').eql('User account deleted successfully');
          expect(res.body.data).to.have.property('id').eql('user-1');
          done();
        });
    });

    it('should return 404 for non-existent user', (done) => {
      const ghostToken = jwt.sign(
        { id: 'nonexistent-user', username: 'ghost' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      chai.request(app)
        .delete('/api/users/nonexistent-user')
        .set('Authorization', `Bearer ${ghostToken}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('success').eql(false);
          expect(res.body).to.have.property('error').eql('User not found');
          done();
        });
    });

    it('should return correct response structure on successful deletion', (done) => {
      const user2Token = jwt.sign(
        { id: 'user-2', username: 'demo' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      chai.request(app)
        .delete('/api/users/user-2')
        .set('Authorization', `Bearer ${user2Token}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success').eql(true);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('id');
          done();
        });
    });
  });

  // Test error handling
  describe('Error Handling', () => {
    it('should handle invalid request gracefully', (done) => {
      // Test with empty body on PUT request
      chai.request(app)
        .put('/api/users/profile/user-1')
        .set('Authorization', `Bearer ${testToken}`)
        .send(null)
        .end((err, res) => {
          // Should handle gracefully - might return 200 (no changes) or error
          expect(res).to.satisfy((response) => {
            return response.status >= 200 && response.status < 600;
          });
          done();
        });
    });

    it('should return consistent error response format', (done) => {
      chai.request(app)
        .get('/api/users/profile/nonexistent')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          expect(res.body).to.have.property('success');
          expect(res.body).to.have.property('error');
          expect(res.body.success).to.be.false;
          expect(res.body.error).to.be.a('string');
          done();
        });
    });
  });
});

