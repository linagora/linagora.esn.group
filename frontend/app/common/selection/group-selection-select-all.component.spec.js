'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The groupSelectionSelectAll component', function() {
  var $rootScope, $compile, groupSelectionService;
  var scope;

  beforeEach(function() {
    module('jadeTemplates');
    angular.mock.module('linagora.esn.group');
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

  function initComponent() {
    scope = $rootScope.$new();
    scope.items = [{}, {}];

    var element = $compile('<group-selection-select-all items="items" />')(scope);

    scope.$digest();

    return element;
  }

  it('should toggle select all on click', function() {
    groupSelectionService.toggleItemSelection = sinon.spy();
    groupSelectionService.unselectAllItems = sinon.spy();

    var element = initComponent();

    element.find('.checkbox').click();
    expect(element.find('input')[0].checked).to.equal(true);
    expect(groupSelectionService.toggleItemSelection).to.have.been.callCount(scope.items.length);

    element.find('.checkbox').click();
    expect(element.find('input')[0].checked).to.equal(false);
    expect(groupSelectionService.unselectAllItems).to.have.been.calledOnce;
  });

  it('should unselect all on destroy event', function() {
    groupSelectionService.unselectAllItems = sinon.spy();

    initComponent();
    scope.$destroy();

    expect(groupSelectionService.unselectAllItems).to.have.been.calledOnce;
  });

  it('should check the checkbox if the number of selected items equals items.length', function() {
    groupSelectionService.getSelectedItems = function() {
      return scope.items.slice(0);
    };

    var element = initComponent();

    expect(element.find('input')[0].checked).to.equal(true);
  });

  it('should not check the checkbox if the number of selected items changed and does not equal items.length', function() {
    groupSelectionService.getSelectedItems = function() {
      return scope.items.slice(0);
    };

    var element = initComponent();

    expect(element.find('input')[0].checked).to.equal(true);

    groupSelectionService.getSelectedItems = function() {
      return scope.items.slice(1);
    };
    scope.$digest();

    expect(element.find('input')[0].checked).to.equal(false);
  });

  it('should not check the checkbox if there is no items', function() {
    groupSelectionService.getSelectedItems = function() {
      return scope.items.slice(0);
    };

    var element = initComponent();

    scope.items = [];
    scope.$digest();

    expect(element.find('input')[0].checked).to.equal(false);
  });

});
