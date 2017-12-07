(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .service('groupService', groupService);

  function groupService(
    $rootScope,
    $q,
    _,
    attendeeService,
    esnI18nService,
    asyncAction,
    session,
    groupApiClient,
    GROUP_EVENTS,
    userAPI
  ) {
    var MEMBER_SEARCH_LIMIT = 20;

    return {
      addMembers: addMembers,
      create: create,
      deleteGroup: deleteGroup,
      update: update,
      removeMembers: removeMembers,
      searchMemberCandidates: searchMemberCandidates,
      isEmailAvailableToUse: isEmailAvailableToUse,
      isGroupMemberEmail: isGroupMemberEmail
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
      var subject = members.length > 1 ? 'members' : 'member';
      var notificationMessages = {
        progressing: esnI18nService.translate('Removing %s ' + subject + '...', members.length),
        success: esnI18nService.translate('Removed %s ' + subject, members.length),
        failure: 'Failed to remove ' + subject
      };

      return asyncAction(notificationMessages, function() {
        return groupApiClient.removeMembers(groupId, members);
      }).then(function() {
        $rootScope.$broadcast(GROUP_EVENTS.GROUP_MEMBERS_REMOVED, members);
      });
    }

    function addMembers(group, members) {
      if (!group || !group.id) {
        return $q.reject(new Error('group.id is required'));
      }

      var subject = members.length > 1 ? 'members' : 'member';
      var notificationMessages = {
        progressing: 'Adding ' + subject + '...',
        success: esnI18nService.translate('Added %s ' + subject, members.length),
        failure: 'Failed to add ' + subject
      };

      return asyncAction(notificationMessages, function() {
        return groupApiClient.addMembers(group.id, members);
      }).then(function(response) {
        $rootScope.$broadcast(GROUP_EVENTS.GROUP_MEMBERS_ADDED, response.data);
      });
    }

    function searchMemberCandidates(query, ignoreMembers) {
      return attendeeService.getAttendeeCandidates(query, MEMBER_SEARCH_LIMIT, ['user', 'contact'])
        .then(function(candidates) {
          return candidates.filter(function(candidate) {
            return candidate.email;
          });
        })
        .then(function(candidates) {
          if (ignoreMembers) {
            return candidates.filter(function(candidate) {
              return !_.any(ignoreMembers, function(ignore) {
                return ignore.member.id === candidate.id || ignore.member.id === candidate.email;
              });
            });
          }

          return candidates;
        });
    }

    function deleteGroup(group) {
      if (!group || !group.id) {
        return $q.reject(new Error('group ID is required'));
      }

      var notificationMessages = {
        progressing: 'Deleting group...',
        success: 'Group deleted',
        failure: 'Failed to delete group'
      };

      return asyncAction(notificationMessages, function() {
        return groupApiClient.deleteGroup(group.id);
      }).then(function() {
        $rootScope.$broadcast(GROUP_EVENTS.GROUP_DELETED, group);
      });
    }

    function isEmailAvailableToUse(email, whiteListGroups) {
      whiteListGroups = whiteListGroups || [];

      return groupApiClient.list({ email: email })
        .then(function(response) {
          var group = response.data[0];
          var noGroupConflict = !group || whiteListGroups.some(function(groupItem) { return group.id === groupItem.id; });

          if (noGroupConflict) {
            return userAPI.getUsersByEmail(email).then(function(response) {
              return !response.data[0];
            });
          }
        });
    }

    function isGroupMemberEmail(groupId, email) {
      return groupApiClient.getMembers(groupId, { email: email })
        .then(function(response) {
          return !response.data || !(response.data.length > 0);
        });
    }

  }
})(angular);
