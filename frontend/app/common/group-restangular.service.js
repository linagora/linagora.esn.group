'use strict';

angular.module('linagora.esn.group')

.factory('groupRestangular', function(Restangular, httpErrorHandler) {
  return Restangular.withConfig(function(RestangularConfigurer) {
    RestangularConfigurer.setFullResponse(true);
    RestangularConfigurer.setBaseUrl('/group/api');
    RestangularConfigurer.setErrorInterceptor(function(response) {
      if (response.status === 401) {
        httpErrorHandler.redirectToLogin();
      }

      return true;
    });
  });
});
