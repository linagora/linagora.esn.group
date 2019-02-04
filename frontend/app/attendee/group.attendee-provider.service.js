(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .factory('groupAttendeeProvider', groupAttendeeProvider);

  function groupAttendeeProvider(GROUP_OBJECT_TYPE) {
    return {
      objectType: GROUP_OBJECT_TYPE,
      templateUrl: '/group/app/attendee/group-attendee-template.html'
    };
  }
})(angular);
