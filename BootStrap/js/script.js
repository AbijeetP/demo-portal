$(document).ready(function () {
  var myPieChart = null;
  var myLineChart = null;
  var table = $('#task-grid').DataTable({
    "ajax": "http://10.0.0.160/osm-demo-api/tasks",
    "columns": [
      { "data": "id" },
      { "data": "taskName" },
      { "data": "dueDate" },
      { "data": "createdOn" },
      { "data": "statusName" }
    ]
  });
  var $tableContainer = $(table.table().container());
  $tableContainer.removeClass('form-inline');
  var $cols = $tableContainer.find('.col-xs-12')
  for (var i = 0; i <= $cols.length; i++) {
    $($cols[i]).removeClass('col-xs-12').addClass('col-sm-12');
  }
  setTimeout(function () {
    $tableContainer.find('.pagination').addClass('right-align');
  });

  function randomScalingFactor() {
    return Math.round(Math.random() * 100);
  };

  /**
   * Function to
   * make the API call to get the task count based on statuses and
   * show the response data in a pie chart
   */
  function GetPieChartData() {
    $.ajax({
      url: 'http://10.0.0.160/demo-api/tasks/fetchTasksByStatus',
      method: 'GET',
      dataType: 'json',
      success: function (response) {
        var respData = response.data;
        var chartLabels = [];
        var chartData = [];
        for (var i = 0; i < respData.length; i++) {
          chartLabels.push(respData[i].statusName);
          chartData.push(respData[i].totalTasksCount);
        }
        if (chartLabels.length && chartData.length) {
          var pieChartConfig = {
            type: 'pie',
            data: {
              datasets: [{
                data: chartData,
                backgroundColor: [
                  '#ffa500',
                  '#E83E3E',
                  '#00CCCC',
                  '#228B22'
                ]
              }],
              labels: chartLabels
            },
            options: {
              responsive: true
            }
          };

          var ctxPie = document.getElementById("canvas-pie-chart").getContext("2d");
          myPieChart = new Chart(ctxPie, pieChartConfig);
        }
      },
    });
  };

  /**
   * Function to
   * make the API call to get the completed task count per day and
   * show the response data in a Line chart
   */
  function GetLineChartData() {
    $.ajax({
      url: 'http://10.0.0.160/demo-api/tasks/getCompletedTasksByDay',
      method: 'GET',
      dataType: 'json',
      success: function (response) {
        var respData = response.data;
        var chartLabels = [];
        var chartData = [];
        for (var i = 0; i < respData.length; i++) {
          chartLabels.push(respData[i].completedOn);
          chartData.push(respData[i].totalTasksCount);
        }
        if (chartLabels.length && chartData.length) {
          var lineChartConfig = {
            type: 'line',
            data: {
              labels: chartLabels,
              datasets: [{
                label: "Task completed per day",
                backgroundColor: '#E83E3E',
                borderColor: '#E83E3E',
                data: chartData,
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
                    stepSize: 1
                  }
                }]
              }
            }
          };
          var ctxPie = document.getElementById("canvas-line-chart").getContext("2d");
          myPieChart = new Chart(ctxPie, lineChartConfig);
        }
      },
    });
  };

  GetLineChartData();
  GetPieChartData();
});

