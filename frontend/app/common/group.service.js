(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .service('groupService', groupService);

  function groupService(
    $rootScope,
    $q,
    _,
    esnI18nService,
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
      update: update,
      removeMembers: removeMembers,
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

    function update(group) {
      if (!group || !group.id) {
        return $q.reject(new Error('group.id is required'));
      }

      var notificationMessages = {
        progressing: 'Updating group...',
        success: 'Group updated',
        failure: 'Failed to update group'
      };
      var updateData = {
        name: group.name,
        email: group.email
      };

      return asyncAction(notificationMessages, function() {
        return groupApiClient.update(group.id, updateData);
      }).then(function(response) {
        $rootScope.$broadcast(GROUP_EVENTS.GROUP_UPDATED, response.data);
      });
    }

    function removeMembers(groupId, members) {
      var notificationMessages = {
        progressing: esnI18nService.translate('Removing %s members...', members.length),
        success: esnI18nService.translate('Removed %s members', members.length),
        failure: 'Failed to remove members'
      };

      return asyncAction(notificationMessages, function() {
        return groupApiClient.removeMembers(groupId, members);
      }).then(function() {
        $rootScope.$broadcast(GROUP_EVENTS.GROUP_MEMBERS_REMOVED, members);
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
