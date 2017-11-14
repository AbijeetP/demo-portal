var SidebarBuilder = (function () {
  function build(appData) {
    return buildHTML(appData);
  }

  function buildHTML(appData) {
    var sidebarHTML = '';
    for (var i = 0; i !== appData.length; ++i) {
      var currentCategory = appData[i];
      sidebarHTML += buildCategoryHTML(currentCategory);
    }
    return sidebarHTML;
  }

  function buildCategoryHTML(categoryData) {
    var categoryHTML = '<li class="treeview ui-menu-item">';
    categoryHTML += buildCategoryItem(categoryData.icon, categoryData.name);
    if (!Array.isArray(categoryData.indicators) ||
      categoryData.indicators.length === 0) {

      // no indicators
      return categoryHTML += '</li>';
    }
    var indicators = categoryData.indicators;

    // tree view item header
    categoryHTML += '<div class="treeview-menu">' +
      '<div class="ui-menu-item-header">' +
      '<span>' + categoryData.name + '</span>' +
      '</div><div class="sub-menu-container">';

    // now build the indiciators
    for (var i = 0; i !== indicators.length; ++i) {
      categoryHTML += buildIndicatorHTML(indicators[i]);
    }
    categoryHTML += '</div></div>';

    return categoryHTML + '</li>';
  }

  function buildIndicatorHTML(indicatorData) {
    return '<div class="ui-menu-item indicator-item">' +
      '<a href="#" data-indicator-id="' + indicatorData.id + '">' +
      '<span>' + indicatorData.name + '</span>' +
      '</a></div>';
  }

  function buildCategoryItem(iconClass, categoryName) {
    return '<a>' +
      '<i class="fa ' + iconClass + '" aria-hidden="true"></i>' +
      '<span>' + categoryName + '</span>' +
      '<i class="glyphicon glyphicon-chevron-left pull-right"></i>' +
      '</a>';
  }

  return {
    build: build
  };
})();

var Sidebar = (function () {
  var SIDEBAR_ANIM_SPEED = 200;
  var SIDEBAR_ELEM_SHOW_DELAY = 300;
  var MAX_VW = 1024;
  var MENU_CLOSE_DELAY = 50;
  var SUB_MENU_HEIGHT = 320;
  var BODY_ANIM_DELAY = 50;

  // icons to be shown during the state.
  var COLLAPSED_ICON = 'fa-angle-right';
  var EXPANDED_ICON = 'fa-angle-left';
  var CURRENT_PAGE = 'current-page';

  var $sidebar = null;
  var $overlay = null;
  var niceScroll = null;

  // timeouts
  var menuHideTimeout = null;

  var ee = null;
  function init(appData, eventEmitter) {
    var sidebarHTML = '';
    if (appData) {
      sidebarHTML = SidebarBuilder.build(appData);
    }

    ee = eventEmitter;
    $(document).ready(function () {
      onDomReady(sidebarHTML);
    });
  }

  function onDomReady(sidebarHTML) {
    $sidebar = $('#sidebar');
    $overlay = $('#overlay');

    // prepend the HTML, so as to not remove existing content.
    $sidebar.find('ul.components').prepend(sidebarHTML);

    // add the scrollbar
    // initialize nice scroll
    niceScroll = $sidebar.niceScroll(getNiceScrollObj());

    addEvents();
  }

  function addEvents() {

    // adding the listener that is responsible to update the sidebar
    // when the current page is changed.
    ee.addListener('app.update-current-page', highlightByIndicatorId);

    // for collapsing / expanding the tree view menu
    $sidebar.on('click', '.treeview > a', function () {
      if ($sidebar.hasClass('collapsed')) {
        return;
      }
      var $treeView = $(this).parent();
      var $treeViewMenu = $treeView.find('.treeview-menu');
      if ($treeView.hasClass('expand')) {
        $treeViewMenu.slideUp(SIDEBAR_ANIM_SPEED, function () {
          $treeView.removeClass('expand');

          // after the tree view has expanded resize the nice scroll
          niceScroll.resize();
        });
      } else {
        // first close all explanded views, then open the actual one.
        closeAllExpandTreeview(false, function () {
          $treeViewMenu.slideDown(SIDEBAR_ANIM_SPEED, function () {
            $treeView.addClass('expand');

            // after the tree view has expanded resize the nice scroll
            niceScroll.resize();
          });
        });
      }
    });

    function closeAllExpandTreeview(highlightPage, cb) {
      var $expandedItems = $sidebar.find('.treeview.expand');
      if (!$expandedItems.length) {
        if (cb) {
          return cb();
        }
        return;
      }
      $expandedItems.find('.treeview-menu').slideUp(SIDEBAR_ANIM_SPEED, function () {
        $expandedItems.removeClass('expand');
        if (highlightPage) {
          highlightCurrentPage();
        }
        if (cb) {
          cb();
        }
      });
    }

    // close the sidebar when the overlay is clicked.
    $overlay.click(function () {
      toggleSidebar(true);
    });

    // if sidebar is collapsed we need to popout the treeview and show it outside.
    $sidebar.on('mouseover', '.treeview > a', function () {
      if (!$sidebar.hasClass('collapsed')) {
        return;
      }

      closeSubMenu();
      var elems = getTreeViewMenu(this);

      var position = elems.anchor.position();
      elems.treeViewMenu.css({
        position: 'fixed',
        top: position.top,
        left: position.left + Math.round(elems.anchor.outerWidth())
      }).addClass('active');

      // tree view menu height is less than the cut off height,
      // no need to show scrollbar.
      checkAndAddScroll(elems.treeViewMenu);
    }).on('mouseleave', '.treeview > a', function () {
      closeSubMenu(this);
    }).on('mouseover', '.treeview-menu', function () {
      if (menuHideTimeout) {
        clearTimeout(menuHideTimeout);
      }
    }).on('mouseleave', '.treeview-menu', function () {
      closeSubMenu(this);
    });

    // resize handler to close the sidebar if the viewport falls below 1024 px.
    var resizeTimer = null;
    $(window).resize(function () {
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }
      setTimeout(collapseSidebarBelow, 250);
    });

    $('#btnSidebar').on('click', function () {
      toggleSidebar(false);
    });

    $('#btnSidebarHeader').on('click', function () {
      toggleSidebar(true);
    });

    // click handler for graph related tags.
    $sidebar.find('.indicator-item > a').click(function () {
      var indicatorId = $(this).data('indicatorId');
      if (!indicatorId) {
        return;
      }
      highlightPage(this);
      ee.emitEvent('sidebar.dynamic-menu-item-click', [indicatorId]);
    });

    // click handler for static items.
    $sidebar.find('.ui-menu-item > a').click(function () {
      var moduleName = $(this).data('module');
      var moduleHeading = $(this).data('heading');
      if (!moduleName) {
        return;
      }
      highlightPage(this);
      ee.emitEvent('sidebar.menu-item-click', [moduleName, moduleHeading]);
    });
  }

  function closeSubMenu(element) {
    if (!$sidebar.hasClass('collapsed')) {
      return;
    }

    // if no element is passed, close all submenu
    if (!element) {
      $sidebar.find('.treeview-menu').css({
        position: '',
        top: '',
        left: ''
      }).removeClass('active');
      return;
    }
    var elems = getTreeViewMenu(element);
    menuHideTimeout = setTimeout(function () {
      elems.treeViewMenu.css({
        position: '',
        top: '',
        left: ''
      }).removeClass('active');

      checkAndRemoveScroll(elems.treeViewMenu);
    }, MENU_CLOSE_DELAY);
  }

  function collapseSidebarBelow() {
    if (getViewPortWidth() > MAX_VW) {

      // not less than the recommended viewport.
      return;
    }

    if ($sidebar.hasClass('collapsed')) {

      // already collapsed, nothing to do.
      return;
    }

    // else toggle the sidebar.
    toggleSidebar(true);
  }

  function toggleSidebar(isHeader) {

    // hide the children to avoid the collapsing effect.
    $sidebar.children().hide();

    if ($sidebar.hasClass('collapsed')) {
      $sidebar.removeClass('collapsed').addClass('expanded');
      if (isHeader) {
        $overlay.fadeIn();
      }
      $sidebar.find('#btnSidebar').find('i')
        .removeClass(COLLAPSED_ICON).addClass(EXPANDED_ICON);

      // adding a slight delay in order to remove the white space that
      // appears when animation is happening.
      setTimeout(function () {
        $('body').removeClass('sidebar-collapsed');
      }, BODY_ANIM_DELAY);
    } else {
      $sidebar.removeClass('expanded').addClass('collapsed');
      $overlay.fadeOut();
      $sidebar.find('#btnSidebar').find('i')
        .removeClass(EXPANDED_ICON).addClass(COLLAPSED_ICON);

      // close all expanded items.
      const $expandedItems = $sidebar.find('.treeview.expand');
      $expandedItems.find('.treeview-menu').slideUp(SIDEBAR_ANIM_SPEED, function () {
        $expandedItems.removeClass('expand');
      });
      $('body').addClass('sidebar-collapsed');
    }

    // time to show the sidebar now.
    setTimeout(function () {
      $sidebar.children().show();

      // after sidebar resizing, resize nice scroll
      niceScroll.resize();
    }, SIDEBAR_ELEM_SHOW_DELAY);
  }

  function getTreeViewMenu(anchorTag) {
    var response = {
      anchor: $(anchorTag)
    };

    response.treeView = response.anchor.parent();
    response.treeViewMenu = response.treeView.find('.treeview-menu');
    return response;
  }

  function getViewPortWidth() {
    return window.innerWidth;
  }

  function getNiceScrollObj(customZIndex) {
    if (!customZIndex) {
      customZIndex = 'auto';
    }
    return {
      horizrailenabled: false,
      background: '#fff',
      cursorcolor: '#afafaf',
      cursoropacitymin: 0.0,
      cursoropacitymax: 0.7,
      cursorwidth: '5px',
      cursorborder: '0px',
      cursorborderradius: '5px',
      zindex: customZIndex
    };
  }

  /**
   * Triggered when the currently display chart is changed.
   * @param {*} indicatorId
   */
  function highlightByIndicatorId(indicatorId) {
    $sidebar.find('a.' + CURRENT_PAGE).removeClass(CURRENT_PAGE);
    $sidebar.find('.ui-menu-item a[data-indicator-id="' + indicatorId + '"]')
      .addClass(CURRENT_PAGE);
  }

  function highlightPage(elem) {
    $sidebar.find('.ui-menu-item > a.current-page').removeClass(CURRENT_PAGE);
    $(elem).addClass(CURRENT_PAGE);
  }

  function checkAndAddScroll(treeViewMenu) {
    var $subMenu = treeViewMenu.find('.sub-menu-container');
    if ($subMenu.height() < SUB_MENU_HEIGHT) {
      return;
    }
    $subMenu.niceScroll(getNiceScrollObj(4000));
  }

  function checkAndRemoveScroll(treeViewMenu) {
    var subMenu = treeViewMenu.find('.sub-menu-container');

    // if no niceScroll object to destroy, return.
    if (!subMenu.getNiceScroll) {
      return;
    }
    subMenu.getNiceScroll().remove();
  }

  return {
    init: init
  };
})();