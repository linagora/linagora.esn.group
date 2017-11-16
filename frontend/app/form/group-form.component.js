(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')

  .component('groupForm', {
    templateUrl: '/group/app/form/group-form.html',
    bindings: {
      group: '=',
      newMembers: '=',
      updateMode: '@'
    },
    controller: 'GroupFormController'
  });
})(angular);
