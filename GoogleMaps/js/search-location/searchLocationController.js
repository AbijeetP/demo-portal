angular.module('googleSearchLocation').controller('SearchLocationController', function ($scope) {
  var vm = this;
  var pos;
  vm.pos = [];
  vm.places = [];
  vm.locations = [{
    key: 'movie_theater',
    name: 'Movie theaters',
    img: 'movie.png'
  }, {
    key: 'restaurants',
    name: 'Restaurants',
    img: 'restaurant.png'
  }];
  vm.myCallBack = function (map) {
    vm.map = map;
    navigator.geolocation.getCurrentPosition(function (position) {
      pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      vm.pos = [pos.lat, pos.lng];
    });
  }

  vm.searchLocation = function () {
    vm.places = [];
    var request = {
      location: pos,
      radius: [vm.distance * 1000],
      types: [vm.selectedPlace],
      rankBy: google.maps.places.RankBy.DISTANCE
    };

    var service = new google.maps.places.PlacesService(vm.map);
    service.textSearch(request, function (results, status, pagination) {
      vm.places = vm.places.concat(results);
      vm.places.map(function (location) {
        location.currPos = [location.geometry.location.lat(), location.geometry.location.lng()],
          location.customIcon = vm.selectedPlace === 'movie_theater' ? '../../img/movie.png' : '../../img/restaurant.png';
      });
      if (pagination.hasNextPage) {
        pagination.nextPage();
      }
      $scope.$digest();
    });
  }

  vm.showDetails = function (event, place) {
    vm.place = place;
    vm.place.actualRating = (place.rating * 10) + '%';
    vm.map.showInfoWindow("infoWindow", this);
  }
});