var App = (function () {
  var appData = null;
  var ee = new EventEmitter();
  var appModules = {
    Sidebar: Sidebar,
    CommonMenu : CommonMenu
  };

  function init(appData) {
    addEvents();

    // Initialize the modules.
    appModules.Sidebar.init(appData, ee);
  }

  function addEvents() {
    // Triggered when one of the static menu items are clicked.
    ee.addListener('sidebar.menu-item-click', evtMenuItem);
    ee.addListener('sidebar.dynamic-menu-item-click', evtMenuItem);
  }

  /**
   * Triggered when a menu item other than the graph modules are clicked.
   * @param {*} moduleName
   */
  function evtMenuItem(moduleName, moduleHeading) {
    hideCurrentlyShownModule();
    if (moduleName && appModules[ moduleName ]) {
      appModules[moduleName].display(moduleHeading);
    }
    
  }

  /**
   * Hides the currently shown module.
   */
  function hideCurrentlyShownModule() {
    $('#mainContent').find('.modules').hide();
  }

  return {
    init: init
  };
})();

$(document).ready(function () {
  App.init();
  showFirstIndicator();

  function showFirstIndicator() {
    var $firstAnchor = $('#sidebar').find('.treeview-menu').first()
      .find('.sub-menu-container .ui-menu-item a').first();

    $firstAnchor.trigger('click');
  }
  
  $('.nav-link.help-link').click(function () {
    $('.help-modal').modal('show');
  });
});
