var Dashboard = (function() {
  
  function init() {

  }
  
  // This will trigger when we click on dashboard menu item
  function display(appData) {
      console.log('Dashboard menu is clicked');
  }
  
  return {
    init: init,
    display: display
  };
})();