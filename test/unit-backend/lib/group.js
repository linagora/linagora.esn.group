const sinon = require('sinon');
const { expect } = require('chai');
const models = require('linagora-rse').core.models;
const { Event } = models;

describe('The group module', function() {
  let pubsub, db, mongooseModels, topic, _id, group, CONSTANTS;
  let getModule;

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
        findByIdAndRemove: sinon.stub()
      }
    };
    db = {
      mongo: {
        mongoose: {
          model: name => mongooseModels[name]
        }
      }
    };

    this.moduleHelpers.addDep('core-models', { Event });
    this.moduleHelpers.addDep('pubsub', pubsub);
    this.moduleHelpers.addDep('db', db);

    getModule = () => require(this.moduleHelpers.backendPath + '/lib/group')(this.moduleHelpers.dependencies);
  });

  describe('The create function', function() {
    it('should call mongoose and publish created event in local pubsub on success', function(done) {
      const created = { _id, name: 'The Group name' };

      pubsub.local.topic.withArgs(CONSTANTS.EVENTS.CREATED).returns(topic);
      mongooseModels.Group.create.returns(Promise.resolve(created));

      getModule().create(group).then(result => {
        expect(mongooseModels.Group.create).to.have.been.calledWith(group);
        expect(result).to.deep.equals(created);
        expect(pubsub.local.topic).to.have.been.calledWith(CONSTANTS.EVENTS.CREATED);
        expect(topic.publish).to.have.been.calledWith(sinon.match.instanceOf(Event));

        done();
      });
    });
  });

  describe('The updateById function', function() {
    it('should call mongoose and publish created event in local pubsub on success', function(done) {
      const updated = { _id, name: 'The Group name' };

      pubsub.local.topic.withArgs(CONSTANTS.EVENTS.UPDATED).returns(topic);
      mongooseModels.Group.findOneAndUpdate.returns({ exec: () => Promise.resolve(updated) });

      getModule().updateById(_id, group).then(result => {
        expect(mongooseModels.Group.findOneAndUpdate).to.have.been.calledWith({ _id }, { $set: group }, { new: true });
        expect(result).to.deep.equals(updated);
        expect(pubsub.local.topic).to.have.been.calledWith(CONSTANTS.EVENTS.UPDATED);
        expect(topic.publish).to.have.been.calledWith(sinon.match.instanceOf(Event));

        done();
      });
    });
  });

  describe('The deleteById function', function() {
    it('should call mongoose and publish deleted event in local pubsub on success', function(done) {
      const deleted = { _id, name: 'The Group name' };

      pubsub.local.topic.withArgs(CONSTANTS.EVENTS.DELETED).returns(topic);
      mongooseModels.Group.findByIdAndRemove.returns({ exec: () => Promise.resolve(deleted) });

      getModule().deleteById(_id).then(result => {
        expect(mongooseModels.Group.findByIdAndRemove).to.have.been.calledWith(_id);
        expect(result).to.deep.equals(deleted);
        expect(pubsub.local.topic).to.have.been.calledWith(CONSTANTS.EVENTS.DELETED);
        expect(topic.publish).to.have.been.calledWith(sinon.match.instanceOf(Event));

        done();
      });
    });

    it('should not publish in topic if group to delete does not exist', function(done) {
      pubsub.local.topic.withArgs(CONSTANTS.EVENTS.DELETED).returns(topic);
      mongooseModels.Group.findByIdAndRemove.returns({ exec: () => Promise.resolve() });

      getModule().deleteById(_id).then(result => {
        expect(result).to.be.undefined;
        expect(mongooseModels.Group.findByIdAndRemove).to.have.been.calledWith(_id);
        expect(pubsub.local.topic).to.not.have.been.calledWith(CONSTANTS.EVENTS.DELETED);
        expect(topic.publish).to.not.have.been.called;

        done();
      });
    });
  });

  describe('The getMemberEmail function', function() {
    it('should should return preferred email of user member', function() {
      const member = {
        objectType: 'user',
        member: {
          preferredEmail: 'user@email.com'
        }
      };

      expect(
        getModule().getMemberEmail(member)
      ).to.equal(member.member.preferredEmail);
    });

    it('should should return plain email of email member', function() {
      const member = {
        objectType: 'email',
        member: 'member@email.com'
      };

      expect(
        getModule().getMemberEmail(member)
      ).to.equal(member.member);
    });
  });

  describe('The getAllMembers function', function() {
    let collaborationMock;

    beforeEach(function() {
      collaborationMock = {};
      this.moduleHelpers.addDep('collaboration', collaborationMock);
    });

    it('should call collaboration module to get all group members', function(done) {
      const group = {
        members: [{}, {}, {}]
      };

      collaborationMock.member = {
        getMembers(collaboration, objectType, query) {
          expect(collaboration).to.deep.equal(group);
          expect(objectType).to.equal(CONSTANTS.OBJECT_TYPE);
          expect(query).to.deep.equal({ limit: group.members.length });
          done();
        }
      };

      getModule().getAllMembers(group);
    });
  });
});
