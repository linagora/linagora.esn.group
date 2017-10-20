(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .controller('groupMemberListSelectionHeaderController', groupMemberListSelectionHeaderController);

  function groupMemberListSelectionHeaderController(
    groupSelectionService,
    groupService
  ) {
    var self = this;

    self.$onInit = $onInit;
    self.isSelecting = isSelecting;
    self.getNumberOfSelectedItems = getNumberOfSelectedItems;
    self.removeSelectedMembers = removeSelectedMembers;

    function $onInit() {
      self.isSelectedAll = false;
    }

    function isSelecting() {
      return groupSelectionService.isSelecting();
    }

    function getNumberOfSelectedItems() {
      return groupSelectionService.getSelectedItems().length;
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
