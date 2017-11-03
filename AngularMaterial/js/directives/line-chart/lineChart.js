
angular
  .module('angularDemo').directive('lineChart', function (ChartsService, $localStorage) {
    return {
      restrict: 'E',
      templateUrl: 'js/directives/line-chart/lineChart.html',
      link: function ($scope, $ele, $atr) {
        var lineChart = null;

        // On data table data is updated then udate the chart.
        $scope.$on('dt-update', function () {
          if (!$localStorage.tasks) {
            return;
          }
          chartUpdate();
        });

        // Render the chart with localstorage.
        function chartUpdate() {
          var completedTasks = $localStorage.tasks;
          completedTasks.sort(function (taskObj, taskObjStatus) {
            taskObj = taskObj.completedOn.split('-').reverse().join('');
            taskObjStatus = taskObjStatus.completedOn.split('-').reverse().join('');
            return taskObj > taskObjStatus ? 1 : taskObj < taskObjStatus ? -1 : 0;
          });
          var chartInfo = {};
          var doneStatusCount = {};
          chartInfo.lblDates = [];
          chartInfo.data = [];
          for (var index = 0; index < completedTasks.length; index++) {
            if (completedTasks[index].completedOn && chartInfo.lblDates.indexOf(completedTasks[index].completedOn) === -1) {
              chartInfo.lblDates.push(completedTasks[index].completedOn);
            }
            doneStatusCount[completedTasks[index].completedOn] = (doneStatusCount[completedTasks[index].completedOn] || 0) + 1;
          }
          for (var dtIndex = 0; dtIndex < chartInfo.lblDates.length; dtIndex++) {
            chartInfo.data.push(doneStatusCount[chartInfo.lblDates[dtIndex]]);
          }
          initLineChart(chartInfo)
        }

        // To initialize the line chart
        function initLineChart(chartData) {
          var lineChartElement = $ele.find('#lineChart');
          var lineChartConfig = {
            type: 'line',
            data: {
              labels: chartData.lblDates,
              datasets: [{
                label: "Tasks completed",
                backgroundColor: 'rgb(0, 202, 202)',
                borderColor: 'rgb(0, 202, 202)',
                borderCapStyle: 'butt',
                pointBackgroundColor: 'rgb(0, 202, 202)',
                data: chartData.data,
                fill: false,
              }]
            },
            options: {
              responsive: true,
              tooltips: {
                mode: 'index',
                intersect: false,
              },
              hover: {
                mode: 'nearest',
                intersect: true
              },
              scales: {
                xAxes: [{
                  display: true,
                  scaleLabel: {
                    display: true,
                    labelString: 'Dates'
                  }
                }],
                yAxes: [{
                  display: true,
                  scaleLabel: {
                    display: true,
                    labelString: 'Number of tasks'
                  },
                  ticks: {
                    stepSize: 1,
                    beginAtZero: true,
                    max: 10
                  }
                }]
              },
              legend: {
                onClick: function (e) {
                  e.stopPropagation();  // Disable the hide/show for the legend related line.
                }
              }
            }
          };
          if (lineChart) {
            lineChart.destroy();
          }
          lineChart = new Chart(lineChartElement, lineChartConfig);
        }
        if (!$localStorage.tasks) {
          ChartsService.getTasksCompleted().then(function (response) {
            var taskStatusInfo = response.data.data;
            var chartInfo = {};
            chartInfo.lblDates = [];
            for (var lblIndex = 0; lblIndex < taskStatusInfo.length; lblIndex++) {
              chartInfo.lblDates.push(taskStatusInfo[lblIndex].completedOn);
            }
            chartInfo.data = [];
            for (var dtIndex = 0; dtIndex < taskStatusInfo.length; dtIndex++) {
              chartInfo.data.push(taskStatusInfo[dtIndex].totalTasksCount);
            }
            initLineChart(chartInfo);
          });
        }
      }
    };
  });