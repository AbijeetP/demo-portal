angular.module('googleMaps').factory('MapsService', function ($http, bootstrapContributors) {
  return {
    fetchUsers: fetchUsers
  }
  function fetchUsers() {
    return $http.get(bootstrapContributors.API_URL).then(function (response) {
      try {
        if (response.data.code === bootstrapContributors.SUCCESS_CODE) {
          return response.data.data;
        } else {
          toastr.remove();
          toastr.error(bootstrapContributors.ERROR_MESSAGE);
        }
      } catch (ex) {
        return ex
      }
    }, function (xhr, error) {
      return xhr;
    });
  }
});