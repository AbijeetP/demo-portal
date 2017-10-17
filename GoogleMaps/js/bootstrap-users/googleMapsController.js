angular.module('googleMaps').controller('MapsController', function (NgMap, $timeout, MapsService) {
  var vm = this;
  vm.users = [];
  NgMap.getMap().then(function (map) {
    MapsService.fetchUsers().then(function (response) {
      for (var i = 0; i < response.length; i++) {
        vm.map = map;
        vm.users.push({
          pos: response[i].location ? [response[i].location.lat, response[i].location.lng] : [0, 0],
          image: {
            url: response[i].profile_pic,
            scaledSize: [50, 50],
            origin: [0, 0],
            anchor: [25, 25]
          },
          name: response[i].name,
          username: response[i].username,
          email: response[i].email,
          followers: response[i].followers,
          following: response[i].following,
          profile: response[i].profile_url
        });
      }
    });
  });

  vm.showDetails = function (e, user) {
    vm.user = user;
    vm.position = user.pos;
    vm.map.showInfoWindow("infoWindow", this);
  }
});