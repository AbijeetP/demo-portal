<template>
<div class="custom-card">
  <h1>Tasks List</h1>
  <div>
  <div class="toggle-container">
    <button  @click="showAndhideDropdown()">
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
    width = "30%"
    >
    <span>Are you sure you want to delete this task?</span>
    <span slot="footer" class="dialog-footer">
      <el-button @click="deleteDialogue = false" type="primary">Cancel</el-button>
      <el-button type="danger">Confirm</el-button>
    </span>
  </el-dialog>
  </div>
</div>
  
</template>

<script>
import { mapActions } from "vuex";
export default {
  name: "TasksList",
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
          title: "Due Date",
          class: "align-right"
        },
        {
          data: "createdOn",
          title: "Created On",
          class: "align-right"
        },
        {
          data: "statusName",
          title: "Status"
        },
        {
          data: "",
          title: "Action",
          render: function(row, type, data) {
            var elem = '<i class="el-icon-edit edit-task row-action"></i>';
            elem += '<i class="el-icon-delete delete-task row-action"></i>';
            if (+data.statusID === 2) {
              elem +=
                '<i class="el-icon-check mark-as-done-task row-action disabled-action"></i>';
            } else {
              elem +=
                '<i class="el-icon-check mark-as-done-task row-action"></i>';
            }
            return elem;
          },
          class: "align-center",
          isRequired: true
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
    toggleColumn: function(column){
      for(var i=0; i< this.headers.length; i++){
        if(this.headers[i].data === column.data){
          var column = this.dtHandle.column(i);
          column.visible(!column.visible());
          break;
        }
      }

    },
    showAndhideDropdown: function(){
    $('.toggle-dropdown-content').toggleClass('hide');
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
        newTaskData.completedOn = moment(new Date()).format("DD-MM-YYYY");
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
      } else {
        this.tasksListData.push(newTaskData);
        this.updateTasksList(this.tasksListData);
      }
    }
  },
  mounted: function() {
    var vm = this;
    this.$nextTick(function() {
      $("#tasksList").on("click", ".delete-task", function() {
        this.deleteDialogue = true;
        var deletedRow = vm.dtHandle
          .row($(this).parents("tr"))
          .remove()
          .draw(false);
        vm.updateTasksList(vm.dtHandle.rows().data());
      });
      $("#tasksList").on("click", ".mark-as-done-task", function() {
        if ($(this).hasClass("disabled-action")) {
          return;
        }
        var markAsDoneData = vm.dtHandle.row($(this).parents("tr")).data();
        markAsDoneData.statusName = "Done";
        markAsDoneData.statusID = 2;
        markAsDoneData.completedOn = moment(new Date()).format("DD-MM-YYYY");
        vm.dtHandle
          .row($(this).parents("tr"))
          .data(markAsDoneData)
          .draw(false);
        vm.updateTasksList(vm.dtHandle.rows().data());
      });
      $("#tasksList").on("click", ".edit-task", function() {
        var taskData = vm.dtHandle.row($(this).parents("tr")).data();
        vm.updateTaskDetails(taskData);
        vm.currentTask = $(this).parents("tr");
      });
    });
    $.ajax({
      url: "http://10.0.0.160/demo-api/tasks",
      success: function(res) {
        vm.tasksListData = res.data;
        vm.updateTasksList(vm.tasksListData);
      },
      error: function() {
        vm.tasksListData = [
          {
            taskName: "test task",
            dueDate: "01-11-2017",
            statusName: "Blocked",
            createdOn: "02-11-2017",
            statusID: "1"
          },
          {
            taskName: "test task 2",
            dueDate: "02-11-2017",
            statusName: "Done",
            createdOn: "02-11-2017",
            statusID: "2"
          },
          {
            taskName: "test task 3",
            dueDate: "03-11-2017",
            statusName: "In Progress",
            createdOn: "02-11-2017",
            statusID: "3"
          },
          {
            taskName: "test task 4",
            dueDate: "04-11-2017",
            statusName: "Planned",
            createdOn: "02-11-2017",
            statusID: "4"
          }
        ];
      }
    });
    this.dtHandle = $("#tasksList").DataTable({
      columns: this.headers,
      data: this.tasksListData
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
.row-action {
  cursor: pointer;
}
.row-action:not(:last-child) {
  margin-right: 20px;
}
.disabled-action {
  cursor: not-allowed;
}
.toggle-dropdown-content label{
  display: block;
  margin-left: 0px !important;
  margin-bottom: 16px;
}
table.dataTable tbody td{
  padding: 12px;
}
table.dataTable thead th,
table.dataTable tbody td,
table{
  border-bottom: 1px solid rgb(236, 238, 239) !important;
}
.toggle-container{
  float: right;
  margin-left: 20px;
  position: relative;
}
#tasksList_wrapper {
  clear: none;
  position: static;
}
.toggle-dropdown-content{
    position: absolute;
    top: 22px;
    right: 0px;
    min-width: 120px;
    background: #fff;
    box-shadow: 0px 0px 1px 1px #DADADA;
    z-index: 4;
    padding: 10px;
    border-radius: 3px;
}
#tasksList_filter {
  margin-bottom: 20px;
}
#tasksList_info,
#tasksList_paginate{
  margin-top: 20px;
}
</style>
