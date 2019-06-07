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

    self.excludedMembers = [];
    self.search = search;
    self.$onInit = $onInit;
    self.onTagAdded = onTagAdded;
    self.onTagAdding = onTagAdding;
    self.onTagRemoved = onTagRemoved;

    function $onInit() {
      if (self.group && self.group.id) {
        _addToExcludedList({
          id: self.group.id,
          objectType: GROUP_OBJECT_TYPE
        });

        !_.isEmpty(self.group.members) && self.group.members.forEach(function(member) {
          _addToExcludedList(member.member);
        });
      }
    }

    function search(query) {
      return groupService.searchMemberCandidates(query, self.excludedMembers);
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

    function onTagAdded($tag) {
      _addToExcludedList($tag);
      elementScrollService.autoScrollDown($element.find('div.tags'));
    }

    function onTagRemoved($tag) {
      self.excludedMembers = self.excludedMembers.filter(function(excludedMember) {
        return excludedMember.id !== $tag.id;
      });
    }

    function _isDuplicatedMember(newMember, members) {
      return !!_.find(members, { email: newMember.email });
    }

    function _addToExcludedList(member) {
      if (!member || !member.id || !member.objectType || member.objectType === 'email') {
        return;
      }

      self.excludedMembers.push({
        id: member.id,
        objectType: member.objectType
      });
    }
  }
})(angular);
