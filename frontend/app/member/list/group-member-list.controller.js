(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .controller('GroupMemberListController', GroupMemberListController);

  function GroupMemberListController(infiniteScrollHelper, groupApiClient) {
    var self = this;
    var DEFAULT_LIMIT = 20;

    var options = {
      offset: 0,
      limit: DEFAULT_LIMIT
    };

    self.$onInit = $onInit;

    function $onInit() {
      self.loadMoreElements = infiniteScrollHelper(self, _loadNextItems);
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
