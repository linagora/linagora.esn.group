(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .controller('GroupEmailInputController', GroupEmailInputController);

    function GroupEmailInputController($q, session) {
      var self = this;

      self.$onInit = $onInit;
      self.buildEmail = buildEmail;
      self.checker = checker;

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

      function checker(emailName) {
        var email = [emailName, '@', self.domainName].join('');
        var emailAvailability = self.availabilityChecker({ email: email });

        return emailAvailability.then(function(available) {
          if (!available) {
            return $q.reject(new Error('this email is already in use'));
          }
        });
      }

    }
})(angular);
