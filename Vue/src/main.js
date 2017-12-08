// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueI18n from 'vue-i18n'
import messages from 'element-ui/lib/locale/lang/en.js'
import { store } from './store/store.js'


Vue.use(VueI18n)
Vue.config.productionTip = false;

// Create VueI18n instance with options
Vue.config.lang = 'en'
Vue.locale('en', messages)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  
  router,
  store,
  template: '<App/>',
  components: { App }
})
