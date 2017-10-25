angular.module('googleSearchLocation', ['ngMap', 'ngMaterial', 'ngMessages'])
.config(function() {
  toastr.options.timeOut = 4000;
  toastr.options.positionClass = 'toast-bottom-right';
})
.constant('searchLocationConstants', {
  LOCATION_BLOCKED: 1
});
