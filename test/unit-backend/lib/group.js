const q = require('q');
const mockery = require('mockery');
const sinon = require('sinon');
const { expect } = require('chai');
const models = require('linagora-rse').core.models;
const { Event } = models;

describe('The group module', function() {
  let pubsub, db, mongooseModels, topic, _id, group, collaborationMock, handlerMock, CONSTANTS;
  let getModule;

  beforeEach(function() {
    CONSTANTS = require(this.moduleHelpers.backendPath + '/lib/constants');
    _id = '1';
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
        findOne: sinon.stub(),
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
    collaborationMock = {};

    this.moduleHelpers.addDep('core-models', { Event });
    this.moduleHelpers.addDep('pubsub', pubsub);
    this.moduleHelpers.addDep('db', db);
    this.moduleHelpers.addDep('collaboration', collaborationMock);

    getModule = () => require(`${this.moduleHelpers.backendPath}/lib/group`)(this.moduleHelpers.dependencies);
  });

  describe('The addMembers function', function() {
    it('should add members to group', function(done) {
      const group = { id: '123' };
      const members = [{}, {}];

      collaborationMock.member = {
        addMembers: sinon.spy(function(g, m, callback) { callback(null, []); })
      };
      handlerMock = {
        addGroupMembers: sinon.stub().returns(Promise.resolve())
      };
      mockery.registerMock('./registry', () => ({
        getHandlers: () => [handlerMock]
      }));

      getModule().addMembers(group, members)
        .then(() => {
          expect(collaborationMock.member.addMembers).to.have.been.calledOnce;
          expect(collaborationMock.member.addMembers).to.have.been.calledWith(group, members);
          expect(handlerMock.addGroupMembers).to.have.been.calledWith(group, members);
          done();
        })
        .catch(err => done(err || 'should resolve'));
    });
  });

  describe('The create function', function() {
    it('should create a group', function(done) {
      const created = { _id, name: 'The Group name' };

      pubsub.local.topic.withArgs(CONSTANTS.EVENTS.CREATED).returns(topic);
      mongooseModels.Group.create.returns(Promise.resolve(created));
      handlerMock = {
        createGroup: sinon.stub().returns(Promise.resolve())
      };
      mockery.registerMock('./registry', () => ({
        getHandlers: () => [handlerMock]
      }));

      getModule().create(group).then(result => {
        expect(mongooseModels.Group.create).to.have.been.calledWith(group);
        expect(result).to.deep.equals(created);
        expect(pubsub.local.topic).to.have.been.calledWith(CONSTANTS.EVENTS.CREATED);
        expect(topic.publish).to.have.been.calledWith(
          sinon.match.instanceOf(Event).and(sinon.match({
            id: _id,
            name: CONSTANTS.EVENTS.CREATED,
            payload: created
          }))
        );
        expect(handlerMock.createGroup).to.have.been.calledWith(created);
        done();
      }).catch(err => done(err || 'should resolve'));
    });
  });

  describe('The updateById function', function() {
    it('should call mongoose and publish created event in local pubsub on success', function(done) {
      const updated = { _id, name: 'The Group name' };

      pubsub.local.topic.withArgs(CONSTANTS.EVENTS.UPDATED).returns(topic);
      mongooseModels.Group.findOneAndUpdate.returns({ exec: () => Promise.resolve(group) });
      mongooseModels.Group.findOne.returns(Promise.resolve(updated));

      handlerMock = {
        updateGroup: sinon.stub().returns(Promise.resolve())
      };
      mockery.registerMock('./registry', () => ({
        getHandlers: () => [handlerMock]
      }));

      getModule().updateById(_id, group).then(result => {
        expect(mongooseModels.Group.findOneAndUpdate).to.have.been.calledWith({ _id }, { $set: group });
        expect(result).to.deep.equals(updated);
        expect(pubsub.local.topic).to.have.been.calledWith(CONSTANTS.EVENTS.UPDATED);
        expect(topic.publish).to.have.been.calledWith(
          sinon.match.instanceOf(Event).and(sinon.match({
            id: _id,
            name: CONSTANTS.EVENTS.UPDATED,
            payload: updated
          }))
        );
        expect(handlerMock.updateGroup).to.have.been.calledWith(group, updated);

        done();
      }).catch(err => done(err || 'should resolve'));
    });
  });

  describe('The deleteById function', function() {
    it('should call mongoose and publish deleted event in local pubsub on success', function(done) {
      const deleted = { _id, name: 'The Group name' };

      pubsub.local.topic.withArgs(CONSTANTS.EVENTS.DELETED).returns(topic);
      mongooseModels.Group.findByIdAndRemove.returns({ exec: () => Promise.resolve(deleted) });
      handlerMock = {
        deleteGroup: sinon.stub().returns(Promise.resolve())
      };
      mockery.registerMock('./registry', () => ({
        getHandlers: () => [handlerMock]
      }));

      getModule().deleteById(_id).then(result => {
        expect(mongooseModels.Group.findByIdAndRemove).to.have.been.calledWith(_id);
        expect(result).to.deep.equals(deleted);
        expect(pubsub.local.topic).to.have.been.calledWith(CONSTANTS.EVENTS.DELETED);
        expect(topic.publish).to.have.been.calledWith(
          sinon.match.instanceOf(Event).and(sinon.match({
            id: _id,
            name: CONSTANTS.EVENTS.DELETED,
            payload: deleted
          }))
        );
        expect(handlerMock.deleteGroup).to.have.been.calledWith(deleted);
        done();
      });
    });

    it('should not publish in topic if group to delete does not exist', function(done) {
      pubsub.local.topic.withArgs(CONSTANTS.EVENTS.DELETED).returns(topic);
      mongooseModels.Group.findByIdAndRemove.returns({ exec: () => Promise.resolve() });
      handlerMock = {
        deleteGroup: sinon.stub().returns(Promise.resolve())
      };
      mockery.registerMock('./registry', () => ({
        getHandlers: () => [handlerMock]
      }));

      getModule().deleteById(_id).then(result => {
        expect(result).to.be.undefined;
        expect(mongooseModels.Group.findByIdAndRemove).to.have.been.calledWith(_id);
        expect(pubsub.local.topic).to.not.have.been.calledWith(CONSTANTS.EVENTS.DELETED);
        expect(topic.publish).to.not.have.been.called;
        expect(handlerMock.deleteGroup).to.have.been.called;

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

  describe('The removeMembers function', function() {
    it('should remove members from group', function(done) {
      const group = { id: '123' };
      const members = [{}, {}];

      collaborationMock.member = {
        removeMembers: sinon.spy(function(g, m, callback) { callback(); })
      };
      handlerMock = {
        removeGroupMembers: sinon.stub().returns(Promise.resolve())
      };
      mockery.registerMock('./registry', () => ({
        getHandlers: () => [handlerMock]
      }));

      getModule().removeMembers(group, members)
        .then(() => {
          expect(collaborationMock.member.removeMembers).to.have.been.calledOnce;
          expect(collaborationMock.member.removeMembers).to.have.been.calledWith(group, members);
          expect(handlerMock.removeGroupMembers).to.have.been.calledWith(group, members);
          done();
        })
        .catch(err => done(err || 'should resolve'));
    });
  });

  describe('The resolveMember function', function() {
    it('should resolve member and keep the tuple information', function(done) {
      const memberTuple = { objectType: 'user', id: '123' };
      const user = { id: '123', name: 'Alice' };

      collaborationMock.memberResolver = {
        resolve: sinon.stub().returns(q.resolve(user))
      };

      getModule().resolveMember(memberTuple)
        .then(member => {
          expect(member).to.deep.equal({
            id: memberTuple.id,
            objectType: memberTuple.objectType,
            member: user
          });

          done();
        })
        .catch(err => done(err || 'should resolve'));
    });
  });
});
