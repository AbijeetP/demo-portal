import Vue from 'vue';
import Vuex from 'vuex';
import {state } from './states.js';
import * as getters from './getters';
import { mutations } from './mutations';
import * as actions from './actions';
Vue.use(Vuex);


export const store = new Vuex.Store({
  state,
  getters,
  mutations,
  actions
})
