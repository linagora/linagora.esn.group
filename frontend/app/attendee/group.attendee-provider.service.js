(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .factory('groupAttendeeProvider', groupAttendeeProvider);

  function groupAttendeeProvider($log, $q, groupApiClient, GROUP_OBJECT_TYPE) {
    return {
      objectType: GROUP_OBJECT_TYPE,
      searchAttendee: function(query, limit, offset) {
        return groupApiClient.search(query, limit, offset)
          .then(function(response) {
            return response.data.map(function(group) {
              group.displayName = group.name;

              return group;
            });
          })
          .catch(function(err) {
            $log.error('Error while searching for groups', err);

            return $q.when([]);
          });
      },
      templateUrl: '/group/app/attendee/group-attendee-template.html'
    };
  }
})(angular);
