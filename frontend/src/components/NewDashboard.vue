<template>
  <div class="new-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h1>{{ t('dashboard.portfolioDashboard') }}</h1>
      <p>{{ t('dashboard.financialOverview') }}</p>
    </div>

    <!-- Main Dashboard Grid -->
    <div class="dashboard-grid">
      <!-- Left Column - Key Metrics -->
      <div class="metrics-panel">
        <!-- Net Worth Card -->
        <div class="metric-card primary">
          <div class="metric-header">
            <h2>NET WORTH</h2>
            <div class="metric-icon">
              <img :src="moneyIcon" alt="Money" class="metric-icon-img" />
            </div>
          </div>
          <div class="metric-value">${{ formatNumber(getTotalPortfolioValue()) }}</div>
          <div class="metric-change" :class="getTotalReturn() >= 0 ? 'positive' : 'negative'">
            {{ getTotalReturn() >= 0 ? '+' : '' }}{{ getTotalReturn().toFixed(2) }}%
          </div>
        </div>

        <!-- Key Performance Indicators -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-icon">
              <img :src="lineChartIcon" alt="Total Return" class="kpi-icon-img" />
            </div>
            <div class="kpi-label">Total Return</div>
            <div class="kpi-value" :class="getTotalReturn() >= 0 ? 'positive' : 'negative'">
              {{ getTotalReturn() >= 0 ? '+' : '' }}{{ getTotalReturn().toFixed(2) }}%
            </div>
          </div>
          
          <div class="kpi-card">
            <div class="kpi-icon">
              <img :src="techIcon" alt="Risk Level" class="kpi-icon-img" />
            </div>
            <div class="kpi-label">Risk Level</div>
            <div class="kpi-value">{{ getRiskLevel() }}</div>
          </div>
          
          <div class="kpi-card">
            <div class="kpi-icon">
              <img :src="barChartIcon" alt="Portfolio Age" class="kpi-icon-img" />
            </div>
            <div class="kpi-label">Portfolio Age</div>
            <div class="kpi-value">{{ getPortfolioAge() }}</div>
          </div>
          
          <div class="kpi-card">
            <div class="kpi-icon">
              <img :src="cashIcon" alt="Cash Ratio" class="kpi-icon-img" />
            </div>
            <div class="kpi-label">Cash Ratio</div>
            <div class="kpi-value">{{ getCashRatio().toFixed(1) }}%</div>
          </div>
        </div>

        <!-- Quick Actions -->
        <!-- <div class="quick-actions-panel">
          <h3>{{ t('dashboard.quickActions') }}</h3>
          <div class="action-buttons">
            <el-button type="primary" size="small" @click="showAddHolding = true">
              <el-icon><Plus /></el-icon>
              {{ t('dashboard.addHolding') }}
            </el-button>
            <el-button size="small" @click="updatePrices">
              <el-icon><Refresh /></el-icon>
              {{ t('dashboard.updatePrices') }}
            </el-button>
          </div>
        </div> -->
      </div>

      <!-- Center Column - Core Charts -->
      <div class="charts-panel">
        <!-- Net Worth Trend Chart -->
        <div class="chart-section">
          <div class="chart-header">
            <div class="chart-title">{{ t('dashboard.netWorthTrend') }}</div>
            <div class="chart-stats">
              <div class="stat-item">
                <div class="stat-label">{{ t('dashboard.last30Days') }}</div>
                <div class="stat-value" :class="getLast30DaysChange() >= 0 ? 'positive' : 'negative'">
                  {{ getLast30DaysChange() >= 0 ? '+' : '' }}{{ getLast30DaysChange().toFixed(2) }}%
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-label">{{ t('dashboard.todaysChange') }}</div>
                <div class="stat-value" :class="getTodayChange() >= 0 ? 'positive' : 'negative'">
                  {{ getTodayChange() >= 0 ? '+' : '' }}{{ getTodayChange().toFixed(2) }}%
                </div>
              </div>
            </div>
          </div>
          <div class="chart-container">
            <PerformanceLineChart :data="historicalData" v-if="historicalData && historicalData.length > 0" />
            <div class="chart-placeholder" v-else>
                              <div class="placeholder-content">
                  <div class="placeholder-icon">📊</div>
                  <div class="placeholder-text">{{ t('dashboard.netWorthTrendChart') }}</div>
                  <div class="placeholder-subtext">{{ t('dashboard.loadingHistoricalData') }}</div>
                </div>
            </div>
          </div>
        </div>

        <!-- Asset Allocation -->
        <div class="chart-section">
          <div class="chart-header">
            <div class="chart-title">{{ t('dashboard.assetAllocation') }}</div>
                      <div class="chart-stats">
            <div class="stat-item">
              <div class="stat-label">{{ t('dashboard.totalHoldingsLabel') }}</div>
              <div class="stat-value">{{ holdings.length || 0 }}</div>
            </div>
          </div>
          </div>
          <div class="allocation-simple" v-if="allocationData && allocationData.length > 0">
            <AllocationPieChart :data="allocationData" />
            <div class="allocation-summary">
              <div class="allocation-item" v-for="item in allocationData.slice(0, 4)" :key="item.type">
                <div class="allocation-type">{{ item.type }}</div>
                <div class="allocation-percentage">{{ item.percentage }}%</div>
              </div>
            </div>
          </div>
          <div class="chart-placeholder" v-else>
            <div class="placeholder-content">
              <div class="placeholder-icon">🥧</div>
              <div class="placeholder-text">{{ t('dashboard.assetAllocationChart') }}</div>
              <div class="placeholder-subtext">{{ t('dashboard.loadingAllocationData') }}</div>
            </div>
          </div>
        </div>

        <!-- Portfolio Health Score -->
        <div class="chart-section">
          <div class="chart-header">
            <div class="chart-title">{{ t('dashboard.portfolioHealth') }}</div>
          </div>
          <div class="health-score-container">
            <div class="health-score">
              <div class="score-circle" :class="getHealthScoreClass()">
                <div class="score-value">{{ getHealthScore() }}</div>
                <div class="score-label">/ 100</div>
              </div>
              <div class="health-status">{{ getHealthStatus() }}</div>
            </div>
                          <div class="health-metrics">
                <div class="health-metric">
                  <span class="metric-label">{{ t('dashboard.diversification') }}</span>
                  <span class="metric-value" :style="{ color: getDiversificationColor() }">{{ getDiversificationScore() }}/100</span>
                </div>
                <div class="health-metric">
                  <span class="metric-label">{{ t('dashboard.riskBalance') }}</span>
                  <span class="metric-value" :style="{ color: getRiskBalanceColor() }">{{ getRiskBalanceScore() }}/100</span>
                </div>
                <div class="health-metric">
                  <span class="metric-label">{{ t('dashboard.performance') }}</span>
                  <span class="metric-value" :style="{ color: getPerformanceColor() }">{{ getPerformanceScore() }}/100</span>
                </div>
              </div>
          </div>
        </div>
      </div>

      <!-- Right Column - Market & Insights -->
      <div class="insights-panel">
        <!-- Market Overview -->
        <div class="market-overview">
          <h3>{{ t('dashboard.marketOverview') }}</h3>
          <div class="market-indices">
            <div class="market-index">
              <div class="index-name">S&P 500</div>
              <div class="index-value positive">+0.65%</div>
            </div>
            <div class="market-index">
              <div class="index-name">NASDAQ</div>
              <div class="index-value positive">+0.14%</div>
            </div>
            <div class="market-index">
              <div class="index-name">DOW JONES</div>
              <div class="index-value negative">-0.72%</div>
            </div>
            <div class="market-index">
              <div class="index-name">10-YR BOND</div>
              <div class="index-value negative">-2.96%</div>
            </div>
          </div>
        </div>

        <!-- Quick Insights -->
        <div class="quick-insights">
          <h3>{{ t('dashboard.quickInsights') }}</h3>
          <div class="insight-item" v-if="getTotalReturn() > 5">
            <div class="insight-icon">
              <img :src="alertIcon" alt="Alert" class="insight-icon-img" />
            </div>
            <div class="insight-text">Strong performance! Your portfolio is up {{ getTotalReturn().toFixed(1) }}%</div>
          </div>
          <div class="insight-item" v-if="getCashRatio() < 10">
            <div class="insight-icon">
              <img :src="alertIcon" alt="Alert" class="insight-icon-img" />
            </div>
            <div class="insight-text">Low cash ratio ({{ getCashRatio().toFixed(1) }}%). Consider adding liquidity.</div>
          </div>
          <div class="insight-item" v-if="getCashRatio() > 30">
            <div class="insight-icon">
              <img :src="targetIcon" alt="Target" class="insight-icon-img" />
            </div>
            <div class="insight-text">High cash ratio ({{ getCashRatio().toFixed(1) }}%). Consider investing excess cash.</div>
          </div>
          <div class="insight-item" v-if="allocationData.length > 0 && getTopAssetPercentage() > 50">
            <div class="insight-icon">
              <img :src="targetIcon" alt="Target" class="insight-icon-img" />
            </div>
            <div class="insight-text">Heavy concentration in {{ getTopAssetType() }} ({{ getTopAssetPercentage() }}%). Consider diversification.</div>
          </div>
          <div class="insight-item">
            <div class="insight-icon">
              <img :src="barChartIcon" alt="Bar Chart" class="insight-icon-img" />
            </div>
            <div class="insight-text">Portfolio age: {{ getPortfolioAge() }}. Long-term perspective is key.</div>
          </div>
        </div>

        <!-- Top Performers -->
        <div class="top-performers">
          <h3>{{ t('dashboard.topPerformers') }}</h3>
          <div class="performer-item" v-for="holding in topGainers.slice(0, 3)" :key="holding.id">
            <div class="performer-symbol">{{ holding.symbol }}</div>
            <div class="performer-change positive">+{{ (parseFloat(holding.gain_percent || 0) || 0).toFixed(1) }}%</div>
          </div>
          <div v-if="topGainers.length === 0" class="no-data">
            {{ t('dashboard.noDataAvailable') }}
          </div>
        </div>

        <!-- Next Actions -->
        <div class="next-actions">
          <h3>{{ t('dashboard.suggestedActions') }}</h3>
          <div class="action-item" v-if="getCashRatio() < 10">
            <div class="action-icon">
              <img :src="moneyIcon" alt="Money" class="action-icon-img" />
            </div>
            <div class="action-text">Add more cash for liquidity</div>
          </div>
          <div class="action-item" v-if="getCashRatio() > 30">
            <div class="action-icon">
              <img :src="techIcon" alt="Tech" class="action-icon-img" />
            </div>
            <div class="action-text">Consider investing excess cash</div>
          </div>
          <div class="action-item" v-if="allocationData.length > 0 && getTopAssetPercentage() > 50">
            <div class="action-icon">
              <img :src="techIcon" alt="Tech" class="action-icon-img" />
            </div>
            <div class="action-text">Diversify your portfolio</div>
          </div>
          <div class="action-item">
            <div class="action-icon">
              <img :src="barChartIcon" alt="Bar Chart" class="action-icon-img" />
            </div>
            <div class="action-text">Review your holdings monthly</div>
          </div>
        </div>
      </div>
    </div>



    <!-- Add/Edit Holding Dialog -->
    <el-dialog
      v-model="showAddHolding"
      :title="editingHolding ? t('dashboard.editHolding') : t('dashboard.addNewHolding')"
      width="500px"
    >
      <el-form
        ref="holdingForm"
        :model="holdingForm"
        :rules="holdingRules"
        label-width="120px"
      >
        <el-form-item :label="t('dashboard.symbol')" prop="symbol">
          <el-input v-model="holdingForm.symbol" :placeholder="t('dashboard.symbolPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('dashboard.name')" prop="name">
          <el-input v-model="holdingForm.name" :placeholder="t('dashboard.namePlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('dashboard.type')" prop="type">
          <el-select v-model="holdingForm.type" :placeholder="t('dashboard.selectType')">
            <el-option :label="t('dashboard.stock')" value="stock" />
            <el-option :label="t('dashboard.bond')" value="bond" />
            <el-option :label="t('dashboard.fund')" value="fund" />
            <el-option :label="t('dashboard.cash')" value="cash" />
            <el-option :label="t('dashboard.crypto')" value="crypto" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('dashboard.quantity')" prop="quantity">
          <el-input-number v-model="holdingForm.quantity" :min="0.000001" :precision="6" />
        </el-form-item>
        <el-form-item :label="t('dashboard.purchasePrice')" prop="purchase_price">
          <el-input-number v-model="holdingForm.purchase_price" :min="0.01" :precision="2" />
        </el-form-item>
        <el-form-item :label="t('dashboard.purchaseDate')" prop="purchase_date">
          <el-date-picker
            v-model="holdingForm.purchase_date"
            type="date"
            :placeholder="t('dashboard.selectDate')"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item :label="t('dashboard.sector')" prop="sector">
          <el-input v-model="holdingForm.sector" :placeholder="t('dashboard.sectorPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('dashboard.notes')" prop="notes">
          <el-input
            v-model="holdingForm.notes"
            type="textarea"
            :rows="3"
            :placeholder="t('dashboard.notesPlaceholder')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddHolding = false">{{ t('dashboard.cancel') }}</el-button>
        <el-button type="primary" @click="saveHolding" :loading="saving">
          {{ editingHolding ? t('dashboard.update') : t('dashboard.add') }}
        </el-button>
      </template>
    </el-dialog>



    <!-- Create Portfolio Dialog -->
    <el-dialog
      v-model="showCreatePortfolio"
      :title="t('dashboard.createNewPortfolio')"
      width="600px"
    >
      <Portfolio 
        :holdings="holdings" 
        @portfolio-created="onPortfolioCreated"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Plus, DataAnalysis, Collection } from '@element-plus/icons-vue'

const { t } = useI18n()
import portfolioAPI from '../api/portfolio.js'
import AllocationPieChart from './charts/AllocationPieChart.vue'
import SectorPieChart from './charts/SectorPieChart.vue'
import PerformanceLineChart from './charts/PerformanceLineChart.vue'
import Portfolio from './Portfolio.vue'
import moneyIcon from '@/assets/money.png'
import lineChartIcon from '@/assets/line_chart.png'
import techIcon from '@/assets/tech.png'
import cashIcon from '@/assets/cash.png'
import alertIcon from '@/assets/loss.png'
import targetIcon from '@/assets/trophy-line.png'
import barChartIcon from '@/assets/bar_chart.png'

const emit = defineEmits(['goToAssetPage'])

// Reactive data
const loading = ref(false)
const saving = ref(false)
const showAddHolding = ref(false)
const showCreatePortfolio = ref(false)
const editingHolding = ref(null)

// Data
const holdings = ref([])
const portfolioSummary = ref(null)
const allocationData = ref([])
const performanceData = ref(null)
const sectorData = ref([])
const historicalData = ref([])

// Form data
const holdingForm = ref({
  symbol: '',
  name: '',
  type: 'stock',
  quantity: 0,
  purchase_price: 0,
  purchase_date: '',
  sector: '',
  notes: ''
})

// Form validation rules
const holdingRules = {
  symbol: [
    { required: true, message: 'Symbol is required', trigger: 'blur' },
    { min: 1, max: 10, message: 'Symbol must be 1-10 characters', trigger: 'blur' }
  ],
  name: [
    { required: true, message: 'Name is required', trigger: 'blur' },
    { min: 1, max: 255, message: 'Name must be 1-255 characters', trigger: 'blur' }
  ],
  type: [
    { required: true, message: 'Type is required', trigger: 'change' }
  ],
  quantity: [
    { required: true, message: 'Quantity is required', trigger: 'blur' },
    { type: 'number', min: 0.000001, message: 'Quantity must be positive', trigger: 'blur' }
  ],
  purchase_price: [
    { required: true, message: 'Purchase price is required', trigger: 'blur' },
    { type: 'number', min: 0.01, message: 'Purchase price must be positive', trigger: 'blur' }
  ],
  purchase_date: [
    { required: true, message: 'Purchase date is required', trigger: 'change' }
  ]
}

// Computed properties
const cashHoldings = computed(() => {
  return holdings.value.filter(holding => holding.type === 'cash')
})

const investmentHoldings = computed(() => {
  return holdings.value.filter(holding => holding.type !== 'cash')
})

const cashTotal = computed(() => {
  return cashHoldings.value.reduce((sum, holding) => sum + holding.current_value, 0)
})

const investmentTotal = computed(() => {
  return investmentHoldings.value.reduce((sum, holding) => sum + holding.current_value, 0)
})

const topGainers = computed(() => {
  return [...holdings.value]
    .filter(holding => holding.gain_percent > 0)
    .sort((a, b) => b.gain_percent - a.gain_percent)
    .slice(0, 5)
})

const topLosers = computed(() => {
  return [...holdings.value]
    .filter(holding => holding.gain_percent < 0)
    .sort((a, b) => a.gain_percent - b.gain_percent)
    .slice(0, 5)
})

// Methods
const loadData = async () => {
  loading.value = true
  try {
    console.log('Loading dashboard data...')
    
    const [holdingsRes, summaryRes, allocationRes, performanceRes, sectorRes, historicalRes] = await Promise.all([
      portfolioAPI.getHoldings(),
      portfolioAPI.getPortfolioSummary(),
      portfolioAPI.getAllocationAnalysis(),
      portfolioAPI.getPerformanceAnalysis(),
      portfolioAPI.getSectorAnalysis(),
      portfolioAPI.getHistoricalData()
    ])
    
    console.log('API responses:', {
      holdings: holdingsRes,
      summary: summaryRes,
      allocation: allocationRes,
      performance: performanceRes,
      sector: sectorRes,
      historical: historicalRes
    })
    
    // Process holdings data
    if (holdingsRes.data && holdingsRes.data.success) {
      holdings.value = holdingsRes.data.data || []
      console.log('Holdings loaded:', holdings.value.length)
    } else {
      console.warn('Holdings data not available:', holdingsRes)
      holdings.value = []
    }
    
    // Process portfolio summary
    if (summaryRes.data && summaryRes.data.success) {
      portfolioSummary.value = summaryRes.data.data?.summary || summaryRes.data.data || null
      console.log('Portfolio summary loaded:', portfolioSummary.value)
    } else {
      console.warn('Portfolio summary not available:', summaryRes)
      portfolioSummary.value = null
    }
    
    // Process allocation data
    if (allocationRes.data && allocationRes.data.success) {
      const rawAllocationData = allocationRes.data.data || []
      // Ensure all numeric values are properly parsed
      allocationData.value = rawAllocationData.map(item => ({
        ...item,
        total_value: parseFloat(item.total_value) || 0,
        percentage: parseFloat(item.percentage) || 0,
        count: parseInt(item.count) || 0
      }))
      console.log('Allocation data loaded:', allocationData.value.length)
    } else {
      console.warn('Allocation data not available:', allocationRes)
      allocationData.value = []
    }
    
    // Process performance data
    if (performanceRes.data && performanceRes.data.success) {
      performanceData.value = performanceRes.data.data || null
      console.log('Performance data loaded:', performanceData.value)
    } else {
      console.warn('Performance data not available:', performanceRes)
      performanceData.value = null
    }
    
    // Process sector data
    if (sectorRes.data && sectorRes.data.success) {
      sectorData.value = sectorRes.data.data || []
      console.log('Sector data loaded:', sectorData.value.length)
    } else {
      console.warn('Sector data not available:', sectorRes)
      sectorData.value = []
    }
    
    // Process historical data
    if (historicalRes.data && historicalRes.data.success) {
      historicalData.value = historicalRes.data.data || []
      console.log('Historical data loaded:', historicalData.value.length)
    } else {
      console.warn('Historical data not available:', historicalRes)
      historicalData.value = []
    }
    
    // Generate mock data if no real data is available
    if (allocationData.value.length === 0 && holdings.value.length > 0) {
      console.log('Generating mock allocation data from holdings...')
      const mockAllocation = generateMockAllocation(holdings.value)
      allocationData.value = mockAllocation
    }
    
    // Generate mock historical data if no real data or insufficient data
    if (historicalData.value.length === 0 || historicalData.value.length < 30) {
      console.log('Generating mock historical data due to insufficient real data...')
      historicalData.value = generateMockHistoricalData()
    }
    
    console.log('All data loaded successfully')
  } catch (error) {
    ElMessage.error(t('dashboard.failedToLoadPortfolioData'))
    console.error('Error loading data:', error)
    
    // Set default values on error
    holdings.value = []
    portfolioSummary.value = null
    allocationData.value = []
    performanceData.value = null
    sectorData.value = []
    historicalData.value = []
  } finally {
    loading.value = false
  }
}

// Helper functions to generate mock data
const generateMockAllocation = (holdings) => {
  if (holdings.length === 0) return []
  
  const typeCount = {}
  const typeValue = {}
  
  holdings.forEach(holding => {
    const type = holding.type || 'stock'
    typeCount[type] = (typeCount[type] || 0) + 1
    const currentValue = parseFloat(holding.current_value) || 0
    typeValue[type] = (typeValue[type] || 0) + currentValue
  })
  
  const totalValue = Object.values(typeValue).reduce((sum, val) => sum + parseFloat(val || 0), 0)
  
  return Object.keys(typeCount).map(type => {
    const typeValueNum = parseFloat(typeValue[type] || 0)
    const percentage = totalValue > 0 ? Math.round((typeValueNum / totalValue) * 100) : 0
    
    return {
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count: typeCount[type],
      total_value: typeValueNum,
      percentage: percentage
    }
  }).sort((a, b) => b.percentage - a.percentage)
}

const generateMockHistoricalData = () => {
  const data = []
  const today = new Date()
  
  // Get current portfolio value to use as base
  const currentValue = getTotalPortfolioValue()
  const baseValue = currentValue > 0 ? currentValue : 6500000 // Default to 6.5M if no current value
  
  // Calculate portfolio age to determine historical data range
  let portfolioAgeMonths = 0
  if (holdings.value.length > 0) {
    const validDates = holdings.value
      .filter(h => h.purchase_date)
      .map(h => new Date(h.purchase_date))
      .filter(date => !isNaN(date.getTime()))
    
    if (validDates.length > 0) {
      const oldestDate = new Date(Math.min(...validDates))
      portfolioAgeMonths = (today.getFullYear() - oldestDate.getFullYear()) * 12 + (today.getMonth() - oldestDate.getMonth())
    }
  }
  
  // Use portfolio age or default to 12 months (365 days)
  const daysToGenerate = Math.max(30, Math.min(365, portfolioAgeMonths * 30))
  
  // Generate smooth trend data
  let runningValue = baseValue * 0.9 // Start at 90% of current value
  const targetValue = baseValue
  const dailyGrowth = (targetValue - runningValue) / daysToGenerate
  
  for (let i = daysToGenerate; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Add small daily volatility (±0.5%)
    const volatility = 1 + (Math.random() - 0.5) * 0.01
    const dailyValue = runningValue * volatility
    
    // Calculate daily change
    const dailyChange = dailyValue - (runningValue / volatility)
    
    data.push({
      date: date.toISOString().split('T')[0],
      total_value: Math.max(0, dailyValue),
      daily_change: dailyChange
    })
    
    // Increment for next day
    runningValue += dailyGrowth
  }
  
  return data
}

const updatePrices = async () => {
  try {
    await portfolioAPI.updateCurrentPrices()
    ElMessage.success(t('dashboard.pricesUpdatedSuccessfully'))
    loadData()
  } catch (error) {
    ElMessage.error(t('dashboard.failedToUpdatePrices'))
    console.error('Error updating prices:', error)
  }
}

const editHolding = (holding) => {
  editingHolding.value = holding
  holdingForm.value = { ...holding }
  showAddHolding.value = true
}

const saveHolding = async () => {
  saving.value = true
  try {
    if (editingHolding.value) {
      await portfolioAPI.updateHolding(editingHolding.value.id, holdingForm.value)
      ElMessage.success(t('dashboard.holdingUpdatedSuccessfully'))
    } else {
      await portfolioAPI.createHolding(holdingForm.value)
      ElMessage.success(t('dashboard.holdingAddedSuccessfully'))
    }
    
    showAddHolding.value = false
    editingHolding.value = null
    holdingForm.value = {
      symbol: '',
      name: '',
      type: 'stock',
      quantity: 0,
      purchase_price: 0,
      purchase_date: '',
      sector: '',
      notes: ''
    }
    loadData()
  } catch (error) {
    ElMessage.error(t('dashboard.failedToSaveHolding'))
    console.error('Error saving holding:', error)
  } finally {
    saving.value = false
  }
}

const onPortfolioCreated = () => {
  showCreatePortfolio.value = false
  ElMessage.success(t('dashboard.portfolioCreatedSuccessfully'))
}

const getTopAssetType = () => {
  if (allocationData.value && allocationData.value.length > 0) {
    return allocationData.value[0].type
  }
  return 'stocks'
}

const getTopAssetPercentage = () => {
  if (allocationData.value.length > 0) {
    return allocationData.value[0].percentage
  }
  return 0
}

// New calculation methods
const getTotalReturn = () => {
  try {
    if (performanceData.value && performanceData.value.gain_loss_percent !== undefined) {
      const value = parseFloat(performanceData.value.gain_loss_percent)
      return isNaN(value) ? 0 : value
    }
    // Fallback calculation from holdings
    if (holdings.value.length > 0) {
      const totalCost = holdings.value.reduce((sum, h) => sum + (parseFloat(h.quantity || 0) * parseFloat(h.purchase_price || 0)), 0)
      const totalValue = holdings.value.reduce((sum, h) => sum + parseFloat(h.current_value || 0), 0)
      if (totalCost > 0) {
        return ((totalValue - totalCost) / totalCost) * 100
      }
    }
    return 0
  } catch (error) {
    console.error('Error in getTotalReturn:', error)
    return 0
  }
}

const getLast30DaysChange = () => {
  try {
    if (historicalData.value && historicalData.value.length >= 2) {
      const current = historicalData.value[historicalData.value.length - 1]
      // 如果有30天数据就用30天，否则用最早的数据
      const daysToLookBack = Math.min(30, historicalData.value.length - 1)
      const pastData = historicalData.value[historicalData.value.length - daysToLookBack]
      
      if (current && pastData && current.total_value && pastData.total_value) {
        const currentValue = parseFloat(current.total_value)
        const pastValue = parseFloat(pastData.total_value)
        if (!isNaN(currentValue) && !isNaN(pastValue) && pastValue > 0) {
          return ((currentValue - pastValue) / pastValue) * 100
        }
      }
    }
    return 0
  } catch (error) {
    console.error('Error in getLast30DaysChange:', error)
    return 0
  }
}

const getTodayChange = () => {
  try {
    if (historicalData.value && historicalData.value.length >= 2) {
      const today = historicalData.value[historicalData.value.length - 1]
      const yesterday = historicalData.value[historicalData.value.length - 2]
      if (today && yesterday && today.total_value && yesterday.total_value) {
        const todayValue = parseFloat(today.total_value)
        const yesterdayValue = parseFloat(yesterday.total_value)
        if (!isNaN(todayValue) && !isNaN(yesterdayValue) && yesterdayValue > 0) {
          return ((todayValue - yesterdayValue) / yesterdayValue) * 100
        }
      }
    }
    return 0
  } catch (error) {
    console.error('Error in getTodayChange:', error)
    return 0
  }
}

const getCashRatio = () => {
  try {
    const totalValue = parseFloat(portfolioSummary.value?.total_value || 0) || 
                      holdings.value.reduce((sum, h) => sum + parseFloat(h.current_value || 0), 0)
    const cashValue = parseFloat(cashTotal.value || 0)
    
    if (totalValue > 0 && !isNaN(cashValue)) {
      return (cashValue / totalValue) * 100
    }
    return 0
  } catch (error) {
    console.error('Error in getCashRatio:', error)
    return 0
  }
}

const getRiskLevel = () => {
  const cashRatio = getCashRatio()
  if (cashRatio > 30) return 'Low'
  if (cashRatio > 15) return 'Medium'
  return 'High'
}

const getPortfolioAge = () => {
  if (holdings.value.length > 0) {
    const validDates = holdings.value
      .filter(h => h.purchase_date)
      .map(h => new Date(h.purchase_date))
      .filter(date => !isNaN(date.getTime()))
    
    if (validDates.length > 0) {
      const oldestDate = new Date(Math.min(...validDates))
      const now = new Date()
      const months = (now.getFullYear() - oldestDate.getFullYear()) * 12 + (now.getMonth() - oldestDate.getMonth())
      if (months < 12) return `${months} months`
      const years = Math.floor(months / 12)
      const remainingMonths = months % 12
      if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`
      return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`
    }
  }
  return '0 months'
}

const getHealthScore = () => {
  const diversification = getDiversificationScore()
  const riskBalance = getRiskBalanceScore()
  const performance = getPerformanceScore()
  return Math.round((diversification + riskBalance + performance) / 3)
}

const getHealthScoreClass = () => {
  const score = getHealthScore()
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 40) return 'fair'
  return 'poor'
}

const getHealthStatus = () => {
  const score = getHealthScore()
  if (score >= 80) return t('dashboard.excellent')
  if (score >= 60) return t('dashboard.good')
  if (score >= 40) return t('dashboard.fair')
  return t('dashboard.needsAttention')
}

const getDiversificationScore = () => {
  if (allocationData.value && allocationData.value.length >= 4) return 90
  if (allocationData.value && allocationData.value.length >= 3) return 75
  if (allocationData.value && allocationData.value.length >= 2) return 60
  return 30
}

const getRiskBalanceScore = () => {
  const cashRatio = getCashRatio()
  if (cashRatio >= 10 && cashRatio <= 25) return 90
  if (cashRatio >= 5 && cashRatio <= 30) return 75
  if (cashRatio >= 0 && cashRatio <= 40) return 60
  return 40
}

const getPerformanceScore = () => {
  const return_ = getTotalReturn()
  if (return_ >= 10) return 95
  if (return_ >= 5) return 85
  if (return_ >= 0) return 70
  if (return_ >= -5) return 50
  return 30
}

// Color functions for health metrics
const getScoreColor = (score) => {
  if (score >= 80) return '#27ae60' // 优秀 - 绿色
  if (score >= 60) return '#f39c12' // 良好 - 橙色
  if (score >= 40) return '#e67e22' // 一般 - 深橙色
  return '#e74c3c' // 需要改进 - 红色
}

const getDiversificationColor = () => {
  return getScoreColor(getDiversificationScore())
}

const getRiskBalanceColor = () => {
  return getScoreColor(getRiskBalanceScore())
}

const getPerformanceColor = () => {
  return getScoreColor(getPerformanceScore())
}

const getTotalPortfolioValue = () => {
  try {
    const summaryValue = parseFloat(portfolioSummary.value?.total_value || 0)
    if (!isNaN(summaryValue) && summaryValue > 0) {
      return summaryValue
    }
    
    const holdingsValue = holdings.value.reduce((sum, h) => sum + parseFloat(h.current_value || 0), 0)
    return isNaN(holdingsValue) ? 0 : holdingsValue
  } catch (error) {
    console.error('Error in getTotalPortfolioValue:', error)
    return 0
  }
}



const formatNumber = (num) => {
  try {
    const value = parseFloat(num)
    if (isNaN(value)) {
      return '0.00'
    }
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  } catch (error) {
    console.error('Error in formatNumber:', error)
    return '0.00'
  }
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.new-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  overflow-x: hidden;
}

.dashboard-header {
  background: linear-gradient(135deg, #6A95CC 0%, #53A7D8 100%);
  color: white;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  text-align: center;
}

.dashboard-header h1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.dashboard-header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

/* Main Layout */
.dashboard-grid {
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  gap: 20px;
  margin-bottom: 30px;
  max-width: 100%;
  overflow: hidden;
}

/* Left Column - Key Metrics */
.metrics-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  height: fit-content;
  min-width: 0;
}

.metric-card {
  background: linear-gradient(135deg, #6A95CC 0%, #53A7D8 100%);
  color: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  text-align: center;
}

.metric-card.primary {
  background: linear-gradient(135deg, #6A95CC 0%, #53A7D8 100%);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.metric-header h2 {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
  opacity: 0.9;
}

.metric-icon {
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

        .metric-icon-img {
          width: 24px;
          height: 24px;
          object-fit: contain;
        }

        /* Make Net Worth icon white */
        .metric-icon .metric-icon-img {
          filter: brightness(0) invert(1);
        }

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.metric-change {
  font-size: 1rem;
  font-weight: 600;
}

.metric-change.positive {
  color: #4ade80;
}

.metric-change.negative {
  color: #f87171;
}

.kpi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.kpi-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  border: 1px solid #e9ecef;
}

.kpi-icon {
  font-size: 1.5rem;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi-icon-img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.kpi-label {
  font-size: 0.75rem;
  color: #7f8c8d;
  margin-bottom: 4px;
  font-weight: 600;
}

.kpi-value {
  font-size: 1rem;
  font-weight: 700;
  color: #2c3e50;
}

.kpi-value.positive {
  color: #27ae60;
}

.kpi-value.negative {
  color: #e74c3c;
}

.quick-actions-panel {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e9ecef;
}

.quick-actions-panel h3 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
  text-align: center;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Center Column - Charts */
.charts-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  min-width: 0;
}

.chart-section {
  margin-bottom: 32px;
}

.chart-section:last-child {
  margin-bottom: 0;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
}

.chart-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
}

.stat-value.positive {
  color: #27ae60;
}

.stat-value.negative {
  color: #e74c3c;
}

.chart-container {
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
}

.allocation-simple {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
}

.allocation-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;
}

.allocation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.allocation-type {
  font-size: 0.8rem;
  font-weight: 600;
  color: #2c3e50;
}

.allocation-percentage {
  font-size: 0.8rem;
  font-weight: 700;
  color: #667eea;
}

/* Health Score Styles */
.health-score-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
}

.health-score {
  text-align: center;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  border: 4px solid;
}

.score-circle.excellent {
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  border-color: #16a34a;
}

.score-circle.good {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  border-color: #2563eb;
}

.score-circle.fair {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-color: #d97706;
}

.score-circle.poor {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
  border-color: #dc2626;
}

.score-value {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  line-height: 1;
}

.score-label {
  font-size: 0.8rem;
  color: white;
  opacity: 0.9;
}

.health-status {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

.health-metrics {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  width: 100%;
}

.health-metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.metric-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #34495e;
}

.metric-value {
  font-size: 1.8rem;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.performance-summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}

.sector-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 20px;
}

.sector-chart-section {
  display: flex;
  align-items: center;
  justify-content: center;
}

.sector-details-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e9ecef;
}

.sector-details-section h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
}

.chart-placeholder {
  height: 200px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7f8c8d;
  font-size: 0.9rem;
  border: 2px dashed #dee2e6;
}

/* Right Column - Market & Insights */
.insights-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  height: fit-content;
  min-width: 0;
}

.market-overview {
  margin-bottom: 24px;
}

.market-overview h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
}

.market-indices {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.market-index {
  background: #f8f9fa;
  padding: 8px;
  border-radius: 8px;
  text-align: center;
  min-width: 0;
}

.index-name {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-bottom: 4px;
}

.index-value {
  font-size: 0.9rem;
  font-weight: 600;
}

.index-value.positive {
  color: #27ae60;
}

.index-value.negative {
  color: #e74c3c;
}

.quick-insights {
  margin-bottom: 24px;
}

.quick-insights h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid #e9ecef;
}

.insight-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
  margin-top: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.insight-icon-img {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

.insight-text {
  font-size: 0.85rem;
  line-height: 1.4;
  color: #2c3e50;
}

.top-performers {
  margin-bottom: 24px;
}

.top-performers h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
}

.performer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 6px;
  border: 1px solid #e9ecef;
}

.performer-symbol {
  font-size: 0.85rem;
  font-weight: 600;
  color: #2c3e50;
}

.performer-change {
  font-size: 0.85rem;
  font-weight: 600;
}

.performer-change.positive {
  color: #27ae60;
}

.performer-change.negative {
  color: #e74c3c;
}

.next-actions {
  margin-bottom: 24px;
}

.next-actions h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid #e9ecef;
}

.action-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon-img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.action-text {
  font-size: 0.85rem;
  color: #2c3e50;
}

.no-data {
  text-align: center;
  color: #7f8c8d;
  font-size: 0.85rem;
  padding: 20px;
  font-style: italic;
}

.chart-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  margin: 20px 0;
}

.placeholder-content {
  text-align: center;
  color: #6c757d;
}

.placeholder-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
  filter: brightness(0) invert(1);
}

.placeholder-text {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.placeholder-subtext {
  font-size: 0.9rem;
  opacity: 0.7;
}

/* Quick Actions */
.quick-actions {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
}

.quick-actions h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

/* Analysis styles */
.allocation-chart,
.sector-chart {
  padding: 20px 0;
}

.allocation-item,
.sector-item {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.allocation-label,
.sector-label {
  display: flex;
  flex-direction: column;
  min-width: 120px;
}

.allocation-type,
.sector-name {
  font-weight: 600;
  color: #2c3e50;
}

.allocation-count,
.sector-count {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.allocation-bar,
.sector-bar {
  flex: 1;
  height: 20px;
  background: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
}

.allocation-fill,
.sector-fill {
  height: 100%;
  background: linear-gradient(135deg, #6A95CC 0%, #53A7D8 100%);
  transition: width 0.3s ease;
}

.allocation-value,
.sector-value {
  min-width: 120px;
  text-align: right;
  font-weight: 600;
  color: #2c3e50;
}

.performance-summary {
  padding: 20px 0;
}

.performance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e9ecef;
}

.performance-item:last-child {
  border-bottom: none;
}

.performance-item .label {
  font-weight: 600;
  color: #2c3e50;
}

.performance-item .value {
  font-weight: 700;
  color: #2c3e50;
}

.positive {
  color: #27ae60;
  font-weight: 600;
}

.negative {
  color: #e74c3c;
  font-weight: 600;
}

/* Analysis Grid Layout */
.analysis-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-top: 20px;
}

.chart-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e9ecef;
}

.chart-section h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
}

.details-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e9ecef;
}

.details-section h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 20px;
    max-width: 100%;
  }
  
  .kpi-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .allocation-summary {
    grid-template-columns: 1fr 1fr;
  }
  
  .market-indices {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .new-dashboard {
    padding: 10px;
  }
  
  .dashboard-header {
    padding: 20px;
  }
  
  .dashboard-header h1 {
    font-size: 1.8rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .allocation-item,
  .sector-item {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .allocation-value,
  .sector-value {
    text-align: left;
  }
  
  .analysis-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .chart-section,
  .details-section {
    padding: 15px;
  }
}
</style> 