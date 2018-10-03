(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')

  .run(function(esnMemberResolverRegistry, groupMemberResolverService, GROUP_OBJECT_TYPE) {
    esnMemberResolverRegistry.addResolver({ objectType: GROUP_OBJECT_TYPE, resolve: groupMemberResolverService });
  })

  .run(function(attendeeService, groupAttendeeProvider) {
    attendeeService.addProvider(groupAttendeeProvider);
  });
})(angular);
