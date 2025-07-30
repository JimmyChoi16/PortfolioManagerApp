<!-- TODO: 中间的Net Worth的数据30天和今天变化的数据没有实时 -->
<!-- TODO: 样式不太对，右边那列突出去了 -->
<!-- TODO: dashboard内容还得改 -->
<template>
  <div class="new-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h1>Portfolio Dashboard</h1>
      <p>Your financial overview at a glance</p>
    </div>

    <!-- Main Dashboard Grid -->
    <div class="dashboard-grid">
      <!-- Left Column - Account Details -->
      <div class="accounts-panel">
        <div class="net-worth-header">
          <h2>NET WORTH</h2>
          <div class="net-worth-value">${{ formatNumber(portfolioSummary?.total_value || 0) }}</div>
        </div>

        <div class="account-section">
          <div class="section-title">CASH</div>
          <div class="account-item" v-for="holding in cashHoldings" :key="holding.id">
            <div class="account-info">
              <div class="account-name">{{ holding.name }}</div>
              <div class="account-time">Updated recently</div>
            </div>
            <div class="account-balance">${{ formatNumber(holding.current_value) }}</div>
          </div>
          <div class="section-total">Total: ${{ formatNumber(cashTotal) }}</div>
        </div>

        <div class="account-section">
          <div class="section-title">INVESTMENT</div>
          <div class="account-item" v-for="holding in investmentHoldings" :key="holding.id">
            <div class="account-info">
              <div class="account-name">{{ holding.name }}</div>
              <div class="account-time">Updated recently</div>
            </div>
            <div class="account-balance">${{ formatNumber(holding.current_value) }}</div>
          </div>
          <div class="section-total">Total: ${{ formatNumber(investmentTotal) }}</div>
        </div>
      </div>

      <!-- Center Column - Charts -->
      <div class="charts-panel">
        <!-- Net Worth Chart -->
        <div class="chart-section">
          <div class="chart-header">
            <div class="chart-title">Net Worth</div>
            <div class="chart-stats">
              <div class="stat-item">
                <div class="stat-label">LAST 30 DAYS</div>
                <div class="stat-value" :class="portfolioSummary?.total_gain >= 0 ? 'positive' : 'negative'">
                  {{ portfolioSummary?.total_gain >= 0 ? '+' : '' }}${{ formatNumber(portfolioSummary?.total_gain || 0) }}
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-label">TODAY'S CHANGE</div>
                <div class="stat-value" :class="portfolioSummary?.total_gain >= 0 ? 'positive' : 'negative'">
                  {{ portfolioSummary?.total_gain >= 0 ? '+' : '' }}${{ formatNumber(portfolioSummary?.total_gain || 0) }}
                </div>
              </div>
            </div>
          </div>
          <div class="chart-container">
            <PerformanceLineChart :data="historicalData" v-if="historicalData.length > 0" />
            <div class="chart-placeholder" v-else>
              Net Worth Trend Chart (30 days)
            </div>
          </div>
        </div>

        <!-- Asset Allocation Chart and Details -->
        <div class="chart-section">
          <div class="chart-header">
            <div class="chart-title">Asset Allocation</div>
            <div class="chart-stats">
              <div class="stat-item">
                <div class="stat-label">TOTAL HOLDINGS</div>
                <div class="stat-value">{{ portfolioSummary?.total_holdings || 0 }}</div>
              </div>
            </div>
          </div>
          <div class="allocation-grid" v-if="allocationData.length > 0">
            <div class="allocation-chart-section">
              <AllocationPieChart :data="allocationData" />
            </div>
            <div class="allocation-details-section">
              <h3>Allocation Details</h3>
              <div class="allocation-chart">
                <div
                  v-for="item in allocationData"
                  :key="item.type"
                  class="allocation-item"
                >
                  <div class="allocation-label">
                    <span class="allocation-type">{{ item.type }}</span>
                    <span class="allocation-count">({{ item.count }} holdings)</span>
                  </div>
                  <div class="allocation-bar">
                    <div
                      class="allocation-fill"
                      :style="{ width: item.percentage + '%' }"
                    ></div>
                  </div>
                  <div class="allocation-value">
                    ${{ formatNumber(item.total_value) }} ({{ item.percentage }}%)
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="chart-placeholder" v-else>
            Asset Allocation Chart
          </div>
        </div>

        <!-- Performance Summary -->
        <div class="chart-section" v-if="performanceData">
          <div class="chart-header">
            <div class="chart-title">Performance Summary</div>
          </div>
          <div class="performance-summary-grid">
            <div class="performance-item">
              <span class="label">Current Value:</span>
              <span class="value">${{ formatNumber(performanceData.current_value) }}</span>
            </div>
            <div class="performance-item">
              <span class="label">Total Cost:</span>
              <span class="value">${{ formatNumber(performanceData.total_cost) }}</span>
            </div>
            <div class="performance-item">
              <span class="label">Total Gain/Loss:</span>
              <span class="value" :class="performanceData.total_gain_loss >= 0 ? 'positive' : 'negative'">
                ${{ formatNumber(performanceData.total_gain_loss) }}
              </span>
            </div>
            <div class="performance-item">
              <span class="label">Gain/Loss %:</span>
              <span class="value" :class="performanceData.gain_loss_percent >= 0 ? 'positive' : 'negative'">
                {{ performanceData.gain_loss_percent >= 0 ? '+' : '' }}{{ performanceData.gain_loss_percent }}%
              </span>
            </div>
          </div>
        </div>

        <!-- Sector Analysis -->
        <div class="chart-section" v-if="sectorData.length > 0">
          <div class="chart-header">
            <div class="chart-title">Sector Analysis</div>
          </div>
          <div class="sector-grid">
            <div class="sector-chart-section">
              <SectorPieChart :data="sectorData" />
            </div>
            <div class="sector-details-section">
              <h3>Sector Details</h3>
              <div class="sector-chart">
                <div
                  v-for="item in sectorData"
                  :key="item.sector"
                  class="sector-item"
                >
                  <div class="sector-label">
                    <span class="sector-name">{{ item.sector }}</span>
                    <span class="sector-count">({{ item.count }} holdings)</span>
                  </div>
                  <div class="sector-bar">
                    <div
                      class="sector-fill"
                      :style="{ width: item.percentage + '%' }"
                    ></div>
                  </div>
                  <div class="sector-value">
                    ${{ formatNumber(item.total_value) }} ({{ item.percentage }}%)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column - Market & Insights -->
      <div class="market-panel">
        <!-- Market Movers -->
        <div class="market-movers">
          <h3>Market Movers</h3>
          <div class="market-indices">
            <div class="market-index">
              <div class="index-name">S&P 500</div>
              <div class="index-value positive">+0.65%</div>
            </div>
            <div class="market-index">
              <div class="index-name">DOW JONES</div>
              <div class="index-value negative">-0.72%</div>
            </div>
            <div class="market-index">
              <div class="index-name">NASDAQ</div>
              <div class="index-value positive">+0.14%</div>
            </div>
            <div class="market-index">
              <div class="index-name">10-YR BOND</div>
              <div class="index-value negative">-2.96%</div>
            </div>
          </div>
          <div class="performance-item">
            <div class="company-name">Your Holdings</div>
            <div class="performance-change" :class="portfolioSummary?.avg_gain_percent >= 0 ? 'positive' : 'negative'">
              {{ portfolioSummary?.avg_gain_percent >= 0 ? '+' : '' }}{{ portfolioSummary?.avg_gain_percent || 0 }}%
            </div>
          </div>
        </div>

        <!-- Holdings Performance -->
        <div class="holdings-performance">
          <div class="performance-section">
            <h4>YOUR GAINERS</h4>
            <div class="performance-item" v-for="holding in topGainers" :key="holding.id">
              <div class="company-name">{{ holding.symbol }}</div>
              <div class="performance-change positive">+{{ holding.gain_percent }}%</div>
            </div>
          </div>

          <div class="performance-section">
            <h4>YOUR LOSERS</h4>
            <div class="performance-item" v-for="holding in topLosers" :key="holding.id">
              <div class="company-name">{{ holding.symbol }}</div>
              <div class="performance-change negative">{{ holding.gain_percent }}%</div>
            </div>
          </div>
        </div>

        <!-- Insights -->
        <div class="insights-section">
          <h3>Insights</h3>
          <div class="insight-item" v-if="allocationData.length > 0">
            Your portfolio is heavily weighted in {{ getTopAssetType() }} ({{ getTopAssetPercentage() }}%).
          </div>
          <div class="insight-item">
            Total portfolio value: ${{ formatNumber(portfolioSummary?.total_value || 0) }}
          </div>
          <div class="insight-item">
            Average return: {{ portfolioSummary?.avg_gain_percent >= 0 ? '+' : '' }}{{ portfolioSummary?.avg_gain_percent || 0 }}%
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <h2>Quick Actions</h2>
      <div class="action-buttons">
        <el-button type="primary" @click="showAddHolding = true">
          <el-icon><Plus /></el-icon>
          Add Holding
        </el-button>
        <el-button @click="showCreatePortfolio = true">
          <el-icon><Collection /></el-icon>
          Create Portfolio
        </el-button>
        <el-button @click="updatePrices">
          <el-icon><Refresh /></el-icon>
          Update Prices
        </el-button>

      </div>
    </div>

    <!-- Add/Edit Holding Dialog -->
    <el-dialog
      v-model="showAddHolding"
      :title="editingHolding ? 'Edit Holding' : 'Add New Holding'"
      width="500px"
    >
      <el-form
        ref="holdingForm"
        :model="holdingForm"
        :rules="holdingRules"
        label-width="120px"
      >
        <el-form-item label="Symbol" prop="symbol">
          <el-input v-model="holdingForm.symbol" placeholder="e.g., AAPL" />
        </el-form-item>
        <el-form-item label="Name" prop="name">
          <el-input v-model="holdingForm.name" placeholder="e.g., Apple Inc." />
        </el-form-item>
        <el-form-item label="Type" prop="type">
          <el-select v-model="holdingForm.type" placeholder="Select type">
            <el-option label="Stock" value="stock" />
            <el-option label="Bond" value="bond" />
            <el-option label="Fund" value="fund" />
            <el-option label="Cash" value="cash" />
            <el-option label="Crypto" value="crypto" />
          </el-select>
        </el-form-item>
        <el-form-item label="Quantity" prop="quantity">
          <el-input-number v-model="holdingForm.quantity" :min="0.000001" :precision="6" />
        </el-form-item>
        <el-form-item label="Purchase Price" prop="purchase_price">
          <el-input-number v-model="holdingForm.purchase_price" :min="0.01" :precision="2" />
        </el-form-item>
        <el-form-item label="Purchase Date" prop="purchase_date">
          <el-date-picker
            v-model="holdingForm.purchase_date"
            type="date"
            placeholder="Select date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="Sector" prop="sector">
          <el-input v-model="holdingForm.sector" placeholder="e.g., Technology" />
        </el-form-item>
        <el-form-item label="Notes" prop="notes">
          <el-input
            v-model="holdingForm.notes"
            type="textarea"
            :rows="3"
            placeholder="Additional notes..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddHolding = false">Cancel</el-button>
        <el-button type="primary" @click="saveHolding" :loading="saving">
          {{ editingHolding ? 'Update' : 'Add' }}
        </el-button>
      </template>
    </el-dialog>



    <!-- Create Portfolio Dialog -->
    <el-dialog
      v-model="showCreatePortfolio"
      title="Create New Portfolio"
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Plus, DataAnalysis, Collection } from '@element-plus/icons-vue'
import portfolioAPI from '../api/portfolio.js'
import AllocationPieChart from './charts/AllocationPieChart.vue'
import SectorPieChart from './charts/SectorPieChart.vue'
import PerformanceLineChart from './charts/PerformanceLineChart.vue'
import Portfolio from './Portfolio.vue'

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
    const [holdingsRes, summaryRes, allocationRes, performanceRes, sectorRes, historicalRes] = await Promise.all([
      portfolioAPI.getHoldings(),
      portfolioAPI.getPortfolioSummary(),
      portfolioAPI.getAllocationAnalysis(),
      portfolioAPI.getPerformanceAnalysis(),
      portfolioAPI.getSectorAnalysis(),
      portfolioAPI.getHistoricalData()
    ])
    
    if (holdingsRes.data && holdingsRes.data.success) {
      holdings.value = holdingsRes.data.data
    }
    
    if (summaryRes.data && summaryRes.data.success) {
      portfolioSummary.value = summaryRes.data.data.summary
    }
    
    if (allocationRes.data && allocationRes.data.success) {
      allocationData.value = allocationRes.data.data
    }
    
    if (performanceRes.data && performanceRes.data.success) {
      performanceData.value = performanceRes.data.data
    }
    
    if (sectorRes.data && sectorRes.data.success) {
      sectorData.value = sectorRes.data.data
    }
    
    if (historicalRes.data && historicalRes.data.success) {
      historicalData.value = historicalRes.data.data
    }
  } catch (error) {
    ElMessage.error('Failed to load portfolio data')
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
}

const updatePrices = async () => {
  try {
    await portfolioAPI.updateCurrentPrices()
    ElMessage.success('Prices updated successfully')
    loadData()
  } catch (error) {
    ElMessage.error('Failed to update prices')
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
      ElMessage.success('Holding updated successfully')
    } else {
      await portfolioAPI.createHolding(holdingForm.value)
      ElMessage.success('Holding added successfully')
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
    ElMessage.error('Failed to save holding')
    console.error('Error saving holding:', error)
  } finally {
    saving.value = false
  }
}

const onPortfolioCreated = () => {
  showCreatePortfolio.value = false
  ElMessage.success('Portfolio created successfully!')
}

const getTopAssetType = () => {
  if (allocationData.value.length > 0) {
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

const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num)
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
}

.dashboard-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  grid-template-columns: 300px 1fr 350px;
  gap: 24px;
  margin-bottom: 30px;
}

/* Left Column - Account Details */
.accounts-panel {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.net-worth-header {
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e9ecef;
}

.net-worth-header h2 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #7f8c8d;
  margin-bottom: 8px;
}

.net-worth-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
}

.account-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #7f8c8d;
  margin-bottom: 12px;
  text-transform: uppercase;
}

.account-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f8f9fa;
}

.account-item:last-child {
  border-bottom: none;
}

.account-info {
  flex: 1;
}

.account-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 4px;
}

.account-time {
  font-size: 0.75rem;
  color: #7f8c8d;
}

.account-balance {
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c3e50;
}

.section-total {
  font-weight: 700;
  color: #2c3e50;
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 6px;
  margin-top: 8px;
}

/* Center Column - Charts */
.charts-panel {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
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

.allocation-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 20px;
}

.allocation-chart-section {
  display: flex;
  align-items: center;
  justify-content: center;
}

.allocation-details-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e9ecef;
}

.allocation-details-section h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
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
.market-panel {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.market-movers {
  margin-bottom: 32px;
}

.market-movers h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
}

.market-indices {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.market-index {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
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

.holdings-performance {
  margin-bottom: 32px;
}

.performance-section {
  margin-bottom: 24px;
}

.performance-section h4 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
}

.performance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f8f9fa;
}

.performance-item:last-child {
  border-bottom: none;
}

.company-name {
  font-size: 0.85rem;
  color: #2c3e50;
}

.performance-change {
  font-size: 0.85rem;
  font-weight: 600;
}

.performance-change.positive {
  color: #27ae60;
}

.performance-change.negative {
  color: #e74c3c;
}

.insights-section h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
}

.insight-item {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 0.85rem;
  line-height: 1.5;
  color: #2c3e50;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  }
  
  .allocation-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .performance-summary-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .sector-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .market-indices {
    grid-template-columns: 1fr;
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