(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .controller('GroupMemberAutoCompleteController', GroupMemberAutoCompleteController);

  function GroupMemberAutoCompleteController(
    $element,
    _,
    elementScrollService,
    emailService,
    groupService,
    GROUP_OBJECT_TYPE
  ) {
    var self = this;

    self.search = search;
    self.onTagAdded = onTagAdded;
    self.onTagAdding = onTagAdding;

    function search(query) {
      var ignoreMembers = self.group && self.group.members ? self.group.members : [];

      if (self.group && self.group.email) {
        ignoreMembers.push({member: {objectType: GROUP_OBJECT_TYPE, id: self.group.email}});
      }

      return groupService.searchMemberCandidates(query, ignoreMembers);
    }

    function onTagAdding($tag) {
      var isValidTag = emailService.isValidEmail($tag.email) && !_isDuplicatedMember($tag, self.newMembers);

      if (!isValidTag || !self.group) {
        self.error = isValidTag ? false : 'invalidEmail';

        return isValidTag;
      }

      if (!self.group.id) {
        // we are creating the group, it does not have any id for now...
        return isValidTag;
      }

      return groupService.isGroupMemberEmail(self.group.id, $tag.email)
        .then(function(isValidMember) {
          self.error = isValidMember ? false : 'existedMember';

          return isValidMember;
        });
    }

    function onTagAdded() {
      elementScrollService.autoScrollDown($element.find('div.tags'));
    }

    function _isDuplicatedMember(newMember, members) {
      return !!_.find(members, { email: newMember.email });
    }
  }
})(angular);
