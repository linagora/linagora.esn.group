'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The GroupListController', function() {
  var $rootScope, $controller;
  var infiniteScrollHelperMock;

  beforeEach(function() {
    infiniteScrollHelperMock = sinon.spy();

    angular.mock.module(function($provide) {
      $provide.value('infiniteScrollHelper', infiniteScrollHelperMock);
    });
  });

  beforeEach(function() {
    module('linagora.esn.group');

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

    var controller = $controller('GroupListController', { scope: scope });

    controller.$onInit();
    scope.$digest();

    return controller;
  }

  it('should call infiniteScrollHelper to load elements', function() {
    initController();

    expect(infiniteScrollHelperMock).to.have.been.called;
  });
});
