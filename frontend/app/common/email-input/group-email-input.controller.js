(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .controller('GroupEmailInputController', GroupEmailInputController);

    function GroupEmailInputController(session) {
      var self = this;

      self.$onInit = $onInit;
      self.buildEmail = buildEmail;

      function $onInit() {
        self.domainName = session.domain.name;

        if (self.email) {
          var emailLocalPart = self.email.split('@')[0];
          var emailDomainPart = self.email.split('@')[1];

          self.emailName = emailDomainPart === self.domainName ? emailLocalPart : self.email;
        }
      }

      function buildEmail() {
        self.email = [self.emailName, '@', self.domainName].join('');
      }
    }
})(angular);
