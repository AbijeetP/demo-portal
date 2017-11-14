
angular
  .module('angularDemo').directive('taskStatusChart', function (ChartsService, $localStorage) {
    return {
      restrict: 'E',
      templateUrl: 'js/directives/task-status-chart/taskStatusChart.html',
      link: function ($scope, $ele, $atr) {
        var pieChartElement = null;
        var pieChart = null;
        $scope.$on('dt-update', function () {
          if (!$localStorage.tasks) {
            return;
          }
          chartUpdate();
        });
        // To initialize the pie chart
        function initPieChart(chartData) {
          if (pieChartElement) {
            pieChartElement = null;
          }
          pieChartElement = $ele.find('#taskStatusChart')[0].getContext('2d');

          var chartConfig = {
            type: 'pie',
            responsive: true,
            data: {
              labels: chartData.labels,
              datasets: [{
                backgroundColor: [
                  "#2ecc71",
                  "#3498db",
                  "#95a5a6",
                  "#9b59b6"
                ],
                data: chartData.data
              }]
            }
          };
          if (pieChart) {
            pieChart.destroy();
          }
          pieChart = new Chart(pieChartElement, chartConfig);

        }

        function chartUpdate() {
          var statusInfo = $localStorage.tasks;
          var chartInfo = {};
          chartInfo.labels = [];
          chartInfo.data = [];
          var statuscount = {};
          statusInfo = statusInfo.sort(function (a, b) {
            var stName = a.statusName.toLowerCase();
            var statusName = b.statusName.toLowerCase()
            if (stName < statusName) //sort string ascending
              return -1
            if (stName > statusName)
              return 1
            return 0 //default return value (no sorting)
          });
          for (var lblIndex = 0; lblIndex < statusInfo.length; lblIndex++) {
            if (chartInfo.labels.indexOf(statusInfo[lblIndex].statusName) === -1) {
              chartInfo.labels.push(statusInfo[lblIndex].statusName);
            }
            statuscount[statusInfo[lblIndex].statusName] = (statuscount[statusInfo[lblIndex].statusName] || 0) + 1;
          }

          for (var dtIndex = 0; dtIndex < chartInfo.labels.length; dtIndex++) {
            chartInfo.data.push(statuscount[chartInfo.labels[dtIndex]]);
          }

          initPieChart(chartInfo);
        }

        function renderGraph(taskStatusInfo) {
          var chartInfo = {};
          chartInfo.labels = [];
          for (var lblIndex = 0; lblIndex < taskStatusInfo.length; lblIndex++) {
            chartInfo.labels.push(taskStatusInfo[lblIndex].statusName);
          }
          chartInfo.data = [];
          for (var dtIndex = 0; dtIndex < taskStatusInfo.length; dtIndex++) {
            chartInfo.data.push(taskStatusInfo[dtIndex].totalTasksCount);
          }
          initPieChart(chartInfo);
        }

        if (!$localStorage.tasks) {
          ChartsService.getTaskStatusCount().then(function (response) {
            var taskStatusInfo = response.data.data;
            renderGraph(taskStatusInfo);
          });
        }
      }
    };
  });