angular.module('angularDemo', ['ngMaterial', 'ngMessages', 'ngStorage', 'blockUI']).constant('DemoConstants', {
  API_URL: 'http://10.0.0.160:3302/demo-api/',
  TASKS_STATUSES: 'tasks/fetchTasksByStatus',
  TASKS_COMPLETED: 'tasks/getCompletedTasksByDay',
  STATUS: 'task-statuses',
  SUCCESSS_CODE: 200,
  DONE_STATUS: 2,
  ALL_TASKS: 'tasks',
  DEFAULT_DATE_FORMAT: 'DD-MM-YYYY',
  TOASTR_TIMEOUT: 4000,
  FETCH_ERROR_MESSAGE : 'Some problem has occurred while fetching ',
  FETCH_ERROR_MESSAGE_2 : '. Please try again later.',
  CREATE_MESSAGE : 'Task has been created successfully.',
  UPDATE_MESSAGE : 'Task has been updated successfully.',
  DELETE_MESSAGE : 'Task has been deleted successfully.',
  MARK_AS_DONE_MESSAGE : 'Task status has been updated successfully.'
});
angular.module('angularDemo').config(function (blockUIConfig, $mdDateLocaleProvider) {
  // Template to load while blocking the UI.
  blockUIConfig.templateUrl = 'js/directives/block-ui/blockUI.html';
  $mdDateLocaleProvider.formatDate = function(date){
    return date ? moment(date).format('DD-MM-YYYY') : '';
  };
});
