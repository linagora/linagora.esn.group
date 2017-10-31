const { expect } = require('chai');
const sinon = require('sinon');
const mockery = require('mockery');

describe('The search module', function() {
  beforeEach(function() {
    this.getModule = () => require(this.moduleHelpers.backendPath + '/lib/search/index')(this.moduleHelpers.dependencies);
  });

  describe('The start function', function() {
    it('should register listeners', function() {
      const register = sinon.spy();

      mockery.registerMock('./listener', () => ({ register }));

      this.getModule().start();

      expect(register).to.have.been.calledOnce;
    });
  });
});
