(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')

  .component('groupMemberListItemEmail', {
    templateUrl: '/group/app/member/list-item-email/group-member-list-item-email.html',
    bindings: {
      member: '<'
    }
  });
})(angular);
