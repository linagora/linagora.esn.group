(function(angular) {
  'use strict';

  angular.module('linagora.esn.group')
    .run(injectAdminGroupDirective);

  function injectAdminGroupDirective(dynamicDirectiveService) {
    var dd = new dynamicDirectiveService.DynamicDirective(true, 'admin-groups-menu-item', {
      attributes: [
        { name: 'display-in', value: '$ctrl.displayIn' }
      ]
    });

    dynamicDirectiveService.addInjection('admin-sidebar', dd);
  }
})(angular);
