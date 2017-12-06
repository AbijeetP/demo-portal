var SidebarBuilder = (function() {
  function build(appData) {
    return buildHTML(appData);
  }

  /**
   * Initializes the html build process.
   * @param {Object} appData
   */
  function buildHTML(appData) {
    var sidebarHTML = '';
    for (var i = 0; i !== appData.length; ++i) {
      var currentCategory = appData [i];
      sidebarHTML += buildCategoryHTML(currentCategory);
    }
    return sidebarHTML;
  }

  /**
   * Builds the html for the menu using the categoryData given.
   * @param {Object} categoryData
   */
  function buildCategoryHTML(categoryData) {
    var categoryHTML = '<li class="treeview ui-menu-item" role="menuitem" aria-label="main menu">';
    categoryHTML += buildCategoryItem(categoryData.icon, categoryData.name);
    if (!Array.isArray(categoryData.indicators) ||
      categoryData.indicators.length === 0) {

      // no indicators
      return categoryHTML += '</li>';
    }
    var indicators = categoryData.indicators;

    // tree view item header
    categoryHTML += '<div class="treeview-menu" role="menuitem" aria-label="main menu">' +
      '<div class="ui-menu-item-header">' +
      '<span>' + categoryData.name + '</span>' +
      '</div><div class="sub-menu-container" role="menu" aria-label="sub menu">';

    // now build the indiciators
    for (var i = 0; i !== indicators.length; ++i) {
      categoryHTML += buildIndicatorHTML(indicators[i]);
    }
    categoryHTML += '</div></div>';

    return categoryHTML + '</li>';
  }

  /**
   * Builds the html for the sub-menu using the indicatorData given.
   * @param {Object} indicatorData
   */
  function buildIndicatorHTML(indicatorData) {
    var html = '<div class="ui-menu-item indicator-item">' +
      '<a href="#" data-indicator-id="' + indicatorData.id + '" role="menuitem" aria-label="' +
        indicatorData.name + ' indicator" class= "clearfix">' +
      '<span>' + indicatorData.name + '</span>';
    if (Array.isArray(indicatorData.exercises) && indicatorData.exercises.length) {
      html += '<i class="fa fa-pencil-square-o"></i>';
    }

    html += '</a></div>';
    return html;
  }

  /**
   * Builds the HTML for menu item.
   * @param {String} iconClass
   * @param {String} categoryName
   */
  function buildCategoryItem(iconClass, categoryName) {
    return '<a href="#" class= "clearfix"  title="' + categoryName + '" role="menuitem" aria-label="' +
      categoryName + ' category">' +
      '<i class="fa ' + iconClass + '" aria-hidden="true"></i>' +
      '<span>' + categoryName + '</span>' +
      '<i class="glyphicon glyphicon-chevron-left pull-right"></i>' +
      '</a>';
  }

  return {
    build: build
  };
})();

var Sidebar = (function() {
  var SIDEBAR_ANIM_SPEED = APP_CONSTANT.SIDEBAR.ANIM_SPEED;
  var SIDEBAR_ELEM_SHOW_DELAY = APP_CONSTANT.SIDEBAR.ELEM_SHOW_DELAY;
  var MAX_VW = APP_CONSTANT.MAX_VW;
  var MENU_CLOSE_DELAY = APP_CONSTANT.SIDEBAR.MENU_CLOSE_DELAY;
  var SUB_MENU_HEIGHT = APP_CONSTANT.SIDEBAR.SUB_MENU_HEIGHT;
  var BODY_ANIM_DELAY = APP_CONSTANT.SIDEBAR.BODY_ANIM_DELAY;

  // icons to be shown during the state.
  var CURRENT_PAGE = 'current-page';
  var ACTIVE_ITEM = 'active';
  var NO_ACTIVE = 'no-active';

  // Elements
  var $sidebar = null;
  var $overlay = null;
  var $mainContainer = null;
  var $components = null;
  var $firstMenuItem = null;
  var $btnSidebar = null;
  var $btnSidebarHeader = null;

  var niceScroll = null;

  // timeouts
  var menuHideTimeout = null;

  // Cached values
  var firstItemMarginTop = null;
  var clickEvent = null;

  // Flags
  var touchDragging = false;
  var menuItemClicked = false;

  var ee = null;
  function init(appData, eventEmitter) {
    var sidebarHTML = '';
    if (appData) {
      sidebarHTML = SidebarBuilder.build(appData);
    }
    ee = eventEmitter;

    $(document).ready(function() {
      onDomReady(sidebarHTML);
    });
  }

  function onDomReady(sidebarHTML) {
    $sidebar = $('#sidebar');
    $overlay = $('#overlay');
    $mainContainer = $('#mainContainer');
    $components = $sidebar.find('ul.components');
    $btnSidebar = $sidebar.find('#btnSidebar');
    $btnSidebarHeader = $('#btnSidebarHeader');

    // prepend the HTML, so as to not remove existing content.
    $components.prepend(sidebarHTML);

    // keep reference to first menu item.
    $firstMenuItem = $components.find('.ui-menu-item a').first();
    firstItemMarginTop = parseInt($firstMenuItem.position().top, 10);
    setComponentHeight($components);

    // Is sidebar expanded by default?
    if (APP_CONSTANT.IS_SIDEBAR_EXPAND) {

      // add the scrollbar
      // initialize nice scroll
      toggleScrollbar($sidebar, true);
    }

    addEvents();

    // collapses the sidebar when the screensize is less than or equal to MAX_VW
    // and expanded sidebar is enabled
    if (APP_CONSTANT.IS_SIDEBAR_EXPAND) {
      if ( Utility.getViewPortWidth() <= MAX_VW) {
        $(window).resize();
      }
    } else {

      // Adding focus to expand/collapse button because the list of indicators
      // item in the sidebar is getting focused on page load.
      focusSidebarBtn();

      // if the sidebar is in the collapsed state, we need to add the close event
      // for sub menu.
      checkAndCloseSubMenu();
    }

    // if it is mobile view we need to check and fix the sidebar height.
    if (APP_CONSTANT.IS_MOBILE) {
      checkSidebarHeight();
    }
  }

  function addEvents() {
    clickEvent = Utility.getClickEvent();

    // adding the listener that is responsible to update the sidebar
    // when the current page is changed.
    ee.addListener('app.update-current-page', highlightByIndicatorId);

    // for collapsing / expanding the sub tree view menu
    // when the sidebar is expanded.
    $sidebar.on('click', '.treeview > a', function() {
      if ($sidebar.hasClass('collapsed')) {
        return;
      }
      var $treeView = $(this).parent();
      var $treeViewMenu = $treeView.find('.treeview-menu');
      var $activeSubMenuItem = null;
      if ($treeView.hasClass('expand')) {
        $treeViewMenu.slideUp(SIDEBAR_ANIM_SPEED, function() {
          $treeView.removeClass('expand');

          // after the tree view has expanded resize the nice scroll
          niceScroll.resize();
        });
      } else {
        $activeSubMenuItem =
        $treeViewMenu.find('.sub-menu-container > .indicator-item > a.current-page');

        if ($(this).hasClass(NO_ACTIVE)) {
          return;
        }

        // first close all explanded views, then open the actual one.
        closeAllExpandTreeview(false, function() {
          $treeViewMenu.slideDown(SIDEBAR_ANIM_SPEED, function() {
            $treeView.addClass('expand');

            // after the tree view has expanded resize the nice scroll
            niceScroll.resize();
            if ($activeSubMenuItem.length !== 0) {

              // If there is any active item in the sub-menu then the scrollbar
              // will be scrolled till that item.
              scrollToItem($activeSubMenuItem);
            }
          });
        });
      }
    });

    var sidebarTriggerEvent = APP_CONSTANT.IS_MOBILE ? Utility.getClickEvent() :
      'mouseover focus';

    // if sidebar is collapsed we need to popout the treeview and show it outside.
    $sidebar.on(sidebarTriggerEvent, '.treeview > a', function() {


      if (!$sidebar.hasClass('collapsed')) {

        // do not return false here since we want the other event
        // of click to trigger. That event will trigger when sidebar
        // is expanded.
        return;
      }
      var treeViewMenu = $(this).parent().find('.treeview-menu');

      // If the submenu is already open then return.
      if (treeViewMenu.hasClass('active')) {
        clearTimeout(menuHideTimeout);
        return;
      }
      menuItemClicked = true;
      closeSubMenu();
      var elems = getTreeViewMenu(this);

      var position = elems.anchor.position();
      openSubMenu(elems, position);

      // tree view menu height is less than the cut off height,
      // no need to show scrollbar.
      checkAndAddScroll(elems.treeViewMenu);
      scrollToActiveItemForCollapsedSidebar(elems.treeViewMenu);

      // to stop triggering of click and touchend handler together.
      return false;
    }).on(sidebarTriggerEvent, '.treeview-menu', function() {
      if (menuHideTimeout) {
        clearTimeout(menuHideTimeout);
      }
      return false;
    });

    if (!APP_CONSTANT.IS_MOBILE) {

      // mouseleave or blur will only trigger on desktop.
      $sidebar.on('mouseleave blur', '.treeview-menu', function() {
        closeSubMenu(this);
      }).on('mouseleave blur', '.treeview > a', function() {
        closeSubMenu(this);
      });
    }


    var resizeTimer = null;
    var lastWidth = 0;
    var lastHeight = 0;

    $(window).resize(function() {
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }

      resizeTimer = setTimeout(function() {
        if (APP_CONSTANT.IS_MOBILE) {
          checkSidebarHeight();
        }

        var dimension = Utility.shouldResize(lastWidth, lastHeight);
        if (dimension === false) {
          return;
        }

        lastWidth = dimension.width;
        lastHeight = dimension.height;
        collapseSidebarBelow();
        setComponentHeight();
        resizeTimer = null;
      }, 250);
    });

    $btnSidebar.on(clickEvent, function(e) {
      e.stopPropagation();
      toggleSidebar(false);
    });

    $btnSidebarHeader.on(clickEvent, function(e) {
      e.stopPropagation();
      toggleSidebar(true);
    });

    // click handler for graph related tags.
    var $indicatorItems = $sidebar.find('.indicator-item > a');
    $indicatorItems.on(clickEvent, function(e) {

      // if dragging we don't want to show the indicator
      if (touchDragging) {
        return;
      }
      e.stopPropagation();
      var indicatorId = $(this).data('indicatorId');
      if (!indicatorId) {
        return;
      }
      highlightCurrentPage(this);
      ee.emitEvent('sidebar.dynamic-menu-item-click', [indicatorId]);
    });

    if (APP_CONSTANT.IS_MOBILE) {
      $indicatorItems.on('touchmove', function() {

        // on touch move set dragging to true
        touchDragging = true;
      }).on('touchstart', function() {

        // on touch start set dragging to false.
        touchDragging = false;
      });
    }

    // click handler for static items.
    $sidebar.find('.static-item > a').on(clickEvent, function(e) {
      e.stopPropagation();
      var moduleName = $(this).data('module');
      if (!moduleName) {
        return;
      }
      highlightCurrentPage(this);
      ee.emitEvent('sidebar.menu-item-click', [moduleName]);
    });
    
    // click handler for static items.
    $sidebar.find('.ui-menu-item > a').click(function () {
      var moduleName = $(this).data('module');
      var moduleHeading = $(this).data('heading');
      if (!moduleName) {
        return;
      }
      highlightCurrentPage(this);
      ee.emitEvent('sidebar.menu-item-click', [moduleName, moduleHeading]);
    });

    $(document).keyup(function(e) {

      // When ESC key in the keyboard is pressed it checks if the screen size is less than MAX_VW
      // and sidebar is expanded or not and closes the opened sidebar.
      if (e.keyCode === APP_CONSTANT.KEYCODES.KEYBOARD_ESC) {
        if (Utility.getViewPortWidth() < MAX_VW && !$sidebar.hasClass('collapsed')) {
          toggleSidebar(true);
        }
      } else if (e.ctrlKey && e.altKey && e.keyCode === APP_CONSTANT.KEYCODES.KEYBOARD_LETTER_M) {

        // When  CTRL and M keys in the keyboard are pressed it applies the focus to expand/collapse
        // button in the sidebar
        focusSidebarBtn();
      }
    });
  }

  /**
   * Closes the opened submenu when the sidebar is collapsed and a menu item is hovered.
   * @param {Object} element
   */
  function closeSubMenu(element) {
    if (!$sidebar.hasClass('collapsed')) {
      return;
    }

    if (menuHideTimeout) {
      clearTimeout(menuHideTimeout);
    }

    // if no element is passed, close all sub-menu
    if (!element || element.length === 0) {
      var $treeViewMenu = $sidebar.find('.treeview-menu.active').first();
      if (!$treeViewMenu.length) {
        return;
      }
      $treeViewMenu.css({
        position: '',
        top: '',
        left: ''
      }).removeClass(ACTIVE_ITEM);
      checkAndRemoveScroll($treeViewMenu);
      return;
    }
    var elems = getTreeViewMenu(element);

    menuHideTimeout = setTimeout(function() {
      elems.treeViewMenu.css({
        position: '',
        top: '',
        left: ''
      }).removeClass(ACTIVE_ITEM);

      checkAndRemoveScroll(elems.treeViewMenu);
    }, MENU_CLOSE_DELAY);
  }


  /**
   * Checks if the sidebar is collapsed or not and adds the click handlers to the mainContainer.
   * @param {Boolean} isCollapsed
   */
  function checkAndCloseSubMenu(isCollapsed) {
    if (Utility.getViewPortWidth() <= MAX_VW && !APP_CONSTANT.IS_MOBILE) {
      return;
    }

    if (isCollapsed || $('body').hasClass('sidebar-collapsed')) {
      $mainContainer.off(clickEvent).on(clickEvent, closeSubMenuForCollapsedSidebar);
    } else {
      $mainContainer.off(clickEvent);
    }

  }

  /**
   * Triggers on main container press and closes the opened sidebar sub-menu
   * if the target element is not an ancestor of the currently active side-menu
   * This is used only on mobile devices as
   * @param {Object} event
   */
  function closeSubMenuForCollapsedSidebar(event) {
    if (menuItemClicked) {

      // it was currently a side menu item that was clicked, no need to close
      // if we proceed then the currently opened item will close.
      menuItemClicked = false;
      return;
    }

    // WARNING: do not do event.stopPropagation here as it will cause weird problems
    // such as carousel not working.
    var activeTreeMenu = $(event.target).closest('.treeview-menu.active');
    if (!activeTreeMenu.length) {
      closeSubMenu();
    }
  }

  /**
   * Opens the submenu when the sidebar is collapsed and a menu item is hovered.
   * @param {Object} elems
   * @param {Object} position
   */
  function openSubMenu(elems, position) {
    elems.treeViewMenu.css({
      top: position.top,
      left: position.left + Math.round(elems.anchor.outerWidth())
    }).addClass(ACTIVE_ITEM);
  }

  /**
   * Checks if the sidebar is opened (screen size below MAX_VW) and toggles it.
   */
  function collapseSidebarBelow() {
    checkAndCloseSubMenu();
    if (Utility.getViewPortWidth() > MAX_VW) {
      $sidebar.show(0);

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

  /**
   * Expands or collapses the sidebar based on the sidebar's current state.
   * @param {Boolean} isHeader
   */
  function toggleSidebar(isHeader) {

    // hide the children to avoid the collapsing effect.
    $sidebar.children().hide();

    var isSidebarEnabled = false;
    if ($sidebar.hasClass('collapsed')) {

      // close any open sub menu items, do not call this after removing
      // collapsed class.
      closeSubMenu();

      $sidebar.show(0);
      $sidebar.removeClass('collapsed').addClass('expanded');
      if (isHeader) {
        toggleOverlay(true);
      }
      isSidebarEnabled = true;

      // adding a slight delay in order to remove the white space that
      // appears when animation is happening.
      setTimeout(function() {
        $('body').removeClass('sidebar-collapsed');
      }, BODY_ANIM_DELAY);
      checkAndCloseSubMenu(false);
      $sidebar.attr('aria-expanded', 'true');
    } else {

      // close all expanded items.
      closeAllExpandTreeview(true);

      $sidebar.removeClass('expanded').addClass('collapsed');
      toggleOverlay(false);

      $('body').addClass('sidebar-collapsed');

      checkAndCloseSubMenu(true);
      $sidebar.attr('aria-expanded', 'false');
    }
    setTimeout(function() {

      $sidebar.children().show();

      // If the viewport width is less than MAX_VW
      // then the sidebar does not disturb the actual
      // container, so no need to trigger this event.
      if (Utility.getViewPortWidth() > MAX_VW) {
        $btnSidebar.focus();
        ee.emitEvent('app.resize-graph');
      } else if (!isSidebarEnabled) {

        // sidebar is closed below MAX_VW, hide the sidebar so that
        // tab events do not occur.
        $sidebar.hide();
      } else {

        // This sets the height of the ul components when the sidebar is shown
        // below MAX_VW.
        setComponentHeight();

        // sidebar is now showing below MAX_VW, focus the first
        // item in the menu
        $sidebar.find('.treeview').first().find('a').focus();
      }

      // after sidebar resizing, resize nice scroll
      toggleScrollbar($sidebar, isSidebarEnabled);
    }, SIDEBAR_ELEM_SHOW_DELAY + BODY_ANIM_DELAY);
  }

  /**
   * Fetches the submenu when a menu item is selected.
   * @param {String} anchorTag
   */
  function getTreeViewMenu(anchorTag) {
    var response = {
      anchor: $(anchorTag)
    };

    response.treeView = response.anchor.parent();
    response.treeViewMenu = response.treeView.find('.treeview-menu');
    return response;
  }

  function getNiceScrollObj(customZIndex, borderRadius) {
    if (!customZIndex) {
      customZIndex = 'auto';
    }
    if (!borderRadius) {
      borderRadius = '5px';
    }
    return {
      horizrailenabled: false,
      background: '#fff',
      cursorcolor: '#afafaf',
      cursoropacitymin: 0.0,
      cursoropacitymax: 0.7,
      cursorwidth: '5px',
      cursorborder: '0px',
      cursorborderradius: borderRadius,
      zindex: customZIndex
    };
  }

  /**
   * When the user changed the graph using navigation buttons it checks if the
   * sidebar submenu item is visible or not and scrolls to that item.
   * @param {Object} $item
   */
  function scrollToItem($item) {
    if (!niceScroll || !niceScroll.doScrollTop) {

      // probably in the collapsed state, just return.
      return;
    }

    // getting top position of item
    var itemPositionTop = $item.position().top - firstItemMarginTop;

    // getting top position + height to find the bottom of the element.
    var itemPositionBot = itemPositionTop + parseInt($item.css('height'), 10);

    // find out the position to be used.
    var itemPosition = itemPositionTop;

    // if the top of the item position is greater than 0, we care about the bottom
    // of the item not the top.
    if (itemPositionTop > 0) {
      itemPosition = itemPositionBot;
    }
    if (itemPosition > 0 && parseInt($components.css('height'), 10) > itemPosition) {

      // the item is already visible, no need to show.
      return;
    }
    var firstItemPosTop = $firstMenuItem.position().top;
    var scrollToPosition = Math.abs(itemPosition - firstItemPosTop);
    niceScroll.doScrollTo(scrollToPosition, 100);
  }

  /**
   * Scrolls to a perticular element in the collapsed sidebar sub-menu
   * @param {Object} elems
   */
  function scrollToActiveItemForCollapsedSidebar($treeViewMenu) {
    var $subMenu = $treeViewMenu.find('.sub-menu-container');
    var $selectedIndicator =  $subMenu.find('a.' + CURRENT_PAGE);
    var selectedIndicatorPosition = $selectedIndicator.position();
    var scrollPosition = 0;

    // If there are no selected items then scroll will go to the topmost position of the sub-menu.
    if (!selectedIndicatorPosition ) {
      $subMenu.scrollTop(scrollPosition);
      return;
    }

    var menuHeaderHeight = $treeViewMenu.find('.ui-menu-item-header').height();
    var selectedItemOffsetTop = selectedIndicatorPosition.top - menuHeaderHeight;
    var submenuHeight = parseInt($subMenu.css('height'), 10);
    var itemHeight = parseInt($selectedIndicator.css('height'), 10);


    // If the item is visible then return
    if (selectedItemOffsetTop >= 0 && (selectedItemOffsetTop + itemHeight) <= submenuHeight) {
      return;
    }

    var niceScroll = $subMenu.getNiceScroll(0);
    var topScroll = niceScroll.getScrollTop();
    niceScroll.doScrollTop(topScroll + selectedItemOffsetTop);
  }

  /**
   * Triggered when the currently display chart is changed.
   * @param {String} indicatorId
   */
  function highlightByIndicatorId(indicatorId) {
    $sidebar.find('a.' + CURRENT_PAGE).removeClass(CURRENT_PAGE);
    var $item = $sidebar.find('.ui-menu-item a[data-indicator-id="' + indicatorId + '"]')
      .addClass(CURRENT_PAGE);

    scrollToItem($item);
  }

  /**
   * Removes the previously highlighted element on graph change and
   * highlights the element that is currently shown in the graph.
   * @param {String} elem
   */
  function highlightCurrentPage(elem) {
    if (!elem) {
      elem = $sidebar.find('.ui-menu-item > a.current-page').first();
    }

    var $self = $(elem);
    if ($self.hasClass(NO_ACTIVE)) {
      return;
    }

    // remove the highlight from the page and the treeview
    var $prevPage = $sidebar.find('.ui-menu-item > a.' + CURRENT_PAGE);
    $prevPage.removeClass(CURRENT_PAGE);
    $prevPage.parents('.treeview').removeClass(ACTIVE_ITEM);

    $self.addClass(CURRENT_PAGE);

    $self.parents('.treeview').addClass(ACTIVE_ITEM);

    scrollToItem($self);

  }

  function checkAndAddScroll(treeViewMenu) {
    var $subMenu = treeViewMenu.find('.sub-menu-container');
    if ($subMenu.height() < SUB_MENU_HEIGHT) {
      return;
    }
    $subMenu.niceScroll(getNiceScrollObj(4000));
  }


  /**
   * Checks if the niceScroll object is present for the submenu or not and removes it.
   * @param {Object} treeViewMenu
   */
  function checkAndRemoveScroll(treeViewMenu) {
    var subMenu = treeViewMenu.find('.sub-menu-container');

    // if no niceScroll object to destroy, return.
    if (!subMenu.getNiceScroll) {
      return;
    }
    subMenu.getNiceScroll().remove();
  }

  /**
   * Sets the category menu's height.
   * @param {*} $components
   */
  function setComponentHeight($components) {
    if (!$components) {
      $components = $sidebar.find('ul.components');
    }

    // calculate component max height = sidebar height - (margin top + footer height)
    var maxHeight = $sidebar.height() - (parseInt($components.css('marginTop'), 10) +
    $sidebar.find('.ui-items-static').height());
    $components.css('max-height', maxHeight);
  }

  function closeAllExpandTreeview(highlightPage, cb) {
    var $expandedItems = $sidebar.find('.treeview.expand');
    if (!$expandedItems.length) {
      if (cb) {
        return cb();
      }
      return;
    }
    $expandedItems.find('.treeview-menu').slideUp(SIDEBAR_ANIM_SPEED, function() {
      $expandedItems.removeClass('expand');
      if (highlightPage) {
        highlightCurrentPage();
      }
      if (cb) {
        cb();
      }
    });
  }

  /**
   * Checks the viewport height and changes the height of the sidebar accordingly.
   */
  function checkSidebarHeight() {
    var height = Utility.getViewPortHeight();
    $sidebar.css('height', height + 'px');

    // When the height of the sidebar is changed we are changing the height of
    // the components.
    setComponentHeight();
  }

  /**
   * Checks the state of the sidebar (expanded/collapsed) and adds/removes the scrollbar.
   * @param {*}  $sidebar
   * @param {Boolean} isEnabled
   */
  function toggleScrollbar($sidebar, isEnabled) {
    if (isEnabled) {
      niceScroll = $sidebar.find('ul.components').niceScroll(getNiceScrollObj(null, '0px'));
    } else {
      niceScroll.remove();
    }
  }

  function focusSidebarBtn() {
    if (Utility.getViewPortWidth() < MAX_VW) {
      $btnSidebarHeader.focus();
    } else {
      $btnSidebar.focus();
    }
  }

  function toggleOverlay(isShow) {
    if (isShow) {

      // close the sidebar when the overlay is clicked.
      $overlay.fadeIn(function() {

        // add the click event after the overlay is visible.
        // this is to avoid the overlay from closing as soon as it is shown
        // on res < 1023 since touchend occurs after click.
        $overlay.on(clickEvent, overlayClick);
      });
    } else {
      $overlay.fadeOut().off(clickEvent);
    }
  }

  // close the sidebar when the overlay is clicked.
  function overlayClick(e) {
    e.stopPropagation();
    toggleSidebar(true);
  }

  return {
    init: init
  };
})();
