'use strict';

angular.module('esn.form.helper', []);
angular.module('pascalprecht.translate', [])
  .provider('$translate', function() {
    return {
      useSanitizeValueStrategy: angular.noop,
      preferredLanguage: angular.noop,
      useStaticFilesLoader: angular.noop,
      $get: angular.noop
    };
  });
angular.module('esn.http', [])
  .factory('httpErrorHandler', function() {
    return {
      redirectToLogin: angular.noop
    };
  });

angular.module('esn.infinite-list', []);
