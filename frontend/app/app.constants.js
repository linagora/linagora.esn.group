(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')

  .constant('GROUP_EVENTS', {
    GROUP_CREATED: 'group:created',
    GROUP_UPDATED: 'group:updated'
  });
})(angular);
