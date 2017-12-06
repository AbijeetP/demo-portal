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
  IS_MOBILE: false
};

if ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
  APP_CONSTANT.IS_MOBILE = true;

  // this has been updated to handle the STUPID window resize that occurs because of iOS Safari hiding
  // items from the screen.
  APP_CONSTANT.MIN_HEIGHT_THRESHOLD = 100;
}