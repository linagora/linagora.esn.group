(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')

  .component('groupMemberValidateMessage', {
    templateUrl: '/group/app/member-auto-complete/validate-message/group-member-validate-message.html',
    bindings: {
      error: '<'
    }
  });
})(angular);
