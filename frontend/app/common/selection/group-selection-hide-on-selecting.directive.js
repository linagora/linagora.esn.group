(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .directive('groupSelectionHideOnSelecting', groupSelectionHideOnSelecting);

  function groupSelectionHideOnSelecting(groupSelectionService) {
    return {
      restrict: 'A',
      link: function(scope, element) {
        scope.$watch(function() {
          return groupSelectionService.isSelecting();
        }, function(isSelecting) {
          if (isSelecting) {
            element.addClass('hidden');
          } else {
            element.removeClass('hidden');
          }
        });
      }
    };
  }

})(angular);
