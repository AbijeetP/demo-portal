angular.module('angularDemo', ['ngMaterial', 'ngMessages', 'ngStorage']).controller('angularDemoController', angularDemoController);

function angularDemoController($scope, $http, $compile, $localStorage, $mdDialog) {
  var tsk = this;
  const BASE_URL = 'http://10.0.0.160/demo-api/';
  const TASK_STATUS = 'task-statuses';
  const TASKS = 'tasks';
  const SUCCESSS_CODE = 200;
  const FETCH_ERROR_MESSAGE = 'Some problem has occurred while fetching ';
  const FETCH_ERROR_MESSAGE_2 = '. Please try again later.';
  const DEFAULT_DATE_FORMAT = 'DD-MM-YYYY';
  const DONE_STATUS = 2;
  const CREATE_MESSAGE = 'Successfully created the task.';
  const UPDATE_MESSAGE = 'Successfully updated the task.';
  tsk.buttonName = 'Save';
  tsk.isUpdate = false;
  getStatus();
  configureToastr();
  showHelpModel();

  function showHelpModel() {
    angular.element('.nav-link').click(function () {
      angular.element('.help-modal').modal('show');
    });
  }

  /**
   * Configure toastr
   */
  function configureToastr() {
    toastr.options.timeOut = 4000;
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
    tasks.push(tsk.taskDetails);
    $localStorage.tasks = tasks;
    bindDataToTable();
    tsk.submitted = true;
    tsk.taskForm.$setPristine();
    tsk.taskForm.$setUntouched();
    tsk.taskDetails = {};
  };

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
    return $http.get(BASE_URL + TASK_STATUS).then(function (response) {
      if (response.data.code === SUCCESSS_CODE) {
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

  // Table columns
  var dtColumns = [{
    data: 'taskName',
    title: 'Task Name',
  }, {
    data: 'dueDate',
    title: 'Due Date',
    render: formatDate
  }, {
    data: 'createdOn',
    title: 'Created On',
    render: formatDate
  }, {
    data: 'statusName',
    title: 'Status'
  },
  {
    data: '',
    title: 'Edit',
    render: function (data, type, row) {
      var elem = null;
      elem = $compile('<span><span class="edit-setting row-action"><i class="fa fa-1x fa-pencil"></span></i></span>')($scope)[0];
      return elem.innerHTML;
    },
    className: 'text-center'
  },
  {
    data: '',
    title: 'Delete',
    render: function (data, type, row) {
      var elem = null;
      elem = $compile('<span><span class="delete-setting row-action"><i class="fa fa-1x fa-trash"></span></i></span>')($scope)[0];
      return elem.innerHTML;
    },
    className: 'text-center'
  },
  {
    data: '',
    title: 'Mark As Done',
    render: function (data, type, row) {
      var elem = null;
      if (row.statusID !== DONE_STATUS) {
        elem = $compile('<span><span title="Mark as done" class="mark-as-done row-action"><i class="fa fa-1x fa-check"></span></i></span>')($scope)[0];
      } else {
        elem = $compile('<span><span class="mark-as-done row-action">--</i></span>')($scope)[0];
      }
      return elem.innerHTML;
    },
    className: 'text-center'
  }];

  var dtConfig = {
    responsive: true,
    colReorder: true,
    columns: dtColumns,
    data: [],
    dom: '<"search"f>rtipl', // To activate default search textbox for grid.
    language: {
      lengthMenu: '_MENU_'
    },
    scrollX: false,
    search: {
      smart: false
    },
    autoWidth: true,
    isFullWidth: true
  };
  var $tasksGrid = angular.element('#tasksGrid');
  var dtObj = $tasksGrid.DataTable(dtConfig);

  // Get tasks and bind data to the grid.
  getTasks().then(function (response) {
    if (response.data.code === SUCCESSS_CODE) {
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
  }

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
   * Get tasks
   */
  function getTasks() {
    return $http.get(BASE_URL + TASKS).then(function (response) {
      return response;
    }, function (error) {
      return error;
    });
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
    var doneTaskIndex = dtObj.row(this.parentElement).index();
    $localStorage.tasks[doneTaskIndex].statusID = DONE_STATUS;
    $localStorage.tasks[doneTaskIndex].statusName = 'Done';
    bindDataToTable();
  });


}