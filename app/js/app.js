'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('myApp', [/*'ui.grid', 'ui.bootstrap', 'bootstrap', 'ui.grid.cellNav', 'ui.grid.edit', 'ui.grid.resizeColumns', 'ui.grid.pinning', 'ui.grid.selection', 'ui.grid.moveColumns', 'ui.grid.exporter', 'ui.grid.importer', 'ui.grid.grouping'*/]);
app.controller('tableCtrl',/* ['$scope', '$http', '$filter', '$timeout', '$interval', 'uiGridConstants', 'uiGridGroupingConstants', */function ($scope, $http/*, $filter, $timeout, $interval, uiGridConstants, uiGridGroupingConstants*/) {
    $http.get("data.php")
        .then(function (response) {
            $scope.records = response.data.records;
        });
    $scope.addTitle = "";
    $scope.addStartDate = "01/12/2017";
    $scope.addEndDate = "";
    $scope.addTag = "dupa";
    $scope.addAssignee = "";
    $scope.bulkStart = "";
    $scope.bulkEnd = "";
    $scope.bulkTag = "";
    $scope.bulkAssignee = "";

    $scope.addNewRow = function () {
        $scope.errortext = "";
        if ($scope.records.indexOf($scope.addTitle) === -1) {    //doesn't work properly
            $scope.records.push({"Title":$scope.addTitle,"StartDate":$scope.addStartDate,"EndDate":$scope.addEndDate,"Tag":$scope.addTag,"Assignee":$scope.addAssignee});
            $scope.addTitle = "";
            $scope.addStartDate = "";
            $scope.addEndDate = "";
            $scope.addTag = "";
            $scope.addAssignee = "";
        } else {
            $scope.errortext = "The package already exists.";
        }
    }
    $scope.chckedIndexs = [];
    $scope.checkedIndex = function (record) {
        if ($scope.chckedIndexs.indexOf(record) === -1) {
            $scope.chckedIndexs.push(record);
        }
        else {
            $scope.chckedIndexs.splice($scope.chckedIndexs.indexOf(record), 1);
        }
    }
    $scope.selectedRows = function () {
        return $filter('filter')($scope.records, { checked: true });
    };
    $scope.removeRows=function(index){
        angular.forEach($scope.chckedIndexs, function (value, index) {
            var index = $scope.records.indexOf(value);
            $scope.records.splice(index, 1);
        });
        $scope.chckedIndexs = [];
    };
    $scope.bulkChangeStartDate=function(index){
        angular.forEach($scope.chckedIndexs, function (value, index) {
            index = $scope.records.indexOf(value);
            $scope.records(index, {"StartDate":$scope.bulkStart});
        });
        $scope.chckedIndexs = [];
    };
    $scope.bulkChangeEndDate=function(index){
        angular.forEach($scope.chckedIndexs, function (value, index) {
            index = $scope.records.indexOf(value);
            $scope.records(index, {"EndDate":$scope.bulkEnd});
        });
        $scope.chckedIndexs = [];
    };
    $scope.bulkChangeTag=function(index){
        angular.forEach($scope.chckedIndexs, function (value, index) {
            index = $scope.records.indexOf(value);
            $scope.records(index, {"Tag":$scope.bulkTag});
        });
        $scope.chckedIndexs = [];
    };
    $scope.bulkChangeAssignee=function(index){
        angular.forEach($scope.chckedIndexs, function (value, index) {
            index = $scope.records.indexOf(value);
            $scope.records(index, {"Assignee":$scope.bulkAssignee});
        });
        $scope.chckedIndexs = [];
    };
    $scope.countDays = function (date1, date2) {
        var d1 = new Date(date1);
        var d2 = new Date(date2);
        var milliseconds = d2-d1;
        var seconds = milliseconds/1000;
        var minutes = seconds/60;
        var hours = minutes/60;
        var days = hours/24;
        return days;
    }
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
});
