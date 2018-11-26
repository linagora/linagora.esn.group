(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .controller('GroupListSearchController', GroupListSearchController);

  function GroupListSearchController() {
    var self = this;

    self.clear = clear;
    self.doSearch = doSearch;

    function clear($event) {
      $event.preventDefault();
      $event.stopPropagation();
      self.onQuery({ query: self.query = '' });
    }

    function doSearch() {
      self.onQuery({ query: self.query });
    }

  }
})(angular);
