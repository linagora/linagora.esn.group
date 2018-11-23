(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .controller('GroupListController', GroupListController);

  function GroupListController(
    _,
    $scope,
    $modal,
    infiniteScrollHelper,
    groupApiClient,
    groupService,
    GROUP_EVENTS
  ) {
    var self = this;
    var DEFAULT_LIMIT = 20;

    self.options = {
      offset: 0,
      limit: DEFAULT_LIMIT
    };

    self.$onInit = $onInit;
    self.search = search;
    self.clearSearch = clearSearch;

    function $onInit() {
      self.onCreateBtnClick = onCreateBtnClick;
      self.deleteGroup = groupService.deleteGroup;
      self.loadMoreElements = infiniteScrollHelper(self, _loadNextItems);

      $scope.$on(GROUP_EVENTS.GROUP_CREATED, function(event, group) {
        _onGroupCreated(group);
      });

      $scope.$on(GROUP_EVENTS.GROUP_DELETED, function(event, data) {
        _onGroupDeleted(data);
      });
    }

    function _loadNextItems() {
      self.options.offset = self.elements.length;

      return groupApiClient.list(self.options)
        .then(function(response) {
          return response.data;
        });
    }

    function search(query) {
      self.options = {
        query: query,
        offset: 0,
        limit: DEFAULT_LIMIT
      };
      _reload();
    }

    function clearSearch() {
      self.options = {
        offset: 0,
        limit: DEFAULT_LIMIT
      };
      _reload();
    }

    function _resetInfiniteScroll() {
      self.elements = [];
      self.infiniteScrollCompleted = false;
      self.loadMoreElements = infiniteScrollHelper(self, _loadNextItems);
    }

    function _reload() {
      _resetInfiniteScroll();
      self.loadMoreElements();
    }

    function onCreateBtnClick() {
      if (self.options.query) {
        clearSearch();
      }

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

    function _onGroupDeleted(deletedGroup) {
      _.remove(self.elements, { id: deletedGroup.id });
    }
  }
})(angular);
