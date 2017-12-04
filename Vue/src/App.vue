<template>
   <div id="app">
      <header-bar/>
      <div class="main-content">
         <add-task @addTask="createNewTask"/>
         <tasks-list :task="taskDetails"/>
      </div>
      <footer-bar/>
   </div>
</template>

<script>
import Vue from 'vue';
import FooterBar from './components/layouts/FooterBar.vue';
import HeaderBar from './components/layouts/HeaderBar.vue';
import AddTask from './components/AddTask.vue';
import TasksList from './components/TasksList.vue';
export default {
  name: 'app',
  data: function() {
    return {
      taskDetails: ''
    };
  },
  components: {
    FooterBar,
    HeaderBar,
    AddTask,
    TasksList
  },
  methods: {
    createNewTask: function(taskDetails) {
      this.taskDetails = taskDetails;
    }
  }
};
</script>

<style>
#app {
  font-family: sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
body {
  margin: 0px;
}
.align-center {
  text-align: center;
}
.el-select {
  width: 100%;
}
.main-content {
  margin: 50px;
}
th {
  text-align: left;
}
.align-left {
  text-align: left;
}
.align-right {
  text-align: right;
}
</style>
