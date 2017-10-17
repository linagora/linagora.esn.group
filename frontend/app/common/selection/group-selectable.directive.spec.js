'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The groupSelectable directive', function() {
  var $rootScope, $compile, groupSelectionService;
  var scope;

  beforeEach(function() {
    module('jadeTemplates');
    module('linagora.esn.group');
  });

  beforeEach(inject(function(
    _$rootScope_,
    _$compile_,
    _groupSelectionService_
  ) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    groupSelectionService = _groupSelectionService_;
  }));

  function initDirective(html) {
    scope = $rootScope.$new();
    scope.item = {};

    var element = $compile(html || '<group-selectable item="item"><span class="test">test</span></group-selectable>')(scope);

    scope.$digest();

    return element;
  }

  it('should display the inner element and hide checkbox by default', function() {
    var element = initDirective();

    expect(element.find('ng-transclude').hasClass('ng-hide')).to.be.false;
    expect(element.find('.checkbox').hasClass('ng-hide')).to.be.true;
  });

  it('should hide the inner element and show checkbox when the item is selected', function() {
    var element = initDirective();

    scope.item.selected = true;
    scope.$digest();

    expect(element.find('ng-transclude').hasClass('ng-hide')).to.be.true;
    expect(element.find('.checkbox').hasClass('ng-hide')).to.be.false;
  });

  it('should toggle select the item on click', function() {
    groupSelectionService.toggleItemSelection = sinon.spy();

    var element = initDirective();

    element.find('.group-selectable').click();

    expect(groupSelectionService.toggleItemSelection).to.have.been.calledOnce;
    expect(groupSelectionService.toggleItemSelection).to.have.been.calledWith(scope.item);
  });
});
