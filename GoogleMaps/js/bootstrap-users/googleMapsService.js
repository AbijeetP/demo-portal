angular.module('googleMaps').factory('MapsService', function ($http) {
  return {
    fetchUsers: fetchUsers
  }
  function fetchUsers () {
    return $http.get('http://10.0.0.160/demo-api/bootstrap-contributors').then(function (response) {
      return response.data.data;
    }, function (err) {
      console.log(err);
    });
  }
});