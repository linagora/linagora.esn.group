(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')

  .config(function($stateProvider) {
    $stateProvider
      .state('group', {
        url: '/group',
        templateUrl: '/group/app/app.html',
        resolve: {
          isAdmin: function($location, session) {
            return session.ready.then(function() {
              if (!session.userIsDomainAdministrator()) { $location.path('/'); }
            });
          }
        },
        deepStateRedirect: {
          default: 'group.list'
        }
      })
      .state('group.list', {
        url: '/list',
        views: {
          'root@group': {
            template: '<group-list />'
          }
        }
      });
  });
})(angular);
