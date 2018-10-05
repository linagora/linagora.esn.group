(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .controller('GroupDisplayController', GroupDisplayController);

  function GroupDisplayController(
    $stateParams,
    $modal,
    $scope,
    $state,
    _,
    groupApiClient,
    groupService,
    GROUP_EVENTS
  ) {
    var self = this;
    var groupId = $stateParams.groupId;

    self.$onInit = $onInit;
    self.onEditBtnClick = onEditBtnClick;
    self.deleteGroup = deleteGroup;

    function $onInit() {
      groupApiClient
        .get(groupId)
        .then(function(resp) {
          self.group = resp.data;
        });

      initListeners();
    }

    function deleteGroup() {
      return groupService.deleteGroup(self.group);
    }

    function onEditBtnClick() {
      $modal({
        templateUrl: '/group/app/update/group-update.html',
        backdrop: 'static',
        placement: 'center',
        controllerAs: '$ctrl',
        controller: 'GroupUpdateController',
        locals: {
          group: self.group
        }
      });
    }

    function initListeners() {
      $scope.$on(GROUP_EVENTS.GROUP_UPDATED, function(event, group) {
        self.group = group;
      });

      $scope.$on(GROUP_EVENTS.GROUP_DELETED, function() {
        $state.go('^');
      });

      $scope.$on(GROUP_EVENTS.GROUP_MEMBERS_REMOVED, function(event, members) {
        self.group.members = self.group.members.filter(function(member) {
          return !_.find(members, member.member);
        });
      });

      $scope.$on(GROUP_EVENTS.GROUP_MEMBERS_ADDED, function(event, members) {
        members.forEach(function(addedMember) {
          self.group.members.push({
            member: {
              id: addedMember.id,
              objectType: addedMember.objectType
            }
          });
        });
      });
    }
  }
})(angular);
