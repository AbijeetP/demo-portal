var Utility = (function() {

  /**
   *  Given a string it makes starting letter of each word in the string to uppercase.
   * @param {String} text Text to be capitalized
   */
  function capitalize(text) {
    return text.replace(/\b\w/g, function(m) {
      return m.toUpperCase();
    });
  }

  /**
   * Calculates and returns the graph height.
   */
  function getViewPortWidth() {
    return window.innerWidth;
  }

  /**
   * Fetches the viewport height.
   */
  function getViewPortHeight() {
    return window.innerHeight;
  }

  /**
   * Checks if an element given should be resized or not and resizes the element if needed.
   * @param {Number} lastWidth
   * @param {Number} lastHeight
   */
  function shouldResize(lastWidth, lastHeight) {
    var currentWidth = Utility.getViewPortWidth();
    var currentHeight = Utility.getViewPortHeight();
    var hasWidthChanged = true;
    var hasHeightChanged = true;

    // the current width is less than max width, and the resize that happened is less than the threshold
    // avoid closing the sidebar. This is because iOS triggers a stupid window resize event.
    if (currentWidth < APP_CONSTANT.MAX_VW &&
      Math.abs(lastWidth - currentWidth) < APP_CONSTANT.MIN_WIDTH_THRESHOLD) {
      hasWidthChanged = false;
    }

    if (Math.abs(lastHeight - currentHeight) < APP_CONSTANT.MIN_HEIGHT_THRESHOLD) {
      hasHeightChanged = false;
    }

    if (!hasWidthChanged && !hasHeightChanged) {
      return false;
    }

    return {
      width: currentWidth,
      height: currentHeight
    };
  }

  function getClickEvent() {
    return ('ontouchend' in window) ? 'touchend click' : 'click';
  }

  return {
    getViewPortWidth: getViewPortWidth,
    capitalize: capitalize,
    shouldResize: shouldResize,
    getViewPortHeight: getViewPortHeight,
    getClickEvent: getClickEvent
  };
})();