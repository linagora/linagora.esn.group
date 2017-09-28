(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')

  .directive('groupApplicationMenu', function(applicationMenuTemplateBuilder) {
    return {
      restrict: 'E',
      replace: true,
      template: applicationMenuTemplateBuilder('/#/group', { url: '/group/images/group-icon.svg' }, 'Group')
    };
  });
})(angular);
