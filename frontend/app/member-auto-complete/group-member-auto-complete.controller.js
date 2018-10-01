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
    groupService,
    GROUP_OBJECT_TYPE
  ) {
    var self = this;

    self.search = function(query) {
      var groupAsMember = {member: {objectType: GROUP_OBJECT_TYPE, id: self.group.email}};
      var ignoreMembers = self.group ? [groupAsMember].concat(self.group.members) : [groupAsMember];

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
