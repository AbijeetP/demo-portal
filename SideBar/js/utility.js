var Utility = (function() {

  /**
   * Fetches the category of the indicator ID given.
   * @param {String} indicatorId to which the category and indicator id should be returned.
   */
  function getCategoryAndIndicatorId(indicatorId) {
    var index = indicatorId.split('.');
    return {
      categoryId: +index[0],
      indicatorId: +index[1]
    };
  }

  /**
   * Gives a carousel index using the indicator id and the separator given.
   * @param {String} indicatorId to which the carousel index should be provided.
   * @param {String} separator which is used to separate the given indicatorId.
   */
  function getCarouselIndex(indicatorId, separator) {
    if (!indicatorId) {
      return false;
    }
    return indicatorId.split(separator)[1];
  }

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
   * Prepares a chart ID using the indicator ID given.
   * @param {String} indicatorId to which the chart ID should be provided.
   */
  function getChartId(indicatorId) {
    var chartId = '#chart-' + indicatorId;

    // Selecting ids havings dots like #chart-0.1 through jQuery will not return the desired element.
    // so to fix this we need to escape dot(.).
    chartId = chartId.replace(/\./g, '\\.');
    return chartId;
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
    getCategoryAndIndicatorId: getCategoryAndIndicatorId,
    getViewPortWidth: getViewPortWidth,
    getCarouselIndex: getCarouselIndex,
    getChartId: getChartId,
    capitalize: capitalize,
    shouldResize: shouldResize,
    getViewPortHeight: getViewPortHeight,
    getClickEvent: getClickEvent
  };
})();