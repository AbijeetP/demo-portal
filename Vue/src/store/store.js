import Vuex from 'vuex';
import Vue from 'Vue';
Vue.use(Vuex);


export const store = new Vuex.Store({
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
