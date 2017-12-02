<template>
  <div id="app">
    <header-bar/>

<div class="main-content">
<add-task @addTask="createNewTask"/>
    <tasks-list :users="filteredUsers"/>
  </div>



    <footer-bar/>
  </div>
</template>

<script>
import Vue from "vue";
import FooterBar from "./components/layouts/footer.vue";
import HeaderBar from "./components/layouts/header.vue";
import AddTask from "./components/add-task.vue";
import TasksList from "./components/TasksList.vue";
var eventHub = new Vue();
export default {
  name: "app",
  data: function() {
    return {
      taskDetails: '',
      fullName: ''
    };
  },
  components: {
    FooterBar,
    HeaderBar,
    AddTask,
    TasksList
  },
  computed: {
    filteredUsers: function () {
      this.fullName = this.taskDetails
      return this.taskDetails
    }
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
