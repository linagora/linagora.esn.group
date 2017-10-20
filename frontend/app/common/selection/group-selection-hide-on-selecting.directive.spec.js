'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The groupSelectionHideOnSelecting directive', function() {
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

    var element = $compile(html || '<div><span group-selection-hide-on-selecting></span></div>')(scope);

    scope.$digest();

    return element;
  }

  it('should hide the element when user is selecting', function() {
    groupSelectionService.isSelecting = function() {
      return true;
    };

    var element = initDirective();

    expect(element.find('span').hasClass('hidden')).to.be.true;
  });

  it('should not hide the element when user is not selecting', function() {
    groupSelectionService.isSelecting = function() {
      return false;
    };

    var element = initDirective();

    expect(element.find('span').hasClass('hidden')).to.be.false;
  });

});
