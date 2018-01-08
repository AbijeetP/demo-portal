angular.module('angularDemo').controller('angularDemoController', function ($scope, $document, $http, $compile, $localStorage, $mdDialog, $timeout, DemoConstants, tasksService, blockUI) {
  var tsk = this;
  tsk.buttonName = 'Submit';
  tsk.heading = 'Add Task';
  tsk.isUpdate = false;
  var highestIndex = 0;
  var tasksDataTableObj = '';

  getStatus();
  configureToastr();
  showHelpModel();

  function showHelpModel() {
    angular.element('.help-link').click(function () {
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
      angular.element('.add-task-form .ng-invalid').first().focus();
      return;
    }
    // Save the details.
    if (tsk.isUpdate) {
      tsk.editTaskIndex = getTaskIndex(tsk.editTaskData);
      $localStorage.tasks.splice(tsk.editTaskIndex, 1);
      tsk.isUpdate = false;
      tsk.buttonName = 'Submit';
      tsk.heading = 'Add Task';
      showSuccessMessage(DemoConstants.UPDATE_MESSAGE);
    } else {
      showSuccessMessage(DemoConstants.CREATE_MESSAGE);
      tsk.taskDetails.id = ++highestIndex;
    }
    var tasks = $localStorage.tasks ? $localStorage.tasks : [];
    tsk.taskDetails.statusName = getSelectedStatus(tsk.taskDetails.status);
    tsk.taskDetails.createdOn = tsk.taskDetails.createdOn ? tsk.taskDetails.createdOn : formatDate(new Date());
    tsk.taskDetails.statusID = tsk.taskDetails.status;
    tsk.taskDetails = addCompletedOn(tsk.taskDetails);
    tasks.push(tsk.taskDetails);
    $localStorage.tasks = tasks;
    bindDataToTable();
    tsk.submitted = true;
    tsk.taskForm.$setPristine();
    tsk.taskForm.$setUntouched();
    tsk.taskDetails = {};
    tsk.reset();
  };

  /**
   * Change completed on date.
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


  tsk.changeSearch = function () {
    var searchTxt = angular.element('[name="search"]').val();
    angular.element('#tasksGrid_filter .form-control').val(searchTxt).trigger('keyup');
  };

  /**
   * Call to getStatus API.
   */
  function getStatus() {
    tsk.status = [];
    blockUI.start();
    return tasksService.fetchStatus().then(function (response) {
      $timeout(function () {
        blockUI.stop();
      }, 300);
      if (response && response.data && response.data.code === DemoConstants.SUCCESSS_CODE) {
        tsk.status = response.data.data;
      } else {
        showErrorMessage(DemoConstants.DemoConstants.FETCH_ERROR_MESSAGE + 'status' + DemoConstants.DemoConstants.FETCH_ERROR_MESSAGE_2);
      }
    }, function () {
      showErrorMessage(DemoConstants.DemoConstants.FETCH_ERROR_MESSAGE + 'status' + DemoConstants.DemoConstants.FETCH_ERROR_MESSAGE_2);
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
    isRequired: true,
    className: 'mdl-data-table__cell--non-numeric'
  }, {
    data: 'dueDate',
    title: 'Due Date',
    render: formatDate,
    width: '15%',
    className: 'mdl-data-table__cell--non-numeric'
  }, {
    data: 'createdOn',
    title: 'Created On',
    render: formatDate,
    width: '15%',
    className: 'mdl-data-table__cell--non-numeric'
  }, {
    data: 'statusName',
    title: 'Status',
    width: '10%',
    className: 'mdl-data-table__cell--non-numeric'
  },
  {
    data: 'statusID',
    createdCell: function (cell, statusID) {
      $timeout(function () {
        var elem = null;
        elem = '<span class="action-span"><span class="edit-setting row-action"><md-tooltip md-direction="top">Edit</md-tooltip><i class="fa fa-1x fa-pencil"></span></i></span>';
        elem += '<span class="action-span"><span class="delete-setting row-action"><md-tooltip md-direction="top">Delete</md-tooltip><i class="fa fa-1x fa-trash"></span></i></span>';
        if (statusID !== DemoConstants.DONE_STATUS) {
          elem += '<span class="action-span"><span class="mark-as-done row-action"><md-tooltip md-direction="top">Mark as done</md-tooltip><i class="fa fa-1x fa-check"></span></i></span>';
        } else {
          elem += '<span class="action-span"><span class="mark-as-done disabled row-action"><i class="fa fa-1x fa-check"></span></i></span>';
        }
        angular.element(cell).addClass('actions-cell').attr('data-status', statusID);
        renderActionIcons(cell, elem);
      });
    },
    title: 'Actions',
    className: 'text-center mdl-data-table__cell--non-numeric',
    width: '20%',
    bSortable: false,
    isRequired: true
  }];

  var tasksDataTableConfig = {
    responsive: true,
    colReorder: true,
    columns: tsk.dtColumns,
    data: [],
    isFullWidth: true,
    stateSave: true,
    language: {
      info: 'Showing _START_ to _END_ of _TOTAL_ tasks',
      sLengthMenu: 'Show _MENU_ tasks',
      emptyTable: 'No matching tasks found.',
      zeroRecords: 'No matching tasks found.'
    }
  };

  var $tasksGrid = angular.element('#tasksGrid');
  tsk.isForFistTime = true;

  /**
   * On click on pagination scroll to table.
   */
  function handlePageChangeEvnt() {
    tasksDataTableObj.on('page.dt', function () {
      $timeout(function () {
        reRenderActionsColumn(false);
      });
      angular.element('html,body').animate({
        scrollTop: angular.element('.task-list-header').offset().top
      }, 'slow');
    });
  }

  // Toggle columns visibility.
  tsk.columnVisibilityChanged = function (columnData) {
    for (var i = 0; i < tsk.dtColumns.length; i++) {
      if (tsk.dtColumns[i].data === columnData) {
        // Get the column API object
        var column = tasksDataTableObj.column(i);
        column.visible(!column.visible());
        break;
      }
    }
  };

  /**
   * On page load show all the columns.
   */
  function showAllColumns() {
    for (var i = 0; i < tsk.dtColumns.length; i++) {
      tasksDataTableObj.column(i).visible(true);
    }
  }

  // Get tasks and bind data to the grid.
  tasksService.fetchTasks().then(function (response) {
    if (response && response.data && response.data.code === DemoConstants.SUCCESSS_CODE) {
      var tasks = response.data.data;
      if (tasks) {
        $localStorage.tasks = tasks;
        highestIndex = tasks.length;
        bindDataToTable();
        showAllColumns();
        return;
      }
    } else {
      showErrorMessage(DemoConstants.FETCH_ERROR_MESSAGE + 'tasks' + DemoConstants.FETCH_ERROR_MESSAGE_2);
    }
    $scope.dtApi.bindData([]);
  }, function () {
    $scope.dtApi.bindData([]);
    showErrorMessage(DemoConstants.FETCH_ERROR_MESSAGE + 'tasks' + DemoConstants.FETCH_ERROR_MESSAGE_2);
  });

  function bindDataToTable() {
    var tasks = $localStorage.tasks ? $localStorage.tasks : [];
    tasksDataTableConfig.data = tasks;
    if (tasksDataTableObj) {
      tasksDataTableObj.clear();
      tasksDataTableObj.rows.add(tasks).draw(false);
    } else {
      tasksDataTableObj = $tasksGrid.DataTable(tasksDataTableConfig);
      handlePageChangeEvnt();
    }
    tasksDataTableObj.one('draw.dt', function (e, settings) {
      settings.oLanguage.sEmptyTable = 'No tasks found';
    });
    // Event for column re-order
    // We are re-rendering the action icons on column re-render
    tasksDataTableObj.on('column-reorder', function () {
      reRenderActionsColumn(false);
    });
    // Event for responsive rows display
    // We are re-rendering the action icons on displaying the responsive columns
    tasksDataTableObj.on('responsive-display', function (e, datatable, row, showHide, update) {
      reRenderActionsColumn(true);
    });
    $timeout(function () {
      $scope.$parent.$broadcast('dt-update');
    }, 200);
  }

  /**
   * Re-render the actions column to display action icons 
   * @param {type} isRespEvt
   * @returns {undefined}
   */
  function reRenderActionsColumn(isRespEvt) {
    $(tasksDataTableObj.table().node()).find('.actions-cell').each(function () {
      var statusID = angular.element(this).data('status');
      var elem = getActionsCellHtml(statusID);
      renderActionIcons(this, elem, isRespEvt);
    });
  }

  /**
   * This is to render action icons in actions cell
   * If the event is responsive-display then we need to render it in its child row
   * @param {type} cell
   * @param {type} elem
   * @param {type} isRespEvt
   * @returns {undefined}
   */
  function renderActionIcons(cell, elem, isRespEvt) {
    if (isRespEvt) {
      responsiveCell = angular.element(cell).parent().next().find('li[data-dtr-index="4"]').find('span.dtr-data');
      angular.element(responsiveCell).empty().append($compile(elem)($scope));
    } else {
      angular.element(cell).empty().append($compile(elem)($scope));
    }
  }

  /**
   * This will generate the action icons html based on the status of the task
   * @param {type} statusID
   * @returns {String}
   */
  function getActionsCellHtml(statusID) {
    var elem = null;
    elem = '<span class="action-span"><span class="edit-setting row-action"><md-tooltip md-direction="top">Edit</md-tooltip><i class="fa fa-1x fa-pencil"></span></i></span>';
    elem += '<span class="action-span"><span class="delete-setting row-action"><md-tooltip md-direction="top">Delete</md-tooltip><i class="fa fa-1x fa-trash"></span></i></span>';
    if (statusID !== DemoConstants.DONE_STATUS) {
      elem += '<span class="action-span"><span class="mark-as-done row-action"><md-tooltip md-direction="top">Mark as done</md-tooltip><i class="fa fa-1x fa-check"></span></i></span>';
    } else {
      elem += '<span class="action-span"><span class="mark-as-done disabled row-action"><i class="fa fa-1x fa-check"></span></i></span>';
    }
    return elem;
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
    tsk.heading = 'Edit Task';
    tsk.isUpdate = true;
    var currentTr = angular.element(this).parents('tr');
    if (currentTr.hasClass('child')) {
      currentTr = currentTr.prev();
    }
    var rowData = tasksDataTableObj.row(currentTr).data();
    tsk.taskDetails.taskName = rowData.taskName;
    tsk.taskDetails.dueDate = convertStringToDate(rowData.dueDate);
    tsk.taskDetails.createdOn = convertStringToDate(rowData.createdOn);
    tsk.taskDetails.status = rowData.statusID;
    $scope.$apply();
    tsk.editTaskData = tasksDataTableObj.row(currentTr).data();

    angular.element('html,body').animate({
      scrollTop: angular.element('.form-heading').offset().top
    },
      'slow');
  });

  // On click on delete, delete row.
  angular.element('#tasksGrid').on('click', '.delete-setting', function () {
    var currentTr = angular.element(this).parents('tr');
    if (currentTr.hasClass('child')) {
      currentTr = currentTr.prev();
    }
    var rowData = tasksDataTableObj.row(currentTr).data();
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
        var deleteTaskIndex = getTaskIndex(rowData);
        $localStorage.tasks.splice(deleteTaskIndex, 1);
        bindDataToTable();
        showSuccessMessage(DemoConstants.DELETE_MESSAGE);
        $mdDialog.hide();
      };
    }
  });

  /**
   * It will return the index of selected task.
   * @param {*} rowData
   */
  function getTaskIndex(rowData) {
    var index = '';
    var tasks = $localStorage.tasks;
    for (var i = 0; i < tasks.length; i++) {
      if (rowData.id === tasks[i].id) {
        index = i;
        break;
      }
    }
    return index;
  }

  // Handle mark as done functionality.
  angular.element('#tasksGrid').on('click', '.mark-as-done', function () {
    var $currentElem = angular.element(this);
    if (!$currentElem.hasClass('disabled')) {
      $currentElem.trigger('mouseleave');
      var currentTr = $currentElem.parents('tr');
      if (currentTr.hasClass('child')) {
        currentTr = currentTr.prev();
      }
      var doneTaskData = tasksDataTableObj.row(currentTr).data();
      var doneTaskIndex = getTaskIndex(doneTaskData);
      var doneTask = $localStorage.tasks[doneTaskIndex];
      doneTask.statusID = DemoConstants.DONE_STATUS;
      doneTask.statusName = 'Done';
      doneTask.completedOn = formatDate(new Date());
      $localStorage.tasks[doneTaskIndex] = doneTask;
      bindDataToTable();
      showSuccessMessage(DemoConstants.MARK_AS_DONE_MESSAGE);
    }
  });

  /**
   * Reset the form.
   */
  tsk.reset = function () {
    tsk.taskForm.$setPristine();
    tsk.taskForm.$setUntouched();
    tsk.taskDetails = {};
    tsk.submitted = true;
    tsk.buttonName = 'Submit';
    tsk.heading = 'Add Task';
  };

  /**
   * Handle toggle dropdown click event.
   */
  tsk.toggleColumnsDropDown = function () {
    angular.element('.toggle-dropdown-content').toggleClass('hide');
  };

  // On click on document hide the toggle column dropdown if it is opened.
  $document.mouseup(function (e) {
    var isHidden = angular.element('.toggle-dropdown-content').hasClass('hide');
    var isToggleClmnDrpdwn = (e.target === angular.element('.toggle-col-drop-down')[0] || angular.element('.toggle-col-drop-down').has(e.target).length === 0);
    if (isToggleClmnDrpdwn && !isHidden) {
      angular.element('.toggle-dropdown-content').addClass('hide');
    }
  });
});
