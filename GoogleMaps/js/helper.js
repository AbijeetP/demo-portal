$(document).ready(function () {
  $('.nav-link').click(function () {
    $('.help-modal').modal('show');
  });

  $('.google-maps').css({ 'height': $('.map-container').height() + "px" });
});