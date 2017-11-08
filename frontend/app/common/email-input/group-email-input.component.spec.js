'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The groupEmailInput component', function() {
  var $rootScope, $compile, sessionMock;

  beforeEach(function() {
    module('jadeTemplates');
    angular.mock.module('linagora.esn.group', function($provide) {
      sessionMock = {
        domain: { name: '123' }
      };

      $provide.value('session', sessionMock);
    });
  });

  beforeEach(inject(function(
    _$rootScope_,
    _$compile_
  ) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
  }));

  function initComponent(scope) {
    scope = scope || $rootScope.$new();
    var element = $compile('<group-email-input email="email"/>')(scope);

    scope.$digest();

    return element;
  }

  it('should display current domain as domain part of email input', function() {
    var elementHtml = initComponent().html();

    expect(elementHtml).to.contain('@' + sessionMock.domain.name);
  });

  it('should set input field as local part of group email if domain of email is similar with current domain name', function() {
    var scope = $rootScope.$new();

    scope.email = ['testemail', '@', sessionMock.domain.name].join('');
    var element = initComponent(scope);

    expect(element.find('input[ng-model="$ctrl.emailName"]')[0].value).to.equal('testemail');
  });

  it('should set input field as entire email if domain of email is different with current domain name', function() {
    var scope = $rootScope.$new();

    scope.email = 'testemail@outside.domain';
    var element = initComponent(scope);

    expect(element.find('input[ng-model="$ctrl.emailName"]')[0].value).to.equal(scope.email);
  });
});
