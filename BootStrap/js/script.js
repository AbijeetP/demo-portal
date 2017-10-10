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
  var config = {
    type: 'pie',
    data: {
      datasets: [{
        data: [
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
        ],
        backgroundColor: [
          '#ff0000',
          '#ffa500',
          '#ffff00',
          '#228B22',
          '#0000ff'
        ],
        label: 'Dataset 1'
      }],
      labels: [
        "Red",
        "Orange",
        "Yellow",
        "Green",
        "Blue"
      ]
    },
    options: {
      responsive: true
    }
  };

  var ctxPie = document.getElementById("canvas-pie-chart").getContext("2d");
  myPieChart = new Chart(ctxPie, config);

  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var lineConfig = {
    type: 'line',
    data: {
      labels: ["January", "February", "March", "April", "May", "June", "July"],
      datasets: [{
        label: "My First dataset",
        backgroundColor: '#ff0000',
        borderColor: '#ff0000',
        data: [
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor()
        ],
        fill: false,
      }, {
        label: "My Second dataset",
        fill: false,
        backgroundColor: '#0000ff',
        borderColor: '#0000ff',
        data: [
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor(),
          randomScalingFactor()
        ],
      }]
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: 'Chart.js Line Chart'
      },
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
            labelString: 'Month'
          }
        }],
        yAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Value'
          }
        }]
      }
    }
  };
  var ctxLine = document.getElementById("canvas-line-chart").getContext("2d");
  myLineChart = new Chart(ctxLine, lineConfig);
});

