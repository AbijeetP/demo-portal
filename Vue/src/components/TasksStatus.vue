<template>
<div>
    <h2>Tasks status</h2>
    <div id="tasksStatusGraphContainer">
<canvas id="tasksStatusGraph" width="540" height="300"></canvas>
</div>

</div>

</template>
<script>
import chartJs from 'chart.js/dist/Chart.js'
import {mapGetters} from 'vuex';
export default {
    name: 'TasksStatus',
    computed: {
        ...mapGetters(['getTasksList'])
    },
    watch: {
        getTasksList: function(tasksList){
            var chartInfo = {
                labels : [],
                tasksData: []
            };
            var statusInfo = [];
            for(var i=0; i< tasksList.length; i++){
                var task = tasksList[i];
                if(chartInfo.labels.indexOf(task.statusName) === -1){
                    chartInfo.labels.push(task.statusName);
                }
                statusInfo[task.statusName] = (statusInfo[task.statusName] || 0)+1;
            }
            for(var i=0; i<chartInfo.labels.length; i++){
                chartInfo.tasksData.push(statusInfo[chartInfo.labels[i]]);
            }
            this.initPieChart(chartInfo);
        }
    }, 
    methods: {
        initPieChart(chartInfo){

            var pieChartElement = $('#tasksStatusGraph')[0].getContext('2d');
            var chartConfig = {
                type : 'pie',
                responsive: true,
                data: {
                    labels: chartInfo.labels,
                    datasets: [{
                        backgroundColor: [
                            "#2ecc71",
                            "#3498db",
                            "#95a5a6",
                            "#9b59b6"
                        ],
                        data: chartInfo.tasksData
                    }]
                }
            }
            var pieChart = new Chart(pieChartElement, chartConfig)
        }
    }
}
</script>
<style>


</style>