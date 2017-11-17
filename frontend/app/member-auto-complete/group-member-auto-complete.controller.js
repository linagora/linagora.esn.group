(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .controller('GroupMemberAutoCompleteController', GroupMemberAutoCompleteController);

  function GroupMemberAutoCompleteController(
    $element,
    _,
    elementScrollService,
    emailService,
    groupService
  ) {
    var self = this;

    self.search = function(query) {
      return groupService.searchMemberCandidates(query, self.ignoreMembers);
    };

    self.onTagAdding = function($tag) {
      return emailService.isValidEmail($tag.email) && !_isDuplicatedMember($tag, self.newMembers);
    };

    self.onTagAdded = function() {
      elementScrollService.autoScrollDown($element.find('div.tags'));
    };

    function _isDuplicatedMember(newMember, members) {
      return !!_.find(members, { email: newMember.email });
    }
  }
})(angular);
