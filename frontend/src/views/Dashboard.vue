<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="title">Portfolio Value</div>
          <div class="value">${{ portfolioValue.toLocaleString() }}</div>
          <small>Live updates</small>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="title">Today's Change</div>
          <div :class="['value', dailyChange >= 0 ? 'positive' : 'negative']">
            {{ dailyChange >= 0 ? '+' : '' }}${{ dailyChange.toLocaleString() }}
          </div>
          <small>{{ percentChange.toFixed(2) }}%</small>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="title">Active Holdings</div>
          <div class="value">{{ holdingsCount }}</div>
          <small>Across {{ sectorsCount }} sectors</small>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="title">Best Performer</div>
          <div class="value">{{ bestPerformer.symbol }}</div>
          <small>{{ bestPerformer.changePercent.toFixed(1) }}%</small>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="section-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>5-Day Performance</span>
            </div>
          </template>
          <canvas ref="chartCanvas" height="200"></canvas>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>Top Performers</span>
            </div>
          </template>
          <el-table :data="topPerformers" stripe style="width: 100%">
            <el-table-column prop="symbol" label="#" width="60">
              <template #default="scope">
                {{ scope.$index + 1 }}
              </template>
            </el-table-column>
            <el-table-column prop="symbol" label="Symbol" />
            <el-table-column prop="price" label="Price" />
            <el-table-column prop="changePercent" label="Change %">
              <template #default="scope">
                <span :class="scope.row.changePercent >= 0 ? 'positive' : 'negative'">
                  {{ scope.row.changePercent.toFixed(1) }}%
                </span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Chart from 'chart.js/auto';
import api from '../services/api';

const portfolioValue = ref(0);
const dailyChange = ref(0);
const percentChange = ref(0);
const holdingsCount = ref(0);
const sectorsCount = ref(0);
const bestPerformer = ref({ symbol: '', changePercent: 0 });
const topPerformers = ref([]);

const chartCanvas = ref(null);
let lineChart;

async function fetchData() {
  const { data: holdings } = await api.get('/assets');
  holdingsCount.value = holdings.length;
  // For simplicity, fake calculation. In real scenario compute from holdings
  portfolioValue.value = holdings.reduce((sum, h) => sum + h.quantity * h.purchasePrice, 0);

  // Mock daily change:  random number
  dailyChange.value = Math.round(portfolioValue.value * (Math.random() * 0.05 - 0.02));
  percentChange.value = (dailyChange.value / (portfolioValue.value - dailyChange.value)) * 100 || 0;

  sectorsCount.value = new Set(holdings.map((h) => h.type)).size;

  // Fetch quote for each symbol for top performers
  const performers = [];
  for (const h of holdings) {
    try {
      const { data: quote } = await api.get(`/quotes/${h.symbol}`);
      performers.push({ symbol: h.symbol, price: quote.regularMarketPrice, changePercent: quote.regularMarketChangePercent });
    } catch {
      // ignore errors
    }
  }
  topPerformers.value = performers.sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  if (topPerformers.value.length) bestPerformer.value = topPerformers.value[0];

  drawChart();
}

function drawChart() {
  if (!chartCanvas.value) return;
  const ctx = chartCanvas.value.getContext('2d');
  if (lineChart) lineChart.destroy();
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const base = portfolioValue.value - dailyChange.value;
  const data = labels.map((_, i) => base + (i * dailyChange.value) / labels.length);
  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Portfolio Value',
          data,
          borderColor: '#409EFF',
          backgroundColor: 'rgba(64,158,255,0.2)'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

onMounted(fetchData);
</script>

<style scoped>
.stat-card {
  text-align: left;
}
.title {
  font-size: 0.9rem;
  color: #888;
}
.value {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 4px 0;
}
.positive {
  color: #16a34a;
}
.negative {
  color: #e02424;
}
.section-row {
  margin-top: 1.5rem;
}
.card-header {
  font-weight: 600;
}
</style>