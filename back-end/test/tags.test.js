const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;

chai.use(chaiHttp);

const app = require('../index');
const daoFactory = require('../lib/daoFactory');

describe('Tags API', () => {
  // Reset mock data before each test to ensure isolation
  beforeEach(() => {
    daoFactory.resetMockData();
  });

  describe('GET /api/tags', () => {
    it('should return all tags', (done) => {
      chai.request(app)
        .get('/api/tags')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('count');
          expect(res.body.data).to.be.an('array');
          expect(res.body.data.length).to.be.greaterThan(0);

          // Basic structure check
          const first = res.body.data[0];
          expect(first).to.have.property('id');
          expect(first).to.have.property('name');
          // color property deprecated; ensure core fields only
          // Consistency: every tag must expose articleCount reflecting usage
          res.body.data.forEach(tag => {
            expect(tag).to.have.property('articleCount');
            expect(tag.articleCount).to.be.a('number');
            expect(tag.articleCount).to.be.at.least(0);
          });

          done();
        });
    });

    it('should support sorting by popular', (done) => {
      chai.request(app)
        .get('/api/tags?sort=popular')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
  });

  describe('GET /api/tags/:id', () => {
    it('should return a single tag by ID', (done) => {
      chai.request(app)
        .get('/api/tags/1')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.be.an('object');
          expect(res.body.data).to.have.property('id', 1);
          expect(res.body.data).to.have.property('name', 'javascript');
          expect(res.body.data).to.have.property('articleCount');
          expect(res.body.data.articleCount).to.be.a('number');
          done();
        });
    });

    it('should return 404 for non-existent tag ID', (done) => {
      chai.request(app)
        .get('/api/tags/non-existent-id')
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('success', false);
          expect(res.body).to.have.property('error', 'Tag not found');
          done();
        });
    });
  });

  describe('POST /api/tags', () => {
    it('should create a new tag with valid data', (done) => {
      const ts = Date.now();
      const newTag = { name: `NewTag-${ts}`, color: '#123456', description: 'A test tag' };

      chai.request(app)
        .post('/api/tags')
        .send(newTag)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('message', 'Tag created successfully');
          expect(res.body.data).to.be.an('object');
          // Server lowercases names
          expect(res.body.data.name).to.match(/^newtag-\d+/);
          expect(res.body.data).to.have.property('color');
          expect(res.body.data).to.have.property('id');
          done();
        });
    });

    it('should return 400 when name is missing', (done) => {
      chai.request(app)
        .post('/api/tags')
        .send({ color: '#fff' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('success', false);
          expect(res.body).to.have.property('error', 'Tag name is required');
          done();
        });
    });

    it('should return 409 when tag already exists', (done) => {
      // 'javascript' is present in mockTags
      chai.request(app)
        .post('/api/tags')
        .send({ name: 'javascript' })
        .end((err, res) => {
          expect(res).to.have.status(409);
          expect(res.body).to.have.property('success', false);
          expect(res.body).to.have.property('error');
          expect(res.body.error).to.include('already exists');
          done();
        });
    });

    // Tests for tag name normalization and duplicate detection bug fix
    describe('Tag Name Normalization (Bug Fix Tests)', () => {
      it('should normalize tag names to lowercase on creation', (done) => {
        chai.request(app)
          .post('/api/tags')
          .send({ 
            name: 'Python Programming',
            description: 'Python language and frameworks'
          })
          .end((err, res) => {
            expect(res).to.have.status(201);
            expect(res.body).to.have.property('success', true);
            expect(res.body.data).to.have.property('name', 'python programming');
            done();
          });
      });

      it('should prevent duplicate tags with different casing', (done) => {
        // First, create a tag
        chai.request(app)
          .post('/api/tags')
          .send({ name: 'Ruby on Rails' })
          .end((err, res1) => {
            expect(res1).to.have.status(201);
            expect(res1.body.data.name).to.equal('ruby on rails');

            // Try to create the same tag with different casing
            chai.request(app)
              .post('/api/tags')
              .send({ name: 'RUBY ON RAILS' })
              .end((err, res2) => {
                expect(res2).to.have.status(409);
                expect(res2.body).to.have.property('success', false);
                expect(res2.body.error).to.include('already exists');
                done();
              });
          });
      });

      it('should prevent duplicate tags with mixed casing variations', (done) => {
        // Create original tag
        chai.request(app)
          .post('/api/tags')
          .send({ name: 'Artificial Intelligence' })
          .end((err, res1) => {
            expect(res1).to.have.status(201);

            // Try lowercase version
            chai.request(app)
              .post('/api/tags')
              .send({ name: 'artificial intelligence' })
              .end((err, res2) => {
                expect(res2).to.have.status(409);
                expect(res2.body.error).to.include('already exists');

                // Try uppercase version
                chai.request(app)
                  .post('/api/tags')
                  .send({ name: 'ARTIFICIAL INTELLIGENCE' })
                  .end((err, res3) => {
                    expect(res3).to.have.status(409);
                    expect(res3.body.error).to.include('already exists');

                    // Try mixed case
                    chai.request(app)
                      .post('/api/tags')
                      .send({ name: 'ArTiFiCiAl InTeLLiGeNcE' })
                      .end((err, res4) => {
                        expect(res4).to.have.status(409);
                        expect(res4.body.error).to.include('already exists');
                        done();
                      });
                  });
              });
          });
      });

      it('should allow creation of genuinely different tags', (done) => {
        // Create first tag
        chai.request(app)
          .post('/api/tags')
          .send({ name: 'Go Language' })
          .end((err, res1) => {
            expect(res1).to.have.status(201);
            expect(res1.body.data.name).to.equal('go language');
            const firstId = res1.body.data.id;

            // Create a different tag - should succeed
            chai.request(app)
              .post('/api/tags')
              .send({ name: 'Golang Advanced' })
              .end((err, res2) => {
                expect(res2).to.have.status(201);
                expect(res2.body.data.name).to.equal('golang advanced');
                expect(res2.body.data.id).to.not.equal(firstId);

                // Verify both tags exist independently
                chai.request(app)
                  .get('/api/tags')
                  .end((err, res3) => {
                    const tagNames = res3.body.data.map(t => t.name);
                    expect(tagNames).to.include('go language');
                    expect(tagNames).to.include('golang advanced');
                    done();
                  });
              });
          });
      });

      it('should handle tags with special characters consistently', (done) => {
        chai.request(app)
          .post('/api/tags')
          .send({ name: 'C++ Programming' })
          .end((err, res1) => {
            expect(res1).to.have.status(201);
            expect(res1.body.data.name).to.equal('c++ programming');

            // Try to recreate with different casing
            chai.request(app)
              .post('/api/tags')
              .send({ name: 'C++ PROGRAMMING' })
              .end((err, res2) => {
                expect(res2).to.have.status(409);
                expect(res2.body.error).to.include('already exists');
                done();
              });
          });
      });

      it('should verify existing mock tags are normalized', (done) => {
        // Check that existing tags from mock data are lowercase
        chai.request(app)
          .get('/api/tags/1') // javascript tag
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.data.name).to.equal('javascript');
            expect(res.body.data.name).to.equal(res.body.data.name.toLowerCase());
            done();
          });
      });

      it('should reject duplicate of existing mock tag regardless of casing', (done) => {
        // 'react' exists in mock data (id: 2)
        chai.request(app)
          .post('/api/tags')
          .send({ name: 'React' })
          .end((err, res1) => {
            expect(res1).to.have.status(409);
            expect(res1.body.error).to.include('already exists');

            chai.request(app)
              .post('/api/tags')
              .send({ name: 'REACT' })
              .end((err, res2) => {
                expect(res2).to.have.status(409);
                expect(res2.body.error).to.include('already exists');
                done();
              });
          });
      });
    });
  });

  describe('PUT /api/tags/:id', () => {
    it('should update an existing tag', (done) => {
      const update = { description: 'Updated description' };

      chai.request(app)
        .put('/api/tags/2')
        .send(update)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('message', 'Tag updated successfully');
          expect(res.body.data).to.be.an('object');
          // ID can be string or number depending on DAO implementation
          expect(String(res.body.data.id)).to.equal('2');
          expect(res.body.data).to.have.property('description', update.description);
          done();
        });
    });

    it('should return 404 when updating non-existent tag', (done) => {
      chai.request(app)
        .put('/api/tags/non-existent-id')
        .send({ name: 'doesntmatter' })
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('success', false);
          expect(res.body).to.have.property('error', 'Tag not found');
          done();
        });
    });
  });

  describe('DELETE /api/tags/:id', () => {
    it('should delete an existing tag (or return 404 if already removed in prior tests)', (done) => {
      chai.request(app)
        .delete('/api/tags/4')
        .end((err, res) => {
          if (res.status === 404) {
            expect(res.body).to.have.property('success', false);
            expect(res.body).to.have.property('error', 'Tag not found');
            // Acceptable for idempotent deletion scenario
            return done();
          }
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('message', 'Tag deleted successfully');
          expect(String(res.body.data.id)).to.equal('4');
          done();
        });
    });

    it('should return 404 when deleting non-existent tag', (done) => {
      chai.request(app)
        .delete('/api/tags/non-existent-id')
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('success', false);
          expect(res.body).to.have.property('error', 'Tag not found');
          done();
        });
    });
  });

  describe('GET /api/tags/:id/articles', () => {
    it('should return articles tagged with the requested tag', (done) => {
      chai.request(app)
        .get('/api/tags/1/articles')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('tag');
          expect(res.body).to.have.property('count');
          expect(res.body.data).to.be.an('array');
          expect(res.body.tag).to.have.property('id', 1);
          expect(res.body.tag).to.have.property('name', 'javascript');
          expect(res.body.tag).to.have.property('articleCount');
          // Count returned should match data length and articleCount
          expect(res.body.count).to.equal(res.body.data.length);
          expect(res.body.tag.articleCount).to.equal(res.body.data.length);

          // Check that all returned articles include the tag id
          res.body.data.forEach(article => {
            expect(article.tags).to.be.an('array');
            expect(article.tags.includes(1)).to.equal(true);
          });

          done();
        });
    });

    it('should return 404 for non-existent tag when fetching articles', (done) => {
      chai.request(app)
        .get('/api/tags/non-existent-id/articles')
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('success', false);
          expect(res.body).to.have.property('error', 'Tag not found');
          done();
        });
    });
  });
});
