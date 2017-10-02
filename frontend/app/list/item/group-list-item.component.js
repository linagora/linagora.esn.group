(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')

  .component('groupListItem', {
    templateUrl: '/group/app/list/item/group-list-item.html',
    bindings: {
      group: '<'
    }
  });
})(angular);
