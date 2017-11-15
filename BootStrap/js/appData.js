  var BASE_API_URL = 'http://10.0.0.160/demo-api/';

  var API_URLS = {
   taskStatus : 'tasks/fetchTasksByStatus',
   completedTaskStatus: 'tasks/getCompletedTasksByDay'
  }

  var appMessages = {
   somethingWrongTaskGrid: 'Something went wrong while populating the tasks in the grid. Please try again later.',
   somethingWrongTaskStatus: 'Something went wrong while populating the task statuses. Please try again later.',
   taskDelete: 'Task has been deleted successfully.',
   taskUpdate: 'Task has been updated successfully.',
   taskCreate: 'Task has been created successfully.',
   taskDone : 'Task has been done successfully.'
  }