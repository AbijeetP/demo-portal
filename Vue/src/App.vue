<template>
   <div id="app">
      <header-bar/>
      <div class="main-content container">
         <add-task @addTask="createNewTask"/>
         <tasks-list :task="taskDetails"/>
          <h1 class="graph-heading">Statistics</h1>
          <el-row >
            <el-col :xs="24" :sm="24" :md="11" class="custom-card">
              <tasks-status/>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12" class="custom-card tasks-completed">
              <tasks-completed/>
            </el-col>
          </el-row>
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
import TasksStatus from './components/TasksStatus.vue';
import TasksCompleted from './components/TasksCompleted.vue';
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
    TasksList,
    TasksStatus,
    TasksCompleted
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
  flex: 1 0 auto;
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
.tasks-status-graph,
.tasks-completed-graph {
  display: inline-block;
  width: 49%;
}
.hide {
  display: none;
}
.custom-card {
      box-shadow: 0 1px 3px 0 rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 2px 1px -1px rgba(0,0,0,.12);
      background-color: rgb(255, 255, 255);
      border-radius: 2px;
      padding: 20px;  
      margin-top: 20px;  
}
.container{
  margin: auto;
}
table {
  border-color: grey;
}
table tr{
  font-size: 14px;
}
#app{
  color: #5a5e66 !important;
  display: flex;
  flex-direction: column;
  height: 100%;
}
a {
  text-decoration: none;
}
img {
  vertical-align: middle;
}
html,
body {
  height: 100%;
}
@media (max-width: 768px) {
  .container {
    width: 100%;
  }
}
@media (min-width: 768px) {
  .container {
    width: 750px;
  }
}
@media (min-width: 992px) {
  .container {
    width: 970px;
  }
  .tasks-completed {
    margin-left: 4%;
    width: 46%;
  }
}
@media(min-width: 1200px){
  .container {
    width: 1170px;
  }
}
.graph-heading {
  margin-left: 20px;
}
.success-notification {
  background-color: #51A351;
}
.error-notification {
  background-color: #fa5555;
}
.el-notification__icon:before,
.el-notification__title,
.el-notification__content,
.el-icon-close{
  color: #fff;
}
[class^=el-icon]{
  font-weight: bold;
}
button {
  cursor: pointer;
}
</style>
