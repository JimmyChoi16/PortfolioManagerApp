<template>
  <div class="stock-section">
    <!-- Login Warning -->
    <div v-if="!isLoggedIn" class="login-warning">
      <el-alert title="⚠️ You are not logged in. All data shown is for demonstration purposes only." type="warning"
        :closable="false" show-icon />
    </div>

    <!-- Header -->
    <div class="section-header">
      <h1>Stock Portfolio</h1>
      <p>Track and analyze your stock investments with real-time market data</p>
    </div>

    <!-- Stock Categories Overview -->
    <div class="stock-categories" v-if="stockAllocation.length > 0">
      <div v-for="category in stockAllocation" :key="category.sector" class="category-card">
        <div class="category-icon">📈</div>
        <h3>{{ category.sector || 'Other' }}</h3>
        <p>{{ getSectorDescription(category.sector) }}</p>
        <div class="category-metrics">
          <div class="metric">
            <span class="label">Holdings</span>
            <span class="value">{{ category.count }} stocks</span>
          </div>
          <div class="metric">
            <span class="label">Value</span>
            <span class="value">${{ formatNumber(category.total_value) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">📈</div>
      <h3>No Stock Holdings</h3>
      <p>You don't have any stock holdings yet. Add some stocks to get started!</p>
      <el-button type="primary" @click="goToDashboard">
        <el-icon>
          <Plus />
        </el-icon>
        Add Stock Holding
      </el-button>
    </div>

    <!-- Performance Metrics Title and Cards -->
    <h2 style="margin-bottom: 12px;">Performance Metrics</h2>
    <div class="performance-cards" style="margin-bottom: 32px;">
      <div class="performance-card" @click="showCagrDialog = true" style="cursor:pointer;">
        <div class="card-icon">📈</div>
        <div class="card-content">
          <h4>CAGR</h4>
          <p class="card-value">{{ (cagr * 100).toFixed(2) }}%</p>
          <span class="card-subtitle">Annualized Return</span>
        </div>
      </div>
      <div class="performance-card" @click="showSharpeDialog = true" style="cursor:pointer;">
        <div class="card-icon">📊</div>
        <div class="card-content">
          <h4>Sharpe Ratio</h4>
          <p class="card-value">{{ sharpe.toFixed(2) }}</p>
          <span class="card-subtitle">Risk-adjusted</span>
        </div>
      </div>
      <div class="performance-card" @click="showDrawdownDialog = true" style="cursor:pointer;">
        <div class="card-icon">📉</div>
        <div class="card-content">
          <h4>Max Drawdown</h4>
          <p class="card-value">{{ (maxDrawdown * 100).toFixed(2) }}%</p>
          <span class="card-subtitle">Worst Loss</span>
        </div>
      </div>
    </div>
    <!-- CAGR Dialog -->
    <el-dialog v-model="showCagrDialog" title="CAGR - Historical Net Value" width="700px">
      <PerformanceLineChart :data="effectiveHistoricalData" />
    </el-dialog>
    <!-- Sharpe Ratio Dialog -->
    <el-dialog v-model="showSharpeDialog" title="Sharpe Ratio - Daily Returns Distribution" width="700px" @close="onSharpeDialogClose">
      <div style="height:350px;width:100%;">
        <canvas v-if="showSharpeDialog" ref="sharpeChart"></canvas>
        <div v-else-if="!dailyReturns.length" style="text-align:center;color:#aaa;">No data available</div>
      </div>
    </el-dialog>
    <!-- Max Drawdown Dialog -->
    <el-dialog v-model="showDrawdownDialog" title="Max Drawdown - Net Value Curve" width="700px" @close="onDrawdownDialogClose">
      <div style="height:350px;width:100%;">
        <canvas v-if="showDrawdownDialog" ref="drawdownChart"></canvas>
        <div v-else-if="!drawdownChartData.data.length" style="text-align:center;color:#aaa;">No data available</div>
      </div>
    </el-dialog>
    <!-- Stock Portfolio Performance (move below metrics) -->
    <div class="portfolio-performance" v-if="stockPerformance">
      <h2>Stock Portfolio Performance</h2>
      <div class="performance-cards">
        <div class="performance-card">
          <div class="card-icon">📊</div>
          <div class="card-content">
            <h4>Total Value</h4>
            <p class="card-value">${{ formatNumber(stockPerformance.total_value) }}</p>
            <span class="card-change" :class="stockPerformance.total_gain >= 0 ? 'positive' : 'negative'">
              {{ stockPerformance.total_gain >= 0 ? '+' : '' }}${{ formatNumber(stockPerformance.total_gain) }}
              ({{ stockPerformance.avg_gain_percent >= 0 ? '+' : '' }}{{ stockPerformance.avg_gain_percent }}%)
            </span>
          </div>
        </div>

        <div class="performance-card">
          <div class="card-icon">📈</div>
          <div class="card-content">
            <h4>Total Holdings</h4>
            <p class="card-value">{{ stockPerformance.total_holdings }}</p>
            <span class="card-subtitle">Stock positions</span>
          </div>
        </div>

        <div class="performance-card">
          <div class="card-icon">🎯</div>
          <div class="card-content">
            <h4>Best Performer</h4>
            <p class="card-value">{{ bestPerformer?.symbol || 'N/A' }}</p>
            <span class="card-change positive" v-if="bestPerformer">
              +{{ bestPerformer.gain_percent }}%
            </span>
          </div>
        </div>

        <div class="performance-card">
          <div class="card-icon">📉</div>
          <div class="card-content">
            <h4>Worst Performer</h4>
            <p class="card-value">{{ worstPerformer?.symbol || 'N/A' }}</p>
            <span class="card-change negative" v-if="worstPerformer">
              {{ worstPerformer.gain_percent }}%
            </span>
          </div>
        </div>
      </div>
    </div>
    <!-- Your Real-time Stock Holdings -->
    <div class="holdings-data" v-if="isLoggedIn">
      <div class="holdings-header">
        <h2>Your Real-time Stock Holdings</h2>
        <el-button type="primary" @click="showCreateDialog = true" size="small">
          <el-icon>
            <Plus />
          </el-icon>
          Add Holding
        </el-button>
      </div>
      
      <div v-if="stockHoldings.length > 0" class="market-table-wrapper">
        <table class="market-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Name</th>
              <th>Quantity</th>
              <th>Avg Purchase Price</th>
              <th>Current Price</th>
              <th>Current Value</th>
              <th>Gain/Loss</th>
              <th>Gain/Loss %</th>
              <th v-if="isLoggedIn">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in pagedComputedStockHoldings" :key="item.symbol" @mouseover="hoveredRow = item.symbol"
              @mouseleave="hoveredRow = null" :class="[
                { hovered: hoveredRow === item.symbol },
                holdingsRowFlash[item.symbol] === 'up' ? 'flash-up' : '',
                holdingsRowFlash[item.symbol] === 'down' ? 'flash-down' : ''
              ]">
              <td>{{ item.symbol }}</td>
              <td>{{ item.name }}</td>
              <td>{{ formatNumber(item.quantity) }}</td>
              <td>${{ formatNumber(item.avg_purchase_price) }}</td>
              <td>${{ formatNumber(item.current_price) }}</td>
              <td>${{ formatNumber(item.current_value) }}</td>
              <td :class="{ up: item.unrealized_gain > 0, down: item.unrealized_gain < 0 }">
                {{ item.unrealized_gain > 0 ? '+' : '' }}${{ formatNumber(item.unrealized_gain) }}
              </td>
              <td :class="{ up: item.gain_percent > 0, down: item.gain_percent < 0 }">
                {{ item.gain_percent > 0 ? '+' : '' }}{{ item.gain_percent }}%
              </td>
              <td v-if="isLoggedIn" class="actions-cell">
                <div class="action-buttons">
                  <el-button 
                    v-if="item.holdings_count === 1" 
                    type="danger" 
                    size="small" 
                    @click="sellHolding(item)"
                    :icon="Delete"
                    circle
                    title="Sell"
                  />
                  <el-button 
                    v-if="item.holdings_count > 1" 
                    type="info" 
                    size="small" 
                    @click="showHoldingDetails(item)"
                    :icon="View"
                    circle
                    title="View Details"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Empty state when no holdings -->
      <div v-else class="empty-state">
        <div class="empty-icon">📈</div>
        <h3>No Holdings Yet</h3>
        <p>Start building your portfolio by adding your first stock holding.</p>
      </div>

      <!-- Holdings Pagination -->
      <div class="pagination" v-if="holdingsTotalPages > 1">
        <el-button @click="holdingsPrevPage" :disabled="holdingsCurrentPage === 1" size="small">
          Previous
        </el-button>
        <span>Page {{ holdingsCurrentPage }} of {{ holdingsTotalPages }}</span>
        <el-button @click="holdingsNextPage" :disabled="holdingsCurrentPage === holdingsTotalPages" size="small">
          Next
        </el-button>
      </div>
    </div>

    <!-- Create Holding Dialog -->
    <el-dialog v-model="showCreateDialog" title="Add New Stock Holding" width="500px">
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="120px"
      >
        <el-form-item label="Symbol" prop="symbol">
          <el-input 
            v-model="createForm.symbol" 
            placeholder="e.g., AAPL, SH600519"
            @blur="fetchStockInfo"
            clearable
          />
        </el-form-item>
        <el-form-item label="Name" prop="name">
          <el-input v-model="createForm.name" disabled />
        </el-form-item>
        <el-form-item label="Quantity" prop="quantity">
          <el-input-number 
            v-model="createForm.quantity" 
            :min="0.000001" 
            :precision="6" 
            :step="1"
            :controls="true"
            style="width: 100%" 
          />
        </el-form-item>
        <el-form-item label="Purchase Price" prop="purchase_price">
          <el-input-number 
            v-model="createForm.purchase_price" 
            :min="0.01" 
            :precision="2" 
            :step="0.01"
            :controls="true"
            style="width: 100%" 
          />
        </el-form-item>
        <el-form-item label="Purchase Date" prop="purchase_date">
          <el-date-picker
            v-model="createForm.purchase_date"
            type="date"
            placeholder="Select purchase date"
            style="width: 100%"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            clearable
          />
        </el-form-item>
        <el-form-item label="Sector" prop="sector">
          <el-select v-model="createForm.sector" placeholder="Select sector" style="width: 100%" clearable>
            <el-option label="Technology" value="Technology" />
            <el-option label="Healthcare" value="Healthcare" />
            <el-option label="Financial" value="Financial" />
            <el-option label="Consumer" value="Consumer" />
            <el-option label="Energy" value="Energy" />
            <el-option label="Industrial" value="Industrial" />
            <el-option label="Other" value="Other" />
          </el-select>
        </el-form-item>
        <el-form-item label="Notes" prop="notes">
          <el-input
            v-model="createForm.notes"
            type="textarea"
            :rows="3"
            placeholder="Additional notes..."
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">Cancel</el-button>
        <el-button type="primary" @click="createHolding" :loading="creating">Create</el-button>
      </template>
    </el-dialog>

    <!-- Holding Details Dialog -->
    <el-dialog v-model="showDetailsDialog" :title="`${selectedHolding?.symbol} - Holding Details`" width="800px">
      <div v-if="selectedHolding">
        <div class="holding-summary">
          <h4>Summary</h4>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="label">Total Quantity:</span>
              <span class="value">{{ formatNumber(selectedHolding.quantity) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Average Purchase Price:</span>
              <span class="value">${{ formatNumber(selectedHolding.avg_purchase_price) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Current Price:</span>
              <span class="value">${{ formatNumber(selectedHolding.current_price) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Total Value:</span>
              <span class="value">${{ formatNumber(selectedHolding.current_value) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Total Gain/Loss:</span>
              <span class="value" :class="{ up: selectedHolding.unrealized_gain > 0, down: selectedHolding.unrealized_gain < 0 }">
                {{ selectedHolding.unrealized_gain > 0 ? '+' : '' }}${{ formatNumber(selectedHolding.unrealized_gain) }}
              </span>
            </div>
            <div class="summary-item">
              <span class="label">Gain/Loss %:</span>
              <span class="value" :class="{ up: selectedHolding.gain_percent > 0, down: selectedHolding.gain_percent < 0 }">
                {{ selectedHolding.gain_percent > 0 ? '+' : '' }}{{ selectedHolding.gain_percent }}%
              </span>
            </div>
          </div>
        </div>
        
        <div class="individual-holdings">
          <h4>Individual Holdings ({{ selectedHolding.holdings_count }})</h4>
          <table class="details-table">
            <thead>
              <tr>
                <th>Purchase Date</th>
                <th>Quantity</th>
                <th>Purchase Price</th>
                <th>Current Value</th>
                <th>Gain/Loss</th>
                <th>Gain/Loss %</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="holding in selectedHolding.individual_holdings" :key="holding.id">
                <td>{{ formatDate(holding.purchase_date) }}</td>
                <td>{{ formatNumber(holding.quantity) }}</td>
                <td>${{ formatNumber(holding.purchase_price) }}</td>
                <td>${{ formatNumber(holding.current_value) }}</td>
                <td :class="{ up: holding.unrealized_gain > 0, down: holding.unrealized_gain < 0 }">
                  {{ holding.unrealized_gain > 0 ? '+' : '' }}${{ formatNumber(holding.unrealized_gain) }}
                </td>
                <td :class="{ up: holding.gain_percent > 0, down: holding.gain_percent < 0 }">
                  {{ holding.gain_percent > 0 ? '+' : '' }}{{ holding.gain_percent }}%
                </td>
                <td>
                  <el-button 
                    type="danger" 
                    size="small" 
                    @click="sellIndividualHolding(holding)"
                    :icon="Delete"
                    circle
                    title="Sell"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <template #footer>
        <el-button @click="showDetailsDialog = false">Close</el-button>
      </template>
    </el-dialog>

    <!-- Real-time Market Data -->
    <div class="market-data" v-if="!isLoggedIn">
      <div class="market-data">
        <div class="market-header">
          <h2>Real-time Market Data</h2>
          <div class="market-type-toggle">
            <button :class="['market-type-btn', marketType === 'us' ? 'active' : '']" @click="marketType = 'us'">
              US Stocks/ETF
            </button>
            <button :class="['market-type-btn', marketType === 'cn' ? 'active' : '']" @click="marketType = 'cn'">
              China A-Shares
            </button>
          </div>
          <el-button @click="fetchMarketData" :loading="marketDataLoading" size="small">
            <el-icon>
              <Refresh />
            </el-icon>
            Refresh
          </el-button>
        </div>
        <div class="market-table-wrapper">
          <table class="market-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Name</th>
                <th>Price</th>
                <th>Change</th>
                <th>Change %</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="marketDataLoading && pagedMarketData.length === 0">
                <td colspan="5" style="text-align: center; padding: 40px;">
                  <el-icon class="is-loading">
                    <Loading />
                  </el-icon>
                  <span style="margin-left: 8px;">Loading market data...</span>
                </td>
              </tr>
              <tr v-else-if="!marketDataLoading && pagedMarketData.length === 0">
                <td colspan="5" style="text-align: center; padding: 40px; color: #7f8c8d;">
                  <div>No market data available</div>
                  <div style="font-size: 0.9rem; margin-top: 8px;">Try refreshing the data</div>
                </td>
              </tr>
              <tr v-for="item in pagedMarketData" :key="item.symbol" @mouseover="hoveredRow = item.symbol"
                @mouseleave="hoveredRow = null" :class="[
                  { hovered: hoveredRow === item.symbol },
                  rowFlash[item.symbol] === 'up' ? 'flash-up' : '',
                  rowFlash[item.symbol] === 'down' ? 'flash-down' : ''
                ]">
                <td>{{ item.symbol }}</td>
                <td>{{ item.name }}</td>
                <td>${{ formatNumber(item.currentPrice) }}</td>
                <td :class="{ up: item.change > 0, down: item.change < 0 }">
                  {{ item.change > 0 ? '+' : '' }}{{ formatNumber(item.change) }}
                </td>
                <td :class="{ up: item.change > 0, down: item.change < 0 }">
                  {{ item.change > 0 ? '+' : '' }}{{ formatNumber(item.changePercent) }}%
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div class="pagination">
            <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
            <span>Page {{ currentPage }} of {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Plus, Refresh, Loading, Edit, View, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import portfolioAPI from '../api/portfolio.js'
import marketAPI from '../api/market.js'
import http from '../api/http.js'
import PerformanceLineChart from './charts/PerformanceLineChart.vue'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const props = defineProps({
  isLoggedIn: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['goToDashboard'])

const hoveredRow = ref(null)
const stockHoldings = ref([])
const marketData = ref([])
const rowFlash = ref({})
const holdingsRowFlash = ref({})
const prevDataMap = ref({})
const prevUsDataMap = ref({})
const prevCnDataMap = ref({})
const prevHoldingsDataMap = ref({})
const timer = ref(null)
const currentPage = ref(1)
const pageSize = 10
const marketDataLoading = ref(false)
const holdingsCurrentPage = ref(1)
const holdingsPageSize = 10
const marketType = ref('us') // 'us' or 'cn'

// Lifecycle
let holdingsPriceTimer = null
const REFRESH_INTERVAL_MS = 10000 // Global refresh interval in milliseconds

const historicalData = ref([])
// Real-time performance metrics
const realTimeMetrics = ref({
  cagr: 0,
  sharpeRatio: 0,
  maxDrawdown: 0,
  totalValue: 0,
  totalCost: 0,
  totalGainLoss: 0,
  gainLossPercent: 0
})

// Static mock data for unauthenticated users
const staticMockHistoricalData = [
  { date: '2025-01-01', total_value: 100000 },
  { date: '2025-02-01', total_value: 108333 },
  { date: '2025-03-01', total_value: 117361 },
  { date: '2025-04-01', total_value: 127141 },
  { date: '2025-05-01', total_value: 137736 },
  { date: '2025-06-01', total_value: 149212 },
  { date: '2025-07-01', total_value: 161646 },
  { date: '2025-07-30', total_value: 175116 }
]
const staticMockCagr = 0.13 // 13% annualized return

const effectiveHistoricalData = computed(() => props.isLoggedIn ? historicalData.value : staticMockHistoricalData)

// Fetch real-time performance metrics
const fetchRealTimeMetrics = async () => {
  if (!props.isLoggedIn) return
  
  try {
    const response = await portfolioAPI.getRealTimePerformanceMetrics()
    if (response.data.success) {
      realTimeMetrics.value = response.data.data
    }
  } catch (error) {
    console.error('Error fetching real-time metrics:', error)
  }
}

// Update portfolio history
const updatePortfolioHistory = async () => {
  if (!props.isLoggedIn) return
  
  try {
    await portfolioAPI.updatePortfolioHistory()
  } catch (error) {
    console.error('Error updating portfolio history:', error)
  }
}

const cagr = computed(() => {
  if (!props.isLoggedIn) {
    return staticMockCagr
  }
  return realTimeMetrics.value.cagr || 0
})

const sharpe = computed(() => {
  if (!props.isLoggedIn) {
    const data = effectiveHistoricalData.value
    if (!data || data.length < 2) return 0
    const returns = []
    for (let i = 1; i < data.length; i++) {
      returns.push((data[i].total_value / data[i - 1].total_value) - 1)
    }
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
    const stdDev = Math.sqrt(returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length)
    const riskFreeRate = 0.02
    return stdDev > 0 ? (cagr.value - riskFreeRate) / (stdDev * Math.sqrt(252)) : 0
  }
  return realTimeMetrics.value.sharpeRatio || 0
})

const maxDrawdown = computed(() => {
  if (!props.isLoggedIn) {
    const data = effectiveHistoricalData.value
    if (!data || data.length < 2) return 0
    let maxDd = 0, peak = data[0].total_value
    for (let i = 1; i < data.length; i++) {
      if (data[i].total_value > peak) peak = data[i].total_value
      const drawdown = (peak - data[i].total_value) / peak
      if (drawdown > maxDd) maxDd = drawdown
    }
    return maxDd
  }
  return realTimeMetrics.value.maxDrawdown || 0
})
const dailyReturns = computed(() => {
  const data = effectiveHistoricalData.value
  if (!data || data.length < 2) return []
  const arr = []
  for (let i = 1; i < data.length; i++) {
    arr.push((data[i].total_value / data[i - 1].total_value) - 1)
  }
  return arr
})
const drawdownChartData = computed(() => {
  const data = effectiveHistoricalData.value
  if (!data || data.length < 2) return { labels: [], data: [], drawdownArea: [] }
  let peak = data[0].total_value
  let maxDd = 0, maxDdStart = 0, maxDdEnd = 0
  const drawdowns = []
  for (let i = 0; i < data.length; i++) {
    if (data[i].total_value > peak) peak = data[i].total_value
    const dd = (peak - data[i].total_value) / peak
    drawdowns.push(dd)
    if (dd > maxDd) {
      maxDd = dd
      maxDdEnd = i
    }
  }
  peak = data[0].total_value
  for (let i = 0; i <= maxDdEnd; i++) {
    if (data[i].total_value >= peak) {
      peak = data[i].total_value
      maxDdStart = i
    }
  }
  return {
    labels: data.map(d => d.date),
    data: data.map(d => d.total_value),
    drawdownArea: [maxDdStart, maxDdEnd]
  }
})

const showCagrDialog = ref(false)
const showSharpeDialog = ref(false)
const showDrawdownDialog = ref(false)
const showCreateDialog = ref(false)
const showDetailsDialog = ref(false)
const saving = ref(false)
const creating = ref(false)
const selectedHolding = ref(null)
const createFormRef = ref(null)

// Create form data
const createForm = ref({
  symbol: '',
  name: '',
  quantity: 1,
  purchase_price: 0,
  purchase_date: '',
  sector: '',
  notes: ''
})

// Create form validation rules
const createRules = {
  symbol: [
    { required: true, message: 'Symbol is required', trigger: 'blur' },
    { min: 1, max: 10, message: 'Symbol must be between 1 and 10 characters', trigger: 'blur' }
  ],
  name: [
    { required: true, message: 'Name is required', trigger: 'blur' }
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
    { required: true, message: 'Purchase date is required', trigger: 'blur' }
  ]
}

// Computed properties
const stockPerformance = computed(() => {
  if (!props.isLoggedIn) {
    // mock performance for not logged in
    return {
      total_value: 114392.71,
      total_gain: 21535.79,
      avg_gain_percent: 12.67,
      total_holdings: 10
    }
  }
  if (computedStockHoldings.value.length === 0) return null

  const totalValue = computedStockHoldings.value.reduce((sum, item) => {
    const currentValue = parseFloat(item.current_value) || 0
    return sum + currentValue
  }, 0)

  const totalGain = computedStockHoldings.value.reduce((sum, item) => {
    const unrealizedGain = parseFloat(item.unrealized_gain) || 0
    return sum + unrealizedGain
  }, 0)

  const avgGainPercent = computedStockHoldings.value.length > 0 ?
    computedStockHoldings.value.reduce((sum, item) => {
      const gainPercent = parseFloat(item.gain_percent) || 0
      return sum + gainPercent
    }, 0) / computedStockHoldings.value.length : 0

  return {
    total_value: totalValue,
    total_gain: totalGain,
    avg_gain_percent: avgGainPercent,
    total_holdings: computedStockHoldings.value.length
  }
})

const stockAllocation = computed(() => {
  const allocation = {}

  computedStockHoldings.value.forEach(holding => {
    const sector = holding.sector || 'Other'
    if (!allocation[sector]) {
      allocation[sector] = {
        sector,
        count: 0,
        total_value: 0
      }
    }
    allocation[sector].count++
    const currentValue = parseFloat(holding.current_value) || 0
    allocation[sector].total_value += currentValue
  })

  const totalValue = computedStockHoldings.value.reduce((sum, item) => {
    const currentValue = parseFloat(item.current_value) || 0
    return sum + currentValue
  }, 0)

  return Object.values(allocation)
    .map(item => ({
      ...item,
      percentage: totalValue > 0 ? Math.round((item.total_value / totalValue) * 100) : 0
    }))
    .sort((a, b) => b.total_value - a.total_value)
})

const bestPerformer = computed(() => {
  if (!props.isLoggedIn) {
    // mock best performer for not logged in
    return {
      symbol: 'MSFT',
      gain_percent: 50.00
    }
  }
  if (computedStockHoldings.value.length === 0) return null
  return computedStockHoldings.value.reduce((best, current) => {
    const bestGain = parseFloat(best.gain_percent) || 0
    const currentGain = parseFloat(current.gain_percent) || 0
    return currentGain > bestGain ? current : best
  })
})

const worstPerformer = computed(() => {
  if (!props.isLoggedIn) {
    // mock worst performer for not logged in
    return {
      symbol: 'SH601318',
      gain_percent: -15.01
    }
  }
  if (computedStockHoldings.value.length === 0) return null
  return computedStockHoldings.value.reduce((worst, current) => {
    const worstGain = parseFloat(worst.gain_percent) || 0
    const currentGain = parseFloat(current.gain_percent) || 0
    return currentGain < worstGain ? current : worst
  })
})

const holdingsRealtimePrices = ref({})

const fetchHoldingsRealtimePrices = async () => {
  if (!stockHoldings.value.length) return
  const usSymbols = stockHoldings.value.filter(h => !/^S[HZ]/i.test(h.symbol)).map(h => h.symbol)
  const cnSymbols = stockHoldings.value.filter(h => /^S[HZ]/i.test(h.symbol)).map(h => h.symbol)
  let usPrices = {}, cnPrices = {}
  if (usSymbols.length) {
    const resUs = await marketAPI.getUsMultipleQuotes(usSymbols)
    if (resUs.data && resUs.data.data) {
      for (const item of resUs.data.data) {
        usPrices[item.symbol] = item.currentPrice
      }
    }
  }
  if (cnSymbols.length) {
    const resCn = await marketAPI.getCnMultipleQuotes(cnSymbols)
    if (resCn.data && resCn.data.data) {
      for (const item of resCn.data.data) {
        cnPrices[item.symbol] = item.currentPrice
      }
    }
  }
  
  // 合并价格数据
  const newPrices = { ...usPrices, ...cnPrices }
  
  // 高亮逻辑 - 检查价格变化
  const newHoldingsFlash = {}
  Object.keys(newPrices).forEach(symbol => {
    const prevPrice = prevHoldingsDataMap.value[symbol]
    const currentPrice = newPrices[symbol]
    if (prevPrice !== undefined && prevPrice !== currentPrice) {
      if (currentPrice > prevPrice) {
        newHoldingsFlash[symbol] = 'up'
      } else if (currentPrice < prevPrice) {
        newHoldingsFlash[symbol] = 'down'
      }
    }
  })
  
  // 设置高亮效果
  holdingsRowFlash.value = newHoldingsFlash
  if (Object.keys(newHoldingsFlash).length > 0) {
    setTimeout(() => { holdingsRowFlash.value = {} }, 1000)
  }
  
  // 更新价格映射
  prevHoldingsDataMap.value = { ...newPrices }
  holdingsRealtimePrices.value = newPrices
}

watch(stockHoldings, () => {
  fetchHoldingsRealtimePrices()
})

const computedStockHoldings = computed(() => {
  const result = stockHoldings.value.map(h => {
    const realPrice = holdingsRealtimePrices.value[h.symbol]
    const current_price = (realPrice !== undefined && realPrice !== null) ? realPrice : h.purchase_price
    const current_value = current_price * h.quantity
    const purchase_value = h.purchase_price * h.quantity
    const unrealized_gain = current_value - purchase_value
    const gain_percent = purchase_value > 0 ? (unrealized_gain / purchase_value) * 100 : 0
    return {
      ...h,
      current_price,
      current_value,
      unrealized_gain,
      gain_percent: gain_percent.toFixed(2)
    }
  })
  
  // Group holdings by symbol and aggregate data
  const groupedHoldings = {}
  result.forEach(holding => {
    if (!groupedHoldings[holding.symbol]) {
      groupedHoldings[holding.symbol] = {
        symbol: holding.symbol,
        name: holding.name,
        quantity: 0,
        purchase_value: 0,
        current_value: 0,
        unrealized_gain: 0,
        avg_purchase_price: 0,
        current_price: holding.current_price,
        sector: holding.sector,
        type: holding.type,
        holdings_count: 0,
        individual_holdings: []
      }
    }
    
    const group = groupedHoldings[holding.symbol]
    // Ensure proper number parsing for Avg calculation
    const quantity = parseFloat(holding.quantity) || 0
    const purchase_price = parseFloat(holding.purchase_price) || 0
    const current_price = parseFloat(holding.current_price) || 0
    
    // Calculate values using original data for Avg calculation
    const purchase_value = purchase_price * quantity
    const current_value = current_price * quantity
    const unrealized_gain = current_value - purchase_value
    
    group.quantity += quantity
    group.purchase_value += purchase_value
    group.current_value += current_value
    group.unrealized_gain += unrealized_gain
    group.holdings_count += 1
    group.individual_holdings.push(holding)
  })
  
  // Calculate average purchase price and gain percentage
  Object.values(groupedHoldings).forEach(group => {
    // Ensure proper number calculations
    const quantity = parseFloat(group.quantity) || 0
    const purchase_value = parseFloat(group.purchase_value) || 0
    const unrealized_gain = parseFloat(group.unrealized_gain) || 0
    
    group.avg_purchase_price = quantity > 0 ? purchase_value / quantity : 0
    group.gain_percent = purchase_value > 0 ? (unrealized_gain / purchase_value) * 100 : 0
    group.gain_percent = group.gain_percent.toFixed(2)
    
    // Ensure all values are numbers
    group.quantity = quantity
    group.purchase_value = purchase_value
    group.current_value = parseFloat(group.current_value) || 0
    group.unrealized_gain = unrealized_gain
  })
  
  return Object.values(groupedHoldings)
})

const totalPages = computed(() => Math.ceil(marketData.value.length / pageSize))
const pagedMarketData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const result = marketData.value.slice(start, start + pageSize)
  return result
})

const holdingsTotalPages = computed(() => Math.ceil(stockHoldings.value.length / holdingsPageSize))
const pagedStockHoldings = computed(() => {
  const start = (holdingsCurrentPage.value - 1) * holdingsPageSize
  return stockHoldings.value.slice(start, start + holdingsPageSize)
})

const pagedComputedStockHoldings = computed(() => {
  const start = (holdingsCurrentPage.value - 1) * holdingsPageSize
  return computedStockHoldings.value.slice(start, start + holdingsPageSize)
})

// Methods
const loadStockData = async () => {
  if (!props.isLoggedIn) {
    // Mock data for non-logged in users (more than 10 items to test pagination)
    stockHoldings.value = [
      {
        id: 1,
        symbol: 'AAPL',
        name: 'Apple Inc.',
        quantity: 10,
        purchase_price: 150.00,
        current_price: 214.05,
        current_value: 2140.50,
        purchase_value: 1500.00,
        unrealized_gain: 640.50,
        gain_percent: 42.70,
        sector: 'Technology',
        type: 'stock'
      },
      {
        id: 2,
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        quantity: 5,
        purchase_price: 200.00,
        current_price: 512.50,
        current_value: 2562.50,
        purchase_value: 1000.00,
        unrealized_gain: 1562.50,
        gain_percent: 156.25,
        sector: 'Technology',
        type: 'stock'
      },
      {
        id: 3,
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        quantity: 8,
        purchase_price: 180.00,
        current_price: 192.58,
        current_value: 1540.64,
        purchase_value: 1440.00,
        unrealized_gain: 100.64,
        gain_percent: 6.99,
        sector: 'Technology',
        type: 'stock'
      },
      {
        id: 4,
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        quantity: 3,
        purchase_price: 300.00,
        current_price: 520.00,
        current_value: 1560.00,
        purchase_value: 900.00,
        unrealized_gain: 660.00,
        gain_percent: 73.33,
        sector: 'Technology',
        type: 'stock'
      },
      {
        id: 5,
        symbol: 'AMZN',
        name: 'Amazon.com Inc.',
        quantity: 12,
        purchase_price: 120.00,
        current_price: 185.50,
        current_value: 2226.00,
        purchase_value: 1440.00,
        unrealized_gain: 786.00,
        gain_percent: 54.58,
        sector: 'Consumer',
        type: 'stock'
      },
      {
        id: 6,
        symbol: 'META',
        name: 'Meta Platforms Inc.',
        quantity: 20,
        purchase_price: 200.00,
        current_price: 485.00,
        current_value: 9700.00,
        purchase_value: 4000.00,
        unrealized_gain: 5700.00,
        gain_percent: 142.50,
        sector: 'Technology',
        type: 'stock'
      },
      {
        id: 7,
        symbol: 'NFLX',
        name: 'Netflix Inc.',
        quantity: 8,
        purchase_price: 350.00,
        current_price: 680.00,
        current_value: 5440.00,
        purchase_value: 2800.00,
        unrealized_gain: 2640.00,
        gain_percent: 94.29,
        sector: 'Consumer',
        type: 'stock'
      },
      {
        id: 8,
        symbol: 'JPM',
        name: 'JPMorgan Chase & Co.',
        quantity: 25,
        purchase_price: 140.00,
        current_price: 195.00,
        current_value: 4875.00,
        purchase_value: 3500.00,
        unrealized_gain: 1375.00,
        gain_percent: 39.29,
        sector: 'Financial',
        type: 'stock'
      },
      {
        id: 9,
        symbol: 'JNJ',
        name: 'Johnson & Johnson',
        quantity: 30,
        purchase_price: 160.00,
        current_price: 175.00,
        current_value: 5250.00,
        purchase_value: 4800.00,
        unrealized_gain: 450.00,
        gain_percent: 9.38,
        sector: 'Healthcare',
        type: 'stock'
      },
      {
        id: 10,
        symbol: 'PG',
        name: 'Procter & Gamble Co.',
        quantity: 18,
        purchase_price: 150.00,
        current_price: 165.00,
        current_value: 2970.00,
        purchase_value: 2700.00,
        unrealized_gain: 270.00,
        gain_percent: 10.00,
        sector: 'Consumer',
        type: 'stock'
      },
      {
        id: 11,
        symbol: 'V',
        name: 'Visa Inc.',
        quantity: 22,
        purchase_price: 220.00,
        current_price: 280.00,
        current_value: 6160.00,
        purchase_value: 4840.00,
        unrealized_gain: 1320.00,
        gain_percent: 27.27,
        sector: 'Financial',
        type: 'stock'
      }
    ]
    // Reset pagination for mock data
    holdingsCurrentPage.value = 1
    // Reset holdings data map for proper flash highlighting
    prevHoldingsDataMap.value = {}
    return
  }

  try {
    const response = await portfolioAPI.getHoldings()
    if (response.data.success) {
      const allHoldings = response.data.data
      stockHoldings.value = allHoldings.filter(holding => holding.type === 'stock')
      // Reset pagination when new data is loaded
      holdingsCurrentPage.value = 1
      // Reset holdings data map for proper flash highlighting
      prevHoldingsDataMap.value = {}
      // Fetch real-time metrics after loading holdings
      await fetchRealTimeMetrics()
    }
  } catch (error) {
    console.error('Error loading stock data:', error)
    stockHoldings.value = []
    holdingsCurrentPage.value = 1
    prevHoldingsDataMap.value = {}
  }
}

const fetchMarketData = async () => {
  marketDataLoading.value = true
  try {
    let res
    if (marketType.value === 'us') {
      res = await marketAPI.getUsStockQuotes()
    } else {
      res = await marketAPI.getCnStockQuotes()
    }

    if (res.data && res.data.success && res.data.data) {
      const newData = res.data.data

      // 检查数据格式并确保所有必要字段都存在
      const validData = newData.filter(item => {
        return item &&
          item.symbol &&
          item.name &&
          typeof item.currentPrice === 'number' &&
          typeof item.change === 'number' &&
          typeof item.changePercent === 'number'
      })

      // 高亮逻辑
      const newFlash = {}
      const currentDataMap = marketType.value === 'us' ? prevUsDataMap.value : prevCnDataMap.value
      validData.forEach(item => {
        const prev = currentDataMap[item.symbol]
        if (prev !== undefined && prev !== item.currentPrice) {
          if (item.currentPrice > prev) {
            newFlash[item.symbol] = 'up'
          } else if (item.currentPrice < prev) {
            newFlash[item.symbol] = 'down'
          }
        }
      })
      rowFlash.value = newFlash
      if (Object.keys(newFlash).length > 0) {
        setTimeout(() => { rowFlash.value = {} }, 1000)
      }
      
      // 更新对应的数据映射
      if (marketType.value === 'us') {
        prevUsDataMap.value = Object.fromEntries(validData.map(i => [i.symbol, i.currentPrice]))
      } else {
        prevCnDataMap.value = Object.fromEntries(validData.map(i => [i.symbol, i.currentPrice]))
      }
      
      // Force Vue reactivity by creating a new array
      marketData.value = [...validData]
    } else {
      marketData.value = []
    }
  } catch (e) {
    console.error('Error fetching market data:', e)
    marketData.value = []
  } finally {
    marketDataLoading.value = false
  }
}

const fetchHistoricalData = async () => {
  // Only fetch from backend if user is logged in
  if (!props.isLoggedIn) {
    return
  }
  
  try {
    const res = await http.get('/holdings/historical')
    if (res.data && res.data.data && res.data.data.length > 1) {
      historicalData.value = res.data.data.sort((a, b) => new Date(a.date) - new Date(b.date))
    }
  } catch (e) {
    historicalData.value = []
    console.log('Error fetching historical data:', e)
  }
}

watch(marketType, () => {
  currentPage.value = 1
  // 清除当前的高亮效果
  rowFlash.value = {}
  holdingsRowFlash.value = {}
  fetchMarketData()
})

watch(showCreateDialog, (val) => {
  if (!val) {
    resetCreateForm()
  }
})

// Update details dialog when real-time prices change
watch(holdingsRealtimePrices, () => {
  if (showDetailsDialog.value && selectedHolding.value) {
    // Recalculate the selected holding with new prices
    const holding = computedStockHoldings.value.find(h => h.symbol === selectedHolding.value.symbol)
    if (holding) {
      showHoldingDetails(holding)
    }
  }
})

const updatePrices = async () => {
  try {
    await portfolioAPI.updateCurrentPrices()
    await loadStockData()
  } catch (error) {
    console.error('Error updating prices:', error)
  }
}

const getSectorDescription = (sector) => {
  const descriptions = {
    'Technology': 'Tech companies and software',
    'Healthcare': 'Medical and pharmaceutical',
    'Financial': 'Banks and financial services',
    'Consumer': 'Consumer goods and retail',
    'Energy': 'Oil, gas, and utilities',
    'Industrial': 'Manufacturing and industrial',
    'Other': 'Other sectors'
  }
  return descriptions[sector] || 'Various industries'
}

const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toISOString().slice(0, 10) // YYYY-MM-DD
}

const goToDashboard = () => {
  emit('goToDashboard')
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const holdingsPrevPage = () => {
  if (holdingsCurrentPage.value > 1) holdingsCurrentPage.value--
}

const holdingsNextPage = () => {
  if (holdingsCurrentPage.value < holdingsTotalPages.value) holdingsCurrentPage.value++
}

onMounted(() => {
  loadStockData()
  fetchMarketData()
  fetchHistoricalData()
  fetchHoldingsRealtimePrices()
  fetchRealTimeMetrics()
  updatePortfolioHistory()
  // Update market data every REFRESH_INTERVAL_MS for real-time feel
  timer.value = setInterval(() => {
    fetchMarketData()
    fetchHoldingsRealtimePrices()
    fetchRealTimeMetrics()
  }, REFRESH_INTERVAL_MS)
})

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value)
  if (holdingsPriceTimer) clearInterval(holdingsPriceTimer)
  // 清理数据映射
  prevHoldingsDataMap.value = {}
  prevUsDataMap.value = {}
  prevCnDataMap.value = {}
})

const sharpeChart = ref(null)
const drawdownChart = ref(null)
let sharpeChartInstance = null
let drawdownChartInstance = null

const onSharpeDialogClose = () => {
  if (sharpeChartInstance) {
    sharpeChartInstance.destroy()
    sharpeChartInstance = null
  }
}
const onDrawdownDialogClose = () => {
  if (drawdownChartInstance) {
    drawdownChartInstance.destroy()
    drawdownChartInstance = null
  }
}

watch(showSharpeDialog, async (val) => {
  if (val) {
    await nextTick()
    if (sharpeChartInstance) sharpeChartInstance.destroy()
    if (!sharpeChart.value) return
    const ctx = sharpeChart.value.getContext('2d')
    const returns = dailyReturns.value.map(x => (x * 100).toFixed(2))
    const bins = Array(21).fill(0)
    const min = -10, max = 10, step = 1
    for (let r of returns) {
      const idx = Math.max(0, Math.min(bins.length - 1, Math.floor((r - min) / step)))
      bins[idx]++
    }
    sharpeChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Array.from({length: bins.length}, (_, i) => `${min + i * step}%`),
        datasets: [{
          label: 'Frequency',
          data: bins,
          backgroundColor: '#667eea',
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { title: { display: true, text: 'Daily Return (%)' } },
          y: { title: { display: true, text: 'Frequency' }, beginAtZero: true }
        }
      }
    })
  } else {
    onSharpeDialogClose()
  }
})

watch(showDrawdownDialog, async (val) => {
  if (val) {
    await nextTick()
    if (drawdownChartInstance) drawdownChartInstance.destroy()
    if (!drawdownChart.value) return
    const ctx = drawdownChart.value.getContext('2d')
    const chartData = drawdownChartData.value
    drawdownChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: 'Net Value',
            data: chartData.data,
            borderColor: '#667eea',
            backgroundColor: 'rgba(102,126,234,0.08)',
            borderWidth: 3,
            fill: true,
            pointRadius: 0,
            segment: {
              backgroundColor: ctx => {
                const i = ctx.p0DataIndex
                if (i >= chartData.drawdownArea[0] && i <= chartData.drawdownArea[1]) return 'rgba(245,87,108,0.2)'
                return undefined
              }
            }
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            title: { display: true, text: 'Date' },
            ticks: {
              callback: function(value, index, ticks) {
                const label = chartData.labels[index]
                if (!label) return ''
                // Format as YYYY-MM-DD
                return label.slice(0, 10)
              }
            }
          },
          y: { title: { display: true, text: 'Net Value' }, beginAtZero: false }
        }
      }
    })
  } else {
    onDrawdownDialogClose()
  }
})

const createHolding = async () => {
  if (!createFormRef.value) return
  
  try {
    await createFormRef.value.validate()
  } catch (error) {
    console.log('Form validation failed:', error)
    return
  }
  
  creating.value = true
  try {
    const formData = {
      ...createForm.value,
      type: 'stock'
    }
    await portfolioAPI.createHolding(formData)
    await loadStockData()
    showCreateDialog.value = false
    resetCreateForm()
    ElMessage.success('Holding created successfully!')
  } catch (error) {
    console.error('Error creating holding:', error)
    ElMessage.error('Failed to create holding.')
  } finally {
    creating.value = false
  }
}

const fetchStockInfo = async () => {
  const symbol = createForm.value.symbol.trim().toUpperCase()
  if (!symbol) {
    createForm.value.name = ''
    createForm.value.purchase_price = 0
    return
  }
  
  try {
    // Determine if it's A股 or US stock
    const isAStock = /^S[HZ]/.test(symbol)
    
    if (isAStock) {
      // Fetch A股 data
      const response = await marketAPI.getCnMultipleQuotes([symbol])
      if (response.data && response.data.success && response.data.data.length > 0) {
        const stockData = response.data.data[0]
        createForm.value.name = stockData.name || symbol
        createForm.value.purchase_price = stockData.currentPrice || 0
      } else {
        createForm.value.name = symbol
        createForm.value.purchase_price = 0
      }
    } else {
      // Fetch US stock data
      const response = await marketAPI.getUsMultipleQuotes([symbol])
      if (response.data && response.data.success && response.data.data.length > 0) {
        const stockData = response.data.data[0]
        createForm.value.name = stockData.name || symbol
        createForm.value.purchase_price = stockData.currentPrice || 0
      } else {
        createForm.value.name = symbol
        createForm.value.purchase_price = 0
      }
    }
  } catch (error) {
    console.error('Error fetching stock info:', error)
    // Keep the symbol but set default values
    createForm.value.name = symbol
    createForm.value.purchase_price = 0
  }
}

const resetCreateForm = () => {
  createForm.value = {
    symbol: '',
    name: '',
    quantity: 1,
    purchase_price: 0,
    purchase_date: '',
    sector: '',
    notes: ''
  }
  // Reset form validation
  if (createFormRef.value) {
    createFormRef.value.resetFields()
  }
}

const showHoldingDetails = (holding) => {
  // Get real-time price for this symbol
  const realPrice = holdingsRealtimePrices.value[holding.symbol]
  const current_price = (realPrice !== undefined && realPrice !== null) ? realPrice : holding.current_price
  
  // Process individual holdings to ensure proper calculations
  const processedIndividualHoldings = holding.individual_holdings.map(h => {
    const quantity = parseFloat(h.quantity) || 0
    const purchase_price = parseFloat(h.purchase_price) || 0
    const purchase_value = purchase_price * quantity
    const current_value = current_price * quantity
    const unrealized_gain = current_value - purchase_value
    const gain_percent = purchase_value > 0 ? (unrealized_gain / purchase_value) * 100 : 0
    
    return {
      ...h,
      quantity,
      purchase_price,
      purchase_value,
      current_price,
      current_value,
      unrealized_gain,
      gain_percent: gain_percent.toFixed(2)
    }
  })
  
  // Calculate summary values
  const totalQuantity = processedIndividualHoldings.reduce((sum, h) => sum + h.quantity, 0)
  const totalPurchaseValue = processedIndividualHoldings.reduce((sum, h) => sum + h.purchase_value, 0)
  const totalCurrentValue = processedIndividualHoldings.reduce((sum, h) => sum + h.current_value, 0)
  const totalUnrealizedGain = totalCurrentValue - totalPurchaseValue
  const avgPurchasePrice = totalQuantity > 0 ? totalPurchaseValue / totalQuantity : 0
  const gainPercent = totalPurchaseValue > 0 ? (totalUnrealizedGain / totalPurchaseValue) * 100 : 0
  
  selectedHolding.value = {
    ...holding,
    current_price,
    quantity: totalQuantity,
    purchase_value: totalPurchaseValue,
    current_value: totalCurrentValue,
    unrealized_gain: totalUnrealizedGain,
    avg_purchase_price: avgPurchasePrice,
    gain_percent: gainPercent.toFixed(2),
    individual_holdings: processedIndividualHoldings
  }
  showDetailsDialog.value = true
}

const sellHolding = async (holding) => {
  const symbol = holding.symbol
  const quantityToSell = holding.quantity
  const currentPrice = holdingsRealtimePrices.value[symbol] || holding.current_price

  if (quantityToSell <= 0) {
    ElMessage.warning('Please select a positive quantity to sell.')
    return
  }

  if (currentPrice <= 0) {
    ElMessage.error('Cannot sell at a price of 0 or less.')
    return
  }

  const confirm = await ElMessageBox.confirm(
    `Are you sure you want to sell ${quantityToSell} shares of ${symbol} at $${currentPrice.toFixed(2)}?`,
    'Confirm Sale',
    {
      confirmButtonText: 'Sell',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  ).catch(() => false)

  if (confirm) {
    try {
      // For single holdings, we need to find the actual holding ID
      const actualHolding = holding.individual_holdings ? holding.individual_holdings[0] : holding
      await portfolioAPI.deleteHolding(actualHolding.id)
      
      await loadStockData()
      ElMessage.success(`Sold ${quantityToSell} shares of ${symbol} for $${(quantityToSell * currentPrice).toFixed(2)}`)
    } catch (error) {
      console.error('Error selling holding:', error)
      ElMessage.error('Failed to sell holding.')
    }
  }
}

const sellIndividualHolding = async (holding) => {
  const symbol = holding.symbol
  const quantityToSell = holding.quantity
  const currentPrice = holdingsRealtimePrices.value[symbol] || holding.current_price

  if (quantityToSell <= 0) {
    ElMessage.warning('Please select a positive quantity to sell.')
    return
  }

  if (currentPrice <= 0) {
    ElMessage.error('Cannot sell at a price of 0 or less.')
    return
  }

  const confirm = await ElMessageBox.confirm(
    `Are you sure you want to sell ${quantityToSell} shares of ${symbol} at $${currentPrice.toFixed(2)}?`,
    'Confirm Sale',
    {
      confirmButtonText: 'Sell',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  ).catch(() => false)

  if (confirm) {
    try {
      await portfolioAPI.deleteHolding(holding.id)
      await loadStockData()
      ElMessage.success(`Sold ${quantityToSell} shares of ${symbol} for $${(quantityToSell * currentPrice).toFixed(2)}`)
    } catch (error) {
      console.error('Error selling individual holding:', error)
      ElMessage.error('Failed to sell individual holding.')
    }
  }
}
</script>

<style scoped>
.market-type-toggle {
  display: flex;
  gap: 8px;
  margin-right: 16px;
}

.market-type-btn {
  background: #f8f9fa;
  border: 1px solid #d1d5db;
  color: #2c3e50;
  font-weight: 600;
  padding: 6px 18px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border 0.2s;
  outline: none;
}

.market-type-btn.active {
  background: #667eea;
  color: #fff;
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.08);
}

.market-type-btn:hover:not(.active) {
  background: #e0e7ff;
  color: #2c3e50;
  border-color: #a5b4fc;
}

.stock-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.stock-categories {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 50px;
}

.category-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 32px 24px;
  border-radius: 16px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.3);
}

.category-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.category-card h3 {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.category-card p {
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 20px;
  line-height: 1.5;
}

.category-metrics {
  display: flex;
  justify-content: space-around;
  gap: 16px;
}

.positive {
  color: #27ae60;
}

.negative {
  color: #e74c3c;
}

/* Component-specific styles only */

.card-subtitle {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.stock-allocation {
  text-align: center;
}

.stock-allocation h2 {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 24px;
}

.allocation-chart {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

.allocation-item {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.allocation-label {
  display: flex;
  flex-direction: column;
  min-width: 120px;
}

.allocation-sector {
  font-weight: 600;
  color: #2c3e50;
}

.allocation-count {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.allocation-bar {
  flex: 1;
  height: 20px;
  background: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
}

.allocation-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.allocation-value {
  min-width: 120px;
  text-align: right;
  font-weight: 600;
  color: #2c3e50;
}

@media (max-width: 768px) {
  .stock-categories {
    grid-template-columns: repeat(2, 1fr);
  }

  .section-header h1 {
    font-size: 2rem;
  }

  .performance-cards {
    grid-template-columns: 1fr;
  }

  .market-table-wrapper {
    overflow-x: auto;
  }

  .market-table {
    min-width: 600px;
  }

  .allocation-item {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .allocation-value {
    text-align: left;
  }
}
</style>