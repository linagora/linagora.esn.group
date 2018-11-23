(function(angular) {
  'use strict';

  angular.module('linagora.esn.group').component('groupListSearch', {
    templateUrl: '/group/app/list/group-list-search.html',
    controller: 'GroupListSearchController',
    bindings: {
      onQuery: '&'
    }
  });
})(angular);
