(function(angular) {
  'use strict';

  var MODULE_NAME = 'linagora.esn.group';

  angular.module(MODULE_NAME, [
    'ui.router',
    'op.dynamicDirective',
    'restangular',
    'esn.http'
  ]);
})(angular);
