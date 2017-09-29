(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')

  .config(function($stateProvider) {
    $stateProvider
      .state('group', {
        url: '/group',
        template: '<h1>This is group state</h1>',
        resolve: {
          isAdmin: function($location, session) {
            return session.ready.then(function() {
              if (!session.userIsDomainAdministrator()) { $location.path('/'); }
            });
          }
        }
      });
  });
})(angular);
