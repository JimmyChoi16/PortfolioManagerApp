<template>
  <div class="performance">
    <div class="performance-header">
      <h2>Portfolio Performance</h2>
      <p>Detailed analysis of your investment returns</p>
    </div>

    <!-- Performance Overview Cards -->
    <div class="performance-cards">
      <el-card class="metric-card">
        <div class="metric-content">
          <div class="metric-label">Total Return</div>
          <div class="metric-value" :class="{ 
            'positive': totalGain >= 0, 
            'negative': totalGain < 0 
          }">
            {{ totalGain >= 0 ? '+' : '' }}${{ formatCurrency(Math.abs(totalGain)) }}
          </div>
          <div class="metric-subtitle">
            {{ gainPercent >= 0 ? '+' : '' }}{{ gainPercent.toFixed(2) }}% overall
          </div>
        </div>
      </el-card>

      <el-card class="metric-card">
        <div class="metric-content">
          <div class="metric-label">Best Performer</div>
          <div class="metric-value" v-if="bestPerformer">
            {{ bestPerformer.symbol }}
          </div>
          <div class="metric-subtitle" v-if="bestPerformer">
            +{{ bestPerformer.gain_percent }}%
          </div>
        </div>
      </el-card>

      <el-card class="metric-card">
        <div class="metric-content">
          <div class="metric-label">Portfolio Value</div>
          <div class="metric-value">
            ${{ formatCurrency(totalValue) }}
          </div>
          <div class="metric-subtitle">Current market value</div>
        </div>
      </el-card>
    </div>

    <!-- Charts Section -->
    <div class="charts-grid">
      <!-- Portfolio Performance Chart -->
      <el-card class="custom-card chart-card">
        <template #header>
          <div class="card-header">
            <h3>Portfolio Performance</h3>
            <el-radio-group v-model="performancePeriod" size="small">
              <el-radio-button label="7d">7 Days</el-radio-button>
              <el-radio-button label="1m">1 Month</el-radio-button>
              <el-radio-button label="3m">3 Months</el-radio-button>
              <el-radio-button label="1y">1 Year</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div class="chart-container">
          <v-chart :option="performanceChartOption" />
        </div>
      </el-card>

      <!-- Holdings Performance -->
      <el-card class="custom-card">
        <template #header>
          <h3>Individual Holdings Performance</h3>
        </template>
        <div class="holdings-performance">
          <div 
            v-for="holding in topHoldings" 
            :key="holding.symbol"
            class="holding-performance-item"
          >
            <div class="holding-info">
              <div class="holding-symbol">{{ holding.symbol }}</div>
              <div class="holding-name">{{ holding.name }}</div>
            </div>
            <div class="holding-metrics">
              <div class="holding-value">${{ formatCurrency(holding.current_value) }}</div>
              <div class="holding-gain" :class="{
                'positive': holding.gain_percent >= 0,
                'negative': holding.gain_percent < 0
              }">
                {{ holding.gain_percent >= 0 ? '+' : '' }}{{ holding.gain_percent }}%
              </div>
            </div>
            <div class="holding-progress">
              <el-progress 
                :percentage="Math.abs(holding.gain_percent)" 
                :color="holding.gain_percent >= 0 ? '#67c23a' : '#f56c6c'"
                :show-text="false"
                :stroke-width="8"
              />
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Detailed Performance Table -->
    <el-card class="custom-card">
      <template #header>
        <h3>Detailed Performance Analysis</h3>
      </template>
      <el-table 
        :data="holdings" 
        class="performance-table"
        :header-cell-style="{ background: '#fafafa' }"
      >
        <el-table-column prop="symbol" label="Symbol" width="100" />
        <el-table-column prop="name" label="Name" min-width="200" />
        <el-table-column prop="quantity" label="Shares" width="100" align="right">
          <template #default="scope">
            {{ formatNumber(scope.row.quantity) }}
          </template>
        </el-table-column>
        <el-table-column prop="purchase_price" label="Avg Cost" width="120" align="right">
          <template #default="scope">
            ${{ formatCurrency(scope.row.purchase_price) }}
          </template>
        </el-table-column>
        <el-table-column prop="current_price" label="Current Price" width="130" align="right">
          <template #default="scope">
            ${{ formatCurrency(scope.row.current_price) }}
          </template>
        </el-table-column>
        <el-table-column prop="current_value" label="Market Value" width="130" align="right">
          <template #default="scope">
            ${{ formatCurrency(scope.row.current_value) }}
          </template>
        </el-table-column>
        <el-table-column prop="unrealized_gain" label="Unrealized P&L" width="150" align="right">
          <template #default="scope">
            <span :class="{
              'gain-positive': scope.row.unrealized_gain >= 0,
              'gain-negative': scope.row.unrealized_gain < 0
            }">
              {{ scope.row.unrealized_gain >= 0 ? '+' : '' }}${{ formatCurrency(Math.abs(scope.row.unrealized_gain)) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="gain_percent" label="Return %" width="100" align="right">
          <template #default="scope">
            <span :class="{
              'gain-positive': scope.row.gain_percent >= 0,
              'gain-negative': scope.row.gain_percent < 0
            }">
              {{ scope.row.gain_percent >= 0 ? '+' : '' }}{{ scope.row.gain_percent }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column label="Performance" width="120">
          <template #default="scope">
            <el-progress 
              :percentage="Math.min(Math.abs(scope.row.gain_percent), 100)" 
              :color="scope.row.gain_percent >= 0 ? '#67c23a' : '#f56c6c'"
              :show-text="false"
              :stroke-width="6"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { usePortfolioStore } from '@/stores/portfolio'

// Register ECharts components
use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const portfolioStore = usePortfolioStore()
const performancePeriod = ref('1m')

// Computed properties
const holdings = computed(() => portfolioStore.holdings)
const totalValue = computed(() => portfolioStore.totalValue)
const totalGain = computed(() => portfolioStore.totalGain)
const gainPercent = computed(() => portfolioStore.gainPercent)
const historicalData = computed(() => portfolioStore.historicalData)

const bestPerformer = computed(() => {
  if (!holdings.value.length) return null
  return holdings.value.reduce((best, current) => 
    current.gain_percent > best.gain_percent ? current : best
  )
})

const topHoldings = computed(() => {
  return holdings.value
    .slice()
    .sort((a, b) => b.current_value - a.current_value)
    .slice(0, 5)
})

// Chart options
const performanceChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    formatter: function (params) {
      const point = params[0]
      return `${point.name}<br/>Portfolio Value: $${formatCurrency(point.value)}`
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: historicalData.value.map(item => {
      const date = new Date(item.date)
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    })
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: function (value) {
        return '$' + (value / 1000).toFixed(0) + 'k'
      }
    }
  },
  series: [
    {
      name: 'Portfolio Value',
      type: 'line',
      data: historicalData.value.map(item => item.total_value),
      smooth: true,
      lineStyle: {
        color: '#409eff',
        width: 3
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0, color: 'rgba(64, 158, 255, 0.3)'
          }, {
            offset: 1, color: 'rgba(64, 158, 255, 0.05)'
          }]
        }
      }
    }
  ]
}))

// Utility functions
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

const formatNumber = (value) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6
  }).format(value)
}

// Lifecycle
onMounted(async () => {
  await portfolioStore.refreshAll()
})
</script>

<style scoped>
.performance {
  max-width: 1400px;
  margin: 0 auto;
}

.performance-header {
  margin-bottom: 30px;
}

.performance-header h2 {
  margin: 0 0 4px 0;
  color: #303133;
  font-weight: 600;
  font-size: 1.8rem;
}

.performance-header p {
  margin: 0;
  color: #909399;
}

.performance-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.metric-card {
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #ebeef5;
}

.metric-content {
  text-align: center;
}

.metric-label {
  color: #909399;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.metric-value {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 4px;
}

.metric-value.positive {
  color: #67c23a;
}

.metric-value.negative {
  color: #f56c6c;
}

.metric-subtitle {
  color: #606266;
  font-size: 0.85rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.chart-card {
  min-height: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  color: #303133;
  font-weight: 600;
}

.holdings-performance {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.holding-performance-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.holding-performance-item:last-child {
  border-bottom: none;
}

.holding-info {
  flex: 1;
}

.holding-symbol {
  font-weight: 600;
  color: #303133;
  margin-bottom: 2px;
}

.holding-name {
  font-size: 0.85rem;
  color: #909399;
}

.holding-metrics {
  text-align: right;
  margin-right: 16px;
}

.holding-value {
  font-weight: 600;
  color: #303133;
  margin-bottom: 2px;
}

.holding-gain {
  font-size: 0.85rem;
  font-weight: 500;
}

.holding-gain.positive {
  color: #67c23a;
}

.holding-gain.negative {
  color: #f56c6c;
}

.holding-progress {
  width: 80px;
}

.performance-table {
  width: 100%;
}

.gain-positive {
  color: #67c23a;
  font-weight: 600;
}

.gain-negative {
  color: #f56c6c;
  font-weight: 600;
}

@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .performance-cards {
    grid-template-columns: 1fr;
  }
  
  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>