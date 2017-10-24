$(document).ready(function () {
  var BASE_API_URL = 'http://10.0.0.160/demo-api/';
  var myPieChart = null;
  var myLineChart = null;
  var $currentRow = '';
  var isEdit = false;
  var DEFAULT_DATE_FORMAT = 'DD-MM-YYYY';
  var DONE_STATUS = 2;
  var pieChartConfig = {};
  var lineChartConfig = {};
  var $tasksGrid = $('#task-grid');
  var $currentRowToDlt = '';
  var COLOR_CONSTANTS = {
    BLOCKED: '#2ecc71',
    DONE: '#3498db',
    INPROGRESS: '#95a5a6',
    PLANNED: '#9b59b6',
    TASKS_COMPLETED: '#00caca'
  }


  $('.add-task-form').on('blur', '.reqCntrl', function () {
    Validator.removeErrForFld($(this));
  });

  $('#createdOn').val(formatDate(new Date()));

  $('#dueDate').datepicker({
    format: 'dd-mm-yyyy',
    todayHighlight: true
  });

  $('.open-datepicker').click(function (event) {
    event.preventDefault();
    $(this).parent().find('input').datepicker('show');
  });

  // Table columns
  var dtColumns = [{
    data: 'taskName',
    title: 'Task Name',
    width: '40%',
    isRequired: true
  }, {
    data: 'dueDate',
    title: 'Due Date',
    render: formatDate,
    width: '10%'
  }, {
    data: 'createdOn',
    title: 'Created On',
    render: formatDate,
    width: '10%'
  }, {
    data: 'statusName',
    title: 'Status',
    width: '10%'
  },
  {
    data: '',
    width: '20%',
    title: 'Actions',
    render: function (data, type, row) {
      var actions = '<span><span title="Edit" class="edit-setting row-action"><i class="fa fa-1x fa-pencil"></span></i></span>';
      actions += '<span><span title="Delete" class="delete-setting row-action"><i class="fa fa-1x fa-trash"></span></i></span>';
      if (row.statusID != DONE_STATUS) {
        actions += '<span><span title="Mark as done" class="mark-as-done row-action"><i class="fa fa-1x fa-check"></span></i></span>';
      } else {
        actions += '<span><span class="mark-as-done disabled row-action"><i class="fa fa-1x fa-check"></span></i></span>';
      }
      return actions;
    },
    className: 'table-actions text-center',
    bSortable: false,
    isRequired: true
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
  var elements = '';
  for (var index = 0; index < dtColumns.length; index++) {
    if (!dtColumns[index].isRequired) {
      elements = elements + '<span  class="dropdown-item dt-column-list" data- value="' + dtColumns[index].title + '" > <input style="display:none;" id="' + dtColumns[index].data + '" type="checkbox"  checked="true"/> <span class="check-box"></span> <label >&nbsp; ' + dtColumns[index].title + ' </label></span>';
    }
  }

  $('#dropdown-list').html(elements);

  $('#dropdown-list').on('click', '.dt-column-list', function (e) {
    $(this).find('input').prop('checked', !$(this).find('input').is(':checked'));
    for (var i = 0; i < dtColumns.length; i++) {
      if (dtColumns[i].data === $(this).find('input').attr('id')) {
        // Get the column API object
        var column = dtObj.column(i);
        column.visible(!column.visible());
        break;
      }
    }
    e.stopPropagation();
  });

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
      localStorage.setItem('tasksStatuses', JSON.stringify(result));
    } else {
      // TODO : Show errors
    }

  }

  // Click event for delete icon in the grid
  var $dltConfirmationModal = $('.delete-confirmation-modal');
  $tasksGrid.on('click', '.delete-setting', function () {
    $currentRowToDlt = $(this).parents('tr');
    $dltConfirmationModal.modal('show');
  });

  $dltConfirmationModal.find('.confirm-dlt-btn').click(function () {
    dtObj
      .row($currentRowToDlt)
      .remove()
      .draw();
    setTasksInLocalStorage();
    udpatePieChartData();
    updateLineChart();
    $dltConfirmationModal.modal('hide');
    $currentRowToDlt = '';
  });

  // Click event for edit icon in the grid
  $tasksGrid.on('click', '.edit-setting', function () {
    $currentRow = $(this).parents('tr');
    var rowData = dtObj.row($(this).parents('tr')).data();
    isEdit = true;
    fillDetailsInForm(rowData);
    $('.add-task-form').find('input')[0].focus();
  });

  function fillDetailsInForm(rowData) {
    var $addTaskForm = $('.add-task-form');
    for (var prop in rowData) {
      if (prop === 'statusID') {
        $addTaskForm.find('select[name="' + prop + '"]').val(rowData[prop]);
      } else {
        var $currentFormInput = $addTaskForm.find('input[name="' + prop + '"]');
        $currentFormInput.val(rowData[prop]);
        if ($currentFormInput.hasClass('datepicker')) {
          $currentFormInput.datepicker("setDate", formatDate(rowData[prop]));
        }

      }

    }
  }

  // Reset the add task form fields on click of the reset button.
  $('.task-reset').click(function () {
    Validator.resetResponse($('#addTaskForm'));
  });

  // Submitting the add/edit task form
  $('.task-submit').click(function () {
    var $taskForm = $('.add-task-form');
    var response = Validator.validateFormCntrls($taskForm, this);
    if (!response.hasError) {
      var rowData = getFormData();
      addCompletedOn(rowData);
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
      updateLineChart();
      $('#createdOn').val(formatDate(new Date()));
      $('.add-task-form')[0].reset();
    }
  });

  /**
  * Chang completed on date.
  * @param {*} tskDetails
  */
  function addCompletedOn(tskDetails) {
    if (tskDetails.statusID == DONE_STATUS) {
      tskDetails.completedOn = formatDate(new Date());
    } else {
      tskDetails.completedOn = '';
    }
    return tskDetails;
  }

  // Handle mark as done functionality.
  $tasksGrid.on('click', '.mark-as-done', function () {
    if (!$(this).hasClass('disabled')) {
      var $rowToUpdate = $(this).parents('tr');
      var rowData = dtObj.row($rowToUpdate).data();
      rowData.statusID = DONE_STATUS;
      rowData.statusName = 'Done';
      rowData.completedOn = formatDate(new Date());
      dtObj
        .row($rowToUpdate)
        .data(rowData)
        .draw();
      setTasksInLocalStorage();
      udpatePieChartData();
      updateLineChart();
    }
  });

  // Getting tasksData from local storage
  function getTasksFromLocalStorage() {
    var taskDataJSON = localStorage.getItem('tasksData');
    return JSON.parse(taskDataJSON);
  }

  // Getting tasksData from local storage
  function getTaskStatusesFromLocalStorage() {
    var taskStatusesDataJSON = localStorage.getItem('tasksStatuses');
    return JSON.parse(taskStatusesDataJSON);
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

  $('.nav-link.help-link').click(function () {
    $('.help-modal').modal('show');
  });

  /**
  * converting string to date.
  */
  function convertStringToDate(date) {
    return moment(date, DEFAULT_DATE_FORMAT).toDate();
  }

  function formatDate(date) {
    var dateObj = convertStringToDate(date);
    return moment(dateObj).format(DEFAULT_DATE_FORMAT);
  }

  /**
   * Function to update the pie chart data by
   * getting the updated tasks lists from the local storage and
   * creating the required chart array data by calculating the total task statuses and their respective counts and
   * passing the updated tasks statuses and their counts to the createPieChart method.
   */
  function udpatePieChartData(initialLoad) {
    var taskStatuses = getTaskStatusesFromLocalStorage();
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

    // Check if the task status is not present in the current tasks list.
    // If yes create a object with the status details and the count as 0 and push it to the taskData array.
    for (var k = 0; k < taskStatuses.length; k++) {
      var taskStatus = taskStatuses[k];
      var statusIsPresent = false;
      for (var l = 0; l < taskData.length; l++) {
        if (parseInt(taskData[l].statusId, 10) === parseInt(taskStatus.statusID, 10)) {
          statusIsPresent = true;
          break;
        }
      }
      if (!statusIsPresent) {
        var statusObj = {
          statusId: taskStatus.statusID,
          statusName: taskStatus.statusName,
          totalTasksCount: 0
        }
        taskData.push(statusObj);
      }
    }
    taskData.sort(function (a, b) { return parseInt(a.statusId, 10) - parseInt(b.statusId) });
    var requestData = {
      data: taskData,
    }
    if (!initialLoad) {
      requestData.isUpdate = true;
    }
    createUpdatePieChart(requestData);
  }

  // Render the chart with localstorage.
  function updateLineChart(initialLoad) {
    var completedTasks = getTasksFromLocalStorage();
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
    createUpdateLineChart(chartInfo, initialLoad)
  }

  /**
   * Function to create or update the Pie chart
   * @param {*} response
   */
  function createUpdatePieChart(response) {
    var pieChart = $(document.getElementById("canvas-pie-chart"));
    var emptyPie = $(document.getElementsByClassName("empty-pie-chart"));
    var respData = response.data;
    var chartLabels = [];
    var chartData = [];
    var validDataCount = 0;
    for (var i = 0; i < respData.length; i++) {
      chartLabels.push(respData[i].statusName);
      chartData.push(respData[i].totalTasksCount);
      if (respData[i].totalTasksCount > 0) {
        validDataCount++;
      }
    }

    if (validDataCount === 0) {
      pieChart.addClass('hide-div');
      if (emptyPie.hasClass('hide-div')) {
        emptyPie.removeClass('hide-div');
      }
    } else if (pieChart.hasClass('hide-div')) {
      pieChart.removeClass('hide-div');
    } else if (!emptyPie.hasClass('hide-div')) {
      emptyPie.addClass('hide-div');
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
                COLOR_CONSTANTS.BLOCKED,
                COLOR_CONSTANTS.DONE,
                COLOR_CONSTANTS.INPROGRESS,
                COLOR_CONSTANTS.PLANNED
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
  function createUpdateLineChart(response, initialLoad) {
    var lineChart = $(document.getElementById("canvas-line-chart"));
    var emptyLine = $(document.getElementsByClassName("empty-line-chart"));
    var respData = response.data;
    var chartLabels = [];
    var chartData = [];

    if (response.lblDates && response.data) {
      chartLabels = response.lblDates;
      chartData = response.data;
    } else {
      for (var i = 0; i < respData.length; i++) {
        if (respData[i].completedOn !== '') {
          chartLabels.push(respData[i].completedOn);
          chartData.push(respData[i].totalTasksCount);
        }
      }
    }

    if (chartData.length === 0) {
      lineChart.addClass('hide-div');
      if (emptyLine.hasClass('hide-div')) {
        emptyLine.removeClass('hide-div');
      }
    } else if (lineChart.hasClass('hide-div')) {
      lineChart.removeClass('hide-div');
    } else if (!emptyLine.hasClass('hide-div')) {
      emptyLine.addClass('hide-div');
    }

    if (Object.keys(lineChartConfig).length === 0) {
      if (chartLabels.length && chartData.length) {
        lineChartConfig = {
          type: 'line',
          data: {
            labels: chartLabels,
            datasets: [{
              label: "Tasks completed",
              backgroundColor: COLOR_CONSTANTS.TASKS_COMPLETED,
              borderColor: COLOR_CONSTANTS.TASKS_COMPLETED,
              borderCapStyle: 'butt',
              pointBackgroundColor: COLOR_CONSTANTS.TASKS_COMPLETED,
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
                },
                ticks: {
                  stepSize: 1
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
            }
          }
        };
        var ctxPie = document.getElementById("canvas-line-chart").getContext("2d");
        myLineChart = new Chart(ctxPie, lineChartConfig);
      }
    } else {
      lineChartConfig.data.labels = chartLabels;
      lineChartConfig.data.datasets[0].data = chartData;
      myLineChart.update();
    }
  };

  // Check if the task list is present in the local storage.
  // If No call the APi methods to get the pie chart and line chart data.
  // If Yes call the update methods to update the charts data and pass the initialLoad variable to indentify its the initial load
  var localStorageTasks = getTasksFromLocalStorage()
  if (!localStorageTasks || localStorageTasks.length <= 0) {
    // Making ajax call to get the task count based on statuses show the response data in a Pie chart
    makeAjaxCall('tasks/fetchTasksByStatus', createUpdatePieChart);
    // Making ajax call to get the completed task count per day and show the response data in a Line chart
    makeAjaxCall('tasks/getCompletedTasksByDay', createUpdateLineChart);
  } else {
    var initialLoad = true;
    udpatePieChartData(initialLoad)
    updateLineChart(initialLoad)
  }

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