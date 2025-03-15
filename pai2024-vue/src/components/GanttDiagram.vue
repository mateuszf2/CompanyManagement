<script>
import { ref, onMounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';

export default {
  data() {
    return {
      selectedProject: null,
      projects: [],
      tasks: [],
      websocket: null
    };
  },
  computed: {
    formattedProjects() {
      const currentTime = Date.now();
      return this.projects.map(proj => ({
        name: proj.name,
        value: [
          new Date(proj.startDate).getTime(),
          new Date(proj.endDate || currentTime).getTime(),
          proj.name
        ]
      }));
    },
    formattedTasks() {
      const currentTime = Date.now();
      return this.tasks.map(task => ({
        name: task.name,
        value: [
          new Date(task.startDate).getTime(),
          new Date(task.endDate || currentTime).getTime(),
          task.name
        ]
      }));
    }
  },
  methods: {
    async fetchProjects() {
      try {
        const response = await fetch('/api/project');
        const data = await response.json();
        this.projects = data.data;
        await nextTick();
        this.initProjectChart();
      } catch (error) {
        console.error('Błąd pobierania projektów:', error);
      }
    },
    async fetchTasks() {
      if (!this.selectedProject) return;
      try {
        const response = await fetch(`/api/task?project_id=${this.selectedProject}`);
        const data = await response.json();
        this.tasks = data.data;
        await nextTick();
        this.initTaskChart();
      } catch (error) {
        console.error('Błąd pobierania zadań:', error);
      }
    },
    initProjectChart() {
      const chartContainer = this.$refs.projectChart;
      if (!chartContainer) return;
      const myChart = echarts.init(chartContainer);
      
      const option = {
        title: { text: 'Diagram Gantta - Projekty' },
        xAxis: { type: 'time' },
        yAxis: { type: 'category', data: this.projects.map(p => p.name) },
        series: [{
          type: 'custom',
          renderItem: this.renderBar,
          encode: { x: [0, 1], y: 2 },
          data: this.formattedProjects
        }],
        tooltip: {
          trigger: 'item',
          formatter: params => `${params.data.name}<br/>${new Date(params.data.value[0]).toLocaleString()} - ${new Date(params.data.value[1]).toLocaleString()}`
        }
      };

      myChart.setOption(option);
    },
    initTaskChart() {
      const chartContainer = this.$refs.taskChart;
      if (!chartContainer) return;
      const myChart = echarts.init(chartContainer);

      const option = {
        title: { text: 'Diagram Gantta - Zadania' },
        xAxis: { type: 'time' },
        yAxis: { type: 'category', data: this.tasks.map(t => t.name) },
        series: [{
          type: 'custom',
          renderItem: this.renderBar,
          encode: { x: [0, 1], y: 2 },
          data: this.formattedTasks
        }],
        tooltip: {
          trigger: 'item',
          formatter: params => `${params.data.name}<br/>${new Date(params.data.value[0]).toLocaleString()} - ${new Date(params.data.value[1]).toLocaleString()}`
        }
      };

      myChart.setOption(option);
    },
    renderBar(params, api) {
      const currentTime = Date.now();
      const catIndex = api.value(2);
      const start = api.coord([api.value(0), catIndex]);
      const adjustedEnd = api.value(1) || currentTime;
      const end = api.coord([adjustedEnd, catIndex]);
      const height = api.size([0, 1])[1] * 0.6;

      return {
        type: 'rect',
        shape: { x: start[0], y: start[1] - height / 2, width: end[0] - start[0], height },
        style: { fill: '#2da8f3' }
      };
    },
    setupWebSocket() {
      this.websocket = new WebSocket(`ws://${window.location.host}/ws`);
      this.websocket.onopen = () => console.log('Websocket połączony');
      this.websocket.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'project_update') {
            this.fetchProjects();
          } else if (data.type === 'task_update') {
            this.fetchTasks();
          }
        } catch (err) {
          console.error('Błąd przetwarzania wiadomości WebSocket:', err);
        }
      };
    }
  },
  mounted() {
    this.fetchProjects();
    this.setupWebSocket();
  },
  watch: {
    selectedProject: 'fetchTasks'
  }
};
</script>

<template>
  <div>
    <v-container>
      <v-card>
        <v-card-title>Analiza</v-card-title>
        <v-card-text>
          <div ref="projectChart" class="chart-container"></div>
        </v-card-text>
      </v-card>

      <v-card v-if="projects.length">
        <v-card-text>
          <v-select 
            v-model="selectedProject" 
            :items="projects" 
            item-title="name" 
            item-value="_id" 
            label="Wybierz projekt">
          </v-select>
          <div v-if="selectedProject" ref="taskChart" class="chart-container"></div>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<style scoped>
.chart-container {
  position: relative;
  height: 500px;
  width: 100%;
  overflow: hidden;
}
</style>
