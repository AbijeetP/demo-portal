$(document).ready(function () {
    var table = $('#task-grid').DataTable({
        "ajax": "http://10.0.0.160/osm-demo-api/tasks",
        "columns": [
            {"data": "id"},
            {"data": "taskName"},
            {"data": "dueDate"},
            {"data": "createdOn"},
            {"data": "statusName"}
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

});

