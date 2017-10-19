'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The GroupCreateController', function() {
  var $rootScope, $controller;
  var groupService;

  beforeEach(function() {
    module('linagora.esn.group');

    inject(function(
      _$rootScope_,
      _$controller_,
      _groupService_
    ) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      groupService = _groupService_;
    });
  });

  function initController(scope) {
    scope = scope || $rootScope.$new();

    var controller = $controller('GroupCreateController', { scope: scope });

    scope.$digest();

    return controller;
  }

  it('should initialize newMembers with empty array', function() {
    var controller = initController();

    expect(controller.newMembers).to.deep.equal([]);
  });

  describe('The create function', function() {
    it('should call groupService.create to create group with right members', function() {
      groupService.create = sinon.spy();

      var group = { name: 'abc', email: 'abc@domain.com', members: {} };
      var newMembers = [
        { email: 'user1@domain.com' },
        { email: 'user2@domain.com' }
      ];
      var expectResult = {
        name: group.name,
        email: group.email,
        members: [newMembers[0].email, newMembers[1].email]
      };

      var controller = initController();

      controller.newMembers = newMembers;
      controller.group = group;
      controller.create();
      $rootScope.$digest();

      expect(groupService.create).to.have.been.calledWith(expectResult);
    });
  });
});
