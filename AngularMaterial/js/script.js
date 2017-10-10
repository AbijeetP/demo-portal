angular
  .module('angularDemo', ['ngMaterial'])
  .controller('angularDemoController', inputController);

function inputController($scope, $http, $compile) {
  var ctrl = this;
  // $scope.task = {
  //   status: [
  //     { statusId: 1, statusName: 'Planned' },
  //     { statusId: 2, statusName: 'Development' }
  //   ],
  //   statusValue: 1
  // };

  function getStatus() {
    return $http.get('http://10.0.0.160/demo-api/task-statuses').then(function (response) {
      $scope.task = {};
      $scope.task.status = response.data.data;
    }, function (error) {
      return error;
    });
  }
  getStatus();

  var dtColumns = [{
    data: 'taskName',
    title: 'Task Name',
    isRequired: true,
    isDefaultShow: true,
    responsivePriority: 1,
  }, {
    data: 'dueDate',
    isDefaultShow: true,
    title: 'Due Date'
  }, {
    data: 'createdOn',
    title: 'Created On',
    isDefaultShow: true
  }, {
    data: 'statusName',
    title: 'Status name'
  },
  {
    data: 'id',
    title: 'Actions',
    render: function (data, type, row) {
      var elem = null;
      if (row.IsOpen) {
        elem = $compile('<span><span class="action-not-allowed" title="' + $translate.instant('master_settings.open_status_edit_message') + '"><i class="fa fa-1x fa-pencil"></span></i></span>')($scope)[0];
      } else {
        elem = $compile('<span><span class="edit-setting"><i class="fa fa-1x fa-pencil"></span></i></span>')($scope)[0];
      }
      return elem.innerHTML;
    }
  }];

  var defaultConfig = {
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
  $tasksGrid = angular.element('#tasksGrid');
  var dtObj = $tasksGrid.DataTable(defaultConfig);
  //ctrl.initDatatable(dtObj, dtConfig, $element, language);
  //addEvents(dt);

  getTasks().then(function (response) {
    var data = response.data.data;
    if (data) {
      // $scope.dtApi.bindData(data.data.MultipleResults);
      dtObj.clear();
      dtObj.rows.add(data);
      dtObj.one('draw.dt', function (e, settings) {
        settings.oLanguage.sEmptyTable = 'No tasks found';
        // // To adjust the column width after binding data
        // if (settings.aoColumns.length) {
        //   adjustColumnWidths(settings);
        // }
      });
      dtObj.draw();
    } else {
      $scope.dtApi.bindData([]);
    }
  }, function (error) {
    $scope.dtApi.bindData([]);
    logger.error(error);
  });

  function getTasks() {
    // var srvObj = $http.httpGetOpts('http://10.0.0.160/osm-demo-api/tasks');
    return $http.get('http://10.0.0.160/demo-api/tasks').then(function (response) {
      return response;
    }, function (error) {
      return error;
    });
  }
  ctrl.taskDetails = {};
  angular.element('#tasksGrid').on('click', '.edit-setting', function () {
    var rowData = dtObj.row(this.parentElement).data();
    ctrl.taskDetails.taskName = rowData.taskName;
    ctrl.taskDetails.dueDate = rowData.dueDate;
    ctrl.taskDetails.createdOnDate = rowData.createdOn;
    ctrl.taskDetails.status = rowData.statusID;
    $scope.$apply()
  });
}