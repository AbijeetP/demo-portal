<template>
<el-form ref='form' :model='form' label-width='120px' class='add-task'>
  <el-row>
    <el-col :span='12'>
<el-form-item label='Task Name'>
    <el-input v-model='form.name'></el-input>
  </el-form-item>
      </el-col>
      <el-col :span='12'>
         <el-form-item label='Status'>
    <el-select v-model='form.region' placeholder='please select status'>
      <el-option label='Blocked' value='1'></el-option>
      <el-option label='Done' value='2'></el-option>
      <el-option label="In Progress" value = "3"></el-option>
      <el-option label = "Planned" value="4"></el-option>
    </el-select>
  </el-form-item>
        </el-col>
    </el-row>

<el-row>
  <el-col :span='12'>
  <el-form-item label='Due date'>
    <el-col :span='24'>
      <el-date-picker type='date' placeholder='Pick a date' v-model='form.date1' style='width: 100%;'></el-date-picker>
    </el-col>
  </el-form-item>
    </el-col>
  </el-row>
  <el-row type="flex" justify="end">
    <el-form-item>
    <el-button type='primary' @click="createNewTask()">Create</el-button>
    <el-button>Cancel</el-button>
  </el-form-item>
    </el-row>

</el-form>

</template>

<script>
import Vue from "vue";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
Vue.use(ElementUI);
var eventHub = new Vue()
export default {
  name: "AddTask",
  data() {
    debugger
    return {
      form: {
        name: "",
        region: "",
        date1: "",
        date2: "",
        delivery: false,
        type: [],
        resource: "",
        desc: ""
      }
    };
  },
  methods: {
    createNewTask: function() {
    var name =this.form.name
     this.$emit('addTask', name)
    }
  },
  components: {
    ElementUI
  }
};
</script>
