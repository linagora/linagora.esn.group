'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The GroupAddMembersController', function() {
  var $controller;
  var groupService;

  beforeEach(function() {
    module('linagora.esn.group');

    inject(function(
      _$rootScope_,
      _$controller_,
      _groupService_
    ) {
      $controller = _$controller_;
      groupService = _groupService_;
    });
  });

  function initController(locals) {
    return $controller('GroupAddMembersController', locals || {});
  }

  describe('The addMembers function', function() {
    it('should call groupService.addMembers with a list of member objects', function() {
      var group = { id: '123', name: 'abc', email: 'abc@test.com' };
      var controller = initController({ group: group });

      controller.newMembers = [
        { id: 'userid', objectType: 'user' },
        { email: 'contact@example.com', objectType: 'contact'},
        { email: 'email@example.com'}
      ];
      groupService.addMembers = sinon.spy();

      controller.addMembers();

      expect(groupService.addMembers).to.have.been.calledWith(group, [
        { id: 'userid', objectType: 'user' },
        { id: 'contact@example.com', objectType: 'email' },
        { id: 'email@example.com', objectType: 'email'}
      ]);
    });
  });
});
