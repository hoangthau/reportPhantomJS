/* jshint latedef: false */

(function () {
  'use strict';

  angular.module('ngnms.ui.fwk.ovTable.directive')
    .factory('ovTableBuilder', ['ovFilterService', 'ovConditionService', function (ovFilterService, ovConditionService) {
      var srv = {};

      function Table(opts) {
        var defaultOpts = {
            headers: [],
            rows: [],
            visibleColumns: [],
            filters: {},
            tableFilterColumn: []
          },
          headers,
          rows,
          filteredRows,
          selectedFilter,
          i, j;

        //override options
        angular.extend(defaultOpts, opts);

        //activate
        headers = showHeaders(defaultOpts);
        rows = showRows(defaultOpts);

        ovConditionService.setFields(defaultOpts.tableFilterColumn);
        selectedFilter = mapSelectedFilter(defaultOpts.filters, defaultOpts.tableFilterColumn);//re-define filters
        filteredRows = filterTable(rows, selectedFilter, defaultOpts.tableFilterColumn);

        //return table object
        this._tableObj = {
          headers: headers,
          rows: filteredRows
        };

        ////////////////////////////////////////////

        //show headers
        function showHeaders(defaultOpts) {
          var shownHeaders = [];
          for (i = 0; i < defaultOpts.headers.length; i++) {
            for (j = 0; j < defaultOpts.visibleColumns.length; j++) {
              if (defaultOpts.headers[i].id === defaultOpts.visibleColumns[j]) {
                shownHeaders.push(defaultOpts.headers[i]);
              }
            }
          }
          return shownHeaders;
        }

        //show rows
        function showRows(defaultOpts) {
          var shownRows = [];
          for (i = 0; i < defaultOpts.rows.length; i++) {
            var item = {};
            for (j = 0; j < defaultOpts.visibleColumns.length; j++) {
              var val = defaultOpts.rows[i][defaultOpts.visibleColumns[j]];
              if (angular.isDefined(val)) {
                item[defaultOpts.visibleColumns[j]] = val;
              }
            }
            shownRows.push(item);
          }
          return shownRows;
        }

        //filter
        function findItemIndexById(id, foundList) {
          var i;
          for (i = 0; i < foundList.length; i++) {
            if (foundList[i].id === id) {
              return i;
            }
          }
        }

        function mapRules(rules, filterColumn) {
          var obj = {}, i;
          obj.isAnd = rules.and;
          //conditions and groups
          obj.conditions = [];
          obj.groups = [];
          for (i = 0; i < rules.conditions.length; i++) {
            var item = {};
            item.isSelect = true;
            item.notOp = !rules.conditions[i].have;
            item.field = findItemIndexById(rules.conditions[i].field, filterColumn);
            item.operator = findItemIndexById(rules.conditions[i].operator, ovConditionService.getOperatorFields(filterColumn[item.field].type));
            item.compareValue = rules.conditions[i].compareValue;
            item.caseSensitive = rules.conditions[i].caseSensitive;
            obj.conditions.push(item);
          }
          if(angular.isDefined(rules.groups) && !!rules.groups.length ){
            var groups = [];
            for(i = 0; i < rules.groups.length; i++ ){
              groups.push(mapRules(rules.groups[i], filterColumn));
            }
            obj.groups = angular.copy(groups);
          }
          return obj;
        }

        function mapSelectedFilter(filters, filterColumn) {
          var result = {};
          result.rules = {};
          if (angular.isDefined(filters.rules) && angular.isDefined(filters.rules.and) &&
            angular.isDefined(filters.rules.conditions) && !!filterColumn.length) {
            result.rules = mapRules(filters.rules,filterColumn);
          }
          return result;
        }

        function filterTable(rowsTable, selectedFilter, tableFilterColumn) {
          return ovFilterService.filterSelected(rowsTable, selectedFilter, tableFilterColumn);
        }

      }

      Table.prototype.getTable = function () {
        return this._tableObj;
      };

      srv.initTable = function (opts) {
        return new Table(opts);
      };

      return srv;
    }])
    .controller('TableCtrl', ['$scope', 'ovTableBuilder', function ($scope, ovTableBuilder) {
      var tableCfg = {
          visibleColumns: [],
          filters: {}
        },
        tableData = {
          headers: [],
          rows: []
        },
        tableFilterColumn = [];

      angular.extend(tableCfg, $scope.tableConfig);
      angular.extend(tableData, $scope.tableData);

      if (angular.isDefined($scope.tableFilterColumn)) {
        tableFilterColumn = angular.copy($scope.tableFilterColumn);
      }

      var opts = {
        headers: tableData.headers,
        rows: tableData.rows,
        visibleColumns: tableCfg.visibleColumns,
        filters: tableCfg.filters,
        tableFilterColumn: tableFilterColumn
      };

      $scope.$watch('tableData', function (data) {
        angular.extend(tableData, data);
        opts.headers = tableData.headers;
        opts.rows = tableData.rows;
        var tableObj = ovTableBuilder.initTable(opts).getTable();
        $scope.tableModel = angular.copy(tableObj);
      });
    }])
    .directive('ovTable', [function () {
      return {
        restrict: 'EA',
        scope: {
          tableData: '=',
          tableConfig: '=',
          tableFilterColumn: '='
        },
        templateUrl: 'templates/ovTable/ovTableTpl.html',
        controller: 'TableCtrl',
        link: function () {
        }
      };
    }]);
})();
