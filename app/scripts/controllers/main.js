(function () {
  'use strict';

  angular.module('exportApp')
    .controller('MainCtrl', function ($scope, $http, ovFilterService, ovConditionService) {

      var list = [];
      for (var i = 0; i < 50; i++) {
        list.push({
          id: i,
          name: 'Name' + i,
          age: i % 3 === 0 ? i + 15 : i - 1,
          gender: 'Nam',
          phoneNumber: 'phoneNumber' + (i % 4 === 0 ? i + 8 : i + 1).toString(),
          status: 'status' + i,
          level: i % 3 === 0 ? i + 7 : i - 1
        });
      }
      var metadata = {};
      var locatorData = {
        headers: [
          {id: 'id', value: '#'},
          {id: 'name', value: 'Name'},
          {id: 'age', value: 'Age'},
          {id: 'gender', value: 'Gender'},
          {id: 'phoneNumber', value: 'Phone Number'},
          {id: 'status', value: 'Status'},
          {id: 'level', value: 'Level'}
        ],
        rows: list
      };


      metadata['locator-locate-table'] = {
        data: locatorData
      };

      $scope.reportMap = metadata;

      var graphicsObjects = [];

      $http.get('config.json')
        .success(function (response) {
          graphicsObjects = angular.fromJson(response.graphicsObjects);
          $scope.reportCfg = angular.fromJson(response);
          for (var item in graphicsObjects) {
            if (graphicsObjects[item].id === 'locator-locate-table') {
              $scope.locatorLocateTable = metadata['locator-locate-table'].data;
            }
          }
        });

      $scope.tableConfig = {
        filters: {
          rules: {
            and: true,// and(true) or or(false)
            conditions: [//array of conditions
              //{
              //  have: true,
              //  field: 'name',
              //  operator: 'contains',
              //  compareValue: 'Name',
              //  caseSensitive: false
              //}
            ],
            groups: [
              {
                and: false,
                conditions: [
                  //{
                  //  have: true,
                  //  field: 'age',
                  //  operator: 'greaterThanNumber',
                  //  compareValue: '50',
                  //  caseSensitive: false
                  //}
                ],
                groups: []
              }
            ]
          }
        },
        visibleColumns: [
          'id',
          'name',
          'age',
          'gender',
          'phoneNumber',
          'status',
          'level'
        ]
      };
      $scope.tableFilterColumn = [
        {
          'id': 'id',
          'type': 0
        },
        {
          'id': 'name',
          'type': 0

        },
        {
          'id': 'age',
          'type': 1
        },
        {
          'id': 'gender',
          'type': 0
        },
        {
          'id': 'phoneNumber',
          'type': 0

        },
        {
          'id': 'status',
          'type': 0
        },
        {
          'id': 'level',
          'type': 1
        }
      ];

      /////////////////////////////////////


    });

})();
