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
      expect(emailService.isValidEmail).to.have.been.calledWith($tag.email);
    });

    it('should not add new tag if it already have been existed in array of new member emails', function() {
      var controller = initController();
      var $tag = newMembers[0];

      controller.newMembers = newMembers;
      var response = controller.onTagAdding($tag);

      expect(response).to.be.false;
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
});
