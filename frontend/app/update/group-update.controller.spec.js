'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The GroupUpdateController', function() {
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

  function initController(locals) {
    return $controller('GroupUpdateController', locals || {});
  }

  describe('The update function', function() {
    it('should call groupService.update to update group', function() {
      groupService.update = sinon.spy();

      var group = { name: 'abc', email: 'abc@domain.com', members: {} };
      var controller = initController({ group: group });

      controller.update();
      $rootScope.$digest();

      expect(groupService.update).to.have.been.calledWith(group);
    });
  });
});
