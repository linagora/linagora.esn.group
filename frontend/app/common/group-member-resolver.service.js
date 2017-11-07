(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .factory('groupMemberResolverService', groupMemberResolverService);

    function groupMemberResolverService(groupApiClient) {
      return resolve;

      function resolve(email) {
        return groupApiClient.getFromEmail(email).then(function(response) {
          if (!response.data.length) {
            return $q.when([]);
          }

          return groupApiClient.getAllMembers(response.data[0].id)
            .then(function(allMembersResponse) {
              return allMembersResponse.data;
            });
        });
      }
    }
})(angular);
