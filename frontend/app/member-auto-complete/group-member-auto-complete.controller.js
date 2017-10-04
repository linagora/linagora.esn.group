(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .controller('GroupMemberAutoCompleteController', GroupMemberAutoCompleteController);

  function GroupMemberAutoCompleteController($element, elementScrollService, groupService, _) {
    var self = this;

    self.search = groupService.searchMemberCandidates;

    self.onTagAdding = function($tag) {
      return _.filter(self.newMembers, function(tag) {
        return angular.equals(tag.id, $tag.id);
      });
    };

    self.onTagAdded = function() {
      elementScrollService.autoScrollDown($element.find('div.tags'));
    };
  }
})(angular);
