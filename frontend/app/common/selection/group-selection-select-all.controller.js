(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .controller('groupSelectionSelectAllController', groupSelectionSelectAllController);

  function groupSelectionSelectAllController(
    $scope,
    groupSelectionService
  ) {
    var self = this;

    self.$onInit = $onInit;
    self.$onDestroy = $onDestroy;
    self.toggleSelectAll = toggleSelectAll;

    function $onInit() {
      self.isSelectedAll = false;

      $scope.$watch(function() {
        return self.items.length && self.items.length === groupSelectionService.getSelectedItems().length;
      }, function(isSelectedAll) {
        self.isSelectedAll = !!isSelectedAll;
      });
    }

    function $onDestroy() {
      groupSelectionService.unselectAllItems();
    }

    function toggleSelectAll() {
      if (self.isSelectedAll) {
        self.isSelectedAll = false;
        groupSelectionService.unselectAllItems();
      } else {
        self.isSelectedAll = true;
        self.items.forEach(function(item) {
          groupSelectionService.toggleItemSelection(item, self.isSelectedAll);
        });
      }
    }
  }

})(angular);
