(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .config(function($stateProvider) {
      $stateProvider
      .state('admin.domain.groups', {
        url: '/groups',
        views: {
          'root@admin': {
            template: '<admin-groups />'
          }
        }
      })
      .state('admin.domain.groups.display', {
        url: '/:groupId',
        views: {
          'root@admin': {
            template: '<group-display />'
          }
        }
      });
  });
})(angular);
