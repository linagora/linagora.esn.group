(function(angular) {
  'use strict';

  var MODULE_NAME = 'linagora.esn.group';

  angular.module(MODULE_NAME, [
    'esn.router',
    'op.dynamicDirective',
    'restangular',
    'esn.http',
    'esn.infinite-list',
    'esn.core',
    'esn.async-action',
    'esn.session',
    'esn.domain',
    'linagora.esn.contact',
    'esn.attendee',
    'esn.scroll',
    'esn.ui',
    'esn.i18n'
  ]);
})(angular);
