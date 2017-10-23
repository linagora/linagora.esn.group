(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .component('groupSelectionSelectAll', {
      templateUrl: '/group/app/common/selection/group-selection-select-all.html',
      controller: 'groupSelectionSelectAllController',
      bindings: {
        items: '<'
      }
    });

})(angular);
