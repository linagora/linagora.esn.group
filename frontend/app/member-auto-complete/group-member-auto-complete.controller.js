(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .controller('GroupMemberAutoCompleteController', GroupMemberAutoCompleteController);

  function GroupMemberAutoCompleteController(
    $element,
    $q,
    _,
    elementScrollService,
    emailService,
    groupService
  ) {
    var self = this;

    self.search = function(query) {
      var ignoreMembers = self.group ? self.group.members : [];

      return groupService.searchMemberCandidates(query, ignoreMembers);
    };

    self.onTagAdding = function($tag) {
      var isValidTag = emailService.isValidEmail($tag.email) && !_isDuplicatedMember($tag, self.newMembers);

      if (!isValidTag || !self.group) {
        self.error = isValidTag ? false : 'invalidEmail';

        return isValidTag;
      }

      return groupService.isGroupMemberEmail(self.group.id, $tag.email)
        .then(function(isValidMember) {
          self.error = isValidMember ? false : 'existedMember';

          return isValidMember;
        });
    };

    self.onTagAdded = function() {
      elementScrollService.autoScrollDown($element.find('div.tags'));
    };

    function _isDuplicatedMember(newMember, members) {
      return !!_.find(members, { email: newMember.email });
    }
  }
})(angular);
