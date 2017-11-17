'use strict';

/* global _: false */

angular.module('esn.router', ['ui.router'])
  .factory('session', function($q) {
    return {
      ready: $q.when(),
      user: {},
      domain: {},
      userIsDomainAdministrator: function() {
        return false;
      }
    };
  });
angular.module('esn.session', []);
angular.module('esn.member', []);
angular.module('esn.form.helper', []);
angular.module('esn.i18n', [])
  .factory('esnI18nService', function() {
    return {
      translate: angular.noop
    };
  });
angular.module('esn.http', [])
  .factory('httpErrorHandler', function() {
    return {
      redirectToLogin: angular.noop
    };
  });
angular.module('esn.async-action', [])
  .factory('asyncAction', function() {
    return function(message, action) {
      return action();
    };
  })
  .factory('rejectWithErrorNotification', function() {
    return function() {
      return $q.reject();
    };
  });
angular.module('esn.core', [])
  .constant('_', _)
  .factory('emailService', function() {
    return {
      isValidEmail: function() {
        return true;
      }
    };
  });
angular.module('esn.user', [])
  .factory('userAPI', function() {
    return {
      getUsersByEmail: {}
    };
  });
angular.module('esn.attendee', [])
  .constant('ESN_ATTENDEE_DEFAULT_TEMPLATE_URL', '')
  .factory('attendeeService', function() {
    return {
      getAttendeeCandidates: function() {}
    };
  });
angular.module('esn.infinite-list', []);
angular.module('esn.scroll', [])
  .factory('elementScrollService', function() {
    return {};
  });
angular.module('esn.ui', [])
  .factory('$modal', function() { return {}; });
angular.module('esn.header', []);
