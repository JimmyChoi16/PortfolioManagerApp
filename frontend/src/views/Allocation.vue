<template>
  <div class="allocation">
    <div class="allocation-header">
      <h2>Portfolio Allocation</h2>
      <p>Asset distribution and diversification analysis</p>
    </div>

    <!-- Allocation Overview -->
    <div class="allocation-cards">
      <el-card class="metric-card">
        <div class="metric-content">
          <div class="metric-label">Total Assets</div>
          <div class="metric-value">{{ totalHoldings }}</div>
          <div class="metric-subtitle">{{ uniqueTypes.length }} asset types</div>
        </div>
      </el-card>

      <el-card class="metric-card">
        <div class="metric-content">
          <div class="metric-label">Largest Position</div>
          <div class="metric-value" v-if="largestPosition">
            {{ largestPosition.symbol }}
          </div>
          <div class="metric-subtitle" v-if="largestPosition">
            {{ ((largestPosition.current_value / totalValue) * 100).toFixed(1) }}% of portfolio
          </div>
        </div>
      </el-card>

      <el-card class="metric-card">
        <div class="metric-content">
          <div class="metric-label">Diversification</div>
          <div class="metric-value">{{ diversificationScore }}</div>
          <div class="metric-subtitle">Diversification score</div>
        </div>
      </el-card>
    </div>

    <!-- Charts Section -->
    <div class="charts-grid">
      <!-- Asset Allocation Pie Chart -->
      <el-card class="custom-card">
        <template #header>
          <h3>Asset Allocation by Type</h3>
        </template>
        <div class="chart-container">
          <v-chart :option="typeAllocationChart" />
        </div>
        <div class="allocation-legend">
          <div 
            v-for="item in typeAllocation" 
            :key="item.name"
            class="legend-item"
          >
            <div class="legend-color" :style="{ backgroundColor: item.color }"></div>
            <div class="legend-info">
              <div class="legend-name">{{ item.name.toUpperCase() }}</div>
              <div class="legend-value">${{ formatCurrency(item.value) }} ({{ item.percentage }}%)</div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- Holdings Distribution -->
      <el-card class="custom-card">
        <template #header>
          <h3>Holdings Distribution</h3>
        </template>
        <div class="chart-container">
          <v-chart :option="holdingsAllocationChart" />
        </div>
        <div class="allocation-legend">
          <div 
            v-for="item in topHoldings.slice(0, 6)" 
            :key="item.symbol"
            class="legend-item"
          >
            <div class="legend-color" :style="{ backgroundColor: item.color }"></div>
            <div class="legend-info">
              <div class="legend-name">{{ item.symbol }}</div>
              <div class="legend-value">${{ formatCurrency(item.current_value) }} ({{ item.percentage }}%)</div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Detailed Allocation Table -->
    <el-card class="custom-card">
      <template #header>
        <div class="table-header">
          <h3>Detailed Allocation Breakdown</h3>
          <el-radio-group v-model="allocationView" size="small">
            <el-radio-button label="holdings">By Holdings</el-radio-button>
            <el-radio-button label="types">By Asset Type</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      
      <!-- Holdings View -->
      <el-table 
        v-if="allocationView === 'holdings'"
        :data="holdings" 
        class="allocation-table"
        :header-cell-style="{ background: '#fafafa' }"
      >
        <el-table-column prop="symbol" label="Symbol" width="100" />
        <el-table-column prop="name" label="Name" min-width="200" />
        <el-table-column prop="type" label="Type" width="100">
          <template #default="scope">
            <el-tag :type="getTypeTagType(scope.row.type)" size="small">
              {{ scope.row.type.toUpperCase() }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="current_value" label="Market Value" width="150" align="right">
          <template #default="scope">
            ${{ formatCurrency(scope.row.current_value) }}
          </template>
        </el-table-column>
        <el-table-column label="Portfolio %" width="120" align="right">
          <template #default="scope">
            {{ ((scope.row.current_value / totalValue) * 100).toFixed(2) }}%
          </template>
        </el-table-column>
        <el-table-column label="Allocation" width="200">
          <template #default="scope">
            <el-progress 
              :percentage="((scope.row.current_value / totalValue) * 100)" 
              :color="getProgressColor(scope.row.type)"
              :show-text="false"
              :stroke-width="8"
            />
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="Quantity" width="120" align="right">
          <template #default="scope">
            {{ formatNumber(scope.row.quantity) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- Asset Types View -->
      <el-table 
        v-else
        :data="typeAllocationTable" 
        class="allocation-table"
        :header-cell-style="{ background: '#fafafa' }"
      >
        <el-table-column prop="type" label="Asset Type" width="150">
          <template #default="scope">
            <el-tag :type="getTypeTagType(scope.row.type)" size="small">
              {{ scope.row.type.toUpperCase() }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="count" label="Holdings Count" width="150" align="center" />
        <el-table-column prop="value" label="Total Value" width="150" align="right">
          <template #default="scope">
            ${{ formatCurrency(scope.row.value) }}
          </template>
        </el-table-column>
        <el-table-column prop="percentage" label="Portfolio %" width="120" align="right">
          <template #default="scope">
            {{ scope.row.percentage }}%
          </template>
        </el-table-column>
        <el-table-column label="Allocation" min-width="200">
          <template #default="scope">
            <el-progress 
              :percentage="scope.row.percentage" 
              :color="getProgressColor(scope.row.type)"
              :show-text="false"
              :stroke-width="12"
            />
          </template>
        </el-table-column>
        <el-table-column label="Risk Level" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getRiskTagType(scope.row.type)" size="small">
              {{ getRiskLevel(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Rebalancing Suggestions -->
    <el-card class="custom-card">
      <template #header>
        <h3>Rebalancing Suggestions</h3>
      </template>
      <div class="suggestions-grid">
        <div class="suggestion-card">
          <div class="suggestion-icon">
            <el-icon size="24" color="#409eff"><Warning /></el-icon>
          </div>
          <div class="suggestion-content">
            <h4>High Concentration Risk</h4>
            <p>Your portfolio is concentrated in tech stocks ({{ techAllocation }}%). Consider diversifying into other sectors.</p>
          </div>
        </div>
        
        <div class="suggestion-card">
          <div class="suggestion-icon">
            <el-icon size="24" color="#67c23a"><CircleCheck /></el-icon>
          </div>
          <div class="suggestion-content">
            <h4>Good Asset Mix</h4>
            <p>Your stock-to-other-assets ratio is well balanced for long-term growth.</p>
          </div>
        </div>
        
        <div class="suggestion-card">
          <div class="suggestion-icon">
            <el-icon size="24" color="#e6a23c"><InfoFilled /></el-icon>
          </div>
          <div class="suggestion-content">
            <h4>Consider Bonds</h4>
            <p>Adding 10-15% bonds could reduce portfolio volatility while maintaining growth potential.</p>
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
import { PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { usePortfolioStore } from '@/stores/portfolio'
import { 
  Warning, 
  CircleCheck, 
  InfoFilled 
} from '@element-plus/icons-vue'

// Register ECharts components
use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

const portfolioStore = usePortfolioStore()
const allocationView = ref('holdings')

// Color schemes
const typeColors = {
  stock: '#409eff',
  bond: '#67c23a',
  fund: '#e6a23c',
  crypto: '#f56c6c',
  cash: '#909399'
}

const holdingColors = [
  '#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399',
  '#ff7f50', '#87ceeb', '#dda0dd', '#98fb98', '#f0e68c'
]

// Computed properties
const holdings = computed(() => portfolioStore.holdings)
const totalValue = computed(() => portfolioStore.totalValue)
const totalHoldings = computed(() => portfolioStore.totalHoldings)

const largestPosition = computed(() => {
  if (!holdings.value.length) return null
  return holdings.value.reduce((largest, current) => 
    current.current_value > largest.current_value ? current : largest
  )
})

const uniqueTypes = computed(() => {
  return [...new Set(holdings.value.map(h => h.type))]
})

const diversificationScore = computed(() => {
  if (!holdings.value.length) return 'N/A'
  const maxWeight = Math.max(...holdings.value.map(h => 
    (h.current_value / totalValue.value) * 100
  ))
  return maxWeight < 20 ? 'High' : maxWeight < 40 ? 'Medium' : 'Low'
})

const techAllocation = computed(() => {
  const techSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'NFLX']
  const techValue = holdings.value
    .filter(h => techSymbols.includes(h.symbol))
    .reduce((sum, h) => sum + h.current_value, 0)
  return ((techValue / totalValue.value) * 100).toFixed(0)
})

// Type allocation
const typeAllocation = computed(() => {
  const allocation = {}
  holdings.value.forEach(holding => {
    if (!allocation[holding.type]) {
      allocation[holding.type] = 0
    }
    allocation[holding.type] += holding.current_value
  })

  return Object.entries(allocation).map(([type, value]) => ({
    name: type,
    value: value,
    percentage: ((value / totalValue.value) * 100).toFixed(1),
    color: typeColors[type] || '#409eff'
  }))
})

const typeAllocationTable = computed(() => {
  const allocation = {}
  holdings.value.forEach(holding => {
    if (!allocation[holding.type]) {
      allocation[holding.type] = { value: 0, count: 0 }
    }
    allocation[holding.type].value += holding.current_value
    allocation[holding.type].count += 1
  })

  return Object.entries(allocation).map(([type, data]) => ({
    type,
    value: data.value,
    count: data.count,
    percentage: ((data.value / totalValue.value) * 100).toFixed(1)
  }))
})

// Top holdings for pie chart
const topHoldings = computed(() => {
  return holdings.value
    .map((holding, index) => ({
      ...holding,
      percentage: ((holding.current_value / totalValue.value) * 100).toFixed(1),
      color: holdingColors[index % holdingColors.length]
    }))
    .sort((a, b) => b.current_value - a.current_value)
})

// Chart options
const typeAllocationChart = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: ${c} ({d}%)'
  },
  series: [
    {
      name: 'Asset Type',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '50%'],
      data: typeAllocation.value.map(item => ({
        value: item.value,
        name: item.name.toUpperCase(),
        itemStyle: { color: item.color }
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
}))

const holdingsAllocationChart = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: ${c} ({d}%)'
  },
  series: [
    {
      name: 'Holdings',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '50%'],
      data: topHoldings.value.slice(0, 6).map(holding => ({
        value: holding.current_value,
        name: holding.symbol,
        itemStyle: { color: holding.color }
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
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

const getTypeTagType = (type) => {
  const typeMap = {
    stock: 'primary',
    bond: 'success',
    fund: 'warning',
    crypto: 'danger',
    cash: 'info'
  }
  return typeMap[type] || 'primary'
}

const getRiskTagType = (type) => {
  const riskMap = {
    stock: 'warning',
    bond: 'success',
    fund: 'primary',
    crypto: 'danger',
    cash: 'info'
  }
  return riskMap[type] || 'primary'
}

const getRiskLevel = (type) => {
  const riskMap = {
    stock: 'Medium',
    bond: 'Low',
    fund: 'Medium',
    crypto: 'High',
    cash: 'None'
  }
  return riskMap[type] || 'Medium'
}

const getProgressColor = (type) => {
  return typeColors[type] || '#409eff'
}

// Lifecycle
onMounted(async () => {
  await portfolioStore.refreshAll()
})
</script>

<style scoped>
.allocation {
  max-width: 1400px;
  margin: 0 auto;
}

.allocation-header {
  margin-bottom: 30px;
}

.allocation-header h2 {
  margin: 0 0 4px 0;
  color: #303133;
  font-weight: 600;
  font-size: 1.8rem;
}

.allocation-header p {
  margin: 0;
  color: #909399;
}

.allocation-cards {
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
  height: 300px;
  width: 100%;
}

.allocation-legend {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.legend-name {
  font-weight: 500;
  color: #303133;
}

.legend-value {
  font-size: 0.85rem;
  color: #606266;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-header h3 {
  margin: 0;
  color: #303133;
  font-weight: 600;
}

.allocation-table {
  width: 100%;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.suggestion-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fafafa;
}

.suggestion-icon {
  flex-shrink: 0;
}

.suggestion-content h4 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 1rem;
}

.suggestion-content p {
  margin: 0;
  color: #606266;
  font-size: 0.9rem;
  line-height: 1.5;
}

@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .allocation-cards {
    grid-template-columns: 1fr;
  }
  
  .suggestions-grid {
    grid-template-columns: 1fr;
  }
  
  .table-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>