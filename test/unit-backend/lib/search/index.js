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

  describe('The search function', function() {
    const elasticsearch = {};

    beforeEach(function() {
      this.moduleHelpers.addDep('elasticsearch', elasticsearch);
    });

    it('should search with must_not query when there are group ids to be excluded', function(done) {
      elasticsearch.searchDocuments = (query, callback) => {
        expect(query.body.query.bool.must_not).to.shallowDeepEqual({
          terms: {
            _id: ['group1']
          }
        });

        callback(null, {
          hits: { total: 0, hits: 0 }
        });
      };

      this.getModule().search({
        search: 'term',
        excludeGroupIds: ['group1']
      }).then(() => {
        done();
      }).catch(err => {
        done(new Error(`should have been resolved instead: ${err.message}`));
      });
    });
  });
});
