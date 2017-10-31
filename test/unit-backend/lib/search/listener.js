const { expect } = require('chai');
const sinon = require('sinon');

describe('The search listener module', function() {
  let elasticsearch, CONSTANTS;

  beforeEach(function() {
    elasticsearch = {
      listeners: {
        addListener: sinon.stub()
      }
    };
    CONSTANTS = require(this.moduleHelpers.backendPath + '/lib/constants');
    this.moduleHelpers.addDep('elasticsearch', elasticsearch);
    this.getModule = () => require(this.moduleHelpers.backendPath + '/lib/search/listener')(this.moduleHelpers.dependencies);
  });

  describe('The register function', function() {
    it('should add a listener into ES', function() {
      const result = 'The listener result';

      elasticsearch.listeners.addListener.returns(result);

      const registerResult = this.getModule().register();

      expect(registerResult).to.equals(result);
      expect(elasticsearch.listeners.addListener).to.have.been.calledWith({
        events: {
          add: sinon.match.string,
          remove: sinon.match.string,
          update: sinon.match.string
        },
        denormalize: sinon.match.func,
        getId: sinon.match.func,
        type: CONSTANTS.SEARCH.TYPE_NAME,
        index: CONSTANTS.SEARCH.INDEX_NAME
      });
    });
  });
});
