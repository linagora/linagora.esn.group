'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The groupService', function() {
  var $rootScope;
  var GROUP_EVENTS;
  var groupService, groupApiClient, userAPI;
  var attendeeService;

  beforeEach(function() {

    module('linagora.esn.group');

    inject(function(
      _$rootScope_,
      _groupService_,
      _groupApiClient_,
      _GROUP_EVENTS_,
      _attendeeService_,
      _userAPI_
    ) {
      $rootScope = _$rootScope_;
      groupApiClient = _groupApiClient_;
      groupService = _groupService_;
      GROUP_EVENTS = _GROUP_EVENTS_;
      attendeeService = _attendeeService_;
      userAPI = _userAPI_;
    });
  });

  describe('The create function', function() {
    it('should reject if group is undefined', function(done) {
      groupService.create()
        .catch(function(err) {
          expect(err.message).to.equal('Group is required');

          done();
        });

      $rootScope.$digest();
    });

    it('should broadcast an event when create group is sucessfully', function(done) {
      var group = { foo: 'bar' };

      groupApiClient.create = sinon.stub().returns($q.when({ data: group }));
      $rootScope.$broadcast = sinon.spy();

      groupService.create(group)
        .then(function() {
          expect(groupApiClient.create).to.have.been.calledWith(group);
          expect($rootScope.$broadcast).to.have.been.calledWith(GROUP_EVENTS.GROUP_CREATED, group);

          done();
        });

      $rootScope.$digest();
    });

    it('should not reject when failed to create group', function(done) {
      var group = { foo: 'bar' };

      groupApiClient.create = sinon.stub().returns($q.reject());
      $rootScope.$broadcast = sinon.spy();

      groupService.create(group)
        .catch(function() {
          expect(groupApiClient.create).to.have.been.calledWith(group);
          expect($rootScope.$broadcast).to.not.have.been.called;

          done();
        });

      $rootScope.$digest();
    });
  });

  describe('The update function', function() {
    it('should reject promise when group.id is missing', function(done) {
      var group = {};

      groupService.update(group).catch(function(err) {
        expect(err.message).to.equal('group.id is required');
        done();
      });

      $rootScope.$digest();
    });

    it('should call groupApiClient to update group', function() {
      var group = { id: 123, name: 'my group', email: 'mygroup@email.com' };

      groupApiClient.update = sinon.stub().returns($q.when({}));
      groupService.update(group);
      $rootScope.$digest();

      expect(groupApiClient.update).to.have.been.calledWith(group.id, sinon.match({
        name: group.name,
        email: group.email
      }));
    });

    it('should broadcast event with updated group on success', function() {
      var group = { id: 123, name: 'my group', email: 'mygroup@email.com' };
      var response = {
        data: { name: 'updated group' }
      };

      groupApiClient.update = sinon.stub().returns($q.when(response));
      $rootScope.$broadcast = sinon.spy();
      groupService.update(group);
      $rootScope.$digest();

      expect($rootScope.$broadcast).to.have.been.calledWith(GROUP_EVENTS.GROUP_UPDATED, response.data);
    });
  });

  describe('The removeMembers function', function() {
    it('should call groupApiClient to remove group members', function() {
      var groupId = '123';
      var members = [{
        objectType: 'user',
        id: '456'
      }, {
        objectType: 'email',
        id: 'my@email.com'
      }];

      groupApiClient.removeMembers = sinon.stub().returns($q.when());
      groupService.removeMembers(groupId, members);
      $rootScope.$digest();

      expect(groupApiClient.removeMembers).to.have.been.calledWith(groupId, members);
    });

    it('should broadcast event with removed members on success', function() {
      var groupId = '123';
      var members = [{
        objectType: 'user',
        id: '456'
      }, {
        objectType: 'email',
        id: 'my@email.com'
      }];

      groupApiClient.removeMembers = sinon.stub().returns($q.when());
      $rootScope.$broadcast = sinon.spy();
      groupService.removeMembers(groupId, members);
      $rootScope.$digest();

      expect($rootScope.$broadcast).to.have.been.calledWith(GROUP_EVENTS.GROUP_MEMBERS_REMOVED, members);
    });
  });

  describe('The addMembers function', function() {
    it('should reject promise when group.id is missing', function(done) {
      var group = {};

      groupService.addMembers(group).catch(function(err) {
        expect(err.message).to.equal('group.id is required');
        done();
      });

      $rootScope.$digest();
    });

    it('should call groupApiClient to add members', function() {
      var group = { id: 123};
      var members = [
        { id: 'example@email.com', objectType: 'email' }
      ];

      groupApiClient.addMembers = sinon.stub().returns($q.when({}));
      groupService.addMembers(group, members);
      $rootScope.$digest();

      expect(groupApiClient.addMembers).to.have.been.calledWith(group.id, sinon.match(members));
    });

    it('should broadcast event with added members on success', function() {
      var group = { id: 123 };
      var members = [{ id: 'exmaple@email.com', objectType: 'email' }];
      var response = {
        data: [
          {
            id: 'exmaple@email.com',
            objectType: 'email',
            member: 'exmaple@email.com'
          }
        ]
      };

      groupApiClient.addMembers = sinon.stub().returns($q.when(response));
      $rootScope.$broadcast = sinon.spy();
      groupService.addMembers(group, members);
      $rootScope.$digest();

      expect($rootScope.$broadcast).to.have.been.calledWith(GROUP_EVENTS.GROUP_MEMBERS_ADDED, response.data);
    });
  });

  describe('The searchMemberCandidates function', function() {
    var candidates;
    var query, limit;

    beforeEach(function() {
      candidates = [
        { email: 'user1@domain.com' },
        { email: 'user2@domain.com' },
        { email: 'user3@domain.com' },
        { id: 'contact1', email: 'contact1@domain.com' },
        { id: 'contact2', email: 'contact2@domain.com' }
      ];

      query = 'abc';
      limit = 20;
    });

    it('should call attendeeService.getAttendeeCandidates with query, limit, user, contact and group as required objectTypes', function(done) {
      attendeeService.getAttendeeCandidates = sinon.stub().returns($q.when(candidates));

      groupService.searchMemberCandidates(query)
        .then(function(members) {
          expect(attendeeService.getAttendeeCandidates).to.have.been.calledWith(query, limit, ['user', 'contact', 'group']);
          expect(members).to.shallowDeepEqual(candidates);

          done();
        });

      $rootScope.$digest();
    });

    it('should return a list member candidates as email is a required field', function(done) {
      var newCandidates = candidates.concat({}); //add a new candidate without email field

      attendeeService.getAttendeeCandidates = sinon.stub().returns($q.when(newCandidates));

      groupService.searchMemberCandidates(query)
        .then(function(members) {
          expect(attendeeService.getAttendeeCandidates).to.have.been.calledWith(query, limit, ['user', 'contact', 'group']);
          expect(members.length).to.equal(candidates.length);
          expect(members).to.shallowDeepEqual(candidates);

          done();
        });

      $rootScope.$digest();
    });

    it('should return a list of candidates without ignored members', function(done) {
      var ignoreCandidates = [
        { member: { id: candidates[2].email, objectTypes: 'email'} },
        { member: { id: candidates[3].id, objectTypes: 'user' } }
      ];

      attendeeService.getAttendeeCandidates = sinon.stub().returns($q.when(candidates));

      groupService.searchMemberCandidates(query, ignoreCandidates)
        .then(function(members) {
          expect(attendeeService.getAttendeeCandidates).to.have.been.calledWith(query, limit, ['user', 'contact', 'group']);
          expect(members.length).to.equal(3);
          expect(members).to.include(candidates[0]);
          expect(members).to.include(candidates[1]);
          expect(members).to.include(candidates[4]);
          done();
        });

      $rootScope.$digest();
    });
  });

  describe('The deleteGroup function', function() {
    it('should broadcast event with deleted group Id when group is deleted', function() {
      var response = { status: 204 };
      var group = {
        id: 123,
        name: 'Group'
      };

      groupApiClient.deleteGroup = sinon.stub().returns($q.when(response));
      $rootScope.$broadcast = sinon.spy();
      groupService.deleteGroup(group);
      $rootScope.$digest();

      expect($rootScope.$broadcast).to.have.been.calledWith(GROUP_EVENTS.GROUP_DELETED, group);
    });
  });

  describe('The isEmailAvailableToUse function', function() {
    it('should resolve value of false if email is used by another group', function(done) {
      var response = { data: [{ id: 123, name: 'group' }] };

      groupApiClient.list = sinon.stub().returns($q.when(response));

      groupService.isEmailAvailableToUse('email', []).then(function(result) {
        expect(groupApiClient.list).to.have.been.calledWith({ email: 'email' });
        expect(result).to.not.be.ok;
        done();
      });

      $rootScope.$digest();
    });

    it('should resolve value of false if email is used by another user', function(done) {
      var response = { data: [{ id: 123, name: 'group' }] };

      groupApiClient.list = sinon.stub().returns($q.when({ data: [] }));
      userAPI.getUsersByEmail = sinon.stub().returns($q.when(response));

      groupService.isEmailAvailableToUse('email', []).then(function(result) {
        expect(result).to.equal(false);
        expect(userAPI.getUsersByEmail).to.have.been.calledWith('email');
        done();
      });

      $rootScope.$digest();
    });

    it('should resolve value of true if email is not used by any group nor user', function(done) {
      var response = { data: [] };

      userAPI.getUsersByEmail = sinon.stub().returns($q.when(response));
      groupApiClient.list = sinon.stub().returns($q.when(response));

      groupService.isEmailAvailableToUse('email', []).then(function(result) {
        expect(result).to.equal(true);
        expect(userAPI.getUsersByEmail).to.have.been.calledWith('email');
        done();
      });

      $rootScope.$digest();
    });

    it('should resolve value of true if email is not changed', function(done) {
      var group = { id: 123, name: 'group' };

      userAPI.getUsersByEmail = sinon.stub().returns($q.when({ data: [] }));
      groupApiClient.list = sinon.stub().returns($q.when({ data: [group] }));

      groupService.isEmailAvailableToUse('email', [group]).then(function(result) {
        expect(result).to.equal(true);
        expect(groupApiClient.list).to.have.been.calledWith({ email: 'email' });
        done();
      });

      $rootScope.$digest();
    });
  });

  describe('The isGroupMemberEmail function', function() {
    it('should return false if there is existing member of given email', function(done) {
      groupApiClient.getMembers = sinon.stub().returns($q.when({ data: [{ objectType: 'user', id: '123'}] }));

      groupService.isGroupMemberEmail('groupId', 'email@exampl.com')
        .then(function(result) {
          expect(result).to.equal(false);
          done();
        });

      $rootScope.$digest();
    });

    it('should return true if there is no existing member of given email', function(done) {
      groupApiClient.getMembers = sinon.stub().returns($q.when({ data: [] }));

      groupService.isGroupMemberEmail('groupId', 'email@exampl.com')
        .then(function(result) {
          expect(result).to.equal(true);
          done();
        });

      $rootScope.$digest();
    });
  });
});
