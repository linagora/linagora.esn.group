(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .component('groupEmailInput', {
      templateUrl: '/group/app/common/email-input/group-email-input.html',
      controller: 'GroupEmailInputController',
      bindings: {
        email: '=',
        form: '<',
        availabilityChecker: '&'
      }
    });
})(angular);
