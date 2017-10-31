const sinon = require('sinon');
const { expect } = require('chai');
const mockery = require('mockery');

describe('The groups controller', function() {
  let lib, userModule;

  beforeEach(function() {
    this.moduleHelpers.addDep('user', userModule);
    this.moduleHelpers.addDep('tuple', {});
    this.moduleHelpers.addDep('collaboration', {});

    lib = {
      group: {
        getById: sinon.stub()
      },
      search: {
        search: sinon.stub()
      }
    };

    this.getModule = function() {
      return require(this.moduleHelpers.backendPath + '/webserver/api/groups/controller')(this.moduleHelpers.dependencies, lib);
    };
  });

  describe('The search function', function() {
    let denormalize, utils, req, res, status, total_count, groups, denormalized;

    beforeEach(function() {
      total_count = 10;
      groups = [{ _id: 1 }, { _id: 2 }];
      denormalized = [{ id: 1 }, { id: 2 }];
      lib.search.search.returns(Promise.resolve({
        total_count,
        list: groups
      }));
      status = { json: sinon.stub() };
      req = {
        query: {
          query: 'The search term',
          limit: 50,
          offset: 20
        },
        domain: {
          id: 'The domain id'
        }
      };
      res = {
        header: sinon.stub(),
        status: () => (status)
      };
      denormalize = {
        denormalize: sinon.stub(),
        denormalizeMember: sinon.stub()
      };
      utils = {
        send500Error: sinon.stub(),
        send400Error: sinon.stub()
      };
      mockery.registerMock('./denormalize', () => (denormalize));
      mockery.registerMock('../utils', () => (utils));
    });

    it('should HTTP 200 with denormalized groups', function(done) {
      lib.group.getById.withArgs(groups[0]._id).returns(Promise.resolve(groups[0]));
      lib.group.getById.withArgs(groups[1]._id).returns(Promise.resolve(groups[1]));
      denormalize.denormalize.withArgs(groups[0]).returns(denormalized[0]);
      denormalize.denormalize.withArgs(groups[1]).returns(denormalized[1]);

      const module = this.getModule();

      module.search(req, res).then(() => {
        expect(res.header).to.have.been.calledWith('X-ESN-Items-Count', total_count);
        expect(lib.group.getById).to.have.been.calledTwice;
        expect(denormalize.denormalize).to.have.been.calledTwice;
        expect(utils.send500Error).to.not.have.been.called;
        expect(status.json).to.have.been.calledOnce;
        expect(status.json.firstCall.args[0]).to.have.lengthOf(2);
        done();
      }, done);
    });

    it('should HTTP 200 without groups which can not be found from the lib', function(done) {
      lib.group.getById.withArgs(groups[0]._id).returns(Promise.resolve(groups[0]));
      lib.group.getById.withArgs(groups[1]._id).returns(Promise.resolve());
      denormalize.denormalize.withArgs(groups[0]).returns(denormalized[0]);

      const module = this.getModule();

      module.search(req, res).then(() => {
        expect(res.header).to.have.been.calledWith('X-ESN-Items-Count', total_count);
        expect(lib.group.getById).to.have.been.calledTwice;
        expect(denormalize.denormalize).to.have.been.calledOnce;
        expect(utils.send500Error).to.not.have.been.called;
        expect(status.json).to.have.been.calledWith([denormalized[0]]);
        done();
      }, done);
    });

    it('should HTTP 200 without groups which are failing from the lib', function(done) {
      const error = new Error('I failed to fetch the group');

      lib.group.getById.withArgs(groups[0]._id).returns(Promise.resolve(groups[0]));
      lib.group.getById.withArgs(groups[1]._id).returns(Promise.reject(error));
      denormalize.denormalize.withArgs(groups[0]).returns(denormalized[0]);

      const module = this.getModule();

      module.search(req, res).then(() => {
        expect(res.header).to.have.been.calledWith('X-ESN-Items-Count', total_count);
        expect(lib.group.getById).to.have.been.calledTwice;
        expect(denormalize.denormalize).to.have.been.calledOnce;
        expect(utils.send500Error).to.not.have.been.called;
        expect(status.json).to.have.been.calledWith([denormalized[0]]);
        done();
      }, done);
    });

    it('should HTTP 500 when search fails', function(done) {
      const err = new Error('I failed to search');

      lib.search.search.returns(Promise.reject(err));

      const module = this.getModule();

      module.search(req, res).then(() => {
        expect(utils.send500Error).to.have.been.calledWith('Error while searching groups', err);
        expect(status.json).to.not.have.been.called;
        done();
      }, done);
    });
  });
});
