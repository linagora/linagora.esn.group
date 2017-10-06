(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .controller('GroupMemberAutoCompleteController', GroupMemberAutoCompleteController);

  function GroupMemberAutoCompleteController($element, elementScrollService, groupService, _) {
    var self = this;

    self.search = groupService.searchMemberCandidates;

    self.onTagAdding = function($tag) {
      return !_isDuplicatedMember($tag, self.newMembers);
    };

    self.onTagAdded = function() {
      elementScrollService.autoScrollDown($element.find('div.tags'));
    };

    function _isDuplicatedMember(newMember, members) {
      return !!_.find(members, { email: newMember.email });
    }
  }
})(angular);
