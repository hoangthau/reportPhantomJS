/**
 * RTR-3556: UI Framework
 * Created by huynhhuutai on 11/26/13.
 */
(function () {
  'use strict';
  angular.module('ngnms.ui.fwk.services.ovFilterServices')
    .factory('ovFilterService', ['$rootScope', 'ovConditionService', function ($rootScope, ovConditionService) {

      var filter = function (data, expression) {
          var result = [],
            filterScope,
            numberToString = function (number) {
              if (!isNaN(number)) {
                number = number.toString();
              }
            },
            numberToDate = function (number) {
              var arrayDate = {};
              number = new Date(number);
              arrayDate.date = number.getDate();
              arrayDate.month = number.getMonth();
              arrayDate.year = number.getFullYear();
              arrayDate.hours = number.getHours();
              arrayDate.minutes = number.getMinutes();
              arrayDate.seconds = number.getSeconds();
              return arrayDate;
            };
//            stringToDate = function (string) {
//              return new Date(string);
//            };
          try {
            filterScope = $rootScope.$new();

//            string
            filterScope.beginsWith = function (stringVal, value) {
              if (stringVal === null || typeof stringVal === 'undefined') {
                stringVal = '';
              }

              numberToString(stringVal);
              return stringVal.indexOf(value) === 0;
            };
            filterScope.beginsWithNC = function (stringVal, value) {
              if (stringVal === null || typeof stringVal === 'undefined') {
                stringVal = '';
              }


              numberToString(stringVal);
              stringVal = stringVal.toUpperCase();
              value = value.toUpperCase();
              return stringVal.indexOf(value) === 0;
            };

            filterScope.endsWith = function (stringVal, value) {
              if (stringVal === null || typeof stringVal === 'undefined') {
                stringVal = '';
              }

              numberToString(stringVal);
              return stringVal.indexOf(value) === (stringVal.length - value.length);
            };

            filterScope.endsWithNC = function (stringVal, value) {
              if (stringVal === null || typeof stringVal === 'undefined') {
                stringVal = '';
              }

              numberToString(stringVal);
              stringVal = stringVal.toUpperCase();
              value = value.toUpperCase();
              return stringVal.indexOf(value) === (stringVal.length - value.length);
            };

            filterScope.contains = function (stringVal, value) {
              if (stringVal === null || typeof stringVal === 'undefined') {
                stringVal = '';
              }

              numberToString(stringVal);
              return stringVal.indexOf(value) > -1;
            };

            filterScope.containsNC = function (stringVal, value) {
              if (stringVal === null || typeof stringVal === 'undefined') {
                stringVal = '';
              }

              numberToString(stringVal);
              stringVal = stringVal.toUpperCase();
              value = value.toUpperCase();
              return stringVal.indexOf(value) > -1;
            };

            filterScope.equalNC = function (stringVal, value) {
              if (stringVal === null || typeof stringVal === 'undefined') {
                stringVal = '';
              }

              return stringVal.toString().toUpperCase() === value.toString().toUpperCase();
            };

            filterScope.notEqualNC = function (stringVal, value) {
              if (stringVal === null || typeof stringVal === 'undefined') {
                stringVal = '';
              }

              return stringVal.toString().toUpperCase() !== value.toString().toUpperCase();
            };

//            bool
            filterScope.equal = function (stringVal, value) {
              if (stringVal === null || typeof stringVal === 'undefined') {
                stringVal = '';
              }

              return stringVal.toString() === value.toString();
            };

            filterScope.notEqual = function (stringVal, value) {
              if (stringVal === null || typeof stringVal === 'undefined') {
                stringVal = '';
              }

              return stringVal.toString() !== value.toString();
            };
//            end bool
//            end string

//            number
            filterScope.equalNumber = function (stringVal, value) {
              if (stringVal === null || typeof stringVal === 'undefined') {
                stringVal = '';
              }

              return Number(stringVal) === Number(value);
            };
            filterScope.notEqualNumber = function (stringVal, value) {
              if (stringVal === null || typeof stringVal === 'undefined') {
                stringVal = '';
              }

              return Number(stringVal) !== Number(value);
            };
            filterScope.greaterThanNumber = function (stringVal, value) {
              if (stringVal === null || typeof stringVal === 'undefined') {
                stringVal = '';
              }

              return Number(stringVal) > Number(value);
            };
            filterScope.greaterThanEqualNumber = function (stringVal, value) {
              if (stringVal === null || typeof stringVal === 'undefined') {
                stringVal = '';
              }

              return Number(stringVal) >= Number(value);
            };
            filterScope.lessThanNumber = function (stringVal, value) {
              if (stringVal === null || typeof stringVal === 'undefined') {
                stringVal = '';
              }

              return Number(stringVal) < Number(value);
            };
            filterScope.lessThanEqualNumber = function (stringVal, value) {
              if (stringVal === null || typeof stringVal === 'undefined') {
                stringVal = '';
              }

              return Number(stringVal) <= Number(value);
            };
//            end number

//---------------- DATETIME -------------------------------------
            filterScope.equalDateTime = function (stringVal, value) {
              if (stringVal === null || typeof stringVal === 'undefined') {
                stringVal = '';
              }


              return Number(new Date(stringVal)) === Number(value);
            };
            filterScope.notEqualDateTime = function (stringVal, value) {
              if (stringVal === null || typeof stringVal === 'undefined') {
                stringVal = '';
              }

              return Number(new Date(stringVal)) !== Number(value);
            };
            filterScope.greaterThanDateTime = function (stringVal, value) {
              if (stringVal === null || typeof stringVal === 'undefined') {
                stringVal = '';
              }


              return Number(new Date(stringVal)) > Number(value);
            };
            filterScope.greaterThanEqualDateTime = function (stringVal, value) {
              if (stringVal === null || typeof stringVal === 'undefined') {
                stringVal = '';
              }

              return Number(new Date(stringVal)) >= Number(value);
            };
            filterScope.lessThanDateTime = function (stringVal, value) {
              if (stringVal === null || typeof stringVal === 'undefined') {
                stringVal = '';
              }


              return Number(new Date(stringVal)) < Number(value);
            };
            filterScope.lessThanEqualDateTime = function (stringVal, value) {
              if (stringVal === null || typeof stringVal === 'undefined') {
                stringVal = '';
              }

              return Number(new Date(stringVal)) <= Number(value);
            };
//---------------- END DATETIME ---------------------------------

            /*****************************************************************/

//---------------- DATE -----------------------------------------

            filterScope.equalDate = function (stringVal, value) {
              if (stringVal === null || typeof stringVal === 'undefined') {
                stringVal = '';
              }


              var date = new Date(stringVal);
              var valueInput = numberToDate(Number(value));
              return (date.getDate() === valueInput.date) && (date.getMonth() === valueInput.month) && (date.getFullYear() === valueInput.year);
            };
            filterScope.notEqualDate = function (stringVal, value) {
              if (stringVal === null || typeof stringVal === 'undefined') {
                stringVal = '';
              }

              var date = new Date(stringVal);
              var valueInput = numberToDate(Number(value));
              return (date.getDate() !== valueInput.date) || (date.getMonth() !== valueInput.month) || (date.getFullYear() !== valueInput.year);
            };
            filterScope.greaterThanDate = function (stringVal, value) {
              if (stringVal === null || typeof stringVal === 'undefined') {
                stringVal = '';
              }

              var date = new Date(stringVal);
              var valueInput = numberToDate(Number(value));
              if (date.getFullYear() > valueInput.year) {
                return true;
              }
              if (date.getFullYear() < valueInput.year) {
                return false;
              }
              if (date.getMonth() > valueInput.month) {
                return true;
              }
              if (date.getMonth() < valueInput.month) {
                return false;
              }
              if (date.getDate() > valueInput.date) {
                return true;
              }
              return false;
            };
            filterScope.greaterThanEqualDate = function (stringVal, value) {
              if (stringVal === null || typeof stringVal === 'undefined') {
                stringVal = '';
              }


              var date = new Date(stringVal);
              var valueInput = numberToDate(Number(value));
              return date.getFullYear() >= valueInput.year &&
                date.getMonth() >= valueInput.month &&
                date.getDate() >= valueInput.date;
            };
            filterScope.lessThanDate = function (stringVal, value) {
              if (stringVal === null || typeof stringVal === 'undefined') {
                stringVal = '';
              }


              var date = new Date(stringVal);
              var valueInput = numberToDate(Number(value));
              if (date.getFullYear() < valueInput.year) {
                return true;
              }
              if (date.getFullYear() > valueInput.year) {
                return false;
              }
              if (date.getMonth() < valueInput.month) {
                return true;
              }
              if (date.getMonth() > valueInput.month) {
                return false;
              }
              if (date.getDate() < valueInput.date) {
                return true;
              }
              if (date.getDate() >= valueInput.date) {
                return false;
              }
            };
            filterScope.lessThanEqualDate = function (stringVal, value) {
              if (stringVal === null || typeof stringVal === 'undefined') {
                stringVal = '';
              }

              var date = new Date(stringVal);
              var valueInput = numberToDate(Number(value));
              return date.getFullYear() <= valueInput.year &&
                date.getMonth() <= valueInput.month &&
                date.getDate() <= valueInput.date;
            };

//---------------- END DATE -------------------------------------

            /***************************************************************/

//---------------- TIME -------------------------------------
            filterScope.equalTime = function (stringVal, value) {
              if (stringVal === null || typeof stringVal === 'undefined') {
                stringVal = '';
              }


              var time = new Date(stringVal);
              var valueInput = numberToDate(Number(value));
              return (time.getHours() === valueInput.hours) && (time.getMinutes() === valueInput.minutes) && (time.getSeconds() === valueInput.seconds);
            };
            filterScope.notEqualTime = function (stringVal, value) {
              if (stringVal === null || typeof stringVal === 'undefined') {
                stringVal = '';
              }


              var time = new Date(stringVal);
              var valueInput = numberToDate(Number(value));
              return (time.getHours() !== valueInput.hours) || (time.getMinutes() !== valueInput.minutes) || (time.getSeconds() !== valueInput.seconds);
            };
            filterScope.greaterThanTime = function (stringVal, value) {
              if (stringVal === null || typeof stringVal === 'undefined') {
                stringVal = '';
              }


              var time = new Date(stringVal);
              var valueInput = numberToDate(Number(value));
              if (time.getHours() > valueInput.hours) {
                return true;
              }
              if (time.getHours() < valueInput.hours) {
                return false;
              }
              if (time.getMinutes() > valueInput.minutes) {
                return true;
              }
              if (time.getMinutes() < valueInput.minutes) {
                return false;
              }
              if (time.getSeconds() > valueInput.seconds) {
                return true;
              }
              return false;
            };
            filterScope.greaterThanEqualTime = function (stringVal, value) {
              if (stringVal === null || typeof stringVal === 'undefined') {
                stringVal = '';
              }

              var time = new Date(stringVal);
              var valueInput = numberToDate(Number(value));
              return (time.getHours() >= valueInput.hours) && (time.getMinutes() >= valueInput.minutes) && (time.getSeconds() >= valueInput.seconds);
            };
            filterScope.lessThanTime = function (stringVal, value) {
              if (stringVal === null || typeof stringVal === 'undefined') {
                stringVal = '';
              }

              var time = new Date(stringVal);
              var valueInput = numberToDate(Number(value));
              if (time.getHours() < valueInput.hours) {
                return true;
              }
              if (time.getHours() > valueInput.hours) {
                return false;
              }
              if (time.getMinutes() < valueInput.minutes) {
                return true;
              }
              if (time.getMinutes() > valueInput.minutes) {
                return false;
              }
              if (time.getSeconds() < valueInput.seconds) {
                return true;
              }
              return false;
            };
            filterScope.lessThanEqualTime = function (stringVal, value) {
              if (stringVal === null || typeof stringVal === 'undefined') {
                stringVal = '';
              }

              var time = new Date(stringVal);
              var valueInput = numberToDate(Number(value));
              return (time.getHours() <= valueInput.hours) && (time.getMinutes() <= valueInput.minutes) && (time.getSeconds() <= valueInput.seconds);
            };

//---------------- END TIME ---------------------------------


            angular.forEach(data, function (d) {
              filterScope.$object = d;
              if (filterScope.$eval(expression)) {
                result.push(d);
              }
            });
          }
          finally {
            filterScope.$destroy();
            return result;
          }
        },
        recursiveExpression = function (array, isAnd, expr, filterColumn) {
          for (var i = 0; i < array.length; i++) { //loop groups
            expr += isAnd ? '&&(' : '||('; // if parent group.isAnd, add this string to begin new group

            if (array[i].conditions.length) {// if group[i] has condition
              for (var j = 0; j < array[i].conditions.length; j++) { // loop conditions
                var and = j === 0 ? '(' : '&&('; // if 1st condition, add only '(', else add '&&('
                var or = j === 0 ? '(' : '||('; // same as above
                if (array[i].conditions[j].isSelect) { // if condition[j] was selected...
                  expr += (array[i].isAnd ? and : or); // decide to add "and" or "or" variable
                  expr += (array[i].conditions[j].notOp ? '!' : ''); // if notOp --> add '!', else add ''
                  expr += ovConditionService.getOperatorFields(ovConditionService.getFields()[array[i].conditions[j]
                    .field].type)[array[i].conditions[j].operator].id; // add operator
                  expr += ((!array[i].conditions[j].caseSensitive &&
                    ovConditionService.getFields()[array[i].conditions[j].field].type === 0) ? 'NC' : ''); // decide to add "NC" to operator or not
                  expr += '($object.' + filterColumn[array[i].conditions[j].field].id + ','; // add column
                  expr += ' \''; // add value inside ''
                  expr += array[i].conditions[j].compareValue; // value
                  expr += '\'))'; // end $object and end a child expression
                } else { // if condition[i] wasn't selected ...
                  expr += (array[i].isAnd ? and : or) + 'true' + ')'; // add "(true)" to expression
                }
              }
            } else { //if group[i] doesn't have any condition ...
              expr += '(true)'; //add this string to expr
            }// end loop conditions


            if (array[i].groups.length) { // if group[i] doesn't have child groups ...
              var temp = '';
              expr += recursiveExpression(array[i].groups, array[i].isAnd, temp, filterColumn);// loop child groups
              expr += ')'; // close parentheses parent group
            }
            else {
              expr += ')';
            }
          }
          return expr;
        },
        finishFilter = function (data, filterSelected, filterColumn) { // when user click apply button, ready to filter
          if (filterSelected === null || filterSelected === undefined) {
            return data;
          }
          // ------------- begin create expression (comments same recursiveExpression function) ---------------

          var expression = '';
          expression += '('; // open parenthesis

          if (filterSelected.rules.conditions.length) { // if group has condition(s)
            for (var j = 0; j < filterSelected.rules.conditions.length; j++) { // begin loop condition
              var and = j === 0 ? '(' : '&&(';
              var or = j === 0 ? '(' : '||(';
              if (filterSelected.rules.conditions[j].isSelect) {
                expression += (filterSelected.rules.isAnd ? and : or) + (filterSelected.rules.conditions[j].notOp ? '!' : '') +
                  ovConditionService.getOperatorFields(ovConditionService.getFields()[filterSelected.rules.conditions[j]
                    .field].type)[filterSelected.rules.conditions[j].operator].id +
                  ((!filterSelected.rules.conditions[j].caseSensitive &&
                    ovConditionService.getFields()[filterSelected.rules.conditions[j]
                      .field].type === 0) ? 'NC' : '') + '($object.' +
                  filterColumn[filterSelected.rules.conditions[j].field].id + ',' +
                  ' \'' + filterSelected.rules.conditions[j].compareValue + '\'))'; // end $object
              } else {
                expression += (filterSelected.rules.isAnd ? and : or) + 'true' + ')';
              }
            } // end loop condition
          } else { // if group doesn't have condition(s)
            expression += '(true)';
          }

          if (filterSelected.rules.groups.length) { // if this group has child groups, begin loop child groups
            var temp = '';
            expression += recursiveExpression(filterSelected.rules.groups, filterSelected.rules.isAnd, temp, filterColumn);
            expression += ')';// end
          } else {
            expression += ')';
          }
          return filter(data, expression);
        };
      return {
        filter: filter,
        filterSelected: finishFilter
      };
    }])
    .factory('ovConditionService', [function () {
      var notOpItems = function () {
          return [
            { id: 'have' },
            { id: 'notHave'}
          ];
        },
        caseSensitiveItems = function () {
          return [
            { id: 'nonCaseSensitive' },
            { id: 'caseSensitive' }
          ];
        },
        fieldItems = [],
        operatorFields = function (num) {
          switch (num) {
          case 0:
            return [
              {id: 'contains'},
              {id: 'beginsWith'},
              {id: 'endsWith'},
              {id: 'equal'},
              {id: 'notEqual'}
            ];
          case 1:
            return [
              {id: 'equalNumber'},
              {id: 'notEqualNumber'},
              {id: 'greaterThanNumber'},
              {id: 'greaterThanEqualNumber'},
              {id: 'lessThanNumber'},
              {id: 'lessThanEqualNumber'}
            ];
          case 2:
            return [
              {id: 'equal'},
              {id: 'notEqual'}
            ];
          case 3:
            return [
              {id: 'equalDate'},
              {id: 'notEqualDate'},
              {id: 'greaterThanDate'},
              {id: 'greaterThanEqualDate'},
              {id: 'lessThanDate'},
              {id: 'lessThanEqualDate'}
            ];
          case 4:
            return [
              {id: 'equalTime'},
              {id: 'notEqualTime'},
              {id: 'greaterThanTime'},
              {id: 'greaterThanEqualTime'},
              {id: 'lessThanTime'},
              {id: 'lessThanEqualTime'}
            ];
          case 5:
            return [
              {id: 'equalDateTime'},
              {id: 'notEqualDateTime'},
              {id: 'greaterThanDateTime'},
              {id: 'greaterThanEqualDateTime'},
              {id: 'lessThanDateTime'},
              {id: 'lessThanEqualDateTime'}
            ];
          }
        },
        joinOperatorItems = function () {
          return [
            {id: 'all'},
            {id: 'any'}
          ];
        },
        findOperator = function (operators, id) {
          var n = 0;
          angular.forEach(operators, function (o, i) {
            if (id === o.id) {
              n = i;
            }
          });
          return n;
        },
        service = {};

      service.setFields = function (fields) {
        fieldItems = fields;
      };

      service.getFields = function () {
        return fieldItems;
      };

      service.getOperatorFields = function (type) {
        return operatorFields(type);
      };

      service.getOperator = function (field, id) {
        return findOperator(operatorFields(fieldItems[field].type), id);
      };
      service.createNewCondition = function () {
        return {
          isSelect: true,
          notOp: false,
          field: 0,
          operator: 0,
          compareValue: '',
          caseSensitive: false
        };
      };
      service.createNewGroup = function () {
        return {
          isAnd: true,
          conditions: [
            service.createNewCondition()
          ],
          groups: [
          ]
        };
      };

      return service;

    }]);
})();
