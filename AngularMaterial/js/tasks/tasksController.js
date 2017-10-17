angular.module('angularDemo').controller('angularDemoController', function ($scope, $http, $compile, $localStorage, $mdDialog, $timeout, DemoConstants, tasksService) {
  var tsk = this;

  const FETCH_ERROR_MESSAGE = 'Some problem has occurred while fetching ';
  const FETCH_ERROR_MESSAGE_2 = '. Please try again later.';
  const CREATE_MESSAGE = 'Successfully created the task.';
  const UPDATE_MESSAGE = 'Successfully updated the task.';
  tsk.buttonName = 'Save';
  tsk.isUpdate = false;

  getStatus();
  configureToastr();
  showHelpModel();

  function showHelpModel() {
    angular.element('.nav-link.help-link').click(function () {
      angular.element('.help-modal').modal('show');
    });
  }

  /**
   * Configure toastr
   */
  function configureToastr() {
    toastr.options.timeOut = DemoConstants.TOASTR_TIMEOUT;
    toastr.options.positionClass = 'toast-bottom-right';
  }

  // Create or update a task
  tsk.createNewTask = function (isValid) {
    tsk.submitted = false;
    if (!isValid) {
      return;
    }
    // Save the details.
    if (tsk.isUpdate) {
      $localStorage.tasks.splice(tsk.editTaskIndex, 1);
      tsk.isUpdate = false;
      tsk.buttonName = 'Save';
      showSuccessMessage(UPDATE_MESSAGE);
    } else {
      showSuccessMessage(CREATE_MESSAGE);
    }
    var tasks = $localStorage.tasks ? $localStorage.tasks : [];
    tsk.taskDetails.statusName = getSelectedStatus(tsk.taskDetails.status);
    tsk.taskDetails.createdOn = formatDate(new Date());
    tsk.taskDetails.statusID = tsk.taskDetails.status;
    tsk.taskDetails = addCompletedOn(tsk.taskDetails);
    tasks.push(tsk.taskDetails);
    $localStorage.tasks = tasks;
    bindDataToTable();
    tsk.submitted = true;
    tsk.taskForm.$setPristine();
    tsk.taskForm.$setUntouched();
    tsk.taskDetails = {};
  };

  /**
   * Chang completed on date.
   * @param {*} tskDetails
   */
  function addCompletedOn(tskDetails) {
    if (tskDetails.statusID === DemoConstants.DONE_STATUS) {
      tskDetails.completedOn = formatDate(new Date());
    } else {
      tskDetails.completedOn = '';
    }
    return tskDetails;
  }

  /**
   * It return status named based on status id.
   * @param {*} statusId
   */
  function getSelectedStatus(statusId) {
    for (var i = 0; i < tsk.status.length; i++) {
      if (+tsk.status[i].statusID === +statusId) {
        return tsk.status[i].statusName;
      }
    }
  }

  /**
   * Call to getStatus API.
   */
  function getStatus() {
    tsk.status = [];
    return tasksService.fetchStatus().then(function (response) {
      if (response.data.code === DemoConstants.SUCCESSS_CODE) {
        tsk.status = response.data.data;
      } else {
        showErrorMessage(FETCH_ERROR_MESSAGE + 'status' + FETCH_ERROR_MESSAGE_2);
      }
    }, function () {
      showErrorMessage(FETCH_ERROR_MESSAGE + 'status' + FETCH_ERROR_MESSAGE_2);
    });
  }

  /**
   * To show error messgaes.
   */
  function showErrorMessage(message) {
    toastr.remove();
    toastr.error(message);
  }

  /**
   * To show the success message
   * @param {*} message
   */
  function showSuccessMessage(message) {
    toastr.remove();
    toastr.success(message);
  }
  tsk.isCheckedColumn = {
    'taskName': true,
    'dueDate': true,
    'createdOn': true,
    'statusName': true
  };

  // Table columns
  tsk.dtColumns = [{
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
    title: 'Edit',
    render: function (data, type, row) {
      var elem = null;
      elem = $compile('<span><span class="edit-setting row-action" title="Edit"><i class="fa fa-1x fa-pencil"></span></i></span>')($scope)[0];
      return elem.innerHTML;
    },
    className: 'text-center',
    width: '10%',
    isRequired: true
  },
  {
    data: '',
    title: 'Delete',
    render: function (data, type, row) {
      var elem = null;
      elem = $compile('<span><span class="delete-setting row-action" title="Delete"><i class="fa fa-1x fa-trash"></span></i></span>')($scope)[0];
      return elem.innerHTML;
    },
    className: 'text-center',
    width: '10%',
    isRequired: true
  },
  {
    data: '',
    title: 'Mark As Done',
    render: function (data, type, row) {
      var elem = null;
      if (row.statusID !== DemoConstants.DONE_STATUS) {
        elem = $compile('<span><span title="Mark as done" class="mark-as-done row-action"><i class="fa fa-1x fa-check"></span></i></span>')($scope)[0];
      } else {
        elem = $compile('<span><span class="mark-as-done disabled row-action"><i class="fa fa-1x fa-check"></span></i></span>')($scope)[0];
      }
      return elem.innerHTML;
    },
    className: 'text-center',
    width: '20%',
    isRequired: true
  }];

  var dtConfig = {
    responsive: true,
    colReorder: true,
    columns: tsk.dtColumns,
    data: [],
    autoWidth: false,
    isFullWidth: true
  };
  var $tasksGrid = angular.element('#tasksGrid');
  var dtObj = $tasksGrid.DataTable(dtConfig);
  tsk.isForFistTime = true;

  // Toggle columns visibility.
  tsk.columnVisibilityChanged = function (columnData) {
    for (var i = 0; i < tsk.dtColumns.length; i++) {
      if (tsk.dtColumns[i].data === columnData) {
        // Get the column API object
        var column = dtObj.column(i);
        column.visible(!column.visible());
        break;
      }
    }
  };

  // Get tasks and bind data to the grid.
  tasksService.fetchTasks().then(function (response) {
    if (response.data.code === DemoConstants.SUCCESSS_CODE) {
      var tasks = response.data.data;
      if (tasks) {
        $localStorage.tasks = tasks;
        bindDataToTable();
        return;
      }
    } else {
      showErrorMessage(FETCH_ERROR_MESSAGE + 'tasks' + FETCH_ERROR_MESSAGE_2);
    }
    $scope.dtApi.bindData([]);
  }, function (error) {
    $scope.dtApi.bindData([]);
    showErrorMessage(FETCH_ERROR_MESSAGE + 'tasks' + FETCH_ERROR_MESSAGE_2);
  });

  function bindDataToTable() {
    var tasks = $localStorage.tasks ? $localStorage.tasks : [];
    dtObj.clear();
    dtObj.rows.add(tasks);
    dtObj.one('draw.dt', function (e, settings) {
      settings.oLanguage.sEmptyTable = 'No tasks found';
    });
    dtObj.draw();
    $timeout(function () {
      $scope.$parent.$broadcast('dt-update');
    }, 200);
  }

  /**
   * converting string to date.
   */
  function convertStringToDate(date) {
    return moment(date, DemoConstants.DEFAULT_DATE_FORMAT).toDate();
  }

  /**
   * It converts date int0 DEFAULT_DATE_FORMAT
   * @param {*} date
   */
  function formatDate(date) {
    var dateObj = convertStringToDate(date);
    return moment(dateObj).format(DemoConstants.DEFAULT_DATE_FORMAT);
  }


  // On click on edit, populate form with data.
  angular.element('#tasksGrid').on('click', '.edit-setting', function () {
    tsk.taskDetails = {};
    tsk.buttonName = 'Update';
    tsk.isUpdate = true;
    var rowData = dtObj.row(this.parentElement).data();
    tsk.taskDetails.taskName = rowData.taskName;
    tsk.taskDetails.dueDate = convertStringToDate(rowData.dueDate);
    tsk.taskDetails.createdOn = convertStringToDate(rowData.createdOn);
    tsk.taskDetails.status = rowData.statusID;
    $scope.$apply();
    tsk.editTaskIndex = dtObj.row(this.parentElement).index();

    angular.element('html,body').animate({
      scrollTop: angular.element('.add-task-form ').offset().top
    },
      'slow');
  });

  // On click on delete, delete row.
  angular.element('#tasksGrid').on('click', '.delete-setting', function () {
    tsk.deleteTaskIndex = dtObj.row(this.parentElement).index();
    // Show delete dialog
    $mdDialog.show({
      scope: $scope,
      preserveScope: true,
      controller: deleteTaskController,
      templateUrl: 'delete-dialog.html',
      parent: angular.element(document.body),
      escapeToClose: true,
    });

    function deleteTaskController(scope) {
      scope.cancelDelete = function () {
        $mdDialog.hide();
      };
      // On click on delete, delete that row from datatable.
      scope.deleteTask = function () {
        $localStorage.tasks.splice(tsk.deleteTaskIndex, 1);
        bindDataToTable();
        $mdDialog.hide();
      };
    }
  });

  // Handle mark as done functionality.
  angular.element('#tasksGrid').on('click', '.mark-as-done', function () {
    if (!angular.element(this).hasClass('disabled')) {
      var doneTaskIndex = dtObj.row(this.parentElement).index();
      var doneTask = $localStorage.tasks[doneTaskIndex];
      doneTask.statusID = DemoConstants.DONE_STATUS;
      doneTask.statusName = 'Done';
      doneTask.completedOn = formatDate(new Date());
      $localStorage.tasks[doneTaskIndex] = doneTask;
      bindDataToTable();
    }
  });

  tsk.reset = function () {
    tsk.taskForm.$setPristine();
    tsk.taskForm.$setUntouched();
    tsk.taskDetails = {};
    tsk.submitted = true;
  };

  tsk.toggleWidgetDropDown = function () {
    angular.element('.toggle-dropdown-content').toggleClass('hide');
  };
});
