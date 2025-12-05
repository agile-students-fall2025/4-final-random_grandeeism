// test/stacks.test.js
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index');
const jwt = require('jsonwebtoken');
const daoFactory = require('../lib/daoFactory');
const { expect } = chai;

require('dotenv').config();
chai.use(chaiHttp);

describe('Stacks API', () => {
  let token;

  beforeEach(() => {
    daoFactory.resetMockData();
    token = jwt.sign({ id: 'user-1', username: 'testuser' }, process.env.JWT_SECRET, { expiresIn: '7d' });
  });

  it('should get all stacks (initially empty or seeded)', (done) => {
    chai.request(app)
      .get('/api/stacks')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('success', true);
        expect(res.body.data).to.be.an('array');
        done();
      });
  });

  it('should create a new stack', (done) => {
    const stack = {
      name: 'Test Stack',
      query: 'test',
      filters: { status: 'inbox' }
    };
    chai.request(app)
      .post('/api/stacks')
      .set('Authorization', `Bearer ${token}`)
      .send(stack)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('success', true);
        expect(res.body.data).to.include({ name: 'Test Stack', query: 'test' });
        expect(res.body.data).to.have.property('id');
        done();
      });
  });

  it('should return 400 if name is missing', (done) => {
    chai.request(app)
      .post('/api/stacks')
      .set('Authorization', `Bearer ${token}`)
      .send({ query: 'no name', filters: {} })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property('success', false);
        done();
      });
  });

  it('should delete a stack by id', (done) => {
    const stack = { name: 'To Delete', query: 'delete-me', filters: {} };

    chai.request(app)
      .post('/api/stacks')
      .set('Authorization', `Bearer ${token}`)
      .send(stack)
      .end((createErr, createRes) => {
        expect(createRes).to.have.status(201);
        const stackId = createRes.body.data.id;

        chai.request(app)
          .delete(`/api/stacks/${stackId}`)
          .set('Authorization', `Bearer ${token}`)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('success', true);
            done();
          });
      });
  });

  it('should return 404 when deleting a non-existent stack', (done) => {
    chai.request(app)
      .delete('/api/stacks/nonexistent-id')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.have.property('success', false);
        done();
      });
  });
});
