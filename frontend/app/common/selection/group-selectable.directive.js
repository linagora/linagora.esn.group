(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .directive('groupSelectable', groupSelectable);

  function groupSelectable(groupSelectionService) {
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: '/group/app/common/selection/group-selectable.html',
      link: function(scope) {
        if (!scope.item) {
          throw new Error('item is required');
        }

        scope.toggle = function(event) {
          event.preventDefault();
          groupSelectionService.toggleItemSelection(scope.item);
        };
      },
      scope: {
        item: '='
      }
    };
  }

})(angular);
