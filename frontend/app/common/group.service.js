(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .service('groupService', groupService);

  function groupService(
    $rootScope,
    $q,
    _,
    asyncAction,
    session,
    groupApiClient,
    domainSearchMembersProvider,
    ContactAttendeeProvider,
    ESN_ATTENDEE_DEFAULT_TEMPLATE_URL,
    GROUP_EVENTS
  ) {
    var MEMBER_SEARCH_LIMIT = 20;

    return {
      create: create,
      searchMemberCandidates: searchMemberCandidates
    };

    function create(group) {
      if (!group) {
        return $q.reject(new Error('Group is required'));
      }

      var notificationMessages = {
        progressing: 'Creating group...',
        success: 'Group created',
        failure: 'Failed to create group'
      };

      return asyncAction(notificationMessages, function() {
        return groupApiClient.create(group);
      }).then(function(response) {
        $rootScope.$broadcast(GROUP_EVENTS.GROUP_CREATED, response.data);
      });
    }

    function searchMemberCandidates(query) {
      var searchProviders = [domainSearchMembersProvider.get(session.domain._id), ContactAttendeeProvider];

      return $q.all(searchProviders.map(function(provider) {
        provider.templateUrl = provider.templateUrl || ESN_ATTENDEE_DEFAULT_TEMPLATE_URL;

        return provider.searchAttendee(query, MEMBER_SEARCH_LIMIT)
          .then(function(attendees) {
            return attendees.map(function(attendee) {
              return angular.extend(attendee, { templateUrl: provider.templateUrl });
            });
          });
      }))
      .then(function(arrays) {
        return arrays.reduce(function(resultArray, currentArray) {
          return resultArray.concat(currentArray);
        }, []);
      })
      .then(function(candidates) {
        return candidates.map(function(candidate) {
          return candidate.email ? candidate : null;
        }).filter(Boolean);
      })
      .then(function(candidates) {
        return _.uniq(candidates, false, function(candidate) {
          return candidate.email;
        });
      });
    }
  }
})(angular);
