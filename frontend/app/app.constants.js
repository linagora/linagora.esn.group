(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')

  .constant('GROUP_OBJECT_TYPE', 'group')

  .constant('GROUP_EVENTS', {
    GROUP_CREATED: 'group:created',
    GROUP_UPDATED: 'group:updated',
    GROUP_DELETED: 'group:deleted',
    GROUP_MEMBERS_REMOVED: 'group:members:removed',
    GROUP_MEMBERS_ADDED: 'group:members:added'
  })

  .constant('GROUP_OBJECT_TYPE', 'group');
})(angular);
