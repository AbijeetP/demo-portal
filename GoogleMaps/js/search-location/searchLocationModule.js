angular.module('googleSearchLocation', ['ngMap', 'ngMaterial', 'ngMessages'])
.config(function() {
  toastr.options.timeOut = 4000;
  toastr.options.positionClass = 'toast-bottom-right';
})
.constant('searchLocationConstants', {
  LOCATION_BLOCKED: 1,
  ERROR_MESSAGE: 'Something went terribly wrong. Please come back later.',
  PERMISSION_GRANTED: 'granted',
  MOVIES: 'movie_theater',
  RESTAURANTS: 'restaurants'
});
