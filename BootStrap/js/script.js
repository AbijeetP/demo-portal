$(document).ready(function () {
    var BASE_API_URL = 'http://10.0.0.160/demo-api/';
    var myPieChart = null;
    var myLineChart = null;
    var $currentRow = '';
    var isEdit = false;
    var dateFormat = 'dd-mm-yyyy';
    var DONE_STATUS = 2;
    var pieChartConfig = {};
    var $tasksGrid = $('#task-grid');

    $('#dueDate').datepicker({
        format: dateFormat
    });
    // Table columns
    var dtColumns = [{
        data: 'taskName',
        title: 'Task Name',
        width: '40%'
    }, {
        data: 'dueDate',
        title: 'Due Date',
        width: '10%'
    }, {
        data: 'createdOn',
        title: 'Created On',
        width: '10%'
    }, {
        data: 'statusName',
        title: 'Status',
        width: '10%'
    },
    {
        data: '',
        width: '10%',
        title: 'Edit',
        render: function (data, type, row) {
            return '<span><span class="edit-setting row-action"><i class="fa fa-1x fa-pencil"></span></i></span>';
        },
        className: 'text-center'
    },
    {
        data: '',
        width: '10%',
        title: 'Delete',
        render: function (data, type, row) {
            return '<span><span class="delete-setting row-action"><i class="fa fa-1x fa-trash"></span></i></span>';
        },
        className: 'text-center'
    },
    {
        data: '',
        width: '10%',
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
        responsive: true,
        colReorder: true,
        columns: dtColumns,
        data: [],
        autoWidth: true,
        isFullWidth: true
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
        udpatePieChartData();
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
            udpatePieChartData();
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
        udpatePieChartData();
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
    };

    /**
     * Function to update the pie chart data by
     * getting the updated tasks lists from the local storage and
     * creating the required chart array data by calculating the total task statuses and their respective counts and
     * passing the updated tasks statuses and their counts to the createPieChart method.
     */
    function udpatePieChartData() {
        var taskData = [];
        var tasks = getTasksFromLocalStorage();
        for (var i = 0; i < tasks.length; i++) {
            var obj = {};
            obj.statusId = tasks[i].statusID;
            obj.statusName = tasks[i].statusName;
            if (!taskData.length) {
                obj.totalTasksCount = 1;
                taskData.push(obj);
            } else {
                var taskStatusPresent = false;
                for (var j = 0; j < taskData.length; j++) {
                    if (taskData[j].statusId == obj.statusId) {
                        taskStatusPresent = true;
                        taskData[j].totalTasksCount = taskData[j].totalTasksCount + 1;
                        break;
                    }
                }
                if (!taskStatusPresent) {
                    obj.totalTasksCount = 1;
                    taskData.push(obj);
                }
            }
        }
        taskData.sort(function (a, b) { return parseInt(a.statusId, 10) - parseInt(b.statusId) });
        var requestData = {
            data: taskData,
            isUpdate: true
        }
        createUpdatePieChart(requestData);
    }

    /**
     * Function to create or update the Pie chart
     * @param {*} response
     */
    function createUpdatePieChart(response) {

        var respData = response.data;
        var chartLabels = [];
        var chartData = [];
        for (var i = 0; i < respData.length; i++) {
            chartLabels.push(respData[i].statusName);
            chartData.push(respData[i].totalTasksCount);
        }
        if (response.isUpdate) {
            pieChartConfig.data.datasets[0].data = chartData;
            myPieChart.update();
        } else {
            if (chartLabels.length && chartData.length) {
                pieChartConfig = {
                    type: 'pie',
                    data: {
                        datasets: [{
                            data: chartData,
                            backgroundColor: [
                                "#2ecc71",
                                "#3498db",
                                "#95a5a6",
                                "#9b59b6"
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
        }
    }

    /**
     * Function to create or update the Line chart
     * @param {*} response
     */
    function createUpdateLineChart(response) {
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
                        label: "Task completed",
                        backgroundColor: 'rgb(0, 202, 202)',
                        borderColor: 'rgb(0, 202, 202)',
                        borderCapStyle: 'butt',
                        pointBackgroundColor: 'rgb(0, 202, 202)',
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
            myLineChart = new Chart(ctxPie, lineChartConfig);
        }
    };

    // Making ajax call to get the task count based on statuses show the response data in a Pie chart
    makeAjaxCall('tasks/fetchTasksByStatus', createUpdatePieChart);
    // Making ajax call to get the completed task count per day and show the response data in a Line chart
    makeAjaxCall('tasks/getCompletedTasksByDay', createUpdateLineChart);

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

