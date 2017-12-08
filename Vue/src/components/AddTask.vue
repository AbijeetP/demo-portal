<template>
<div class="custom-card">
    <h1>Add Task</h1>
     <el-form ref='form' :model='form' label-width='120px' class='add-task'>
      <el-row>
         <el-col :xs="24">
            <el-form-item label='Task Name' for="taskName">
               <el-input v-validate="'required'" :class= "{'is-danger': errors.has('taskName')}" name="taskName" v-model="form.name" id="taskName"></el-input>
               <span v-show="errors.has('taskName')" class="help is-danger">{{errors.first('taskName')}}</span>
            </el-form-item>
         </el-col>
         <el-col :xs="24">
            <el-form-item label='Status' for="status">
               <el-select v-validate="'required'" :class = "{'is-danger': errors.has('status')}" name = "status" v-model='form.status' placeholder='please select status' id="status">
                  <el-option v-for="status in statusList" :label='status.statusName' :value = 'status.statusID' :key= 'status.statusID'></el-option>
               </el-select>
               <span v-show="errors.has('status')" class="is-danger">{{errors.first('status')}}</span>
            </el-form-item>
         </el-col>
      </el-row>
      <el-row>
         <el-col :xs="24">
            <el-form-item label='Due Date' for="dueDate">
               <el-col :span='24'>
                  <el-date-picker  id="dueDate" format="dd-MM-yyyy" v-validate="'date_format:MM/DD/YYYY|required'" :class = "{'is-danger': errors.has('dueDate')}" name = "dueDate" type="date"  placeholder='Pick a date' v-model='form.dueDate'  @change="datePkcr()" style='width: 100%;'></el-date-picker>
                  <span v-show="errors.has('dueDate')" class="is-danger">{{errors.first('dueDate')}}</span>
               </el-col>
            </el-form-item>
         </el-col>
      </el-row>
      <el-row type="flex" justify="end">
         <el-form-item class="tasks-buttons">
            <el-button type='success' @click="createNewTask()">{{buttonName}}</el-button>
            <el-button type = 'danger' @click="resetForm()">Reset</el-button>
         </el-form-item>
      </el-row>
   </el-form>
</div>
</template>

<script>
import Vue from "vue";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import { mapActions, mapGetters } from "vuex";
import VeeValidate from "vee-validate";
import mixins from "./../mixins.js";
Vue.use(ElementUI);
const veeValidateConfig = {
  fieldsBagName: "formControls",
  events: "input|blur"
};
Vue.use(VeeValidate, veeValidateConfig);
export default {
  name: "AddTask",
  mixins: [mixins],
  data() {
    return {
      form: {
        name: "",
        status: "",
        dueDate: "",
        isUpdate: ""
      },
      statusList: [],
      buttonName: "Create"
    };
  },
  computed: {
    ...mapGetters(["getTaskDetails"])
  },
  watch: {
    getTaskDetails: function() {
      this.addFormValues();
    }
  },
  methods: {
    ...mapActions(["updateTaskDetails"]),
    addFormValues: function() {
      this.form.name = this.getTaskDetails.taskName;
      this.form.status = this.getTaskDetails.statusID;
      this.form.dueDate = moment(
        this.getTaskDetails.dueDate,
        "DD-MM-YYYY"
      ).toDate();
      this.form.isUpdate = this.getTaskDetails.taskName ? true : false;
      this.buttonName = this.form.isUpdate ? "Update" : "Create";
    },
    datePkcr: function() {
      this.$validator.validate("dueDate");
    },
    createNewTask: function() {
      this.$validator.validateAll().then(result => {
        if (!result) {
          return;
        } else {
          var newTaskData = {};
          newTaskData.taskName = this.form.name;
          newTaskData.createdOn = this.formatDate(new Date());
          newTaskData.dueDate = this.formatDate(this.form.dueDate);
          newTaskData.statusID = this.form.status;
          newTaskData.statusName = this.getStatusName(this.form.status);
          newTaskData.isUpdate = this.form.isUpdate;
          this.$emit("addTask", newTaskData);
          this.form.isUpdate = false;
          this.resetForm();
        }
      });
    },
    resetForm() {
      var vm = this;
      vm.form = {
        name: "",
        status: "",
        dueDate: "",
        isUpdate: ""
      };
      this.buttonName = "Create";
      this.updateTaskDetails({});
      setTimeout(function() {
        vm.$validator.clean();
      }, 50);
    },
    formatDate: function(date) {
      var dateObj = moment(date, "DD-MM-YYYY").toDate();
      return moment(dateObj).format("DD-MM-YYYY");
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
      url: "http://10.0.0.160/demo-api/task-statuses",
      success: function(response) {
        vm.statusList = response.data;
      },
      error: function(response) {
        vm.showErrorMessage("Some problem has occurred while fetching statuses");
      }
    });
  },
  components: {
    ElementUI
  }
};
</script>
<style>
.is-danger input,
.is-danger select {
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
</style>