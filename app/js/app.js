'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('myApp', ['xeditable', 'angularCharts', 'ngTouch', 'ngMessages', 'ui.date', 'ui.keypress', 'ui.event', 'angularjs-dropdown-multiselect']);
app.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.keyCode === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter)();
                });
                event.preventDefault();
            }
        });
    };
});
app.directive('focusMe', ['$timeout', '$parse', function ($timeout, $parse) {
    return {
        link: function (scope, element, attrs) {
            var model = $parse(attrs.focusMe);
            scope.$watch(model, function (value) {
                //console.log('value=', value);
                if (value === true) {
                    $timeout(function () {
                        element[0].focus();
                    });
                }
            });
            element.bind('blur', function () {
                console.log('blur');
                scope.$apply(model.assign(scope, false));
            });
        }
    };
}]);
app.directive('fixedTableHeaders', ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            $timeout(function() {
                var container = element.parentsUntil(attrs.fixedTableHeaders);
                element.stickyTableHeaders({ scrollableArea: container, "fixedOffset": 2 });
            }, 0);
        }
    }
}]);

app.controller('tableCtrl', ['$scope', '$http', '$filter', '$timeout', '$interval', function ($scope, $http, $filter) {
    $http.get("data.json")
        .then(function (response) {
            $scope.records = response.data.records;
        });

    $scope.bulkSelect = "Delete";
    $scope.bulkStart = new Date();
    $scope.bulkEnd = new Date();
    $scope.bulkTags = "";
    $scope.bulkAssignee = "";
    $scope.bulkProgress = "";
    $scope.bulkBudget = "";
    $scope.bulkApprovedExtraCost = "";
    $scope.bulkWorkingWeek = "Mon-Fri";
    $scope.bulkSchedulingMode = "Manual";
    $scope.bulkStatus = "Verified";
    $scope.startDateInput = new Date();
    $scope.endDateInput = new Date();
    $scope.searchTable = "";
    $scope.filterDropdown = "All";
    $scope.states = ["Verified", "Awaiting sign-off", "In progress", "Problem", "Not started"];
    $scope.schedulingModes = ["Manual", "Automatic"];
    $scope.workingWeeks = ["Mon-Fri", "Mon-Sat", "Mon-Sun"];

    $scope.addNewRow = function () {
        var now = new Date();
        $scope.errortext = "";
        if (now.getMonth() > 8 && now.getDate() > 8) {
            $scope.records.push({
                "Title": "Task",
                "StartDate": (now.getMonth() + 1) + "/" + (now.getDate()) + "/" + now.getFullYear(),
                "EndDate": (now.getMonth() + 1) + "/" + (now.getDate()) + "/" + now.getFullYear(),
                "Milestone": 0,
                "Tag": "",
                "Assignee": "",
                "Budget": "",
                "ApprovedExtraCost": "",
                "WorkingWeek": "Mon-Fri",
                "SchedulingMode": "Manual",
                "Progress": 0,
                "State": "Not started"
            });
        } else if (now.getMonth() <= 8 && now.getDate() > 8) {
            $scope.records.push({
                "Title": "Task",
                "StartDate": "0" + (now.getMonth() + 1) + "/" + (now.getDate()) + "/" + now.getFullYear(),
                "EndDate": "0" + (now.getMonth() + 1) + "/" + (now.getDate()) + "/" + now.getFullYear(),
                "Milestone": 0,
                "Tag": "",
                "Assignee": "",
                "Budget": "",
                "ApprovedExtraCost": "",
                "WorkingWeek": "Mon-Fri",
                "SchedulingMode": "Manual",
                "Progress": 0,
                "State": "Not started"
            });
        } else if (now.getMonth() > 8 && now.getDate() <= 8) {
            $scope.records.push({
                "Title": "Task",
                "StartDate": (now.getMonth() + 1) + "/0" + (now.getDate()) + "/" + now.getFullYear(),
                "EndDate": (now.getMonth() + 1) + "/0" + (now.getDate()) + "/" + now.getFullYear(),
                "Milestone": 0,
                "Tag": "",
                "Assignee": "",
                "Budget": "",
                "ApprovedExtraCost": "",
                "WorkingWeek": "Mon-Fri",
                "SchedulingMode": "Manual",
                "Progress": 0,
                "State": "Not started"
            });
        } else {
            $scope.records.push({
                "Title": "Task",
                "StartDate": "0" + (now.getMonth() + 1) + "/0" + (now.getDate()) + "/" + now.getFullYear(),
                "EndDate": "0" + (now.getMonth() + 1) + "/0" + (now.getDate()) + "/" + now.getFullYear(),
                "Milestone": 0,
                "Tag": "",
                "Assignee": "",
                "Budget": "",
                "ApprovedExtraCost": "",
                "WorkingWeek": "Mon-Fri",
                "SchedulingMode": "Manual",
                "Progress": 0,
                "State": "Not started"
            });
        }
    };

    $scope.filterModel = [];
    $scope.filteredData = ["All", "Verified", "Awaiting sign-off", "In progress", "Not started", "Problem"];
    $scope.filterData = [{id: 1, label: "Verified"}, {id: 2, label: "Awaiting sign-off"}, {id: 3, label: "In progress"}, {id: 4, label: "Problem"}, {id: 5, label: "Not started"}];
    $scope.bulks = ["Delete", "Start date", "End date", "Tags", "Assignee", "Budget", "Approved extra cost", "Working week", "Scheduling mode", "Progress", "Status"];
    $scope.filterTexts = {buttonDefaultText: 'Filter tasks'};
    $scope.tickedIndex = [];
    $scope.tickedMilestone = [];

    $scope.dateOptions = {
        changeYear: true,
        changeMonth: true,
        yearRange: '1900:-0'
    };

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

    $scope.filterStatus = function () {
        angular.forEach($scope.records, function (value, key) {
            angular.forEach($scope.filterModel.label, function (v1, k1) {
                if (value === v1) {
                    return value;
                }
            });
        });
    };

    $scope.bulkChangeStartDate = function (index) {
        angular.forEach($scope.tickedIndex, function (value, index) {
            var index = $scope.records.indexOf(value);
            if ($scope.countDays ($scope.bulkStart, $scope.records[index].EndDate) < 0) {
                if ($scope.bulkStart.getMonth() > 8 && $scope.bulkStart.getDate() > 8) {
                    $scope.records[index].EndDate = ($scope.bulkStart.getMonth() + 1) +
                        "/" + ($scope.bulkStart.getDate()) + "/" + $scope.bulkStart.getFullYear();
                } else if ($scope.bulkStart.getMonth() <= 8 && $scope.bulkStart.getDate() > 8) {
                    $scope.records[index].EndDate = "0" + ($scope.bulkStart.getMonth() + 1) +
                        "/" + ($scope.bulkStart.getDate()) + "/" + $scope.bulkStart.getFullYear();
                } else if ($scope.bulkStart.getMonth() > 8 && $scope.bulkStart.getDate() <= 8) {
                    $scope.records[index].EndDate = ($scope.bulkStart.getMonth() + 1) +
                        "/0" + ($scope.bulkStart.getDate()) + "/" + $scope.bulkStart.getFullYear();
                } else {
                    $scope.records[index].EndDate = "0" + ($scope.bulkStart.getMonth() + 1) +
                        "/0" + ($scope.bulkStart.getDate()) + "/" + $scope.bulkStart.getFullYear();
                }
            }
            else {
                $scope.records[index].Milestone = 0;
            }
            if ($scope.bulkStart.getMonth() > 8 && $scope.bulkStart.getDate() > 8) {
                $scope.records[index].StartDate = ($scope.bulkStart.getMonth() + 1) +
                    "/" + ($scope.bulkStart.getDate()) + "/" + $scope.bulkStart.getFullYear();
            } else if ($scope.bulkStart.getMonth() <= 8 && $scope.bulkStart.getDate() > 8) {
                $scope.records[index].StartDate = "0" + ($scope.bulkStart.getMonth() + 1) +
                    "/" + ($scope.bulkStart.getDate()) + "/" + $scope.bulkStart.getFullYear();
            } else if ($scope.bulkStart.getMonth() > 8 && $scope.bulkStart.getDate() <= 8) {
                $scope.records[index].StartDate = ($scope.bulkStart.getMonth() + 1) +
                    "/0" + ($scope.bulkStart.getDate()) + "/" + $scope.bulkStart.getFullYear();
            } else {
                $scope.records[index].StartDate = "0" + ($scope.bulkStart.getMonth() + 1) +
                    "/0" + ($scope.bulkStart.getDate()) + "/" + $scope.bulkStart.getFullYear();
            }
        });
        $scope.bulkStart = new Date();
    };

    $scope.bulkChangeEndDate = function (index) {
        angular.forEach($scope.tickedIndex, function (value, index) {
            var index = $scope.records.indexOf(value);
            if ($scope.countDays ($scope.records[index].StartDate, $scope.bulkEnd) < 0) {
                if ($scope.bulkEnd.getMonth() > 8 && $scope.bulkEnd.getDate() > 8) {
                    $scope.records[index].StartDate = ($scope.bulkEnd.getMonth() + 1) + "/" + ($scope.bulkEnd.getDate()) + "/" + $scope.bulkEnd.getFullYear();
                } else if ($scope.bulkEnd.getMonth() <= 8 && $scope.bulkEnd.getDate() > 8) {
                    $scope.records[index].StartDate = "0" + ($scope.bulkEnd.getMonth() + 1) + "/" + ($scope.bulkEnd.getDate()) + "/" + $scope.bulkEnd.getFullYear();
                } else if ($scope.bulkEnd.getMonth() > 8 && $scope.bulkEnd.getDate() <= 8) {
                    $scope.records[index].StartDate = ($scope.bulkEnd.getMonth() + 1) + "/0" + ($scope.bulkEnd.getDate()) + "/" + $scope.bulkEnd.getFullYear();
                } else {
                    $scope.records[index].StartDate = "0" + ($scope.bulkEnd.getMonth() + 1) + "/0" + ($scope.bulkEnd.getDate()) + "/" + $scope.bulkEnd.getFullYear();
                }
            }
            else {
                $scope.records[index].Milestone = 0;
            }
            if ($scope.bulkEnd.getMonth() > 8 && $scope.bulkEnd.getDate() > 8) {
                $scope.records[index].EndDate = ($scope.bulkEnd.getMonth() + 1) + "/" + ($scope.bulkEnd.getDate()) + "/" + $scope.bulkEnd.getFullYear();
            } else if ($scope.bulkEnd.getMonth() <= 8 && $scope.bulkEnd.getDate() > 8) {
                $scope.records[index].EndDate = "0" + ($scope.bulkEnd.getMonth() + 1) + "/" + ($scope.bulkEnd.getDate()) + "/" + $scope.bulkEnd.getFullYear();
            } else if ($scope.bulkEnd.getMonth() > 8 && $scope.bulkEnd.getDate() <= 8) {
                $scope.records[index].EndDate = ($scope.bulkEnd.getMonth() + 1) + "/0" + ($scope.bulkEnd.getDate()) + "/" + $scope.bulkEnd.getFullYear();
            } else {
                $scope.records[index].EndDate = "0" + ($scope.bulkEnd.getMonth() + 1) + "/0" + ($scope.bulkEnd.getDate()) + "/" + $scope.bulkEnd.getFullYear();
            }
        });
        $scope.bulkEnd = new Date();
    };

    $scope.bulkChangeTag = function (index) {
        angular.forEach($scope.tickedIndex, function (value, index) {
            var index = $scope.records.indexOf(value);
            $scope.records[index].Tag = $scope.bulkTags;
        });
        $scope.bulkTags = "";
    };

    $scope.bulkChangeAssignee = function (index) {
        angular.forEach($scope.tickedIndex, function (value, index) {
            var index = $scope.records.indexOf(value);
            $scope.records[index].Assignee = $scope.bulkAssignee;
        });
        $scope.bulkAssignee = "";
    };

    $scope.bulkChangeBudget = function (index) {
        angular.forEach($scope.tickedIndex, function (value, index) {
            var index = $scope.records.indexOf(value);
            $scope.records[index].Budget = $scope.bulkBudget;
        });
        $scope.bulkBudget = "";
    };

    $scope.bulkChangeApprovedExtraCost = function (index) {
        angular.forEach($scope.tickedIndex, function (value, index) {
            var index = $scope.records.indexOf(value);
            $scope.records[index].ApprovedExtraCost = $scope.bulkApprovedExtraCost;
        });
        $scope.bulkApprovedExtraCost = "";
    };

    $scope.bulkChangeWorkingWeek = function (index) {
        angular.forEach($scope.tickedIndex, function (value, index) {
            var index = $scope.records.indexOf(value);
            $scope.records[index].WorkingWeek = $scope.bulkWorkingWeek;
        });
        $scope.bulkWorkingWeek = "Mon-Fri";
    };

    $scope.bulkChangeSchedulingMode = function (index) {
        angular.forEach($scope.tickedIndex, function (value, index) {
            var index = $scope.records.indexOf(value);
            $scope.records[index].SchedulingMode = $scope.bulkSchedulingMode;
        });
        $scope.bulkSchedulingMode = "Manual";
    };

    $scope.bulkChangeProgress = function (index) {
        angular.forEach($scope.tickedIndex, function (value, index) {
            var index = $scope.records.indexOf(value);
            var now = new Date();
            if ($scope.bulkProgress === 100) {
                if ($scope.records[index].State != "Verified" && $scope.records[index].State != "Awaiting sign-off") {
                    $scope.records[index].Progress = $scope.bulkProgress;
                    $scope.records[index].State = "Awaiting sign-off";
                }
            } else if ($scope.bulkProgress === 0) {
                if ($scope.countDays($scope.records[index].EndDate, now) > 0) {
                    $scope.records[index].Progress = $scope.bulkProgress;
                    $scope.records[index].State = "Problem";
                } else {
                    $scope.records[index].State = "Not started";
                    $scope.records[index].Progress = $scope.bulkProgress;
                }
            } else if ($scope.bulkProgress > 0 && $scope.bulkProgress < 100) {
                if ($scope.countDays($scope.records[index].EndDate, now) > 0) {
                    $scope.records[index].Progress = $scope.bulkProgress;
                    $scope.records[index].State = "Problem";
                } else {
                    $scope.records[index].Progress = $scope.bulkProgress;
                    $scope.records[index].State = "In progress";
                }
            } else {
                alert("Invalid progress!");
            }
        });
        $scope.bulkProgress = "";
    };

    $scope.bulkChangeStatus = function (index) {
        angular.forEach($scope.tickedIndex, function (value, index) {
            var index = $scope.records.indexOf(value);
            $scope.records[index].State = $scope.bulkStatus;
            if ($scope.bulkStatus === "Verified" || $scope.bulkStatus === "Awaiting sign-off") {
                $scope.records[index].Progress = 100;
            } else if ($scope.bulkStatus === "In progress") {
                if ($scope.records[index].Progress === 100 || $scope.records[index].Progress === 0) {
                    $scope.records[index].Progress = 50;
                }
            } else if ($scope.bulkStatus === "Not started") {
                $scope.records[index].Progress = 0;
            }
            else if ($scope.bulkStatus === "Problem") {
                if ($scope.records[index].Progress === 100) {
                    $scope.records[index].Progress = 0;
                }
            }
        });
        $scope.bulkStatus = "Verified";
    };

    $scope.startDateEdit = function (index) {
        if ($scope.x.StartDate.getMonth() > 8 && $scope.x.StartDate.getDate() > 8) {
            $scope.records[index].StartDate = ($scope.x.StartDate.getMonth() + 1) +
                "/" + ($scope.x.StartDate.getDate()) + "/" + $scope.x.StartDate.getFullYear();
        } else if ($scope.x.StartDate.getMonth() <= 8 && $scope.x.StartDate.getDate() > 8) {
            $scope.records[index].StartDate = "0" + ($scope.x.StartDate.getMonth() + 1) +
                "/" + ($scope.x.StartDate.getDate()) + "/" + $scope.x.StartDate.getFullYear();
        } else if ($scope.x.StartDate.getMonth() > 8 && $scope.x.StartDate.getDate() <= 8) {
            $scope.records[index].StartDate = ($scope.x.StartDate.getMonth() + 1) + "" +
                "/0" + ($scope.x.StartDate.getDate()) + "/" + $scope.x.StartDate.getFullYear();
        } else {
            $scope.records[index].StartDate = "0" + ($scope.x.StartDate.getMonth() + 1) +
                "/0" + ($scope.x.StartDate.getDate()) + "/" + $scope.x.StartDate.getFullYear();
        }
        $scope.editStartDateMode = false;
    };

    $scope.endDateEdit = function (index) {
        if ($scope.x.EndDate.getMonth() > 8 && $scope.x.EndDate.getDate() > 8) {
            $scope.records[index].EndDate = ($scope.x.EndDate.getMonth() + 1) + "/" + ($scope.x.EndDate.getDate()) + "/" + $scope.x.EndDate.getFullYear();
        } else if ($scope.x.EndDate.getMonth() <= 8 && $scope.x.EndDate.getDate() > 8) {
            $scope.records[index].EndDate = "0" + ($scope.x.EndDate.getMonth() + 1) + "/" + ($scope.x.EndDate.getDate()) + "/" + $scope.x.EndDate.getFullYear();
        } else if ($scope.x.EndDate.getMonth() > 8 && $scope.x.EndDate.getDate() <= 8) {
            $scope.records[index].EndDate = ($scope.x.EndDate.getMonth() + 1) + "/0" + ($scope.x.EndDate.getDate()) + "/" + $scope.x.EndDate.getFullYear();
        } else {
            $scope.records[index].EndDate = "0" + ($scope.x.EndDate.getMonth() + 1) + "/0" + ($scope.x.EndDate.getDate()) + "/" + $scope.x.EndDate.getFullYear();
        }
        $scope.editEndDateMode = false;
    };

    $scope.updateState = function (index) {
        if ($scope.x.Progress === 100) {
            if ($scope.records[index].State != "Verified" && $scope.records[index].State != "Awaiting sign-off") {
                $scope.records[index].State = "Awaiting sign-off";
            }
        } else if ($scope.x.Progress === 0) {
            var now = new Date();
            if ($scope.countDays($scope.records[index].EndDate, now) > 0) {
                $scope.records[index].State = "Problem";
            } else {
                $scope.records[index].State = "Not started";
            }
        } else if ($scope.x.Progress > 0 && $scope.x.Progress < 100) {
            var now = new Date();
            if ($scope.countDays($scope.records[index].EndDate, now) > 0) {
                $scope.records[index].State = "Problem";
            } else {
                $scope.records[index].State = "In progress";
            }
        } else {
            alert("Invalid progress!");
        }
    };

    $scope.updateProgress = function () {
        if ($scope.x.State === "Verified" || $scope.x.State === "Awaiting sign-off") {
            $scope.x.Progress = 100;
        } else if ($scope.x.State === "In progress") {
            if ($scope.x.Progress === 100 || x.Progress === 0) {
                $scope.x.Progress = 50;
            }
        } else if ($scope.x.State === "Not started") {
            $scope.x.Progress = 0;
        }
        else if ($scope.x.State === "Problem") {
            if ($scope.x.Progress === 100) {
                $scope.x.Progress = 0;
            }
        }
    };

    $scope.milestoneSelected = function (record){
        if ($scope.records[record].Milestone === 1) {
            $scope.tickedMilestone.push(record);
            return true;
        }
        return false;
    };

    $scope.changeMilestone = function (record) {
        if ($scope.tickedMilestone.indexOf(record) === -1) {
            $scope.tickedMilestone.push(record);
            record.Milestone = 1;
            record.StartDate = record.EndDate;
        }
        else {
            $scope.tickedMilestone.splice($scope.tickedMilestone.indexOf(record), 1);
            record.Milestone = 0;
        }
    };

    $scope.checkBulk = function () {
        return $scope.bulkSelect.id;
    };

    $scope.countDays = function (date1, date2) {
        var d1 = new Date(date1);
        var d2 = new Date(date2);
        var milliseconds = d2 - d1;
        var seconds = milliseconds / 1000;
        var minutes = seconds / 60;
        var hours = minutes / 60;
        var days = hours / 24;
        var displayedDays = Math.round(days);
        return displayedDays;
    };

    $scope.dateDisplay = function (d) {
        var date = new Date(d);
        if (date.getMonth() > 8 && date.getDate() > 9) {
            date = (date.getMonth() + 1) + "/" + (date.getDate()) + "/" + date.getFullYear();
        } else if (date.getMonth() <= 8 && date.getDate() > 9) {
            date = "0" + (date.getMonth() + 1) + "/" + (date.getDate()) + "/" + date.getFullYear();
        } else if (date.getMonth() > 8 && date.getDate() <= 9) {
            date = (date.getMonth() + 1) + "/0" + (date.getDate()) + "/" + date.getFullYear();
        } else {
            date = "0" + (date.getMonth() + 1) + "/0" + (date.getDate()) + "/" + date.getFullYear();
        }
        return date;
    };

    $scope.durationSuffix = function (startDate, endDate) {
        var days = $scope.countDays(startDate, endDate);
        var suffix = "";
        if (days === 0) {
            suffix = " day";
        } else {
            suffix = " days";
        }
        return suffix;
    };

    $scope.euroSuffix = function (budget) {
        var text = budget;
        if (budget != "") {
            text = budget + "€";
        }
        return text;
    };

    $scope.selectAll = function () {
        var ticks = 0;
        var records = 0;
        angular.forEach ($scope.records, function (value, key) {
            records++;
        });
        angular.forEach ($scope.tickedIndex, function (value, key) {
            ticks++;
        });
        if (ticks === records) {
            $scope.tickedIndex = [];
        } else {
            angular.forEach ($scope.records, function (value, key) {
                $scope.tickedIndex.push(value);
            });
        }
    };

    $scope.getVerified = function () {
        return _($scope.records).filter(function(value, key){
            return value.State == "Verified";
        }).length;
    };

    $scope.verifyDropdown = function () {
        if ($scope.filterDropdown === "All") {
            return "";
        }
        return $scope.filterDropdown;
    };

    $scope.configStates = {
        colors: ['green', 'greenyellow', 'yellow', 'orange', 'red'],
        title: 'Status chart',
        tooltips: true,
        labels: false,
        legend: {
            display: false,
            position: 'right'
        }
    };

    $scope.dataStates = {
        data: [{
            x: "Verified",
            y: [$scope.getVerified()],
            tooltip: "Verified"
        }, {
            x: "Awaiting sign-off",
            y: [3],
            tooltip: "Awaiting sign-off"
        }, {
            x: "In progress",
            y: [1],
            tooltip: "In progress"
        }, {
            x: "Not started",
            y: [1],
            tooltip: "Not started"
        }, {
            x: "Problem",
            y: [1],
            tooltip: "Problem"
        }]
    };

    $scope.configProgress = {
        colors: ['greenyellow', 'red'],
        title: 'Progress chart',
        tooltips: true,
        labels: false,
        legend: {
            display: false,
            position: 'right'
        }
    };

    $scope.dataProgress = {
        data: [{
            x: "Done",
            y: [30],
            tooltip: "Done"
        }, {
            x: "To do",
            y: [41],
            tooltip: "To do"
        }]
    };

    $scope.cancelChanges = function () {
        $http.get("data.json")
            .then(function (response) {
                $scope.records = response.data.records;
            });
    };
}]);
