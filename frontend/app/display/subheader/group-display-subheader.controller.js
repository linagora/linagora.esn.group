(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .controller('groupDisplaySubheaderController', groupDisplaySubheaderController);

  function groupDisplaySubheaderController(
    groupSelectionService,
    groupService
  ) {
    var self = this;

    self.$onDestroy = $onDestroy;
    self.isSelecting = isSelecting;
    self.getNumberOfSelectedItems = getNumberOfSelectedItems;
    self.unselectAllItems = unselectAllItems;
    self.removeSelectedMembers = removeSelectedMembers;

    function $onDestroy() {
      groupSelectionService.unselectAllItems();
    }

    function isSelecting() {
      return groupSelectionService.isSelecting();
    }

    function getNumberOfSelectedItems() {
      return groupSelectionService.getSelectedItems().length;
    }

    function unselectAllItems() {
      return groupSelectionService.unselectAllItems();
    }

    function removeSelectedMembers() {
      var members = groupSelectionService.getSelectedItems().map(function(member) {
        return {
          id: member.id,
          objectType: member.objectType
        };
      });

      return groupService.removeMembers(self.group.id, members).then(function() {
        groupSelectionService.unselectAllItems();
      });
    }
  }
})(angular);
