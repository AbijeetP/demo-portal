angular.module('googleSearchLocation').controller('SearchLocationController', function ($scope, searchLocationConstants, $mdSidenav, $timeout) {
  checkForLocationAccess();
  var vm = this;
  var pos;
  vm.locationEnabled = false;
  vm.pos = [];
  vm.places = [];
  vm.locations = [{
    key: searchLocationConstants.MOVIES,
    name: 'Movie theaters',
    img: 'movie.png'
  }, {
    key: searchLocationConstants.RESTAURANTS,
    name: 'Restaurants',
    img: 'restaurant.png'
  }];

  /**
   * Function to check whether user gave access to current location.
   */
  function checkForLocationAccess() {
    navigator.permissions.query({ name: 'geolocation' }).then(function (permissionStatus) {
      if (permissionStatus.state === searchLocationConstants.PERMISSION_GRANTED) {
        vm.locationEnabled = true;
      }
      permissionStatus.onchange = function () {
        if (this.state === searchLocationConstants.PERMISSION_GRANTE) {
          vm.locationEnabled = true;
          $scope.$digest();
        }
      };
    });
  }

  function setSearchResultsContainerHeight() {
    $timeout(function () {
      var headerHeight = angular.element('.search-form').height() + angular.element('.header').height() + angular.element('.footer').height() + 320 + angular.element('.search-container h1').height();
      angular.element('.search-results-container').css('height', 'calc(100vh - ' + headerHeight + 'px)');
    });
  }

  vm.myCallBack = function (map) {
    vm.map = map;
    navigator.geolocation.getCurrentPosition(function (position) {
      pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      vm.pos = [pos.lat, pos.lng];
    }, function (error) {
      if (error.code === searchLocationConstants.LOCATION_BLOCKED) {
        showErrorMessage(error.message);
      }
    });
  };

  vm.toggleLeft = function () {
    $mdSidenav('left').toggle();
  };

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
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        showErrorMessage(searchLocationConstants.ERROR_MESSAGE);
        return;
      }
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
  };

  /**
   * To show error messgaes.
   */
  function showErrorMessage(message) {
    toastr.remove();
    toastr.error(message);
  }

  vm.showDetails = function (event, place) {
    vm.place = place;
    vm.place.actualRating = (place.rating * 20) + '%';
    vm.map.showInfoWindow('infoWindow', this);
  };
  setSearchResultsContainerHeight();
  $(window).resize(function () {
    setSearchResultsContainerHeight();
  });
});
