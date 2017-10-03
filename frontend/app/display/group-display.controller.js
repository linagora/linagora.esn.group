(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .controller('GroupDisplayController', GroupDisplayController);

  function GroupDisplayController($stateParams, groupApiClient) {
    var self = this;
    var groupId = $stateParams.groupId;

    self.$onInit = $onInit;

    function $onInit() {
      groupApiClient
        .get(groupId)
        .then(function(resp) {
          self.group = resp.data;
        });
    }
  }
})(angular);
