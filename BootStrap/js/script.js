$(document).ready(function () {
   var myBarChart = null;
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

  var ctx = document.getElementById("chart-area").getContext("2d");
  myBarChart = new Chart(ctx, config);


});

