angular.module('angularDemo').factory('tasksService', function ($http, DemoConstants) {
  return {
    fetchStatus: fetchStatus,
    fetchTasks: fetchTasks
  };

  /**
   * Get task status.
   */
  function fetchStatus() {
    return $http.get(DemoConstants.API_URL + DemoConstants.STATUS).then(function (response) {
      return response;
    }, function (err) {
      return err;
    });
  }

  /**
   * Get all the tasks.
   */
  function fetchTasks() {
    return $http.get(DemoConstants.API_URL + DemoConstants.ALL_TASKS).then(function (response) {
      return response;
    }, function (err) {
      return err;
    });
  }
});