(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')

  .run(function(dynamicDirectiveService, session) {
    session.ready.then(function() {
      if (session.userIsDomainAdministrator()) {
        var group = new dynamicDirectiveService.DynamicDirective(true, 'group-application-menu', { priority: -10 });

        dynamicDirectiveService.addInjection('esn-application-menu', group);
      }
    });
  });
})(angular);
