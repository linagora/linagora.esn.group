'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The groupForm component', function() {
  var $rootScope, $compile;

  beforeEach(function() {
    module('jadeTemplates');
    module('linagora.esn.group');
  });

  beforeEach(inject(function(
    _$rootScope_,
    _$compile_
  ) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
  }));

  function initComponent(html) {
    var scope = $rootScope.$new();
    var element = $compile(html || '<group-form />')(scope);

    scope.$digest();

    return element;
  }

  it('should display inputs to create/update group', function() {
    var element = initComponent();

    expect(element.find('input[ng-model="$ctrl.group.name"]')).to.have.length(1);
    expect(element.find('group-email-input')).to.have.length(1);
    expect(element.find('group-member-auto-complete')).to.have.length(1);
  });

  it('should not display member input when update mode is enabled', function() {
    var element = initComponent('<group-form group="group" update-mode="true" />');

    expect(element.find('group-member-auto-complete')).to.have.length(0);
  });
});
