<template>
  <div class="analytics">
    <div class="analytics-header">
      <h2>Portfolio Analytics</h2>
      <p>Advanced insights and risk analysis</p>
    </div>

    <!-- Analytics Cards -->
    <div class="analytics-cards">
      <el-card class="metric-card">
        <div class="metric-content">
          <div class="metric-label">Sharpe Ratio</div>
          <div class="metric-value">{{ sharpeRatio }}</div>
          <div class="metric-subtitle">Risk-adjusted return</div>
        </div>
      </el-card>

      <el-card class="metric-card">
        <div class="metric-content">
          <div class="metric-label">Portfolio Beta</div>
          <div class="metric-value">{{ beta }}</div>
          <div class="metric-subtitle">Market correlation</div>
        </div>
      </el-card>

      <el-card class="metric-card">
        <div class="metric-content">
          <div class="metric-label">Volatility</div>
          <div class="metric-value">{{ volatility }}%</div>
          <div class="metric-subtitle">30-day volatility</div>
        </div>
      </el-card>

      <el-card class="metric-card">
        <div class="metric-content">
          <div class="metric-label">Max Drawdown</div>
          <div class="metric-value">{{ maxDrawdown }}%</div>
          <div class="metric-subtitle">Largest peak-to-trough decline</div>
        </div>
      </el-card>
    </div>

    <!-- Charts Section -->
    <div class="charts-grid">
      <!-- Risk vs Return Chart -->
      <el-card class="custom-card">
        <template #header>
          <h3>Risk vs Return Analysis</h3>
        </template>
        <div class="chart-container">
          <v-chart :option="riskReturnChart" />
        </div>
      </el-card>

      <!-- Correlation Matrix -->
      <el-card class="custom-card">
        <template #header>
          <h3>Holdings Correlation</h3>
        </template>
        <div class="correlation-matrix">
          <div class="correlation-grid">
            <div class="correlation-header">
              <div></div>
              <div v-for="symbol in topSymbols" :key="symbol" class="correlation-symbol">
                {{ symbol }}
              </div>
            </div>
            <div 
              v-for="(row, i) in correlationMatrix" 
              :key="i" 
              class="correlation-row"
            >
              <div class="correlation-symbol">{{ topSymbols[i] }}</div>
              <div 
                v-for="(value, j) in row" 
                :key="j" 
                class="correlation-cell"
                :style="{ backgroundColor: getCorrelationColor(value) }"
              >
                {{ value.toFixed(2) }}
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Performance Attribution -->
    <el-card class="custom-card">
      <template #header>
        <h3>Performance Attribution</h3>
      </template>
      <el-table 
        :data="performanceAttribution" 
        class="attribution-table"
        :header-cell-style="{ background: '#fafafa' }"
      >
        <el-table-column prop="symbol" label="Symbol" width="100" />
        <el-table-column prop="name" label="Name" min-width="200" />
        <el-table-column prop="weight" label="Weight %" width="120" align="right">
          <template #default="scope">
            {{ scope.row.weight }}%
          </template>
        </el-table-column>
        <el-table-column prop="return" label="Return %" width="120" align="right">
          <template #default="scope">
            <span :class="{
              'positive': scope.row.return >= 0,
              'negative': scope.row.return < 0
            }">
              {{ scope.row.return >= 0 ? '+' : '' }}{{ scope.row.return }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="contribution" label="Contribution" width="150" align="right">
          <template #default="scope">
            <span :class="{
              'positive': scope.row.contribution >= 0,
              'negative': scope.row.contribution < 0
            }">
              {{ scope.row.contribution >= 0 ? '+' : '' }}{{ scope.row.contribution }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="risk" label="Risk Level" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getRiskTagType(scope.row.risk)" size="small">
              {{ scope.row.risk }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Performance" min-width="150">
          <template #default="scope">
            <el-progress 
              :percentage="Math.min(Math.abs(scope.row.return), 100)" 
              :color="scope.row.return >= 0 ? '#67c23a' : '#f56c6c'"
              :show-text="false"
              :stroke-width="8"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Risk Analysis -->
    <div class="risk-analysis-grid">
      <!-- Value at Risk -->
      <el-card class="custom-card">
        <template #header>
          <h3>Value at Risk (VaR)</h3>
        </template>
        <div class="var-content">
          <div class="var-item">
            <div class="var-label">1-Day VaR (95%)</div>
            <div class="var-value">-${{ formatCurrency(var1Day) }}</div>
            <div class="var-subtitle">Maximum expected loss in 1 day</div>
          </div>
          <div class="var-item">
            <div class="var-label">1-Week VaR (95%)</div>
            <div class="var-value">-${{ formatCurrency(var1Week) }}</div>
            <div class="var-subtitle">Maximum expected loss in 1 week</div>
          </div>
          <div class="var-item">
            <div class="var-label">1-Month VaR (95%)</div>
            <div class="var-value">-${{ formatCurrency(var1Month) }}</div>
            <div class="var-subtitle">Maximum expected loss in 1 month</div>
          </div>
        </div>
      </el-card>

      <!-- Sector Analysis -->
      <el-card class="custom-card">
        <template #header>
          <h3>Sector Exposure</h3>
        </template>
        <div class="sector-analysis">
          <div 
            v-for="sector in sectorExposure" 
            :key="sector.name"
            class="sector-item"
          >
            <div class="sector-info">
              <div class="sector-name">{{ sector.name }}</div>
              <div class="sector-percentage">{{ sector.percentage }}%</div>
            </div>
            <el-progress 
              :percentage="sector.percentage" 
              :color="sector.color"
              :show-text="false"
              :stroke-width="12"
            />
          </div>
        </div>
      </el-card>
    </div>

    <!-- Recommendations -->
    <el-card class="custom-card">
      <template #header>
        <h3>Risk Management Recommendations</h3>
      </template>
      <div class="recommendations-grid">
        <div class="recommendation-card high">
          <div class="recommendation-priority">HIGH</div>
          <div class="recommendation-content">
            <h4>Reduce Concentration Risk</h4>
            <p>Your top holding ({{ topHolding?.symbol }}) represents {{ topHoldingWeight }}% of your portfolio. Consider reducing this to below 20%.</p>
          </div>
        </div>
        
        <div class="recommendation-card medium">
          <div class="recommendation-priority">MEDIUM</div>
          <div class="recommendation-content">
            <h4>Add Defensive Assets</h4>
            <p>Consider adding bonds or defensive stocks to reduce overall portfolio volatility (currently {{ volatility }}%).</p>
          </div>
        </div>
        
        <div class="recommendation-card low">
          <div class="recommendation-priority">LOW</div>
          <div class="recommendation-content">
            <h4>Rebalance Quarterly</h4>
            <p>Set up quarterly rebalancing to maintain your target allocation and take advantage of market volatility.</p>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { ScatterChart } from 'echarts/charts'
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
  ScatterChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const portfolioStore = usePortfolioStore()

// Computed properties
const holdings = computed(() => portfolioStore.holdings)
const totalValue = computed(() => portfolioStore.totalValue)

// Mock analytics data (in real app, these would be calculated from actual market data)
const sharpeRatio = computed(() => '1.23')
const beta = computed(() => '1.15')
const volatility = computed(() => '18.5')
const maxDrawdown = computed(() => '12.8')

const var1Day = computed(() => totalValue.value * 0.025)
const var1Week = computed(() => totalValue.value * 0.065)
const var1Month = computed(() => totalValue.value * 0.135)

const topHolding = computed(() => {
  if (!holdings.value.length) return null
  return holdings.value.reduce((largest, current) => 
    current.current_value > largest.current_value ? current : largest
  )
})

const topHoldingWeight = computed(() => {
  if (!topHolding.value) return 0
  return ((topHolding.value.current_value / totalValue.value) * 100).toFixed(1)
})

const topSymbols = computed(() => {
  return holdings.value
    .sort((a, b) => b.current_value - a.current_value)
    .slice(0, 5)
    .map(h => h.symbol)
})

// Mock correlation matrix (in real app, calculated from price data)
const correlationMatrix = computed(() => {
  const size = topSymbols.value.length
  const matrix = []
  for (let i = 0; i < size; i++) {
    const row = []
    for (let j = 0; j < size; j++) {
      if (i === j) {
        row.push(1.0)
      } else {
        // Mock correlation values
        row.push(Math.random() * 0.8 + 0.1)
      }
    }
    matrix.push(row)
  }
  return matrix
})

const performanceAttribution = computed(() => {
  return holdings.value.map(holding => ({
    symbol: holding.symbol,
    name: holding.name,
    weight: ((holding.current_value / totalValue.value) * 100).toFixed(1),
    return: holding.gain_percent,
    contribution: ((holding.current_value / totalValue.value) * holding.gain_percent / 100).toFixed(2),
    risk: holding.gain_percent > 20 ? 'High' : holding.gain_percent > 5 ? 'Medium' : 'Low'
  }))
})

const sectorExposure = computed(() => {
  // Mock sector data (in real app, would be mapped from stock symbols)
  const sectors = [
          { name: 'Technology', percentage: 65, color: '#6A95CC' },
    { name: 'Consumer Discretionary', percentage: 20, color: '#67c23a' },
    { name: 'Healthcare', percentage: 10, color: '#e6a23c' },
    { name: 'Financial Services', percentage: 5, color: '#f56c6c' }
  ]
  return sectors
})

// Risk vs Return chart
const riskReturnChart = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: function(params) {
      return `${params.data.name}<br/>Risk: ${params.data.value[0]}%<br/>Return: ${params.data.value[1]}%`
    }
  },
  grid: {
    left: '10%',
    right: '10%',
    bottom: '10%',
    top: '10%',
    containLabel: true
  },
  xAxis: {
    name: 'Risk (Volatility %)',
    nameLocation: 'middle',
    nameGap: 30,
    type: 'value',
    min: 0,
    max: 30
  },
  yAxis: {
    name: 'Return %',
    nameLocation: 'middle',
    nameGap: 50,
    type: 'value',
    min: -10,
    max: 25
  },
  series: [
    {
      name: 'Holdings',
      type: 'scatter',
      symbolSize: function(data) {
        return Math.sqrt(data[2]) * 2
      },
      data: holdings.value.map(holding => ({
        name: holding.symbol,
        value: [
          Math.random() * 25 + 5, // Mock volatility
          holding.gain_percent,
          holding.current_value / 1000 // Size based on value
        ]
      })),
      itemStyle: {
        color: '#6A95CC',
        opacity: 0.7
      }
    }
  ]
}))

// Utility functions
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

const getCorrelationColor = (value) => {
  const intensity = Math.abs(value - 0.5) * 2
  const hue = value > 0.5 ? 120 : 0 // Green for positive, red for negative correlation
  return `hsla(${hue}, 70%, 50%, ${intensity * 0.7 + 0.3})`
}

const getRiskTagType = (risk) => {
  const riskMap = {
    High: 'danger',
    Medium: 'warning',
    Low: 'success'
  }
  return riskMap[risk] || 'primary'
}

// Lifecycle
onMounted(async () => {
  await portfolioStore.refreshAll()
})
</script>

<style scoped>
.analytics {
  max-width: 1400px;
  margin: 0 auto;
}

.analytics-header {
  margin-bottom: 30px;
}

.analytics-header h2 {
  margin: 0 0 4px 0;
  color: #303133;
  font-weight: 600;
  font-size: 1.8rem;
}

.analytics-header p {
  margin: 0;
  color: #909399;
}

.analytics-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
  color: #303133;
}

.metric-subtitle {
  color: #606266;
  font-size: 0.85rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.chart-container {
  height: 400px;
  width: 100%;
}

.correlation-matrix {
  padding: 20px 0;
}

.correlation-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.correlation-header {
  display: grid;
  grid-template-columns: 60px repeat(5, 1fr);
  gap: 4px;
  margin-bottom: 4px;
}

.correlation-row {
  display: grid;
  grid-template-columns: 60px repeat(5, 1fr);
  gap: 4px;
}

.correlation-symbol {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.85rem;
  color: #303133;
}

.correlation-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.8rem;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

.attribution-table {
  width: 100%;
}

.positive {
  color: #67c23a;
  font-weight: 600;
}

.negative {
  color: #f56c6c;
  font-weight: 600;
}

.risk-analysis-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.var-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px 0;
}

.var-item {
  text-align: center;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fafafa;
}

.var-label {
  color: #909399;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.var-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #f56c6c;
  margin-bottom: 4px;
}

.var-subtitle {
  color: #606266;
  font-size: 0.8rem;
}

.sector-analysis {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 0;
}

.sector-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sector-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sector-name {
  font-weight: 500;
  color: #303133;
}

.sector-percentage {
  font-weight: 600;
  color: #606266;
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.recommendation-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid;
}

.recommendation-card.high {
  border-left-color: #f56c6c;
  background: #fef0f0;
}

.recommendation-card.medium {
  border-left-color: #e6a23c;
  background: #fdf6ec;
}

.recommendation-card.low {
  border-left-color: #67c23a;
  background: #f0f9ff;
}

.recommendation-priority {
  font-size: 0.75rem;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
  align-self: flex-start;
}

.recommendation-card.high .recommendation-priority {
  background: #f56c6c;
  color: white;
}

.recommendation-card.medium .recommendation-priority {
  background: #e6a23c;
  color: white;
}

.recommendation-card.low .recommendation-priority {
  background: #67c23a;
  color: white;
}

.recommendation-content h4 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 1rem;
}

.recommendation-content p {
  margin: 0;
  color: #606266;
  font-size: 0.9rem;
  line-height: 1.5;
}

@media (max-width: 1200px) {
  .charts-grid,
  .risk-analysis-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .analytics-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .recommendations-grid {
    grid-template-columns: 1fr;
  }
  
  .correlation-header,
  .correlation-row {
    font-size: 0.75rem;
  }
}
</style>