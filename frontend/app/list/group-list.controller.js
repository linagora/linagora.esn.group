(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .controller('GroupListController', GroupListController);

  function GroupListController(
    $scope,
    $modal,
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
      self.onCreateBtnClick = onCreateBtnClick;
      self.loadMoreElements = infiniteScrollHelper(self, _loadNextItems);

      $scope.$on(GROUP_EVENTS.GROUP_CREATED, function(event, group) {
        _onGroupCreated(group);
      });
    }

    function _loadNextItems() {
      options.offset = self.elements.length;

      return groupApiClient.list(options)
        .then(function(response) {
          return response.data;
        });
    }

    function onCreateBtnClick() {
      $modal({
        templateUrl: '/group/app/create/group-create.html',
        backdrop: 'static',
        placement: 'center',
        controllerAs: '$ctrl',
        controller: 'GroupCreateController'
      });
    }

    function _onGroupCreated(group) {
      if (!group) {
        return;
      }

      self.elements.unshift(group);
    }
  }
})(angular);
