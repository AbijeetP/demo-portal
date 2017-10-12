
angular
  .module('angularDemo').directive('lineChart', function (ChartsService) {
    return {
      restrict: 'E',
      templateUrl: 'js/directives/line-chart/lineChart.html',
      link: function ($scope, $ele, $atr) {

        // To initialize the line chart
        function initLineChart(chartData) {
          var lineChartElement = $ele.find('#lineChart');
          var lineChart = new Chart(lineChartElement, {
            type: 'line',
            fill: false,
            data: {
              labels: chartData.lblDates,
              datasets: [
                {
                  backgroundColor: 'rgb(0, 202, 202)',
                  borderColor: 'rgb(0, 202, 202)',
                  borderCapStyle: 'butt',
                  pointBackgroundColor: 'rgb(0, 202, 202)',
                  label: 'Tasks completed',
                  data: chartData.data,
                  borderWidth: 1,
                  spanGaps: false,
                  fill: false,
                  lineTension: 0,
                }
              ]
            },
            options: {
              scales: {
                yAxes: [{
                  ticks: {
                    reverse: false
                  }
                }]
              }
            }
          });
        }
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
    };
  });