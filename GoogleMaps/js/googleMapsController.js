angular.module('googleMaps').controller('MapsController', function (NgMap, $timeout, MapsService) {
  var vm = this;
  vm.users = [];
  NgMap.getMap().then(function (map) {
    MapsService.fetchUsers().then(function (response) {
      for (var i = 0; i < response.length; i++) {
        vm.users.push({
          pos: response[i].location ? [response[i].location.lat, response[i].location.lng] : [0, 0],
          image: {
            url: response[i].profile_pic,
            scaledSize: [50, 50],
            origin: [0,0],
            anchor: [25,25]
          },
          name: response[i].name
        });
      }
    });
  });
});