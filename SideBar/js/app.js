var App = (function() {
  var appData = null;
  var ee = new EventEmitter();
  var appModules = {
    Sidebar: Sidebar,
    CommonMenu: CommonMenu
  };

  function init(appData) {
    addEvents();

    // Initialize the modules.
    appModules.Sidebar.init(appData, ee);
  }

  /**
   * Normalises the data acquired in the response.
   * @param {Object} rawData
   */
  function normalizeData(rawData) {

    // create a copy of the data.
    var copyRawData = JSON.parse(JSON.stringify(rawData));

    // loop over the categories
    for (var i = 0; i < copyRawData.length; i++) {
      var currCategory = copyRawData[i];

      // loop over the indicators on the category
      for (var j = 0; j < copyRawData[i].indicators.length; j++) {
        var currIndicator = copyRawData[i].indicators[j];

        // generate an id for the indicator.
        var tmpCurrIndicator = {
          id: i + '.' + j,
          category: currCategory.name,
          name: currIndicator.name,
          dataSeries: currIndicator.dataSeries,
          currentLink: currIndicator.currentLink,
          units: currIndicator.units,
          query: currIndicator.query,
          period: currIndicator.period,
          exercises: currIndicator.exercises
        };
        copyRawData[i].indicators[j] = tmpCurrIndicator;
      }
    }

    return copyRawData;
  }

  // Adds events Listeners.
  function addEvents() {

    // Triggered when one of the static menu items are clicked.
    ee.addListener('sidebar.menu-item-click', evtMenuItem);
    ee.addListener('sidebar.dynamic-menu-item-click', evtMenuItem);

  }

  /**
   * Triggered when a graph menu item is clicked.
   * @param {Number} indicatorId
   */
  function evtLoadGraph(indicatorId) {
    var indicator = getIndicator(indicatorId);
    if (!indicator) {
      ErrorHandler.handle({
        indicatorId: indicatorId
      }, APP_CONSTANT.MESSAGES.ERR_INDICATOR_404, 1001);
      return;
    }
    ee.emitEvent('app.display-graph', [indicator, indicatorId]);
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

  // Toggle's the error message.
  function toggleErrorMessage(isError) {
    var $errorMessage = $('#appError');
    if (isError) {
      $errorMessage.show();
    } else {
      $errorMessage.hide();
    }
  }

  /**
   * Toggles loading message.
   * @param {Boolean} isToggled
   */
  function toggleLoading(isToggled) {
    var loadingMsg = '<h4>';

    loadingMsg += '<img src="img/ajax-body-loader.svg" class="page-loading" alt="loading icon">';
    loadingMsg += 'Your page is loading...</h4>';
    if (isToggled) {
      $('body').block(blockUIConfig(loadingMsg));
    } else {
      $('body').unblock();
    }
  }

  /**
   * Adds css to the loading message.
   * @param {String} loadingMsg
   */
  function blockUIConfig(loadingMsg) {
    return {
      message: loadingMsg,
      css: {
        border: 'none',
        width: '60%',
        backgroundColor: 'transparent',
        color: '#fff'
      },
      fadeOut: 0,
      baseZ: 10000,
      overlayCSS: {
        backgroundColor: '#000000',
        opacity: '0.8'
      },
      blockMsgClass: 'app-blockui'
    };
  }

  /**
   * Triggered when the graph is toggled in the chart module via the
   * next/prev button.
   * @param {*} indicatorId
   */
  function evtGraphToggle(indicatorId) {
    ee.emitEvent('app.update-current-page', [indicatorId]);
  }

  function evtHideModules() {
    hideCurrentlyShownModule();
  }

  /**
   * Splits the indicatorId and returns the indicator object from the
   * appData
   * @param {*} indicatorId
   */
  function getIndicator(indicatorId) {
    if (!isNaN(indicatorId)) {
      indicatorId = indicatorId.toString();
    }
    var indicatorInfo = indicatorId.split('.');
    if (indicatorInfo.length !== 2) {
      return false;
    }

    var category = appData[indicatorInfo[0]];
    if (!category) {
      return false;
    }

    var indicator = category.indicators[indicatorInfo[1]];
    if (!indicator) {
      return false;
    }

    return indicator;
  }

  /**
   * Hides the currently shown module.
   */
  function hideCurrentlyShownModule() {
    $('#mainContent').find('.modules').hide();
  }

  return {
    init: init,
    toggleLoading: toggleLoading,
    toggleErrorMessage: toggleErrorMessage
  };
})();

$(document).ready(function() {
  var $fredLogo = null;
  var MAX_VW = APP_CONSTANT.MAX_VW;
  var MOBILE_LOGO = 'mobile-logo';
  var DESKTOP_LOGO = 'desktop-logo';
  $fredLogo = $('#fredLogo');

  if (APP_CONSTANT.IS_MOBILE) {
    $('body').addClass('is-mobile');
  }

  App.init();
  showFirstIndicator();

  /**
   * Selects the first indicator in the first category on page load.
   */
  function showFirstIndicator() {
    var $firstAnchor = $('#sidebar').find('.treeview-menu').first()
      .find('.sub-menu-container .ui-menu-item a').first();

    $firstAnchor.trigger('click', true);
  }
  
  $('.nav-link.help-link').click(function () {
    $('.help-modal').modal('show');
  });
});
