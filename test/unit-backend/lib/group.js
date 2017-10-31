const sinon = require('sinon');
const { expect } = require('chai');

describe('The group module', function() {
  let pubsub, db, mongooseModels, topic, _id, group, CONSTANTS;

  beforeEach(function() {
    CONSTANTS = require(this.moduleHelpers.backendPath + '/lib/constants');
    _id = 1;
    group = { name: 'The group name' };
    pubsub = {
      local: {
        topic: sinon.stub()
      }
    };
    topic = { publish: sinon.spy() };
    mongooseModels = {
      Group: {
        create: sinon.stub(),
        findOneAndUpdate: sinon.stub(),
        remove: sinon.stub()
      }
    };
    db = {
      mongo: {
        mongoose: {
          model: name => mongooseModels[name]
        }
      }
    };

    this.moduleHelpers.addDep('pubsub', pubsub);
    this.moduleHelpers.addDep('db', db);

    this.getModule = function() {
      return require(this.moduleHelpers.backendPath + '/lib/group')(this.moduleHelpers.dependencies);
    };
  });

  describe('The create function', function() {
    it('should call mongoose and publish created event in local pubsub on success', function(done) {
      const created = { _id, name: 'The Group name' };

      pubsub.local.topic.withArgs(CONSTANTS.EVENTS.CREATED).returns(topic);
      mongooseModels.Group.create.returns(Promise.resolve(created));

      this.getModule().create(group).then(result => {
        expect(mongooseModels.Group.create).to.have.been.calledWith(group);
        expect(result).to.deep.equals(created);
        expect(pubsub.local.topic).to.have.been.calledWith(CONSTANTS.EVENTS.CREATED);
        expect(topic.publish).to.have.been.calledWith(created);

        done();
      });
    });
  });

  describe('The updateById function', function() {
    it('should call mongoose and publish created event in local pubsub on success', function(done) {
      const updated = { _id, name: 'The Group name' };

      pubsub.local.topic.withArgs(CONSTANTS.EVENTS.UPDATED).returns(topic);
      mongooseModels.Group.findOneAndUpdate.returns({ exec: () => Promise.resolve(updated) });

      this.getModule().updateById(_id, group).then(result => {
        expect(mongooseModels.Group.findOneAndUpdate).to.have.been.calledWith({ _id }, { $set: group }, { new: true });
        expect(result).to.deep.equals(updated);
        expect(pubsub.local.topic).to.have.been.calledWith(CONSTANTS.EVENTS.UPDATED);
        expect(topic.publish).to.have.been.calledWith(updated);

        done();
      });
    });
  });

  describe('The deleteById function', function() {
    it('should call mongoose and publish deleted event in local pubsub on success', function(done) {
      const deleted = { _id, name: 'The Group name' };

      pubsub.local.topic.withArgs(CONSTANTS.EVENTS.DELETED).returns(topic);
      mongooseModels.Group.remove.returns({ exec: () => Promise.resolve(deleted) });

      this.getModule().deleteById(_id).then(result => {
        expect(mongooseModels.Group.remove).to.have.been.calledWith({ _id });
        expect(result).to.deep.equals(deleted);
        expect(pubsub.local.topic).to.have.been.calledWith(CONSTANTS.EVENTS.DELETED);
        expect(topic.publish).to.have.been.calledWith(deleted);

        done();
      });
    });

    it('should not publish in topic if group to delete does not exist', function(done) {
      pubsub.local.topic.withArgs(CONSTANTS.EVENTS.DELETED).returns(topic);
      mongooseModels.Group.remove.returns({ exec: () => Promise.resolve() });

      this.getModule().deleteById(_id).then(result => {
        expect(result).to.be.undefined;
        expect(mongooseModels.Group.remove).to.have.been.calledWith({ _id });
        expect(pubsub.local.topic).to.not.have.been.calledWith(CONSTANTS.EVENTS.DELETED);
        expect(topic.publish).to.not.have.been.called;

        done();
      });
    });
  });
});
