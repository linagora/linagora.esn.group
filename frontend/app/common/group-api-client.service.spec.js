'use strict';

describe('The groupApiClient service', function() {
  var $httpBackend;
  var groupApiClient, groupId;

  beforeEach(module('linagora.esn.group'));

  beforeEach(function() {
    groupId = '123';
  });

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

  describe('The getFromEmail function', function() {
    it('should GET to right endpoint to get groups', function() {
      var email = 'groups@open-paas.org';

      $httpBackend.expectGET('/group/api/groups?email=' + email + '&limit=1').respond(200, []);

      groupApiClient.getFromEmail(email);

      $httpBackend.flush();
    });
  });

  describe('The update fn', function() {
    it('should POST to right endpoint to udpate', function() {
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
      var options = {
        limit: 10,
        offset: 0
      };

      $httpBackend.expectGET('/group/api/groups/' + groupId + '/members?limit=' + options.limit + '&offset=' + options.offset).respond(200, []);

      groupApiClient.getMembers(groupId, options);

      $httpBackend.flush();
    });
  });

  describe('The getAllMembers fn', function() {
    it('should GET to right endpoint to get group members', function() {
      $httpBackend.expectGET('/group/api/groups/' + groupId + '/members?limit=0').respond(200, []);

      groupApiClient.getAllMembers(groupId);

      $httpBackend.flush();
    });
  });

  describe('The removeMembers fn', function() {
    it('should POST to right endpoint to remove group members', function() {
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
      $httpBackend.expectDELETE('/group/api/groups/' + groupId).respond(204);

      groupApiClient.deleteGroup(groupId);

      $httpBackend.flush();
    });
  });

  describe('The Search fn', function() {
    it('should GET to right endpoint to get groups with the query', function() {
      var options = {
        limit: 10,
        offset: 0,
        query: 'test'
      };

      $httpBackend.expectGET('/group/api/groups?limit=' + options.limit + '&offset=' + options.offset + '&query=' + options.query).respond(200, []);

      groupApiClient.search(options.query, options.limit, options.offset);

      $httpBackend.flush();
    });
  });
});
