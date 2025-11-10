const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

chai.use(chaiHttp);

// Simple test to verify Mocha and Chai are working
describe('Testing Framework Verification', () => {
  it('should verify chai is working', () => {
    expect(true).to.be.true;
    expect(1 + 1).to.equal(2);
  });

  it('should verify basic assertions work', () => {
    const obj = { name: 'test', count: 5 };
    expect(obj).to.have.property('name');
    expect(obj.count).to.equal(5);
  });
});
