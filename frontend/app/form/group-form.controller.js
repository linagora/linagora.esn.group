(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .controller('GroupFormController', GroupFormController);

  function GroupFormController(groupService) {
    var self = this;

    self.emailAvailabilityChecker = emailAvailabilityChecker;

    function emailAvailabilityChecker(email) {
      return groupService.isEmailAvailableToUse(email, self.group ? [self.group] : null);
    }
  }
})(angular);
