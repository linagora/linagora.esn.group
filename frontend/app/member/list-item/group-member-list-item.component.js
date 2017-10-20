(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')

  .component('groupMemberListItem', {
    templateUrl: '/group/app/member/list-item/group-member-list-item.html',
    bindings: {
      member: '<'
    }
  });
})(angular);
