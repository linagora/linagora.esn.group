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

  describe('The $onInit fn', function() {
    it('should collect member and group id to excluded members list', function() {
      var controller = initController();

      controller.group = {
        id: 'group1',
        members: [
          { member: { id: 'user', objectType: 'user' } },
          { member: { id: 'contact', objectType: 'contact' } },
          { member: { id: 'group', objectType: 'group' } }
        ]
      };

      controller.$onInit();

      expect(controller.excludedMembers).to.shallowDeepEqual([
        { id: 'group1', objectType: 'group' },
        { id: 'user', objectType: 'user' },
        { id: 'contact', objectType: 'contact' },
        { id: 'group', objectType: 'group' }
      ]);
    });
  });

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
    it('should add $tag to the excluded members list', function() {
      var controller = initController();

      elementScrollService.autoScrollDown = angular.noop;
      controller.onTagAdded({ id: '123', objectType: 'user' });

      expect(controller.excludedMembers).to.shallowDeepEqual([
        { id: '123', objectType: 'user' }
      ]);
    });

    it('should call elementScrollService.autoScrollDown', function() {
      elementScrollService.autoScrollDown = sinon.spy();

      var controller = initController();

      controller.onTagAdded({});

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

    it('should pass excluded members list to #searchMemberCandidates', function() {
      var controller = initController();

      controller.group = {};
      controller.excludedMembers = [{ objectType: 'foo', id: 'bar' }];
      controller.search(query);

      expect(groupService.searchMemberCandidates).to.have.been.calledWith(query, controller.excludedMembers);
    });
  });

  describe('The onTagRemoved method', function() {
    it('should remove the removed tag in excluded members list', function() {
      var controller = initController();
      var tag = { id: '123', objectType: 'bar' };

      controller.excludedMembers = [tag];
      controller.onTagRemoved(tag);

      expect(controller.excludedMembers).to.not.include(tag);
    });
  });
});
