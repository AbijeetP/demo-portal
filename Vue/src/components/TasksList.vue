<template>
  <table id="tasksList" class="table table-striped table-bordered">
  </table>
</template>

<script>
import { mapActions } from 'vuex';
export default {
  name: 'TasksList',
  props: ['task'],
  data: function() {
    var returnData = {
      headers: [
        {
          data: 'taskName',
          title: 'Task Name'
        },
        {
          data: 'dueDate',
          title: 'Due Date',
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
          render: function(row, type, data) {
            var elem = '<i class="el-icon-edit edit-task row-action"></i>';
            elem += '<i class="el-icon-delete delete-task row-action"></i>';
            if (+data.statusID === 2) {
              elem += '<i class="el-icon-check mark-as-done-task row-action disabled-action"></i>';
            } else {
              elem += '<i class="el-icon-check mark-as-done-task row-action"></i>';
            }
            return elem;
          },
          class: 'align-center'
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
    ...mapActions(['updateTaskDetails'])
  },
  watch: {
  tasksListData: function(newTasksList) {
      this.dtHandle.clear();
      this.dtHandle.rows.add(newTasksList);
      this.dtHandle.draw();
    },
    task: function(newTaskData) {
      if (newTaskData.isUpdate) {
        var data = this.dtHandle.row(this.currentTask).data();
        data.taskName = newTaskData.taskName;
        data.statusName = newTaskData.statusName;
        data.statusID = newTaskData.statusID;
        data.dueDate = newTaskData.dueDate;
        this.dtHandle
          .row(this.currentTask)
          .data(data)
          .draw(false);
      } else {
        this.tasksListData.push(newTaskData);
      }
    }
  },
  mounted: function() {
    var vm = this;
    this.$nextTick(function() {
      $('#tasksList').on('click', '.delete-task', function() {
        var deletedRow = vm.dtHandle
          .row($(this).parents('tr'))
          .remove()
          .draw(false);
      });
      $('#tasksList').on('click', '.mark-as-done-task', function() {
        if ($(this).hasClass('disabled-action')) {
          return;
        }
        var markAsDoneData = vm.dtHandle.row($(this).parents('tr')).data();
        markAsDoneData.statusName = 'Done';
        markAsDoneData.statusID = 2;
        vm.dtHandle
          .row($(this).parents('tr'))
          .data(markAsDoneData)
          .draw(false);
      });
      $('#tasksList').on('click', '.edit-task', function() {
        var taskData = vm.dtHandle.row($(this).parents('tr')).data();
        vm.updateTaskDetails(taskData);
        vm.currentTask = $(this).parents('tr');
      });
    });
    $.ajax({
      url: 'http://10.0.0.160/demo-api/tasks',
      success: function(res) {
        vm.tasksListData = res.data;
      },
      error: function() {
        vm.tasksListData = [
          {
            taskName: 'test task',
            dueDate: '01-11-2017',
            statusName: 'Blocked',
            createdOn: '02-11-2017',
            statusID: '1'
          },
          {
            taskName: 'test task 2',
            dueDate: '02-11-2017',
            statusName: 'Done',
            createdOn: '02-11-2017',
            statusID: '2'
          },
          {
            taskName: 'test task 3',
            dueDate: '03-11-2017',
            statusName: 'In Progress',
            createdOn: '02-11-2017',
            statusID: '3'
          },
          {
            taskName: 'test task 4',
            dueDate: '04-11-2017',
            statusName: 'Planned',
            createdOn: '02-11-2017',
            statusID: '4'
          }
        ];
      }
    });
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
.disabled-action {
  cursor: not-allowed;
}
</style>
