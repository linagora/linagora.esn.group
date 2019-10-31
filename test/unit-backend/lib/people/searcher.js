const { expect } = require('chai');
const sinon = require('sinon');
const mockery = require('mockery');

describe('The people searcher module', function() {
  let people, groupLib, searchLib, getModule;

  beforeEach(function() {
    people = {
      constants: {
        FIELD_TYPES: { EMAIL_ADDRESS: 'emailaddress' }
      }
    };
    groupLib = {
      getById: sinon.stub()
    };
    searchLib = {
      search: sinon.stub()
    };

    this.moduleHelpers.addDep('people', people);
    mockery.registerMock('../group', () => groupLib);
    mockery.registerMock('../search', () => searchLib);
    getModule = () => require(this.moduleHelpers.backendPath + '/lib/people/searcher')(this.moduleHelpers.dependencies);
  });

  it('should call search with valid arguments', function(done) {
    searchLib.search.returns(Promise.resolve({ list: []}));
    getModule()({
      term: 'searchme',
      context: { user: { _id: 'user' }, domain: { _id: 'domain' } },
      pagination: { limit: 10 },
      excludes: [{ id: 'group1' }, { id: 'group2' }]
    }).then(() => {
      expect(searchLib.search).to.have.been.calledWith(sinon.match(arg => (
        arg.search === 'searchme' &&
        arg.limit === 10 &&
        arg.userId === 'user' &&
        arg.domainId === 'domain' &&
        arg.excludeGroupIds.includes('group1', 'group2')
      )));

      done();
    }).catch(done);
  });

  it('should settle all getting group id promises', function(done) {
    const groups = [
      {_id: 'group1'},
      {_id: 'group2'},
      {_id: 'group3'}
    ];

    searchLib.search.returns(Promise.resolve({ list: groups}));
    groupLib.getById.withArgs('group1').returns(Promise.reject({}));
    groupLib.getById.withArgs('group2').returns(Promise.resolve({ _id: 'group2' }));
    groupLib.getById.withArgs('group3').returns(Promise.resolve({ _id: 'group3' }));

    getModule()({
      term: 'searchme',
      context: { user: { _id: 'user' }, domain: { _id: 'domain' } },
      pagination: { limit: 10 },
      excludes: [{ id: 'group1' }, { id: 'group2' }]
    }).then(results => {
      expect(groupLib.getById).to.have.been.calledThrice;
      expect(results).to.have.lengthOf(2);

      done();
    }).catch(done);
  });
});
