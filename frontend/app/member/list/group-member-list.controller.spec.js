'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The GroupMemberListController', function() {
  var $rootScope, $controller;
  var infiniteScrollHelperMock;

  beforeEach(function() {
    infiniteScrollHelperMock = sinon.spy();

    angular.mock.module('linagora.esn.group', function($provide) {
      $provide.value('infiniteScrollHelper', infiniteScrollHelperMock);
    });

    inject(function(
      _$rootScope_,
      _$controller_
    ) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
    });
  });

  function initController(scope) {
    scope = scope || $rootScope.$new();

    var controller = $controller('GroupMemberListController', { scope: scope });

    controller.$onInit();
    scope.$digest();

    return controller;
  }

  it('should call infiniteScrollHelper to load elements', function() {
    initController();

    expect(infiniteScrollHelperMock).to.have.been.called;
  });
});
