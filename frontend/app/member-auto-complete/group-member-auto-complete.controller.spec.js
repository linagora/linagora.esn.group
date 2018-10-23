'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The GroupMemberAutoCompleteController', function() {
  var $controller, $rootScope, $scope, $elementMock;
  var elementScrollService, emailService, groupService;

  beforeEach(function() {
    module('linagora.esn.group');

    $elementMock = {
      find: function() {}
    };

    module(function($provide) {
      $provide.value('$element', $elementMock);
    });

    inject(function(
      _$controller_,
      _$rootScope_,
      _elementScrollService_,
      _emailService_,
      _groupService_
    ) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      elementScrollService = _elementScrollService_;
      emailService = _emailService_;
      groupService = _groupService_;
    });
  });

  function initController(scope) {
    $scope = scope || $rootScope.$new();

    var controller = $controller('GroupMemberAutoCompleteController', { $scope: $scope });

    $scope.$digest();

    return controller;
  }

  describe('The onTagAdding fn', function() {
    var newMembers;

    beforeEach(function() {
      newMembers = [{ email: 'user1@abc.com' }];
    });

    it('should disallow adding invalid email address', function() {
      emailService.isValidEmail = sinon.spy(function() { return false; });

      var controller = initController();
      var $tag = { email: 'invalid..@email' };
      var response = controller.onTagAdding($tag);

      expect(response).to.be.false;
      expect(controller.error).to.equal('invalidEmail');
      expect(emailService.isValidEmail).to.have.been.calledWith($tag.email);
    });

    it('should not add new tag if it already have been existed in array of new member emails', function() {
      var controller = initController();
      var $tag = newMembers[0];

      controller.newMembers = newMembers;
      var response = controller.onTagAdding($tag);

      expect(response).to.be.false;
      expect(controller.error).to.equal('invalidEmail');
    });

    it('should add new tag if the group.id is undefined', function() {
      var controller = initController();
      var $tag = { email: 'existing-member@current.grp' };

      controller.group = {
        members: [{ id: 'member' }]
      };

      var response = controller.onTagAdding($tag);

      expect(response).to.be.true;
      expect(controller.error).to.be.undefined;
    });

    it('should not add new email tag if the email is used by a group member', function(done) {
      var controller = initController();
      var $tag = { email: 'existing-member@current.grp' };

      controller.group = {
        id: 'groupId',
        members: [{ id: 'member' }]
      };
      groupService.isGroupMemberEmail = sinon.stub().returns($q.when(false));

      controller.onTagAdding($tag)
        .then(function(result) {
          expect(groupService.isGroupMemberEmail).to.have.been.calledWith('groupId', $tag.email);
          expect(controller.error).to.equal('existedMember');
          expect(result).to.equal(false);
          done();
        });

      $rootScope.$digest();
    });

    it('should add new tag if it does not exist in list of tags', function() {
      var controller = initController();
      var $tag = { email: 'user2@abc.com' };

      controller.newMembers = angular.copy(newMembers);
      newMembers.push($tag);

      var response = controller.onTagAdding($tag);

      expect(response).to.be.true;
    });
  });

  describe('The onTagAdded fn', function() {
    it('should call elementScrollService.autoScrollDown', function() {
      elementScrollService.autoScrollDown = sinon.spy();

      var controller = initController();

      controller.onTagAdded();

      expect(elementScrollService.autoScrollDown).to.have.been.calledOnce;
    });
  });

  describe('The search function', function() {
    var query;

    beforeEach(function() {
      query = 'The query';
      groupService.searchMemberCandidates = sinon.stub();
    });

    it('should search with empty array when group is not defined', function() {
      var controller = initController();

      controller.search(query);

      expect(groupService.searchMemberCandidates).to.have.been.calledWith(query, []);
    });

    it('should search with empty array when group members is undefined', function() {
      var controller = initController();

      controller.group = {};
      controller.search(query);

      expect(groupService.searchMemberCandidates).to.have.been.calledWith(query, []);
    });

    it('should search with group members as ignored members', function() {
      var controller = initController();

      controller.group = {
        members: [{member: {objectType: 'user', id: 'foo'}}]
      };
      controller.search(query);

      expect(groupService.searchMemberCandidates).to.have.been.calledWith(query, controller.group.members);
    });

    it('should add the current group email as ignored when group email is defined', function() {
      var controller = initController();

      controller.group = {
        email: 'group1@open-paas.org',
        members: [{member: {objectType: 'user', id: 'foo'}}]
      };
      controller.search(query);

      expect(groupService.searchMemberCandidates).to.have.been.calledWith(query, [
        controller.group.members[0],
        {member: {objectType: 'group', id: controller.group.email}}
      ]);
    });
  });
});
