angular.module('googleSearchLocation').controller('SearchLocationController', function ($scope) {
  var vm = this;
  vm.pos = [];
  vm.places = [];
  vm.myCallBack = function (map) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      vm.pos = [pos.lat, pos.lng];
      var request = {
        location: pos,
        radius: '20000',
        types: ['restaurant']
      };

      var service = new google.maps.places.PlacesService(map);
      service.textSearch(request, function (results, status, pagination) {
        vm.places = vm.places.concat(results);
        vm.places.map(function (location) {
          location.currPos = [location.geometry.location.lat(), location.geometry.location.lng()]
          console.log(location.currPos);
        })
        $scope.$digest();
      });
    });
  }
});