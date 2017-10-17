'use strict';

angular.module('linagora.esn.group')

.component('groupDisplaySubheader', {
  templateUrl: '/group/app/display/subheader/group-display-subheader.html',
  bindings: {
    group: '<'
  },
  controller: 'groupDisplaySubheaderController'
});
