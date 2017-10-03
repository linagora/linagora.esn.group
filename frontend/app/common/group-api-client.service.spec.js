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
});
