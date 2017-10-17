(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .controller('GroupMemberListController', GroupMemberListController);

  function GroupMemberListController(
    $scope,
    _,
    infiniteScrollHelper,
    groupApiClient,
    GROUP_EVENTS
  ) {
    var self = this;
    var DEFAULT_LIMIT = 20;

    var options = {
      offset: 0,
      limit: DEFAULT_LIMIT
    };

    self.$onInit = $onInit;

    function $onInit() {
      self.loadMoreElements = infiniteScrollHelper(self, _loadNextItems);
      $scope.$on(GROUP_EVENTS.GROUP_MEMBERS_REMOVED, function(event, data) {
        _onMembersRemoved(data);
      });
    }

    function _onMembersRemoved(members) {
      members.forEach(function(member) {
        _.remove(self.elements, member);
      });
    }

    function _loadNextItems() {
      options.offset = self.elements.length;

      return groupApiClient.getMembers(self.group.id, options)
        .then(function(response) {
          return response.data;
        });
    }
  }
})(angular);
