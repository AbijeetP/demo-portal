import Vue from 'vue';
import Vuex from 'vuex';
import states from './states.js';
import * as getters from './getters';
import { mutations } from './mutations';
import * as actions from './actions';
Vue.use(Vuex);


export const store = new Vuex.Store({
  state: {
    taskDetails: {},
    tasksList: {}
  },
  getters,
  mutations,
  actions
})
