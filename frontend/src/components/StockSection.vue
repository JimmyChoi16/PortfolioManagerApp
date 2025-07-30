<template>
  <div class="stock-section">
    <!-- Login Warning -->
    <div v-if="!isLoggedIn" class="login-warning">
      <el-alert
        title="⚠️ You are not logged in. All data shown is for demonstration purposes only."
        type="warning"
        :closable="false"
        show-icon
      />
    </div>

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
      <div class="market-header">
        <h2>Real-time Market Data</h2>
        <el-button @click="fetchMarketData" :loading="marketDataLoading" size="small">
          <el-icon><Refresh /></el-icon>
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
                <el-icon class="is-loading"><Loading /></el-icon>
                <span style="margin-left: 8px;">Loading market data...</span>
              </td>
            </tr>
            <tr v-else-if="!marketDataLoading && pagedMarketData.length === 0">
              <td colspan="5" style="text-align: center; padding: 40px; color: #7f8c8d;">
                <div>No market data available</div>
                <div style="font-size: 0.9rem; margin-top: 8px;">Try refreshing the data</div>
              </td>
            </tr>
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
              v-for="item in pagedStockHoldings"
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
      
      <!-- Holdings Pagination -->
      <div class="pagination" v-if="holdingsTotalPages > 1">
        <el-button 
          @click="holdingsPrevPage" 
          :disabled="holdingsCurrentPage === 1"
          size="small"
        >
          Previous
        </el-button>
        <span>Page {{ holdingsCurrentPage }} of {{ holdingsTotalPages }}</span>
        <el-button 
          @click="holdingsNextPage" 
          :disabled="holdingsCurrentPage === holdingsTotalPages"
          size="small"
        >
          Next
        </el-button>
      </div>
    </div>

    <!-- Portfolio Performance -->
    <div class="portfolio-performance" v-if="stockPerformance">
      <h2>Stock Portfolio Performance</h2>
      <div class="performance-cards">
        <div class="performance-card">
          <div class="card-icon">
            <img class="performance-icon-img" src="@/assets/bar_chart.png" alt="Bar Chart" />
          </div>
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
          <div class="card-icon">
            <img class="performance-icon-img" src="@/assets/line_chart.png" alt="Line Chart" />
          </div>
          <div class="card-content">
            <h4>Total Holdings</h4>
            <p class="card-value">{{ stockPerformance.total_holdings }}</p>
            <span class="card-subtitle">Stock positions</span>
          </div>
        </div>
        
        <div class="performance-card"> 
          <div class="card-icon">
            <img class="performance-icon-img" src="@/assets/trophy-line.png" alt="Trophy line" />
          </div>
          
          <div class="card-content">
            <h4>Best Performer</h4>
            <p class="card-value">{{ bestPerformer?.symbol || 'N/A' }}</p>
            <span class="card-change positive" v-if="bestPerformer">
              +{{ bestPerformer.gain_percent }}%
            </span>
          </div>
        </div>
        
        <div class="performance-card">
          <div class="card-icon">
            <img class="performance-icon-img" src="@/assets/loss.png" alt="Loss" />
          </div>
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
import { Plus, Refresh, Loading } from '@element-plus/icons-vue'
import portfolioAPI from '../api/portfolio.js'
import marketAPI from '../api/market.js'

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

// Computed properties
const stockPerformance = computed(() => {
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
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        quantity: 15,
        purchase_price: 180.00,
        current_price: 325.59,
        current_value: 4883.85,
        purchase_value: 2700.00,
        unrealized_gain: 2183.85,
        gain_percent: 80.88,
        sector: 'Automotive',
        type: 'stock'
      },
      {
        id: 6,
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
        id: 7,
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
        id: 8,
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
        id: 9,
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
        id: 10,
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
        id: 11,
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
        id: 12,
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
    const res = await marketAPI.getPublicQuotes()
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

// Lifecycle
onMounted(() => {
  loadStockData()
  fetchMarketData()
  // Update data every 10 seconds for real-time feel
  timer.value = setInterval(() => {
    fetchMarketData()
  }, 10000)
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

.stock-categories {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 50px;
}

.category-card {
  background: linear-gradient(135deg, #6A95CC 0%, #53A7D8 100%);
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

.category-icon-img {
  width: 48px;
  height: 48px;
  object-fit: contain;
  display: block;
  margin: 0 auto 8px auto;
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
  background: linear-gradient(135deg, #6A95CC 0%, #53A7D8 100%);
  transition: width 0.3s ease;
}

.allocation-value {
  min-width: 120px;
  text-align: right;
  font-weight: 600;
  color: #2c3e50;
}

.performance-icon-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  display: block;
  margin: 0 auto 8px auto;
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