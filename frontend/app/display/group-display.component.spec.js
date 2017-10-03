'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The groupDisplay component', function() {
  var $rootScope, $compile, $q;
  var groupApiClient;
  var group;

  beforeEach(function() {
    module('jadeTemplates');
    angular.mock.module('linagora.esn.group', function($provide) {
      $provide.value('infiniteScrollHelper', angular.noop);
    });
  });

  beforeEach(inject(function(_$rootScope_, _$compile_, _$q_, _groupApiClient_) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $q = _$q_;
    groupApiClient = _groupApiClient_;
  }));

  beforeEach(function() {
    group = {
      id: 'groupId',
      name: 'Group name',
      email: 'group@email.com'
    };

    groupApiClient.get = function() {
      return $q.when({ data: group });
    };
  });

  function initComponent() {
    var scope = $rootScope.$new();
    var element = $compile('<group-display />')(scope);

    scope.$digest();

    return element;
  }

  it('should display basic information of group', function() {
    var elementHtml = initComponent().html();

    expect(elementHtml).to.contain(group.name);
    expect(elementHtml).to.contain(group.email);
  });

  it('should display member list', function() {
    var element = initComponent();

    expect(element.find('group-member-list')).to.have.length(1);
  });
});
