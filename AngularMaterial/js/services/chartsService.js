angular
  .module('angularDemo').factory('ChartsService', function ($http, DemoConstants) {
    return {
      getTaskStatusCount: getTaskStatusCount,
      getTasksCompleted: getTasksCompleted
    };

    function httpGetOpts(url, data) {
      var geDataObj = {
        dataType: 'json',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        url: url,
        timeout: 80000,
        params: data,
      };
      return geDataObj;
    }

    // To get the task status and respective count
    function getTaskStatusCount(data) {
      var httpObj = httpGetOpts(DemoConstants.API_URL + DemoConstants.TASKS_STATUSES, data);
      var httpPromise = $http(httpObj).then(function (response) {
        try {
          return response;
        } catch (ex) {
          return ex;
        }
      }, function (xhr, error) {
        return xhr;
      });
      return httpPromise;
    }

    // TO get the task completed count.
    function getTasksCompleted(data) {
      var httpObj = httpGetOpts(DemoConstants.API_URL + DemoConstants.TASKS_COMPLETED, data);
      var httpPromise = $http(httpObj).then(function (response) {
        try {
          return response;
        } catch (ex) {
          return ex;
        }
      }, function (xhr, error) {
        return xhr;
      });
      return httpPromise;
    }
  });