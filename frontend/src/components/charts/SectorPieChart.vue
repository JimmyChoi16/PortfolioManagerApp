<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
})

const chartCanvas = ref(null)
let chart = null

const createChart = () => {
  if (chart) {
    chart.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  
  const chartData = {
    labels: props.data.map(item => item.sector),
    datasets: [{
      data: props.data.map(item => item.total_value),
      backgroundColor: [
        '#11998e',
        '#38ef7d',
        '#6A95CC',
        '#53A7D8',
        '#f093fb',
        '#f5576c',
        '#4facfe',
        '#00f2fe',
        '#43e97b',
        '#38f9d7'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  }

  chart = new Chart(ctx, {
    type: 'doughnut',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            padding: 15,
            usePointStyle: true,
            font: {
              size: 11
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || ''
              const value = context.parsed
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = ((value / total) * 100).toFixed(1)
              return `${label}: $${value.toLocaleString()} (${percentage}%)`
            }
          }
        }
      }
    }
  })
}

onMounted(() => {
  if (props.data && props.data.length > 0) {
    createChart()
  }
})

watch(() => props.data, (newData) => {
  if (newData && newData.length > 0) {
    createChart()
  }
}, { deep: true })
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
}
</style> 