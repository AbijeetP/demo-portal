$(document).ready(function () {
  var taskStatusChart = null;
  var taskCompletedStatusChart = null;
  var $currentRow = '';
  var isEdit = false;
  var DEFAULT_DATE_FORMAT = 'DD-MM-YYYY';
  var DONE_STATUS = 2;
  var taskStatusChartConfig = {};
  var taskCompletedStatusChartConfig = {};
  var $tasksGrid = $('#task-grid');
  var $currentRowToDlt = '';
  var COLOR_CONSTANTS = {
    BLOCKED: '#2ecc71',
    DONE: '#3498db',
    INPROGRESS: '#95a5a6',
    PLANNED: '#9b59b6',
    TASKS_COMPLETED: '#00caca'
  }
  var Validator = $('#addTaskForm').osmValidator();

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
  var taskListColumns = [{
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

  var taskListConfig = {
    responsive: true,
    colReorder: true,
    columns: taskListColumns,
    data: [],
    autoWidth: true,
    isFullWidth: true
  };

  var taskListObj = $tasksGrid.DataTable(taskListConfig);
  var elements = '';
  for (var index = 0; index < taskListColumns.length; index++) {
    if (!taskListColumns[index].isRequired) {
      elements = elements + '<span  class="dropdown-item dt-column-list" data- value="' + taskListColumns[index].title + '" > <input style="display:none;" id="' + taskListColumns[index].data + '" type="checkbox"  checked="true"/> <span class="check-box"></span> <label >&nbsp; ' + taskListColumns[index].title + ' </label></span>';
    }
  }

  // On click on pagination scroll to table.
  taskListObj.on('page.dt', function () {
    $('html,body').animate({
      scrollTop: $('.task-grid-section').offset().top
    }, 'slow');
  });

  $('#dropdown-list').html(elements);

  $('#dropdown-list').on('click', '.dt-column-list', function (e) {
    e.stopPropagation();
    $(this).find('input').prop('checked', !$(this).find('input').is(':checked'));
    for (var i = 0; i < taskListColumns.length; i++) {
      if (taskListColumns[i].data === $(this).find('input').attr('id')) {
        // Get the column API object
        var column = taskListObj.column(i);
        column.visible(!column.visible());
        break;
      }
    }
  });

  // Making ajax call to get all task status and bind to dropdown
  makeAjaxCall('tasks', cbBindTaskDataToGrid, 'loading', true);

  function cbBindTaskDataToGrid(response) {
    if (response.hasOwnProperty('success') && response.success) {
      var taskData = response.data;
      taskListObj.rows.add(taskData).draw();
      setTasksInLocalStorage(taskData);

    } else {
      createNotification('error', appMessages.somethingWrongTaskGrid);
    }
  }

  // Fixing issues with Datatable bootstrap 4 UI
  var $tableContainer = $(taskListObj.table().container());
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
      createNotification('error', appMessages.somethingWrongTaskStatus);
    }

  }

  // Click event for delete icon in the grid
  var $dltConfirmationModal = $('.delete-confirmation-modal');
  $tasksGrid.on('click', '.delete-setting', function () {
    $currentRowToDlt = $(this).parents('tr');
    $dltConfirmationModal.modal('show');
  });

  $dltConfirmationModal.find('.confirm-dlt-btn').click(function () {
    taskListObj
      .row($currentRowToDlt)
      .remove()
      .draw();
    setTasksInLocalStorage();
    udpatePieChartData();
    updateLineChart();
    $dltConfirmationModal.modal('hide');
    $currentRowToDlt = '';
    setTimeout(function () {
      createNotification('success', appMessages.taskDelete);
    }, 500);
  });

  // Click event for edit icon in the grid
  $tasksGrid.on('click', '.edit-setting', function () {
    $currentRow = $(this).parents('tr');
    var rowData = taskListObj.row($(this).parents('tr')).data();
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
    var response = Validator.validateFormControls($taskForm, this);
    if (!response.hasError) {
      var rowData = getFormData();
      addCompletedOn(rowData);
      if (isEdit) {
        taskListObj
          .row($currentRow)
          .data(rowData)
          .draw();
      } else {
        taskListObj.row.add(rowData).draw(false);
      }
      setTasksInLocalStorage();
      udpatePieChartData();
      updateLineChart();
      $('#createdOn').val(formatDate(new Date()));
      $('.add-task-form')[0].reset();
      if (isEdit) {
        isEdit = false;
        createNotification('success', appMessages.taskUpdate);
      } else {
        createNotification('success', appMessages.taskCreate);
      }
    } else {
      var errorElements = $('.has-error').find('.form-control').first().focus();
    }
  });

  function createNotification(type, message) {
    notify({
      type: type, //alert | success | error | warning | info
      message: message,
      position: {
        x: "right", //right | left | center
        y: "bottom" //top | bottom | center
      },
      size: "normal", //normal | full | small
      overlay: false, //true | false
      closeBtn: false, //true | false
      overflowHide: false, //true | false
      spacing: 20, //number px
      theme: "dark-theme", //default | dark-theme
      autoHide: true, //true | false
      delay: 2500, //number ms
      template: '<div class="notify"><div class="notify-text"></div></div>'
    });
  }

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
      var rowData = taskListObj.row($rowToUpdate).data();
      rowData.statusID = DONE_STATUS;
      rowData.statusName = 'Done';
      rowData.completedOn = formatDate(new Date());
      taskListObj
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
      tasksData = taskListObj.rows().data();
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
      taskStatusChartConfig.data.datasets[0].data = chartData;
      taskStatusChart.update();
    } else {
      if (chartLabels.length && chartData.length) {
        taskStatusChartConfig = {
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
        taskStatusChart = new Chart(ctxPie, taskStatusChartConfig);
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

    if (Object.keys(taskCompletedStatusChartConfig).length === 0) {
      if (chartLabels.length && chartData.length) {
        taskCompletedStatusChartConfig = {
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
            },
            legend: {
              onClick: function (e) {
                e.stopPropagation();  // Disable the hide/show for the legend related line.
              }
            }
          }
        };
        var ctxPie = document.getElementById("canvas-line-chart").getContext("2d");
        taskCompletedStatusChart = new Chart(ctxPie, taskCompletedStatusChartConfig);
      }
    } else {
      taskCompletedStatusChartConfig.data.labels = chartLabels;
      taskCompletedStatusChartConfig.data.datasets[0].data = chartData;
      taskCompletedStatusChart.update();
    }
  };

  // Check if the task list is present in the local storage.
  // If No call the APi methods to get the pie chart and line chart data.
  // If Yes call the update methods to update the charts data and pass the initialLoad variable to indentify its the initial load
  var localStorageTasks = getTasksFromLocalStorage()
  if (!localStorageTasks || localStorageTasks.length <= 0) {
    // Making ajax call to get the task count based on statuses show the response data in a Pie chart
    makeAjaxCall(API_URLS.taskStatus, createUpdatePieChart, '', true);
    // Making ajax call to get the completed task count per day and show the response data in a Line chart
    makeAjaxCall(API_URLS.completedTaskStatus, createUpdateLineChart, '', true);
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
            message: $('.loading-div'),
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