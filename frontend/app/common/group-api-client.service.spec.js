'use strict';

describe('The groupApiClient service', function() {
  var $httpBackend;
  var groupApiClient;

  beforeEach(module('linagora.esn.group'));

  beforeEach(inject(function(_$httpBackend_, _groupApiClient_) {
    $httpBackend = _$httpBackend_;
    groupApiClient = _groupApiClient_;
  }));

  describe('The create fn', function() {
    it('should POST to right endpoint to create new group', function() {
      var group = { email: 'mygroup@email.com' };

      $httpBackend.expectPOST('/group/api/groups', group).respond(201);

      groupApiClient.create(group);
      $httpBackend.flush();
    });
  });

  describe('The get fn', function() {
    it('should GET to right endpoint to get group by ID', function() {
      var groupId = '123';

      $httpBackend.expectGET('/group/api/groups/' + groupId).respond(200);

      groupApiClient.get(groupId);
      $httpBackend.flush();
    });
  });

  describe('The list fn', function() {
    it('should GET to right endpoint to get groups', function() {
      var options = {
        limit: 10,
        offset: 0
      };

      $httpBackend.expectGET('/group/api/groups?limit=' + options.limit + '&offset=' + options.offset).respond(200, []);

      groupApiClient.list(options);

      $httpBackend.flush();
    });
  });

  describe('The update fn', function() {
    it('should POST to right endpoint to udpate', function() {
      var groupId = '123';
      var updateData = {
        name: 'My group',
        email: 'mygroup@email.com'
      };

      $httpBackend.expectPOST('/group/api/groups/' + groupId, updateData).respond(200, []);

      groupApiClient.update(groupId, updateData);

      $httpBackend.flush();
    });
  });

  describe('The getMembers fn', function() {
    it('should GET to right endpoint to get group members', function() {
      var groupId = '123';
      var options = {
        limit: 10,
        offset: 0
      };

      $httpBackend.expectGET('/group/api/groups/' + groupId + '/members?limit=' + options.limit + '&offset=' + options.offset).respond(200, []);

      groupApiClient.getMembers(groupId, options);

      $httpBackend.flush();
    });
  });

  describe('The removeMembers fn', function() {
    it('should POST to right endpoint to remove group members', function() {
      var groupId = '123';
      var members = [{
        objectType: 'user',
        id: '456'
      }, {
        objectType: 'email',
        id: 'my@email.com'
      }];

      $httpBackend.expectPOST('/group/api/groups/' + groupId + '/members?action=remove', members).respond(204);

      groupApiClient.removeMembers(groupId, members);

      $httpBackend.flush();
    });
  });

  describe('The addMembers fn', function() {
    it('should POST to right endpoint to update', function() {
      var groupId = '123';
      var membersList = [
        { id: '2222', objectType: 'user' },
        { id: 'email@example.com', objectType: 'email' }
      ];

      $httpBackend.expectPOST('/group/api/groups/' + groupId + '/members?action=add', membersList).respond(200, []);

      groupApiClient.addMembers(groupId, membersList);

      $httpBackend.flush();
    });
  });

  describe('The deleteGroup fn', function() {
    it('should DELETE to right endpoint to delete group', function() {
      var groupId = '123';

      $httpBackend.expectDELETE('/group/api/groups/' + groupId).respond(204);

      groupApiClient.deleteGroup(groupId);

      $httpBackend.flush();
    });
  });
});
