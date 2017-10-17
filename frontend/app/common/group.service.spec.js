'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The groupService', function() {
  var $rootScope;
  var GROUP_EVENTS;
  var groupService, groupApiClient;
  var ContactAttendeeProvider, domainSearchMembersProvider;

  beforeEach(function() {
    module('linagora.esn.group');

    inject(function(
      _$rootScope_,
      _groupService_,
      _groupApiClient_,
      _GROUP_EVENTS_,
      _ContactAttendeeProvider_,
      _domainSearchMembersProvider_
    ) {
      $rootScope = _$rootScope_;
      groupApiClient = _groupApiClient_;
      groupService = _groupService_;
      GROUP_EVENTS = _GROUP_EVENTS_;
      ContactAttendeeProvider = _ContactAttendeeProvider_;
      domainSearchMembersProvider = _domainSearchMembersProvider_;
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

  describe('The searchMemberCandidates function', function() {
    var users, contacts;
    var domainSearchMembersProviderMock;
    var query, limit;

    beforeEach(function() {
      domainSearchMembersProviderMock = {};
      users = [
        { email: 'user1@domain.com' },
        { email: 'user2@domain.com' },
        { email: 'user3@domain.com' }
      ];

      contacts = [
        { email: 'contact1@abc.com' },
        { email: 'contact2@abc.com' },
        { email: 'contact3@abc.com' }
      ];
      query = 'abc';
      limit = 20;

      domainSearchMembersProvider.get = function() {
        return domainSearchMembersProviderMock;
      };
    });

    it('should return a list member candidates includes domain users and contacts', function(done) {
      ContactAttendeeProvider.searchAttendee = sinon.stub().returns($q.when(contacts));
      domainSearchMembersProviderMock.searchAttendee = sinon.stub().returns($q.when(users));

      groupService.searchMemberCandidates(query)
        .then(function(members) {
          expect(ContactAttendeeProvider.searchAttendee).to.have.been.calledWith(query, limit);
          expect(domainSearchMembersProviderMock.searchAttendee).to.have.been.calledWith(query, limit);
          expect(members).to.shallowDeepEqual(users.concat(contacts));

          done();
        });

      $rootScope.$digest();
    });

    it('should return a list member candidates with unique emails', function(done) {
      contacts = [users[0]]; // make a contact have the same email with an user.

      ContactAttendeeProvider.searchAttendee = sinon.stub().returns($q.when(contacts));
      domainSearchMembersProviderMock.searchAttendee = sinon.stub().returns($q.when(users));

      groupService.searchMemberCandidates(query)
        .then(function(members) {
          expect(ContactAttendeeProvider.searchAttendee).to.have.been.calledWith(query, limit);
          expect(domainSearchMembersProviderMock.searchAttendee).to.have.been.calledWith(query, limit);
          expect(members).to.shallowDeepEqual(users);

          done();
        });

      $rootScope.$digest();
    });

    it('should return a list member candidates with email is require field', function(done) {
      var realContacts = angular.copy(contacts);

      realContacts.push({}); //create a new contact without email field
      ContactAttendeeProvider.searchAttendee = sinon.stub().returns($q.when(realContacts));
      domainSearchMembersProviderMock.searchAttendee = sinon.stub().returns($q.when(users));

      groupService.searchMemberCandidates(query)
        .then(function(members) {
          expect(ContactAttendeeProvider.searchAttendee).to.have.been.calledWith(query, limit);
          expect(domainSearchMembersProviderMock.searchAttendee).to.have.been.calledWith(query, limit);
          expect(members).to.shallowDeepEqual(users.concat(contacts));

          done();
        });

      $rootScope.$digest();
    });
  });
});
