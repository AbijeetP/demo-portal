$(document).ready(function () {
    var BASE_API_URL = 'http://10.0.0.160/demo-api/';
    var myPieChart = null;
    var myLineChart = null;
    var $currentRow = '';
    var isEdit = false;
    var DONE_STATUS = 2;
    var $tasksGrid = $('#task-grid');
    // Table columns
    var dtColumns = [{
            data: 'taskName',
            title: 'Task Name',
        }, {
            data: 'dueDate',
            title: 'Due Date'
        }, {
            data: 'createdOn',
            title: 'Created On'
        }, {
            data: 'statusName',
            title: 'Status'
        },
        {
            data: '',
            title: 'Edit',
            render: function (data, type, row) {
                return '<span><span class="edit-setting row-action"><i class="fa fa-1x fa-pencil"></span></i></span>';
            },
            className: 'text-center'
        },
        {
            data: '',
            title: 'Delete',
            render: function (data, type, row) {
                return '<span><span class="delete-setting row-action"><i class="fa fa-1x fa-trash"></span></i></span>';
            },
            className: 'text-center'
        },
        {
            data: '',
            title: 'Mark As Done',
            render: function (data, type, row) {
                var elem = null;
                if (row.statusID !== DONE_STATUS) {
                    elem = '<span><span class="mark-as-done row-action"><i class="fa fa-1x fa-check"></span></i></span>';
                } else {
                    elem = '<span><span class="mark-as-done row-action">--</i></span>';
                }
                return elem;
            },
            className: 'text-center'
        }];

    var dtConfig = {
        columns: dtColumns,
        data: []
    };
    var dtObj = $tasksGrid.DataTable(dtConfig);

    // Making ajax call to get all task status and bind to dropdown
    makeAjaxCall('tasks', cbBindTaskDataToGrid);

    function cbBindTaskDataToGrid(response) {
        if (response.hasOwnProperty('success') && response.success) {
            var taskData = response.data;
            dtObj.rows.add(taskData).draw();
            setTasksInLocalStorage(taskData);

        } else {
            // TODO : Show errors
        }
    }

    // Fixing issues with Datatable bootstrap 4 UI
    var $tableContainer = $(dtObj.table().container());
    $tableContainer.removeClass('form-inline');
    var $cols = $tableContainer.find('.col-xs-12')
    for (var i = 0; i <= $cols.length; i++) {
        $($cols[i]).removeClass('col-xs-12').addClass('col-sm-12');
    }

    // Making ajax call to get all task status and bind to dropdown
    makeAjaxCall('task-statuses', cbBindStatus);

    //This function will show error messages and success messages according to the response.
    function cbBindStatus(response) {
        if (response.hasOwnProperty('success') && response.success) {
            var statusHtml = '<option value="">Select a status</option>';
            var result = response.data;
            for (var prop in result) {
                statusHtml += '<option value="' + result[prop].statusID + '">' + result[prop].statusName + '</option>';
            }
            $('#tastStatus').html(statusHtml);

        } else {
            // TODO : Show errors
        }

    }

    // Click event for delete icon in the grid
    $tasksGrid.on('click', '.delete-setting', function () {
        // TODO : Show delete dialog
        dtObj
                .row($(this).parents('tr'))
                .remove()
                .draw();
        setTasksInLocalStorage();
    });

    // Click event for edit icon in the grid
    $tasksGrid.on('click', '.edit-setting', function () {
        $currentRow = $(this).parents('tr');
        var rowData = dtObj.row($(this).parents('tr')).data();
        isEdit = true;
        fillDetailsInForm(rowData);
    });

    function fillDetailsInForm(rowData) {
        var $addTaskForm = $('.add-task-form');
        for (var prop in rowData) {
            if (prop === 'statusID') {
                $addTaskForm.find('select[name="' + prop + '"]').val(rowData[prop]);
            } else {
                $addTaskForm.find('input[name="' + prop + '"]').val(rowData[prop]);
            }

        }
    }

    // Submitting the add/edit task form
    $('.task-submit').click(function () {
        var $taskForm = $('.add-task-form');
        var response = Validator.validateFormCntrls($taskForm, this);
        if (!response.hasError) {
            var rowData = getFormData();
            if (isEdit) {
                isEdit = false;
                dtObj
                        .row($currentRow)
                        .data(rowData)
                        .draw();
            } else {
                dtObj.row.add(rowData).draw(false);
            }
            setTasksInLocalStorage();
            $('.add-task-form')[0].reset();
        }
    });

    // Handle mark as done functionality.
    $tasksGrid.on('click', '.mark-as-done', function () {
        var $rowToUpdate = $(this).parents('tr');
        var rowData = dtObj.row($rowToUpdate).data();
        rowData.statusID = DONE_STATUS;
        rowData.statusName = 'Done';
        dtObj
                .row($rowToUpdate)
                .data(rowData)
                .draw();
        setTasksInLocalStorage();
    });

    // Getting tasksData from local storage
    function getTasksFromLocalStorage() {
        var taskDataJSON = localStorage.getItem('tasksData');
        return JSON.parse(taskDataJSON);
    }

    // Setting tasksData from parameter if it is passed
    // Else setting it from datatable
    function setTasksInLocalStorage(tasksData) {
        if (!tasksData) {
            tasksData = dtObj.rows().data();
            var updatedTaskData = [];
            for (var i = 0; i < tasksData.length; i++) {
                updatedTaskData[i] = tasksData[i];
            }
        } else {
            updatedTaskData = tasksData;
        }
        localStorage.setItem('tasksData', JSON.stringify(updatedTaskData));
    }

    function getFormData() {
        var $taskForm = $('.add-task-form');
        var rowData = {};
        rowData.taskName = $taskForm.find('input[name="taskName"]').val();
        rowData.dueDate = $taskForm.find('input[name="dueDate"]').val();
        rowData.statusName = $('#tastStatus option:selected').html()
        rowData.statusID = $taskForm.find('select[name="statusID"]').val();
        rowData.createdOn = $taskForm.find('input[name="createdOn"]').val();
        return rowData;
    }

    $('.nav-link').click(function () {
        $('.help-modal').modal('show');
    });

    function randomScalingFactor() {
        return Math.round(Math.random() * 100);
    }
    ;

    /**
     * Function to
     * make the API call to get the task count based on statuses and
     * show the response data in a pie chart
     */
    function GetPieChartData() {
        $.ajax({
            url: BASE_API_URL + 'tasks/fetchTasksByStatus',
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
    }
    ;

    /**
     * Function to
     * make the API call to get the completed task count per day and
     * show the response data in a Line chart
     */
    function GetLineChartData() {
        $.ajax({
            url: BASE_API_URL + 'tasks/getCompletedTasksByDay',
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
                                    backgroundColor: '#00CCCC',
                                    borderColor: '#00CCCC',
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
    }
    ;

    GetLineChartData();
    GetPieChartData();

    function makeAjaxCall(MethodName, callback, message, showProcessing) {
        jQuery.ajax({
            url: BASE_API_URL + MethodName,
            type: 'GET',
            beforeSend: function () {

                if (showProcessing !== false) {
                    if (!message) {
                        message = 'Processing....';
                    }
                    jQuery.blockUI({
                        message: '<div class="loading-div">' + message + '</div>',
                        baseZ: 2000
                    });
                }

            },
            complete: function () {
                jQuery.unblockUI();
            }
        }).done(function (response) {
            jQuery.unblockUI();
            callback(response);
        }).fail(function () {
            jQuery.unblockUI();
        });
    }


});

