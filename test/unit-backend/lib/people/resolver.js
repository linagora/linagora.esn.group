const { expect } = require('chai');
const sinon = require('sinon');
const mockery = require('mockery');

describe('The people resolver module', function() {
  let people, groupLib, getModule;

  beforeEach(function() {
    const self = this;

    people = {
      constants: {
        FIELD_TYPES: { EMAIL_ADDRESS: 'emailaddress' }
      }
    };
    groupLib = {
      getByEmail: sinon.stub()
    };

    self.moduleHelpers.addDep('people', people);
    mockery.registerMock('../group', () => groupLib);
    getModule = () => require(self.moduleHelpers.backendPath + '/lib/people/resolver')(self.moduleHelpers.dependencies);
  });

  it('should call getByEmail with valid arguments', function(done) {
    groupLib.getByEmail.returns(Promise.resolve());
    getModule()({
      fieldType: people.constants.FIELD_TYPES.EMAIL_ADDRESS,
      value: 'foo@bar',
      context: { domain: { _id: 'domain' }}
    }).then(() => {
      expect(groupLib.getByEmail).to.have.been.calledWith('foo@bar', {
        domainIds: ['domain']
      });

      done();
    }).catch(done);
  });

  it('should resolve and not call getByEmail when fieldType is not valid', function(done) {
    groupLib.getByEmail.returns(Promise.resolve());
    getModule()({
      fieldType: 'somethingsomething'
    }).then(() => {
      expect(groupLib.getByEmail).to.not.have.been.called;

      done();
    }).catch(done);
  });
});
