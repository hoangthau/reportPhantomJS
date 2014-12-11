(function(){
  'use strict';

  angular.module('ngnms.ui.fwk.ovChart.directive', []);
  angular.module('ngnms.ui.fwk.ovTable.directive', []);
  angular.module('ngnms.ui.fwk.services.ovFilterServices', []);
  angular.module('ngnms.ui.fwk.ovReport.directive', []);


  angular.module('exportApp', [
    'ngRoute','ngnms.ui.fwk.ovChart.directive',
    'ngnms.ui.fwk.ovTable.directive',
    'ngnms.ui.fwk.services.ovFilterServices',
    'ngnms.ui.fwk.ovReport.directive'
  ])
    .config(function ($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'views/main.html',
          controller: 'MainCtrl'
        })
        .otherwise({
          redirectTo: '/'
        });
    });
})();





