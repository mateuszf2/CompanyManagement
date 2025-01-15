<script>
import common from '../mixins/common'

const projectEndpoint = '/api/project'
    
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, TitleComponent, LegendComponent } from 'echarts/components'
use([ CanvasRenderer, BarChart, GridComponent, TooltipComponent, TitleComponent, LegendComponent ])

export default {
    props: [ 'session' ],
    emits: [ 'display-message' ],
    mixins: [ common ],
    components: { VChart },
    data() {
        return { 
            chartOptions: {
                title: {
                    text: 'Wykonawcy na projekt'
                },
                legend: {
                    orient: 'horizontal',
                    left: 'center',
                    bottom: 0,
                    data: [ 'Wykonawcy' ],
                },
                xAxis: {
                    type: 'category',
                    data: [],
                },
                yAxis: {
                    type: 'value',
                },
                series: [
                    {
                        name: 'Wykonawcy',
                        data: [],
                        type: 'bar',
                    },
                ],
            }
        }
    },
    mounted() {
        fetch(projectEndpoint + '?' + new URLSearchParams({ sort: 'name', order: 1 }).toString())
                .then(res => res.json().then(facet => {
                    this.chartOptions.xAxis.data = facet.data.map(el => el.name)
                    this.chartOptions.series[0].data = facet.data.map(el => el.contractor_ids.length || 0 )
                }))
    }
}
</script>

<template>
    <div>
        <h1>Wykresy</h1>
        <br/>
        <div>
            <v-chart :option="chartOptions" class="barChart"></v-chart>
        </div>
    </div>
</template>

<style>
.barChart {
  height: 400px;
}
</style>