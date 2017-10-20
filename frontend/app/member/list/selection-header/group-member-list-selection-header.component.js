(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .component('groupMemberListSelectionHeader', {
      templateUrl: '/group/app/member/list/selection-header/group-member-list-selection-header.html',
      controller: 'groupMemberListSelectionHeaderController',
      bindings: {
        group: '<',
        members: '<',
        total: '<'
      }
    });

})(angular);
