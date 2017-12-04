<template>
   <el-form ref='form' :model='form' label-width='120px' class='add-task'>
      <div>{{getTaskDetails}}</div>
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
                  <el-option v-for="status in statusList" :label='status.statusName' :value = 'status.statusID'></el-option>
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
import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import { mapGetters } from 'vuex';
Vue.use(ElementUI);
export default {
  name: 'AddTask',
  data() {
    return {
      form: {
        name: '',
        status: '',
        dueDate: '',
        isUpdate: ''
      },
      statusList: []
    };
  },
  computed: {
    ...mapGetters(['getTaskDetails']),
    taskDetails: function() {
      this.addFormValues();
      return this.getTaskDetails;
    }
  },
  methods: {
    addFormValues: function() {
      this.form.name = this.getTaskDetails.taskName;
      this.form.status = this.getTaskDetails.statusID;
      this.form.dueDate = this.getTaskDetails.dueDate;
      this.form.isUpdate = this.getTaskDetails.taskName ? true : false;
    },
    createNewTask: function() {
      var newTaskData = {};
      newTaskData.taskName = this.form.name;
      newTaskData.createdOn = this.formatDate(new Date());
      newTaskData.dueDate = this.formatDate(this.form.dueDate);
      newTaskData.statusID = this.form.status;
      newTaskData.statusName = this.getStatusName(this.form.status);
      newTaskData.isUpdate = this.form.isUpdate;
      this.$emit('addTask', newTaskData);
      this.form.isUpdate = false;
    },
    formatDate: function(date) {
      var dateObj = moment(date, 'DD-MM-YYYY').toDate();
      return moment(dateObj).format('DD-MM-YYYY');
    },
    getStatusName: function(statusId) {
      for (var i = 0; i < this.statusList.length; i++) {
        if (this.statusList[i].statusID === +statusId) {
          return this.statusList[i].statusName;
        }
      }
    }
  },
  mounted: function() {
    var vm = this;
    $.ajax({
      url: 'http://10.0.0.160/demo-api/task-statuses',
      success: function(response) {
        vm.statusList = response.data;
      }
    });
  },
  components: {
    ElementUI
  }
};
</script>
