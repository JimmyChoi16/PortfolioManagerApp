<template>
  <div class="stock-section">
    <!-- Header -->
    <div class="section-header">
      <h1>Stock Portfolio</h1>
      <p>Track and analyze your stock investments with real-time market data</p>
    </div>

    <!-- Stock Categories Overview -->
    <div class="stock-categories" v-if="stockAllocation.length > 0">
      <div 
        v-for="category in stockAllocation" 
        :key="category.sector"
        class="category-card"
      >
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
        <el-icon><Plus /></el-icon>
        Add Stock Holding
      </el-button>
    </div>

    <!-- Real-time Market Data -->
    <div class="market-data">
      <h2>Real-time Market Data</h2>
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
            <tr
              v-for="item in pagedMarketData"
              :key="item.symbol"
              @mouseover="hoveredRow = item.symbol"
              @mouseleave="hoveredRow = null"
              :class="[
                { hovered: hoveredRow === item.symbol },
                rowFlash[item.symbol] === 'up' ? 'flash-up' : '',
                rowFlash[item.symbol] === 'down' ? 'flash-down' : ''
              ]"
            >
              <td>{{ item.symbol }}</td>
              <td>{{ item.name }}</td>
              <td>${{ item.currentPrice }}</td>
              <td :class="{ up: item.change > 0, down: item.change < 0 }">
                {{ item.change > 0 ? '+' : '' }}{{ item.change }}
              </td>
              <td :class="{ up: item.change > 0, down: item.change < 0 }">
                {{ item.change > 0 ? '+' : '' }}{{ item.changePercent }}%
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

    <!-- Your Stock Holdings -->
    <div class="holdings-data" v-if="stockHoldings.length > 0">
      <h2>Your Stock Holdings</h2>
      <div class="market-table-wrapper">
        <table class="market-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Name</th>
              <th>Quantity</th>
              <th>Current Price</th>
              <th>Current Value</th>
              <th>Gain/Loss</th>
              <th>Gain/Loss %</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in stockHoldings"
              :key="item.symbol"
              @mouseover="hoveredRow = item.symbol"
              @mouseleave="hoveredRow = null"
              :class="[
                { hovered: hoveredRow === item.symbol },
                rowFlash[item.symbol] === 'up' ? 'flash-up' : '',
                rowFlash[item.symbol] === 'down' ? 'flash-down' : ''
              ]"
            >
              <td>{{ item.symbol }}</td>
              <td>{{ item.name }}</td>
              <td>{{ formatNumber(item.quantity) }}</td>
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
    </div>

    <!-- Portfolio Performance -->
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

    <!-- Stock Allocation Chart -->
    <div class="stock-allocation" v-if="stockAllocation.length > 0">
      <h2>Stock Allocation by Sector</h2>
      <div class="allocation-chart">
        <div
          v-for="item in stockAllocation"
          :key="item.sector"
          class="allocation-item"
        >
          <div class="allocation-label">
            <span class="allocation-sector">{{ item.sector || 'Other' }}</span>
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
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import portfolioAPI from '../api/portfolio.js'
import marketAPI from '../api/market.js'

const emit = defineEmits(['goToDashboard'])

const hoveredRow = ref(null)
const stockHoldings = ref([])
const marketData = ref([])
const rowFlash = ref({})
const prevDataMap = ref({})
const timer = ref(null)
const currentPage = ref(1)
const pageSize = 10

// Computed properties
const stockPerformance = computed(() => {
  if (stockHoldings.value.length === 0) return null
  
  const totalValue = stockHoldings.value.reduce((sum, item) => sum + item.current_value, 0)
  const totalGain = stockHoldings.value.reduce((sum, item) => sum + item.unrealized_gain, 0)
  const avgGainPercent = stockHoldings.value.reduce((sum, item) => sum + item.gain_percent, 0) / stockHoldings.value.length
  
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
    allocation[sector].total_value += holding.current_value
  })
  
  const totalValue = stockHoldings.value.reduce((sum, item) => sum + item.current_value, 0)
  
  return Object.values(allocation)
    .map(item => ({
      ...item,
      percentage: totalValue > 0 ? Math.round((item.total_value / totalValue) * 100) : 0
    }))
    .sort((a, b) => b.total_value - a.total_value)
})

const bestPerformer = computed(() => {
  if (stockHoldings.value.length === 0) return null
  return stockHoldings.value.reduce((best, current) => 
    current.gain_percent > best.gain_percent ? current : best
  )
})

const worstPerformer = computed(() => {
  if (stockHoldings.value.length === 0) return null
  return stockHoldings.value.reduce((worst, current) => 
    current.gain_percent < worst.gain_percent ? current : worst
  )
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

// Methods
const loadStockData = async () => {
  try {
    const response = await portfolioAPI.getHoldings()
    if (response.data.success) {
      const allHoldings = response.data.data
      stockHoldings.value = allHoldings.filter(holding => holding.type === 'stock')
    }
  } catch (error) {
    console.error('Error loading stock data:', error)
    stockHoldings.value = []
  }
}

const fetchMarketData = async () => {
  try {
    const res = await marketAPI.getPublicQuotes()
    console.log('marketAPI.getPublicQuotes() response:', res)
    console.log('res.success:', res.success)
    console.log('res.data:', res.data)
    
    if (res.success && res.data) {
      const newData = res.data
      console.log('newData length:', newData.length)
      console.log('newData[0]:', newData[0])
      
      // 检查数据格式
      newData.forEach((item, index) => {
        console.log(`Item ${index}:`, {
          symbol: item.symbol,
          name: item.name,
          currentPrice: item.currentPrice,
          change: item.change,
          changePercent: item.changePercent
        })
      })
      
      // 高亮逻辑
      const newFlash = {}
      newData.forEach(item => {
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
      prevDataMap.value = Object.fromEntries(newData.map(i => [i.symbol, i.currentPrice]))
      marketData.value = newData
      console.log('marketData.value set to:', marketData.value)
    } else {
      console.log('API response not successful:', res)
    }
  } catch (e) {
    console.error('Error fetching market data:', e)
    marketData.value = []
  }
}

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

// Lifecycle
onMounted(() => {
  loadStockData()
  fetchMarketData()
  // Update data every 30 seconds
  timer.value = setInterval(() => {
    updatePrices()
    fetchMarketData()
  }, 30000)
})

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value)
})
</script>

<style scoped>
.stock-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.section-header {
  text-align: center;
  margin-bottom: 50px;
}

.section-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 16px;
}

.section-header p {
  font-size: 1.2rem;
  color: #7f8c8d;
  max-width: 600px;
  margin: 0 auto;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  margin-bottom: 50px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 24px;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin-bottom: 32px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
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

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.metric .label {
  font-size: 0.85rem;
  opacity: 0.8;
  margin-bottom: 4px;
}

.metric .value {
  font-size: 1.2rem;
  font-weight: 700;
}

.positive {
  color: #27ae60;
}

.negative {
  color: #e74c3c;
}

.market-data,
.holdings-data {
  margin-bottom: 50px;
}

.market-data h2,
.holdings-data h2 {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 24px;
  text-align: center;
}

.market-table-wrapper {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.market-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1rem;
}

.market-table th,
.market-table td {
  padding: 16px 20px;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

.market-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

.market-table tr {
  transition: background 0.18s;
}

.market-table tr.hovered {
  background: #f8f9fa;
}

.market-table td.up {
  color: #27ae60;
  font-weight: 600;
}

.market-table td.down {
  color: #e74c3c;
  font-weight: 600;
}

.flash-up {
  animation: flashUp 1s;
  background: #e6fbe6 !important;
}

.flash-down {
  animation: flashDown 1s;
  background: #ffeaea !important;
}

@keyframes flashUp {
  0% { background: #e6fbe6; }
  100% { background: transparent; }
}

@keyframes flashDown {
  0% { background: #ffeaea; }
  100% { background: transparent; }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8f9fa;
}

.pagination button {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}

.pagination button:hover:not(:disabled) {
  background: #5a6fd8;
}

.pagination button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.pagination span {
  font-weight: 600;
  color: #2c3e50;
}

.portfolio-performance {
  margin-bottom: 50px;
}

.portfolio-performance h2 {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 32px;
  text-align: center;
}

.performance-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.performance-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.3s ease;
}

.performance-card:hover {
  transform: translateY(-4px);
}

.card-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.card-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.card-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
}

.card-change {
  font-size: 0.9rem;
  font-weight: 600;
}

.card-change.positive {
  color: #27ae60;
}

.card-change.negative {
  color: #e74c3c;
}

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