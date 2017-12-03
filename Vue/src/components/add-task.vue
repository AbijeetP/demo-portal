<template>
  
<el-form ref='form' :model='form' label-width='120px' class='add-task'>
  <div>{{ getTaskDetails}}</div>
  <div>{{taskDetails}}</div>
  <el-row>
    <el-col :span='12'>
<el-form-item label='Task Name'>
    <el-input  v-model="form.name" ></el-input>
  </el-form-item>
      </el-col>
      <el-col :span='12'>
         <el-form-item label='Status'>
    <el-select v-model='form.status' placeholder='please select status'>
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
      <el-date-picker type='date' placeholder='Pick a date' v-model='form.dueDate' style='width: 100%;'></el-date-picker>
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
  import { mapGetters } from 'vuex';
Vue.use(ElementUI);
var eventHub = new Vue()
export default {
  name: "AddTask",
  data() {
    return {
      form: {
        name: "",
        status: "",
        dueDate: "",
        isUpdate: ""
      }
    };
  },
  computed: {
    ...mapGetters(['getTaskDetails']),
    taskDetails: function () {
      console.log('tst');
      this.changeFormDetails();
      return this.getTaskDetails;
    }
  },
  methods: {
    changeFormDetails: function () {
      this.form.name = this.getTaskDetails.taskName;
      this.form.status = this.getTaskDetails.statusId;
      this.form.dueDate = this.getTaskDetails.dueDate;
      this.form.isUpdate = this.getTaskDetails.taskName ? true : false;
      },
    createNewTask: function () {
    var taskData = {};
    taskData.taskName = this.form.name;
    taskData.createdOn = this.formatDate(new Date());
    taskData.dueDate = this.formatDate(this.form.dueDate);
    taskData.statusId = this.form.status;
    taskData.statusName = this.getStatusName(this.form.status);
    taskData.isUpdate = this.form.isUpdate;
    this.$emit('addTask', taskData);
    this.form.isUpdate = false;
    },
    formatDate: function (date) {
      var dateObj = moment(date, 'DD-MM-YYYY').toDate();
      return moment(dateObj).format('DD-MM-YYYY');
    },
    getStatusName: function (statusId) {
      var statusList = [
        {
          statusId: 1,
          statusName: 'Blocked'
        },
        {
          statusId: 2,
          statusName: 'Done'
        },
        {
          statusId: 3,
          statusName: 'In Progress'
        },
        {
          statusId: 4,
          statusName: 'Planned'
        }
      ];
      for (var i = 0; i < statusList.length; i++) {
        if (statusList[i].statusId === +statusId) {
          return statusList[i].statusName;
        }
      }
    }
  },
  components: {
    ElementUI
  }
};
</script>
