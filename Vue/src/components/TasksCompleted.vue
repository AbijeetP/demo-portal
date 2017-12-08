<template>
<div>
<h2>Tasks completed per day</h2>
<div class="completed-on-graph-container">
<canvas id="completedOnGraphContainer" width="540" height="300"></canvas>
</div>
</div>
</template>
<script>
import chartJs from "chart.js/dist/Chart.js";
import { mapGetters } from "vuex";
export default {
  name: "TasksCompleted",
  data: function() {
    return {
      lineChart: ""
    };
  },
  computed: {
    ...mapGetters(["getTasksList"])
  },
  watch: {
    getTasksList: function(tasksList) {
      var charts = {
        labels: [],
        data: []
      };
      var completedTasksCount = [];
      tasksList = this.sortDates(tasksList);

      for (var i = 0; i < tasksList.length; i++) {
        var task = tasksList[i];
        if (
          task.completedOn &&
          charts.labels.indexOf(task.completedOn) === -1
        ) {
          charts.labels.push(task.completedOn);
        }
        if (task.completedOn) {
          completedTasksCount[task.completedOn] =
            (completedTasksCount[task.completedOn] || 0) + 1;
        }
      }
      for (var i = 0; i < charts.labels.length; i++) {
        charts.data.push(completedTasksCount[charts.labels[i]]);
      }
      this.initChart(charts);
    }
  },
  methods: {
    sortDates: function(tasksList) {
      var newTaskList = [...tasksList].sort(function(taskObj, taskObjStatus) {
        taskObj = taskObj.completedOn
          .split("-")
          .reverse()
          .join("");
        taskObjStatus = taskObjStatus.completedOn
          .split("-")
          .reverse()
          .join("");
        return taskObj > taskObjStatus ? 1 : taskObj < taskObjStatus ? -1 : 0;
      });
      return newTaskList;
    },
    initChart: function(chartsData) {
      var chartElement = $("#completedOnGraphContainer");
      var chartConfig = {
        type: "line",
        data: {
          labels: chartsData.labels,
          datasets: [
            {
              label: "Tasks completed",
              backgroundColor: "rgb(0, 202, 202)",
              borderColor: "rgb(0, 202, 202)",
              borderCapStyle: "butt",
              pointBackgroundColor: "rgb(0, 202, 202)",
              data: chartsData.data,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          tooltips: {
            mode: "point",
            intersect: true
          },
          hover: {
            mode: "point",
            intersect: true
          },
          scales: {
            xAxes: [
              {
                display: true,
                scaleLabel: {
                  display: true,
                  labelString: "Dates"
                }
              }
            ],
            yAxes: [
              {
                display: true,
                scaleLabel: {
                  display: true,
                  labelString: "Number of tasks"
                },
                ticks: {
                  stepSize: 1,
                  beginAtZero: true,
                  max: 10
                }
              }
            ]
          },
          legend: {
            onClick: function(e) {
              e.stopPropagation();
            }
          }
        }
      };
      if (this.lineChart) {
        this.lineChart.destroy();
      }
      this.lineChart = new Chart(chartElement, chartConfig);
    }
  }
};
</script>
<style>


/* #completedOnGraphContainer {
  width: 90% !important;
  margin: auto;
} */

</style>