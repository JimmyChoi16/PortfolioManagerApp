<template>
  <div class="dashboard">
    <div class="content-area">
      <!-- Welcome Header -->
      <div class="welcome-header">
        <h1>Welcome Back!</h1>
        <p>Here's what's happening with your portfolio today</p>
      </div>

      <!-- Portfolio Metrics Cards -->
      <div class="dashboard-grid">
        <!-- Portfolio Value -->
        <div class="metric-card">
          <div class="metric-content">
            <div class="metric-icon">
              <el-icon size="24"><Money /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-label">Portfolio Value</div>
              <div class="metric-value">${{ formatCurrency(totalValue) }}</div>
              <div class="metric-subtitle">Live updates</div>
            </div>
          </div>
        </div>

        <!-- Today's Change -->
        <div class="metric-card success">
          <div class="metric-content">
            <div class="metric-icon">
              <el-icon size="24"><TrendCharts /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-label">Today's Change</div>
              <div class="metric-value">+${{ formatCurrency(Math.abs(totalGain)) }}</div>
              <div class="metric-change">{{ gainPercent >= 0 ? '+' : '' }}{{ gainPercent.toFixed(2) }}%</div>
            </div>
          </div>
        </div>

        <!-- Active Holdings -->
        <div class="metric-card warning">
          <div class="metric-content">
            <div class="metric-icon">
              <el-icon size="24"><Grid /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-label">Active Holdings</div>
              <div class="metric-value">{{ totalHoldings }}</div>
              <div class="metric-subtitle">Across {{ totalHoldings }} sectors</div>
            </div>
          </div>
        </div>

        <!-- Best Performer -->
        <div class="metric-card" v-if="topPerformer">
          <div class="metric-content">
            <div class="metric-icon">
              <el-icon size="24"><Star /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-label">Best Performer</div>
              <div class="metric-value">{{ topPerformer.symbol }}</div>
              <div class="metric-change">+{{ topPerformer.gain_percent }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts and Performance -->
      <div class="charts-section">
        <!-- 5-Day Performance Chart -->
        <el-card class="custom-card chart-card">
          <template #header>
            <div class="card-header">
              <h3>5-Day Performance</h3>
              <p>Your portfolio value over the last week</p>
            </div>
          </template>
          <div class="chart-container">
            <v-chart :option="chartOption" />
          </div>
        </el-card>

        <!-- Top Performers -->
        <el-card class="custom-card performers-card">
          <template #header>
            <div class="card-header">
              <h3>Top Performers</h3>
              <p>Your best performing stocks today</p>
            </div>
          </template>
          <div class="performers-list">
            <div 
              v-for="(performer, index) in topPerformers" 
              :key="performer.symbol"
              class="performer-item"
            >
              <div class="performer-rank">{{ index + 1 }}</div>
              <div class="performer-info">
                <div class="performer-symbol">{{ performer.symbol }}</div>
                <div class="performer-name">{{ performer.name }}</div>
              </div>
              <div class="performer-metrics">
                <div class="performer-price">${{ performer.current_price }}</div>
                <div class="performer-change" :class="{ 
                  'positive': performer.gain_percent >= 0,
                  'negative': performer.gain_percent < 0
                }">
                  {{ performer.gain_percent >= 0 ? '+' : '' }}{{ performer.gain_percent }}%
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- AI Investment Suggestions & Market News -->
      <div class="bottom-section">
        <el-card class="custom-card suggestions-card">
          <template #header>
            <div class="card-header">
              <h3>AI Investment Suggestions</h3>
              <p>Personalized recommendations based on your portfolio</p>
            </div>
          </template>
          <div class="suggestions-content">
            <div class="suggestion-item">
              <el-icon color="#409eff"><InfoFilled /></el-icon>
              <div>
                <h4>Diversify into Tech ETFs</h4>
                <p>Consider adding QQQ to balance your individual stock holdings</p>
              </div>
            </div>
            <div class="suggestion-item">
              <el-icon color="#67c23a"><TrendCharts /></el-icon>
              <div>
                <h4>Rebalance Portfolio</h4>
                <p>Your tech allocation is 65%. Consider reducing to 55%</p>
              </div>
            </div>
          </div>
        </el-card>

        <el-card class="custom-card news-card">
          <template #header>
            <div class="card-header">
              <h3>Market News & Activity</h3>
              <p>Latest market updates and your recent transactions</p>
            </div>
          </template>
          <div class="news-content">
            <div class="news-item">
              <div class="news-time">2 hours ago</div>
              <div class="news-text">NVDA reports strong Q4 earnings, up 12% in after-hours trading</div>
            </div>
            <div class="news-item">
              <div class="news-time">4 hours ago</div>
              <div class="news-text">You added 50 shares of AAPL to your portfolio</div>
            </div>
            <div class="news-item">
              <div class="news-time">1 day ago</div>
              <div class="news-text">Federal Reserve hints at potential rate cuts in 2024</div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
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
import { 
  Money, 
  TrendCharts, 
  Grid, 
  Star, 
  InfoFilled 
} from '@element-plus/icons-vue'

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

// Computed properties
const totalValue = computed(() => portfolioStore.totalValue)
const totalGain = computed(() => portfolioStore.totalGain)
const gainPercent = computed(() => portfolioStore.gainPercent)
const totalHoldings = computed(() => portfolioStore.totalHoldings)
const topPerformers = computed(() => portfolioStore.topPerformers.slice(0, 3))
const topPerformer = computed(() => portfolioStore.topPerformers[0])
const historicalData = computed(() => portfolioStore.historicalData)

// Chart configuration
const chartOption = computed(() => ({
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
      return date.toLocaleDateString('en-US', { weekday: 'short' })
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

// Utility function
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

// Lifecycle
onMounted(async () => {
  await portfolioStore.refreshAll()
})
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.welcome-header {
  margin-bottom: 20px;
}

.welcome-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.welcome-header p {
  color: #909399;
  font-size: 1rem;
}

.metric-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-info {
  flex: 1;
}

.charts-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  min-height: 480px;
}

.performers-card {
  min-height: 480px;
}

.card-header h3 {
  margin: 0 0 4px 0;
  color: #303133;
  font-weight: 600;
}

.card-header p {
  margin: 0;
  color: #909399;
  font-size: 0.9rem;
}

.performers-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.performer-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.performer-item:last-child {
  border-bottom: none;
}

.performer-rank {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.performer-info {
  flex: 1;
}

.performer-symbol {
  font-weight: 600;
  color: #303133;
  margin-bottom: 2px;
}

.performer-name {
  font-size: 0.85rem;
  color: #909399;
}

.performer-metrics {
  text-align: right;
}

.performer-price {
  font-weight: 600;
  color: #303133;
  margin-bottom: 2px;
}

.performer-change {
  font-size: 0.85rem;
  font-weight: 500;
}

.performer-change.positive {
  color: #67c23a;
}

.performer-change.negative {
  color: #f56c6c;
}

.bottom-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.suggestions-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.suggestion-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.suggestion-item h4 {
  margin: 0 0 4px 0;
  color: #303133;
}

.suggestion-item p {
  margin: 0;
  color: #606266;
  font-size: 0.9rem;
}

.news-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.news-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.news-item:last-child {
  border-bottom: none;
}

.news-time {
  font-size: 0.8rem;
  color: #909399;
  margin-bottom: 4px;
}

.news-text {
  color: #606266;
  line-height: 1.5;
}

@media (max-width: 1200px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .bottom-section {
    grid-template-columns: 1fr;
  }
  
  .welcome-header h1 {
    font-size: 1.5rem;
  }
}
</style>