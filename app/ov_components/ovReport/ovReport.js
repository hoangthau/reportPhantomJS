/* jshint latedef: false, unused: false */

(function () {
  'use strict';

  angular.module('ngnms.ui.fwk.ovReport.directive')
    .directive('ovReport', ['$compile', '$timeout', '$rootScope', function ($compile, $timeout, $rootScope) {
      return {
        restrict: 'EA',
        scope: {
          reportConfig: '=',
          reportMap: '='
        },
        templateUrl: 'templates/ovReport/ovReportTpl.html',
        link: function (scope, elem, attrs) {
          scope.reportModel = {};
          var usedMap = {};
          scope.$watch('reportConfig', function (config) {
            scope.reportModel = config;

            //return needed map matched original map and graphics map from config json
            if (angular.isDefined(scope.reportModel) && angular.isDefined(scope.reportMap) &&
              scope.reportModel.hasOwnProperty('graphicsObjects')) {
              usedMap = filterUsedMap(scope.reportMap, scope.reportModel.graphicsObjects);
            }

            //begin build widgets
            buildSpecificWidgets(usedMap);
          });

          ///////////////////////////////////////////////////
          function filterUsedMap(orgMap, graphicsObj) {
            var i, resMap = {};
            for (i = 0; i < graphicsObj.length; i++) {
              var item = {},
                graphicsId = graphicsObj[i].id;
              item = orgMap[graphicsId];
              if (item) {
                resMap[graphicsId] = item;
              }
            }
            return resMap;
          }

          function buildLocatorTable(mapObj,key){
            var opts = {};
            for(var i = 0; i < scope.reportModel.graphicsObjects.length; i++ ){
              if(scope.reportModel.graphicsObjects[i].id === key){
                opts = scope.reportModel.graphicsObjects[i].options;
              }
            }
            var $locatorScope = $rootScope.$new();
            $locatorScope.locatorLocateTable = mapObj.data;
            $locatorScope.tableConfig = opts;
            $locatorScope.tableFilterColumn = opts.tableFilterColumn;

            var table = angular.element('<h4>Locator Table</h4><ov-table table-data="locatorLocateTable" table-config="tableConfig" table-filter-column="tableFilterColumn"></ov-table>');
            var compiledElem = $compile(table)($locatorScope);

            $timeout(function () {
              elem.find('.ovTable').append(compiledElem);
              $locatorScope.$destroy();
              $locatorScope = undefined;
            }, 2000);
          }

          function buildAnalyticTopChart() {

          }

          function buildSpecificWidgets(usedMap){
            for (var key in usedMap) {
              if(usedMap.hasOwnProperty(key)){
                switch (key) {
                case 'locator-locate-table':
                  buildLocatorTable(usedMap[key],key);
                  break;

                case 'analytics-top-chart':
                  buildAnalyticTopChart(usedMap[key]);
                  break;
                }
              }
            }
          }
        }
      };
    }]);

})();
