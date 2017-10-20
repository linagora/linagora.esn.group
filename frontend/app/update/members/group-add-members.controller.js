(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .controller('GroupAddMembersController', GroupAddMembersController);

  function GroupAddMembersController(_, groupService, group) {
    var self = this;

    self.group = group;
    self.addMembers = addMembers;

    function addMembers() {
      var members = [];

      self.newMembers.forEach(function(member) {
        if (member.objectType === 'user') {
          return members.push({
            id: member.id,
            objectType: 'user'
          });
        }

        members.push({
          id: member.email,
          objectType: 'email'
        });
      });

      return groupService.addMembers(self.group, members);
    }
  }
})(angular);
