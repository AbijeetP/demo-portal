var APP_CONSTANT = {
  MAX_VW: 1023,
  MAX_GRAPH_VW: 500,
  MIN_HEIGHT_THRESHOLD: 10,
  MIN_WIDTH_THRESHOLD: 10,
  IS_SIDEBAR_EXPAND: true,
  SIDEBAR: {
    ANIM_SPEED: 200,
    ELEM_SHOW_DELAY: 300,
    MENU_CLOSE_DELAY: 50,
    SUB_MENU_HEIGHT: 320,
    BODY_ANIM_DELAY: 50
  },
  INDICATORS: {
    EMBED_CONTAINER_WIDTH: 92,
    MAX_GRAPH_RATIO: 2.75,
    MIN_GRAPH_RATIO: 1.2,
    GRAPH_MARGIN_BOTTOM: 10,
    FULL_WIDTH_CUT_OFF: 500,
    MIN_GRAPH_HEIGHT: 376,
    GRAPH_SLIDER_HEIGHT: 70,
    LOADING_WAIT_TIME: 200,
    IFRAME_WAITING_TIME: 200
  },
  MESSAGES: {
    ERR_WHILE_GENERATING_UI: 'Sorry, there was an error while processing the ' +
      'data retrieved from the server. Please contact Cengage support.',
    ERR_INDICATOR_404: 'Sorry, there was an unexpected error. Please refresh the ' +
      'page after some time.',
    ERR_DISPLAY_INDICATOR: 'Sorry, there was an error while displaying the ' +
      'graph related to the indicator.',
    ERR_TOGGLING_INDICATOR: 'Sorry, there was an error while toggling between the ' +
      'exercie and the indicator. Please refresh the page after some time.',
    ERR_LIST_INDICATOR: 'Sorry, there was an error while generating the list of ' +
      'indicators. Please refresh the page after some time.',
    ARIA_EXERCISE_BTN: 'exercises button to navigate to exercises',
    ARIA_GRAPH_BTN: 'graph button to navigate to graph'
  },
  APP: {
    JSON_URL: 'data/fred-indicators.json',
    AJAX_TIMEOUT: 10000
  }, KEYCODES: {
    KEYBOARD_ESC: 27,
    KEYBOARD_LETTER_M: 77
  },
  IS_MOBILE: false
};

if ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
  APP_CONSTANT.IS_MOBILE = true;

  // this has been updated to handle the STUPID window resize that occurs because of iOS Safari hiding
  // items from the screen.
  APP_CONSTANT.MIN_HEIGHT_THRESHOLD = 100;
}