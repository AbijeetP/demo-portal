<template>
<table id="tasksList" class="table table-striped table-bordered">
</table>
</template>

<script>
export default {
  name: 'TasksList',
  props: ['users'],
  data: function() {
    debugger
    var returnData = {

      headers: [
        {
          data: "taskName",
          title: "Task Name"
        },
        {
          data: "dueDate",
          title: "Due Date",
          class: 'align-right'
        },
        {
          data: 'createdOn',
          title: 'Created On',
          class: 'align-right'
        },
        {
          data: 'statusName',
          title: 'Status'
        },
        {
          data: '',
          title: 'Action',
          render: function(){
            var elem = '<i class="el-icon-edit edit-task row-action"></i>'
            elem += '<i class="el-icon-delete delete-task row-action"></i>'
            elem += '<i class="el-icon-check mark-as-done-task row-action"></i>'
            return elem;
          },
          class: 'align-center'
        }
      ],
      rows: [],
      dtHandle: null,
      tasksListData: [],
      tsk : {}
    };
    return returnData;
  },
 watch: {
   tasksListData: function(newTasksList){
     this.dtHandle.clear();
     this.dtHandle.rows.add(newTasksList);
    this.dtHandle.draw();
   },
   users: function(newTaskData){

     this.tsk.taskName =  newTaskData
     this.tsk.dueDate= '12-10-2017'
     this.tsk.createdOn='createdOn'
     this.tsk.statusName = 'done'

     this.tasksListData.push(this.tsk);
   }
  },

  mounted: function() {
    var vm = this
    $.ajax({
      url: 'http://10.0.0.160/demo-api/tasks',
      success: function(res){
        console.log(res.data)
        vm.tasksListData = res.data
      }
    })
    this.dtHandle = $('#tasksList').DataTable({
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
</style>
