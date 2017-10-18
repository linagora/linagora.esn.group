(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .controller('GroupCreateController', GroupCreateController);

  function GroupCreateController(groupService) {
    var self = this;

    self.create = create;
    self.newMembers = [];

    function create() {
      self.group.members = _qualifyMembers(self.newMembers);

      return groupService.create(self.group);
    }

    function _qualifyMembers(members) {
      return members.map(function(member) {
        return member.email;
      });
    }
  }
})(angular);
