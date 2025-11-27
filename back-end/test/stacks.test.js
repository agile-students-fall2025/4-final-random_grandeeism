// test/stacks.test.js
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index');
const { expect } = chai;

chai.use(chaiHttp);

describe('Stacks API', () => {
  let createdStackId;

  it('should get all stacks (initially empty or seeded)', (done) => {
    chai.request(app)
      .get('/api/stacks')
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
      .send(stack)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('success', true);
        expect(res.body.data).to.include({ name: 'Test Stack', query: 'test' });
        expect(res.body.data).to.have.property('id');
        createdStackId = res.body.data.id;
        done();
      });
  });

  it('should return 400 if name is missing', (done) => {
    chai.request(app)
      .post('/api/stacks')
      .send({ query: 'no name', filters: {} })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property('success', false);
        done();
      });
  });

  it('should delete a stack by id', (done) => {
    chai.request(app)
      .delete(`/api/stacks/${createdStackId}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('success', true);
        done();
      });
  });

  it('should return 404 when deleting a non-existent stack', (done) => {
    chai.request(app)
      .delete('/api/stacks/nonexistent-id')
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.have.property('success', false);
        done();
      });
  });
});
