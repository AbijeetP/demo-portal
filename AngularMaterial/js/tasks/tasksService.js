angular.module('angularDemo').factory('tasksService', function ($http, DemoConstants) {
  return {
    fetchStatus: fetchStatus,
    fetchTasks: fetchTasks
  };

  function fetchStatus() {
    return $http.get(DemoConstants.API_URL + DemoConstants.STATUS).then(function (response) {
      return response;
    }, function (err) {
      return err;
    });
  }

  function fetchTasks() {
    return $http.get(DemoConstants.API_URL + DemoConstants.ALL_TASKS).then(function (response) {
      return response;
    }, function (err) {
      return err;
    });
  }
});