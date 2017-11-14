var CommonMenu = (function() {
  
  function init() {

  }
  
  // This will trigger when we click on dashboard menu item
  function display(moduleHeading) {
      jQuery('.section-heading').html(moduleHeading);
  }
  
  return {
    init: init,
    display: display
  };
})();