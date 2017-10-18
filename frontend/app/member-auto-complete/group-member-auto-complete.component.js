(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')

  .component('groupMemberAutoComplete', {
    templateUrl: '/group/app/member-auto-complete/group-member-auto-complete.html',
    controller: 'GroupMemberAutoCompleteController',
    bindings: {
      newMembers: '=',
      ignoreMembers: '<'
    }
  });
})(angular);
