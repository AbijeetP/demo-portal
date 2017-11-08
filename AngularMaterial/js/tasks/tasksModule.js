angular.module('angularDemo', ['ngMaterial', 'ngMessages', 'ngStorage', 'blockUI']).constant('DemoConstants', {
  API_URL: 'http://10.0.0.160/demo-api/',
  TASKS_STATUSES: 'tasks/fetchTasksByStatus',
  TASKS_COMPLETED: 'tasks/getCompletedTasksByDay',
  STATUS: 'task-statuses',
  SUCCESSS_CODE: 200,
  DONE_STATUS: 2,
  ALL_TASKS: 'tasks',
  DEFAULT_DATE_FORMAT: 'DD-MM-YYYY',
  TOASTR_TIMEOUT: 4000
});
angular.module('angularDemo').config(function (blockUIConfig) {
  // Change the default overlay message
  blockUIConfig.templateUrl = 'js/directives/block-ui/blockUI.html';
});