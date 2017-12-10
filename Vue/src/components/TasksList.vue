<template>
<div class="custom-card">
  <h1>Tasks List</h1>
  <div>
  <div class="toggle-container">
    <button  @click="showAndhideDropdown()" title="Click here to select the columns which you want to view in the below table.">
      <i class="el-icon-tickets"></i>
    </button>
    <div class="toggle-dropdown-content hide">
      <el-checkbox v-for="column in headers" :key="column.data" v-if="!column.isRequired" v-model="isChecked[column.data]" @change="toggleColumn(column)">{{column.title}}</el-checkbox>
    </div>
  </div>
  <table id="tasksList" class="table table-striped table-bordered">
  </table>
  <el-dialog
    title = "Delete"
    :visible.sync = "deleteDialogue"
    class="delete-dialog"
    >
    <span>Are you sure you want to delete this task?</span>
    <span slot="footer" class="dialog-footer">
      <el-button @click="deleteDialogue = false" type="primary">Cancel</el-button>
      <el-button type="danger" @click="deleteTask()">Confirm</el-button>
    </span>
  </el-dialog>
  </div>
</div>
  
</template>

<script>
import { mapActions } from "vuex";
  import mixins from './../mixins.js';
  import 'datatables.net/js/jquery.dataTables.js';
  import 'datatables.net-responsive/js/dataTables.responsive.min.js'
  import 'datatables.net-dt/css/jquery.dataTables.css'
  import 'datatables.net-responsive-dt/css/responsive.dataTables.css'
  import { constants} from './../constants.js';
export default {
  name: "TasksList",
  mixins: [mixins],
  props: ["task"],
  data: function() {
    var returnData = {
      isChecked: {
        dueDate: true,
        createdOn: true,
        statusName: true
      },
      deleteDialogue: false,
      headers: [
        {
          data: "taskName",
          title: "Task Name",
          isRequired: true
        },
        {
          data: "dueDate",
          title: "Due Date"
        },
        {
          data: "createdOn",
          title: "Created On"
        },
        {
          data: "statusName",
          title: "Status"
        },
        {
          data: "",
          title: "Action",
          render: function(row, type, data) {
            var elem = '<i class="el-icon-edit edit-task row-action" title="Edit"></i>';
            elem += '<i class="el-icon-delete delete-task row-action" title="Delete"></i>';
            if (+data.statusID === 2) {
              elem +=
                '<i class="el-icon-check mark-as-done-task row-action disabled-action" title="Mark as done"></i>';
            } else {
              elem +=
                '<i class="el-icon-check mark-as-done-task row-action" title="Mark as done"></i>';
            }
            return elem;
          },
          class: "align-center",
          isRequired: true,
          bSortable: false
        }
      ],
      rows: [],
      dtHandle: null,
      tasksListData: [],
      tsk: {}
    };
    return returnData;
  },
  methods: {
    ...mapActions(["updateTaskDetails", "updateTasksList"]),
    toggleColumn: function(column) {
      for (var i = 0; i < this.headers.length; i++) {
        if (this.headers[i].data === column.data) {
          var column = this.dtHandle.column(i);
          column.visible(!column.visible());
          break;
        }
      }
    },
    showAndhideDropdown: function() {
      $(".toggle-dropdown-content").toggleClass("hide");
    },
    deleteTask: function() {
      var row = this.getParentRow(this.currentDeleteTask);
      var deletedRow = this.dtHandle
        .row(row)
        .remove()
        .draw(false);
      this.deleteDialogue = false;
      this.updateTasksList(this.dtHandle.rows().data());
      this.showSuccessMessage(constants.MESSAGES.DELETE_SUCCESS);
    },
    getParentRow: function($element){
       var row = $element.parents('tr');
        if(row.hasClass('child')){
          row = row.prev();
        }
        return row;
    }
  },

  watch: {
    tasksListData: function(newTasksList) {
      this.dtHandle.clear();
      this.dtHandle.rows.add(newTasksList);
      this.dtHandle.draw();
      var vm = this;
    },
    task: function(newTaskData) {
      if (newTaskData.statusID === 2) {
        newTaskData.completedOn = moment(new Date()).format(constants.DATE_FORMAT);
      } else {
        newTaskData.completedOn = "";
      }
      if (newTaskData.isUpdate) {
        var data = this.dtHandle.row(this.currentTask).data();
        data.taskName = newTaskData.taskName;
        data.statusName = newTaskData.statusName;
        data.statusID = newTaskData.statusID;
        data.dueDate = newTaskData.dueDate;
        data.completedOn = newTaskData.completedOn;
        this.dtHandle
          .row(this.currentTask)
          .data(data)
          .draw(false);
        this.updateTasksList(this.dtHandle.rows().data());
        this.showSuccessMessage(constants.MESSAGES.UPDATE_SUCCESS);
      } else {
        this.tasksListData.push(newTaskData);
        this.updateTasksList(this.tasksListData);
        this.showSuccessMessage(constants.CREATE_SUCCESS);
      }
    }
  },
  mounted: function() {
    var vm = this;
    this.$nextTick(function() {
      $("#tasksList").on("click", ".delete-task", function() {
        vm.deleteDialogue = true;
        vm.currentDeleteTask = $(this);
      });
      $(".test-dialog").click(function() {
        vm.deleteDialogue = true;
      });
      $("#tasksList").on("click", ".mark-as-done-task", function() {
        if ($(this).hasClass("disabled-action")) {
          return;
        }
       var row = vm.getParentRow($(this));
        var markAsDoneData = vm.dtHandle.row(row).data();
        markAsDoneData.statusName = "Done";
        markAsDoneData.statusID = constants.DONE_STATUS_ID;
        markAsDoneData.completedOn = moment(new Date()).format(constants.DATE_FORMAT);
        vm.dtHandle
          .row(row)
          .data(markAsDoneData)
          .draw(false);
        vm.updateTasksList(vm.dtHandle.rows().data());
        vm.showSuccessMessage(constants.UPDATE_SUCCESS);
      });
      $("#tasksList").on("click", ".edit-task", function() {
        var row = vm.getParentRow($(this));
        var taskData = vm.dtHandle.row(row).data();
        vm.updateTaskDetails(taskData);
        vm.currentTask = $(this).parents("tr");
      });
    });
    $.ajax({
      url: constants.BASE_API+constants.TASKS,
      timeout: 100,
      success: function(res) {
        vm.tasksListData = res.data;
        vm.updateTasksList(vm.tasksListData);
      },
      error: function() {
         vm.tasksListData = [
          {
             taskName: "test task",
             completedOn: '02-11-2017',
             dueDate: "01-11-2017",
             statusName: "Blocked",
             createdOn: "02-11-2017",
             statusID: "1"
           },
           {
             taskName: "test task 2",
             completedOn: '02-11-2017',
             dueDate: "02-11-2017",
             statusName: "Done",
             createdOn: "02-11-2017",
             statusID: "2"
           },
           {
             taskName: "test task 3",
             completedOn: '02-11-2017',
             dueDate: "03-11-2017",
             statusName: "In Progress",
             createdOn: "02-11-2017",
             statusID: "3"
           },
           {
             taskName: "test task 4",
             completedOn: '02-11-2017',
             dueDate: "04-11-2017",
             statusName: "Planned",
             createdOn: "02-11-2017",
             statusID: "4"
           }
         ];
         vm.updateTasksList(vm.tasksListData);
       // vm.showErrorMessage(constants.ERROR);
      }
    });
    this.dtHandle = $("#tasksList").DataTable({
      columns: this.headers,
      data: this.tasksListData,
      responsive: true
    });
  }
};
</script>
<style>
.edit-task {
  color: #0275d8;
}
.delete-task {
  color: #f4511e;
}
.mark-as-done-task {
  color: #449d48;
}
#tasksList_wrapper {
  font-size: 15px;
}
/* #tasksList {
  width: 100% !important;
} */
.row-action {
  cursor: pointer;
}
.row-action:not(:last-child) {
  margin-right: 20px;
}
.disabled-action {
  cursor: not-allowed;
}
.toggle-dropdown-content label {
  display: block;
  margin-left: 0px !important;
  margin-bottom: 16px;
}
table.dataTable tbody td {
  padding: 12px;
}
table.dataTable thead th,
table.dataTable tbody td,
table {
  border-bottom: 1px solid rgb(236, 238, 239) !important;
}
.toggle-container {
  float: right;
  margin-left: 20px;
  position: relative;
}
#tasksList_wrapper {
  clear: none;
  position: static;
}
.toggle-dropdown-content {
  position: absolute;
  top: 22px;
  right: 0px;
  min-width: 120px;
  background: #fff;
  box-shadow: 0px 0px 1px 1px #dadada;
  z-index: 4;
  padding: 10px;
  border-radius: 3px;
}
#tasksList_filter {
  margin-bottom: 20px;
}
#tasksList_info,
#tasksList_paginate {
  margin-top: 20px;
}
.delete-dialog .el-dialog {
  width: 30%;
}
@media (max-width: 767px) {
  .delete-dialog .el-dialog {
    width: 80%;
  }
}
</style>
