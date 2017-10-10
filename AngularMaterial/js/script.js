angular.module('angularDemo', ['ngMaterial']).controller('angularDemoController', angularDemoController);

function angularDemoController($scope, $http, $compile) {
  var tsk = this;
  const BASE_URL = 'http://10.0.0.160/demo-api/';
  const TASK_STATUS = 'task-statuses';
  const TASKS = 'tasks';
  const SUCCESSS_CODE = 200;
  const FETCH_ERROR_MESSAGE = 'Some problem has occurred while fetching ';
  const FETCH_ERROR_MESSAGE_2 = '. Please try again later.';
  getStatus();
  configureToastr();

  /**
   * Configure toastr
   */
  function configureToastr() {
    toastr.options.timeOut = 4000;
    toastr.options.positionClass = 'toast-bottom-right';
  }

  /**
   * Call to getStatus API.
   */
  function getStatus() {
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

  // Table columns
  var dtColumns = [{
    data: 'taskName',
    title: 'Task Name',
  }, {
    data: 'dueDate',
    title: 'Due Date'
  }, {
    data: 'createdOn',
    title: 'Created On',
  }, {
    data: 'statusName',
    title: 'Status name'
  },
  {
    data: 'id',
    title: 'Actions',
    render: function (data, type, row) {
      var elem = null;
      elem = $compile('<span><span class="edit-setting"><i class="fa fa-1x fa-pencil"></span></i></span>')($scope)[0];
      return elem.innerHTML;
    }
  }];

  var dtConfig = {
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
    autoWidth: false,
    isFullWidth: true,
    responsive: true
  };
  var $tasksGrid = angular.element('#tasksGrid');
  var dtObj = $tasksGrid.DataTable(dtConfig);

  // Get tasks and bind data to the grid.
  getTasks().then(function (response) {
    if (response.data.code === SUCCESSS_CODE) {
      var tasks = response.data.data;
      if (tasks) {
        dtObj.clear();
        dtObj.rows.add(tasks);
        dtObj.one('draw.dt', function (e, settings) {
          settings.oLanguage.sEmptyTable = 'No tasks found';
        });
        dtObj.draw();
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
    var rowData = dtObj.row(this.parentElement).data();
    tsk.taskDetails.taskName = rowData.taskName;
    tsk.taskDetails.dueDate = rowData.dueDate;
    tsk.taskDetails.createdOnDate = rowData.createdOn;
    tsk.taskDetails.status = rowData.statusID;
    $scope.$apply();
  });
}