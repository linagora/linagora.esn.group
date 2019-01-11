'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The GroupMemberListController', function() {
  var $rootScope, $controller;
  var infiniteScrollHelperMock, GROUP_EVENTS;

  beforeEach(function() {
    module('linagora.esn.group');

    infiniteScrollHelperMock = sinon.spy();

    module(function($provide) {
      $provide.value('infiniteScrollHelper', infiniteScrollHelperMock);
      $provide.constant('ELEMENTS_PER_REQUEST', null);
    });

    inject(function(
      _$rootScope_,
      _$controller_,
      _GROUP_EVENTS_
    ) {
      $rootScope = _$rootScope_;
      $controller = _$controller_;
      GROUP_EVENTS = _GROUP_EVENTS_;
    });
  });

  function initController(scope) {
    scope = scope || $rootScope.$new();

    var controller = $controller('GroupMemberListController', { $scope: scope });

    controller.$onInit();
    scope.$digest();

    return controller;
  }

  it('should call infiniteScrollHelper to load elements', function() {
    initController();

    expect(infiniteScrollHelperMock).to.have.been.called;
  });

  it('should listen on event to remove members from the list', function() {
    var controller = initController();
    var members = [{
      objectType: 'user',
      id: 1
    }, {
      objectType: 'email',
      id: 'my@email.com'
    }];

    controller.elements = members;

    $rootScope.$broadcast(GROUP_EVENTS.GROUP_MEMBERS_REMOVED, members.slice());

    expect(controller.elements).to.deep.equal([]);
  });

  it('should add members to infiniteScroll elements list on MEMBERS_ADDED event', function() {
    var ctrl = initController();
    var members = [
      { id: 'member1', objectType: 'user', member: {} },
      { id: 'member2', objectType: 'user', member: {} }
    ];

    ctrl.elements = [];

    $rootScope.$broadcast(GROUP_EVENTS.GROUP_MEMBERS_ADDED, members);
    $rootScope.$digest();

    expect(ctrl.elements.length).to.equal(2);
    expect(ctrl.elements).to.include(members[0]);
    expect(ctrl.elements).to.include(members[1]);
  });
});
