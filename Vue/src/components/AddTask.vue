<template>
  <div class="custom-card">
    <h2 class="form-heading">{{formHeading}}</h2>
    <el-form ref="form" :model="form" label-width="120px" v-bind:class="{ 'reset-form': isReset }" class="create-task">
      <el-row>
        <el-col :xs="24">
          <el-form-item label="Task Name" for="taskName">
            <el-input v-validate="'required'" :class="{'is-danger': errors.has('taskName')}" name="taskName" :maxlength=200 v-model="form.name" id="taskName"></el-input>
            <span v-show="errors.has('taskName')" class="help is-danger">This field is required.</span>
          </el-form-item>
        </el-col>
        <el-col :xs="24">
          <el-form-item label="Status" for="status">
            <el-select v-validate="'required'" :class="{'is-danger': errors.has('status')}" name="status" v-model="form.status" placeholder="Please select status" id="status">
              <el-option v-for="status in statusList" :label="status.statusName" :value="status.statusID" :key="status.statusID"></el-option>
            </el-select>
            <span v-show="errors.has('status')" class="is-danger">This field is required.</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :xs="24">
          <el-form-item label="Due Date" for="dueDate">
            <el-col :span="24">
              <el-date-picker id="dueDate" format="dd-MM-yyyy" v-validate="'date_format:DD-MM-YYYY|required'" :class="{'is-danger': errors.has('dueDate')}" name="dueDate" type="date" placeholder="Pick a date" v-model="form.dueDate" @change="datePkcr()" style="width: 100%;"></el-date-picker>
              <span v-show="errors.has('dueDate')" class="is-danger">This field is required.</span>
            </el-col>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row type="flex" justify="end">
        <el-form-item class="tasks-buttons">
          <el-button type="success" @click="createNewTask()">{{buttonName}}</el-button>
          <el-button type="danger" @click="resetForm()">Reset</el-button>
        </el-form-item>
      </el-row>
    </el-form>
  </div>
</template>

<script>
  import Vue from 'vue';
  import ElementUI from 'element-ui';
  import 'element-ui/lib/theme-chalk/index.css';
  import {
    mapActions,
    mapGetters
  } from 'vuex';
  import VeeValidate from 'vee-validate';
  import mixins from './../mixins.js';
  import {
    constants
  } from './../constants.js';
  Vue.use(ElementUI);
  const veeValidateConfig = {
    fieldsBagName: 'formControls',
    events: 'input|blur'
  };
  Vue.use(VeeValidate, veeValidateConfig);
  export default {
    name: 'AddTask',
    mixins: [mixins],
    data() {
      return {
        form: {
          name: '',
          status: '',
          dueDate: '',
          isUpdate: ''
        },
        statusList: [],
        buttonName: 'Create',
        isReset: false,
        formHeading: 'Add Task'
      };
    },
    computed: {
      ...mapGetters(['getTaskDetails'])
    },
    watch: {
      getTaskDetails: function() {
        this.addFormValues();
      }
    },
    methods: {
      ...mapActions(['updateTaskDetails']),
      addFormValues: function() {
        if (this.getTaskDetails.hasOwnProperty('taskName')) {
          this.form.name = this.getTaskDetails.taskName;
          this.form.status = this.getTaskDetails.statusID;
          this.form.dueDate = moment(
            this.getTaskDetails.dueDate,
            constants.DATE_FORMAT
          ).toDate();
          this.form.isUpdate = this.getTaskDetails.taskName ? true : false;
          this.buttonName = this.form.isUpdate ? 'Update' : 'Create';
          this.formHeading = this.form.isUpdate ? 'Edit Task' : 'Add Task';
        }
      },
      datePkcr: function() {
        this.$validator.validate('dueDate');
      },
      createNewTask: function() {
        var vm = this;
        this.$validator.validateAll().then(result => {
          if (!result) {
            // Focus first error input field.
            $('.create-task .is-danger').first().children().focus();
            return;
          } else {
            var newTaskData = {};
            newTaskData.taskName = vm.form.name;
            newTaskData.createdOn = vm.formatDate(new Date());
            newTaskData.dueDate = vm.formatDate(this.form.dueDate);
            newTaskData.statusID = vm.form.status;
            newTaskData.statusName = vm.getStatusName(this.form.status);
            newTaskData.isUpdate = vm.form.isUpdate;
            vm.$emit('addTask', newTaskData);
            vm.form.isUpdate = false;
            vm.resetForm();
          }
        });
      },
      resetForm() {
        var vm = this;
        vm.isReset = true;
        vm.form = {
          name: '',
          status: '',
          dueDate: '',
          isUpdate: ''
        };
  
        this.buttonName = 'Create';
        this.formHeading = 'Add Task';
        this.updateTaskDetails({});
        this.$nextTick(() => {
          setTimeout(function() {
            vm.errors.clear();
            vm.isReset = false;
          }, 1)
        });
      },
      formatDate: function(date) {
        var dateObj = moment(date, constants.DATE_FORMAT).toDate();
        return moment(dateObj).format(constants.DATE_FORMAT);
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
        url: constants.BASE_API + constants.TASK_STATUSES,
        success: function(response) {
          vm.statusList = response.data;
        },
        error: function(response) {
          vm.showErrorMessage(constants.MESSAGES.ERROR);
        }
      });
    },
    components: {
      ElementUI
    }
  };
</script>

<style>
  form .is-danger input,
  form .is-danger input:focus,
  form .is-danger select,
  form .is-danger select:focus {
    border-color: #ff3860;
  }
  
  .is-danger {
    color: #ff3860;
  }
  
  .el-form-item label {
    text-align: left;
  }
  
  .tasks-buttons .el-form-item__content {
    margin-left: 0px !important;
  }
  
  .reset-form span.is-danger {
    display: none;
  }
</style>
