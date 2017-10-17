angular.module('googleSearchLocation').controller('SearchLocationController', function ($scope, searchLocationConstants) {
  configureToastr();

  function configureToastr() {
    toastr.options.timeOut = 4000;
    toastr.options.positionClass = 'toast-bottom-right';
  }

  var vm = this;
  vm.pos = [];
  vm.places = [];
  vm.myCallBack = function (map) {
    vm.map = map;
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
          location.currPos = [location.geometry.location.lat(), location.geometry.location.lng()],
            location.customIcon = '../../img/restaurant.png';
        })
        $scope.$digest();
      });
    }, function (error) {
      if (error.code === searchLocationConstants.LOCATION_BLOCKED) {
        showErrorMessage(error.message);
      }
    });
  }

  /**
   * To show error messgaes.
   */
  function showErrorMessage(message) {
    toastr.remove();
    toastr.error(message);
  }

  vm.showDetails = function (event, place) {
    vm.place = place;
    vm.map.showInfoWindow("infoWindow", this);
  }
});