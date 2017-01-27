'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('myApp', ['ngTouch', 'ui.grid'/*, 'ui.bootstrap', 'bootstrap'*/, 'ui.grid.cellNav', 'ui.grid.edit', 'ui.grid.resizeColumns', 'ui.grid.pinning', 'ui.grid.selection', 'ui.grid.moveColumns', 'ui.grid.exporter', 'ui.grid.importer', 'ui.grid.grouping', 'angularjs-dropdown-multiselect']);
app.controller('tableCtrl', ['$scope', '$http', '$filter', '$timeout', '$interval', 'uiGridConstants', 'uiGridGroupingConstants', function ($scope, $http, $filter, $timeout, $interval, uiGridConstants, uiGridGroupingConstants) {
    $http.get("data.php")
        .then(function (response) {
            $scope.records = response.data.records;
        });
    $scope.addTitle = "";
    $scope.addStartDate = "";
    $scope.addEndDate = "";
    $scope.addTag = "";
    $scope.addAssignee = "";
    $scope.bulkStart = "";
    $scope.bulkEnd = "";
    $scope.bulkTags = "";
    $scope.bulkAssignee = "";
    $scope.bulkProgress = "";
    $scope.bulkStatus = "";
    $scope.searchTable = "";
    $scope.states = ["Verified", "Awaiting sign-off", "In progress", "Problem", "Not started"];

    $scope.addNewRow = function () {
        var now = new Date();
        $scope.errortext = "";
        if ($scope.records.indexOf($scope.addTitle) === -1) {    //doesn't work properly
            if ($scope.countDays($scope.addEndDate, now) > 0) {
                $scope.records.push({
                    "Title": $scope.addTitle,
                    "StartDate": $scope.addStartDate,
                    "EndDate": $scope.addEndDate,
                    "Milestone": "No",
                    "Tag": $scope.addTag,
                    "Assignee": $scope.addAssignee,
                    "Progress": "0%",
                    "State": "Problem"
                });
            } else {
                $scope.records.push({
                    "Title": $scope.addTitle,
                    "StartDate": $scope.addStartDate,
                    "EndDate": $scope.addEndDate,
                    "Milestone": "No",
                    "Tag": $scope.addTag,
                    "Assignee": $scope.addAssignee,
                    "Progress": "0%",
                    "State": "Not started"
                });
            }
            $scope.addTitle = "";
            $scope.addStartDate = "";
            $scope.addEndDate = "";
            $scope.addTag = "";
            $scope.addAssignee = "";
        } else {
            $scope.errortext = "The package already exists.";
        }
    };

    $scope.filterModel = [];
    $scope.filterData = [{id: 1, label: "Verified"}, {id: 2, label: "Awaiting sign-off"}, {id: 3, label: "In progress"}, {id: 4, label: "Problem"}, {id: 5, label: "Not started"}];
    $scope.filterSettings = {};
    $scope.filterTexts = {buttonDefaultText: 'Filter tasks'};

    $scope.tickedIndex = [];
    $scope.tickedMilestone = [];

    $scope.checkedIndex = function (record) {
        if ($scope.tickedIndex.indexOf(record) === -1) {
            $scope.tickedIndex.push(record);
        }
        else {
            $scope.tickedIndex.splice($scope.tickedIndex.indexOf(record), 1);
        }
    };

    $scope.selectedRows = function () {
        return $filter('filter')($scope.records, {checked: true});
    };

    $scope.removeRows = function (index) {
        angular.forEach($scope.tickedIndex, function (value, index) {
            var index = $scope.records.indexOf(value);
            $scope.records.splice(index, 1);
        });
        $scope.tickedIndex = [];
    };

    $scope.filterStatus = function (index) {
        angular.forEach($scope.records, function (value, index) {
            var y = 0;
            var index = $scope.records.indexOf(value);
            angular.forEach($scope.filterModel, function (value, index) {
                return ($scope.records[index].State === $scope.filterModel.label);
            });
        });
    };

    $scope.bulkChangeStartDate = function (index) {
        angular.forEach($scope.tickedIndex, function (value, index) {
            var index = $scope.records.indexOf(value);
            $scope.records[index].StartDate = $scope.bulkStart;
        });
        $scope.tickedIndex = [];
        $scope.bulkStart = "";
    };

    $scope.bulkChangeEndDate = function (index) {
        angular.forEach($scope.tickedIndex, function (value, index) {
            var index = $scope.records.indexOf(value);
            $scope.records[index].EndDate = $scope.bulkEnd;
        });
        $scope.tickedIndex = [];
        $scope.bulkEnd = "";
    };

    $scope.bulkChangeTag = function (index) {
        angular.forEach($scope.tickedIndex, function (value, index) {
            var index = $scope.records.indexOf(value);
            $scope.records[index].Tag = $scope.bulkTags;
        });
        $scope.tickedIndex = [];
        $scope.bulkTags = "";
    };

    $scope.bulkChangeAssignee = function (index) {
        angular.forEach($scope.tickedIndex, function (value, index) {
            var index = $scope.records.indexOf(value);
            $scope.records[index].Assignee = $scope.bulkAssignee;
        });
        $scope.tickedIndex = [];
        $scope.bulkAssignee = "";
    };

    $scope.bulkChangeProgress = function (index) {
        angular.forEach($scope.tickedIndex, function (value, index) {
            var index = $scope.records.indexOf(value);
            $scope.records[index].Progress = $scope.bulkProgress;
            if ($scope.bulkProgress === "100%") {
                if ($scope.records[index].State != "Verified" && $scope.records[index].State != "Awaiting sign-off") {
                    $scope.records[index].State = "Awaiting sign-off";
                }
            } else if ($scope.bulkProgress === "0%") {
                var now = new Date();
                if ($scope.countDays($scope.records[index].EndDate, now) > 0) {
                    $scope.records[index].State = "Problem";
                } else {
                    $scope.records[index].State = "Not started";
                }
            } else {
                var now = new Date();
                if ($scope.countDays($scope.records[index].EndDate, now) > 0) {
                    $scope.records[index].State = "Problem";
                } else {
                    $scope.records[index].State = "In progress";
                }
            }
        });
        $scope.tickedIndex = [];
        $scope.bulkProgress = "";
    };

    $scope.bulkChangeStatus = function (index) {
        angular.forEach($scope.tickedIndex, function (value, index) {
            var index = $scope.records.indexOf(value);
            $scope.records[index].State = $scope.bulkStatus;
            if ($scope.bulkStatus === "Verified" || $scope.bulkStatus === "Awaiting sign-off") {
                $scope.records[index].Progress = "100%";
            } else if ($scope.bulkStatus === "In progress") {
                if ($scope.records[index].Progress === "100%" || $scope.records[index].Progress === "0%") {
                    $scope.records[index].Progress = "50%";
                }
            } else if ($scope.bulkStatus === "Not started") {
                $scope.records[index].Progress = "0%";
            }
            else if ($scope.bulkStatus === "Problem") {
                if ($scope.records[index].Progress === "100%") {
                    $scope.records[index].Progress = "0%";
                }
            }
        });
        $scope.tickedIndex = [];
        $scope.bulkStatus = "";
    };

    $scope.setMilestone = function (record) {
        if ($scope.tickedIndex.indexOf(record) === -1) {
            $scope.tickedIndex.push(record);
        }
        else {
            $scope.tickedIndex.splice($scope.tickedIndex.indexOf(record), 1);
        }
    };

    $scope.countDays = function (date1, date2) {
        var d1 = new Date(date1);
        var d2 = new Date(date2);
        var milliseconds = d2 - d1;
        var seconds = milliseconds / 1000;
        var minutes = seconds / 60;
        var hours = minutes / 60;
        var days = hours / 24;
        return days;
    };

    $scope.cancelChanges = function () {
        $http.get("data.php")
            .then(function (response) {
                $scope.records = response.data.records;
            });
    };
    $scope.saveChanges = function () {

    };
    //
    // $scope.today = function() {
    //     $scope.dt = new Date();
    // };
    // $scope.today();
    //
    // $scope.clear = function() {
    //     $scope.dt = null;
    // };
    //
    // $scope.inlineOptions = {
    //     customClass: getDayClass,
    //     minDate: new Date(),
    //     showWeeks: true
    // };
    //
    // $scope.dateOptions = {
    //     dateDisabled: disabled,
    //     formatYear: 'yy',
    //     maxDate: new Date(2020, 5, 22),
    //     minDate: new Date(),
    //     startingDay: 1
    // };
    //
    // // Disable weekend selection
    // function disabled(data) {
    //     var date = data.date,
    //         mode = data.mode;
    //     return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
    // }
    //
    // $scope.toggleMin = function() {
    //     $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
    //     $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
    // };
    //
    // $scope.toggleMin();
    //
    // $scope.open1 = function() {
    //     $scope.popup1.opened = true;
    // };
    //
    // $scope.open2 = function() {
    //     $scope.popup2.opened = true;
    // };
    //
    // $scope.setDate = function(year, month, day) {
    //     $scope.dt = new Date(year, month, day);
    // };
    //
    // $scope.format = 'MM/dd/yyyy';
    // $scope.altInputFormats = ['M!/d!/yyyy'];
    //
    // $scope.popup1 = {
    //     opened: false
    // };
    //
    // $scope.popup2 = {
    //     opened: false
    // };
    //
    // var tomorrow = new Date();
    // tomorrow.setDate(tomorrow.getDate() + 1);
    // var afterTomorrow = new Date();
    // afterTomorrow.setDate(tomorrow.getDate() + 1);
    // $scope.events = [
    //     {
    //         date: tomorrow,
    //         status: 'full'
    //     },
    //     {
    //         date: afterTomorrow,
    //         status: 'partially'
    //     }
    // ];
    //
    // function getDayClass(data) {
    //     var date = data.date,
    //         mode = data.mode;
    //     if (mode === 'day') {
    //         var dayToCheck = new Date(date).setHours(0,0,0,0);
    //
    //         for (var i = 0; i < $scope.events.length; i++) {
    //             var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);
    //
    //             if (dayToCheck === currentDay) {
    //                 return $scope.events[i].status;
    //             }
    //         }
    //     }
    //
    //     return '';
    // }

    /*$scope.gridOptions = {};
     $scope.gridOptions.data = 'myData';
     $scope.gridOptions.enableCellEditOnFocus = true;
     $scope.gridOptions.enableColumnResizing = true;
     $scope.gridOptions.enableFiltering = true;
     $scope.gridOptions.enableGridMenu = true;
     $scope.gridOptions.showGridFooter = true;
     $scope.gridOptions.showColumnFooter = true;
     $scope.gridOptions.fastWatch = true;

     $scope.gridOptions.rowIdentity = function(row) {
     return row.id;
     };
     $scope.gridOptions.getRowIdentity = function(row) {
     return row.id;
     };

     $scope.gridOptions.columnDefs = [
     { name:'Ticked', width:50},
     { name:'Title', width:300, enableCellEdit: true },
     { name:'Duration', width:100, },
     { name:'End Date', width:100, enableCellEdit: true},
     { name:'Tags', width:150, enableCellEdit: true },
     { name:'Assignee', width:3-0, enableCellEdit: true },
     //{ name:'predecessor[0].name', displayName:'1st predecessor', width:150, enableCellEdit: true },
     //{ name:'predecessor[1].name', displayName:'2nd predecessor', width:150, enableCellEdit: true },
     //{ name:'predecessor[2].name', displayName:'3rd predecessor', width:150, enableCellEdit: true },
     ];

     var i = 0;
     $scope.refreshData = function() {
     $scope.myData = [];

     var sec = $interval(function () {

     $http.get('data.php')
     .success(function (data) {

     data.forEach(function (row) {
     row.id = i;
     i++;
     row.registered = new Date(row.registered)
     $scope.myData.push(row);
     });
     })
     }, 200, 10);


     var timeout = $timeout(function () {
     $interval.cancel(sec);
     $scope.left = '';
     }, 2000);

     $scope.$on('$destroy', function () {
     $timeout.cancel(timeout);
     $interval.cancel(sec);
     });
     };*/

}]);
