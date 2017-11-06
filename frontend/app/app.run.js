(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')

  .run(function(esnMemberResolverRegistry, dynamicDirectiveService, session, groupMemberResolverService, GROUP_OBJECT_TYPE) {
    session.ready.then(function() {
      if (session.userIsDomainAdministrator()) {
        var group = new dynamicDirectiveService.DynamicDirective(true, 'group-application-menu', { priority: -10 });

        dynamicDirectiveService.addInjection('esn-application-menu', group);
      }

      esnMemberResolverRegistry.addResolver({ objectType: GROUP_OBJECT_TYPE, resolve: groupMemberResolverService });
    });
  })

  .run(function(attendeeService, groupAttendeeProvider) {
    attendeeService.addProvider(groupAttendeeProvider);
  });
})(angular);
