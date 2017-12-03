// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'


Vue.config.productionTip = false

import Vuex from 'vuex';
Vue.use(Vuex);


const store = new Vuex.Store({
  state: {
    taskDetails: {}
  },
  getters: {
    getTaskDetails: state => {
      return state.taskDetails;
    }
  },
  mutations: {
    updateTaskDetails(state, payload) {
      state.taskDetails = payload;
    }
  },
  actions: {
    updateTaskDetails({ commit }, payload) {
      commit('updateTaskDetails', payload);
    }
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
