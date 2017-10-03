(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')

  .component('groupMemberList', {
    templateUrl: '/group/app/member/list/group-member-list.html',
    controller: 'GroupMemberListController',
    bindings: {
      group: '<'
    }
  });
})(angular);
