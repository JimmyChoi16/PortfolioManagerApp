// TODO: Haven't implemented CRUD for stock holdings yet.
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
    <div class="holdings-data" v-if="stockHoldings.length > 0 && isLoggedIn">
      <h2>Your Real-time Stock Holdings</h2>
      <div class="market-table-wrapper">
        <table class="market-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Name</th>
              <th>Quantity</th>
              <th>Purchase Price</th>
              <th>Current Price</th>
              <th>Current Value</th>
              <th>Gain/Loss</th>
              <th>Gain/Loss %</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in pagedComputedStockHoldings" :key="item.symbol" @mouseover="hoveredRow = item.symbol"
              @mouseleave="hoveredRow = null" :class="[
                { hovered: hoveredRow === item.symbol },
                rowFlash[item.symbol] === 'up' ? 'flash-up' : '',
                rowFlash[item.symbol] === 'down' ? 'flash-down' : ''
              ]">
              <td>{{ item.symbol }}</td>
              <td>{{ item.name }}</td>
              <td>{{ formatNumber(item.quantity) }}</td>
              <td>${{ formatNumber(item.purchase_price) }}</td>
              <td>${{ formatNumber(item.current_price) }}</td>
              <td>${{ formatNumber(item.current_value) }}</td>
              <td :class="{ up: item.unrealized_gain > 0, down: item.unrealized_gain < 0 }">
                {{ item.unrealized_gain > 0 ? '+' : '' }}${{ formatNumber(item.unrealized_gain) }}
              </td>
              <td :class="{ up: item.gain_percent > 0, down: item.gain_percent < 0 }">
                {{ item.gain_percent > 0 ? '+' : '' }}{{ item.gain_percent }}%
              </td>
            </tr>
          </tbody>
        </table>
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
import { Plus, Refresh, Loading } from '@element-plus/icons-vue'
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
const prevDataMap = ref({})
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

const cagr = computed(() => {
  if (!props.isLoggedIn) {
    return staticMockCagr
  }
  const data = effectiveHistoricalData.value
  if (!data || data.length < 2) return 0
  const startValue = data[0].total_value
  const endValue = data[data.length - 1].total_value
  const years = (new Date(data[data.length - 1].date) - new Date(data[0].date)) / (365 * 24 * 3600 * 1000)
  if (startValue <= 0 || years <= 0) return 0
  return Math.pow(endValue / startValue, 1 / years) - 1
})
const sharpe = computed(() => {
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
})
const maxDrawdown = computed(() => {
  const data = effectiveHistoricalData.value
  if (!data || data.length < 2) return 0
  let maxDd = 0, peak = data[0].total_value
  for (let i = 1; i < data.length; i++) {
    if (data[i].total_value > peak) peak = data[i].total_value
    const drawdown = (peak - data[i].total_value) / peak
    if (drawdown > maxDd) maxDd = drawdown
  }
  return maxDd
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

// Computed properties
const stockPerformance = computed(() => {
  if (!props.isLoggedIn) {
    // mock performance for not logged in
    return {
      total_value: 150000,
      total_gain: 50000,
      avg_gain_percent: 50,
      total_holdings: 5
    }
  }
  if (stockHoldings.value.length === 0) return null

  const totalValue = stockHoldings.value.reduce((sum, item) => {
    const currentValue = parseFloat(item.current_value) || 0
    return sum + currentValue
  }, 0)

  const totalGain = stockHoldings.value.reduce((sum, item) => {
    const unrealizedGain = parseFloat(item.unrealized_gain) || 0
    return sum + unrealizedGain
  }, 0)

  const avgGainPercent = stockHoldings.value.length > 0 ?
    stockHoldings.value.reduce((sum, item) => {
      const gainPercent = parseFloat(item.gain_percent) || 0
      return sum + gainPercent
    }, 0) / stockHoldings.value.length : 0

  return {
    total_value: totalValue,
    total_gain: totalGain,
    avg_gain_percent: avgGainPercent,
    total_holdings: stockHoldings.value.length
  }
})

const stockAllocation = computed(() => {
  const allocation = {}

  stockHoldings.value.forEach(holding => {
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

  const totalValue = stockHoldings.value.reduce((sum, item) => {
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
  if (stockHoldings.value.length === 0) return null
  return stockHoldings.value.reduce((best, current) => {
    const bestGain = parseFloat(best.gain_percent) || 0
    const currentGain = parseFloat(current.gain_percent) || 0
    return currentGain > bestGain ? current : best
  })
})

const worstPerformer = computed(() => {
  if (stockHoldings.value.length === 0) return null
  return stockHoldings.value.reduce((worst, current) => {
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
  holdingsRealtimePrices.value = { ...usPrices, ...cnPrices }
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
  console.log('computedStockHoldings:', result)
  return result
})

const totalPages = computed(() => Math.ceil(marketData.value.length / pageSize))
const pagedMarketData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const result = marketData.value.slice(start, start + pageSize)
  console.log('pagedMarketData computed:', {
    marketDataLength: marketData.value.length,
    currentPage: currentPage.value,
    pageSize: pageSize,
    start: start,
    resultLength: result.length,
    result: result
  })
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
    return
  }

  try {
    const response = await portfolioAPI.getHoldings()
    if (response.data.success) {
      const allHoldings = response.data.data
      stockHoldings.value = allHoldings.filter(holding => holding.type === 'stock')
      // Reset pagination when new data is loaded
      holdingsCurrentPage.value = 1
    }
  } catch (error) {
    console.error('Error loading stock data:', error)
    stockHoldings.value = []
    holdingsCurrentPage.value = 1
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
    console.log('marketAPI.getPublicQuotes() response:', res)

    if (res.data && res.data.success && res.data.data) {
      const newData = res.data.data
      console.log('newData length:', newData.length)
      console.log('newData[0]:', newData[0])

      // 检查数据格式并确保所有必要字段都存在
      const validData = newData.filter(item => {
        return item &&
          item.symbol &&
          item.name &&
          typeof item.currentPrice === 'number' &&
          typeof item.change === 'number' &&
          typeof item.changePercent === 'number'
      })

      console.log('validData length:', validData.length)

      // 高亮逻辑
      const newFlash = {}
      validData.forEach(item => {
        const prev = prevDataMap.value[item.symbol]
        if (prev !== undefined && prev !== item.currentPrice) {
          if (item.currentPrice > prev) newFlash[item.symbol] = 'up'
          else if (item.currentPrice < prev) newFlash[item.symbol] = 'down'
        }
      })
      rowFlash.value = newFlash
      if (Object.keys(newFlash).length > 0) {
        setTimeout(() => { rowFlash.value = {} }, 1000)
      }
      prevDataMap.value = Object.fromEntries(validData.map(i => [i.symbol, i.currentPrice]))
      // Force Vue reactivity by creating a new array
      marketData.value = [...validData]
      console.log('marketData.value set to:', marketData.value)
      console.log('marketData.value length:', marketData.value.length)
    } else {
      console.log('API response not successful:', res)
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
    console.log('User not logged in, using mock data')
    return
  }
  
  try {
    const res = await http.get('/holdings/historical')
    if (res.data && res.data.data && res.data.data.length > 1) {
      historicalData.value = res.data.data.sort((a, b) => new Date(a.date) - new Date(b.date))
      console.log('historicalData after fetch:', historicalData.value)
      // Calculate metrics
      const data = historicalData.value
      const initialValue = data[0].total_value
      const finalValue = data[data.length - 1].total_value
      const years = (new Date(data[data.length - 1].date) - new Date(data[0].date)) / (365 * 24 * 3600 * 1000)
      // cagr.value = years > 0 ? Math.pow(finalValue / initialValue, 1 / years) - 1 : 0
      // Daily returns
      // const returns = []
      // for (let i = 1; i < data.length; i++) {
      //   returns.push((data[i].total_value / data[i - 1].total_value) - 1)
      // }
      // const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
      // const stdDev = Math.sqrt(returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length)
      // const riskFreeRate = 0.02
      // sharpe.value = stdDev > 0 ? (cagr.value - riskFreeRate) / (stdDev * Math.sqrt(252)) : 0
      // Max Drawdown
      // let maxDd = 0, peak = initialValue
      // for (let i = 1; i < data.length; i++) {
      //   if (data[i].total_value > peak) peak = data[i].total_value
      //   const drawdown = (peak - data[i].total_value) / peak
      //   if (drawdown > maxDd) maxDd = drawdown
      // }
      // maxDrawdown.value = maxDd
    }
  } catch (e) {
    historicalData.value = []
    console.log('Error fetching historical data:', e)
    // cagr.value = 0
    // sharpe.value = 0
    // maxDrawdown.value = 0
  }
}

watch(marketType, () => {
  currentPage.value = 1
  fetchMarketData()
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
  // Update market data every REFRESH_INTERVAL_MS for real-time feel
  timer.value = setInterval(() => {
    fetchMarketData()
    fetchHoldingsRealtimePrices()
  }, REFRESH_INTERVAL_MS)
})

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value)
  if (holdingsPriceTimer) clearInterval(holdingsPriceTimer)
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