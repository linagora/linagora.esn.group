(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .component('adminGroupsMenuItem', {
      templateUrl: '/group/app/admin/admin-groups-menu-item.html',
      bindings: {
        displayIn: '<'
      }
    });
})(angular);
