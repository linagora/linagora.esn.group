(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .controller('GroupFormController', GroupFormController);

  function GroupFormController(groupService, session) {
    var self = this;

    self.emailAvailabilityChecker = emailAvailabilityChecker;
    self.domainName = session.domain.name;

    function emailAvailabilityChecker(email) {
      return groupService.isEmailAvailableToUse(email, self.group ? [self.group] : null);
    }
  }
})(angular);
