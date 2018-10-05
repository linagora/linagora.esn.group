(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .component('groupMemberListItemGroup', {
      templateUrl: '/group/app/member/list-item-group/group-member-list-item-group.html',
      bindings: {
        member: '<'
      }
    });
})(angular);
