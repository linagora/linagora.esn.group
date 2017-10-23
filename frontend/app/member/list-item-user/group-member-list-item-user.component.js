(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')

  .component('groupMemberListItemUser', {
    templateUrl: '/group/app/member/list-item-user/group-member-list-item-user.html',
    bindings: {
      member: '<'
    }
  });
})(angular);
