<template>
  <div class="stock-section">
    <!-- Header -->
    <div class="section-header">
      <h1>Stock Portfolio</h1>
      <p>Track and analyze your stock investments with real-time market data</p>
      <div class="login-notice">
        <p>⚠️ You are not logged in. All data shown is for demonstration purposes only.</p>
      </div>
    </div>

    <!-- Stock Categories Overview -->
     <!-- TODO: Need to change to mock data, will show the real after login sucessfully -->
    <div class="stock-categories">
      <div class="category-card">
        <div class="category-icon">📈</div>
        <h3>Large Cap</h3>
        <p>Blue-chip stocks with stable growth</p>
        <div class="category-metrics">
          <div class="metric">
            <span class="label">Holdings</span>
            <span class="value">8 stocks</span>
          </div>
          <div class="metric">
            <span class="label">YTD Return</span>
            <span class="value positive">+12.5%</span>
          </div>
        </div>
      </div>
      
      <div class="category-card">
        <div class="category-icon">🚀</div>
        <h3>Growth Stocks</h3>
        <p>High-growth potential companies</p>
        <div class="category-metrics">
          <div class="metric">
            <span class="label">Holdings</span>
            <span class="value">5 stocks</span>
          </div>
          <div class="metric">
            <span class="label">YTD Return</span>
            <span class="value positive">+18.2%</span>
          </div>
        </div>
      </div>
      
      <div class="category-card">
        <div class="category-icon">💰</div>
        <h3>Dividend Stocks</h3>
        <p>Income-generating investments</p>
        <div class="category-metrics">
          <div class="metric">
            <span class="label">Holdings</span>
            <span class="value">6 stocks</span>
          </div>
          <div class="metric">
            <span class="label">Dividend Yield</span>
            <span class="value">3.8%</span>
          </div>
        </div>
      </div>
      
      <div class="category-card">
        <div class="category-icon">🌍</div>
        <h3>International</h3>
        <p>Global diversification opportunities</p>
        <div class="category-metrics">
          <div class="metric">
            <span class="label">Holdings</span>
            <span class="value">4 stocks</span>
          </div>
          <div class="metric">
            <span class="label">YTD Return</span>
            <span class="value positive">+8.7%</span>
          </div>
        </div>
      </div>
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
              v-for="item in pagedData"
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
                {{ item.change > 0 ? '+' : '' }}{{ ((item.change / (item.currentPrice - item.change)) * 100).toFixed(2) }}%
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

    <!-- Portfolio Performance -->
    <div class="portfolio-performance">
      <h2>Portfolio Performance</h2>
      <div class="performance-cards">
        <div class="performance-card">
          <div class="card-icon">📊</div>
          <div class="card-content">
            <h4>Total Value</h4>
            <p class="card-value">$125,450</p>
            <span class="card-change positive">+$8,250 (7.0%)</span>
          </div>
        </div>
        
        <div class="performance-card">
          <div class="card-icon">📈</div>
          <div class="card-content">
            <h4>Today's Gain</h4>
            <p class="card-value">$1,850</p>
            <span class="card-change positive">+1.5%</span>
          </div>
        </div>
        
        <div class="performance-card">
          <div class="card-icon">🎯</div>
          <div class="card-content">
            <h4>Best Performer</h4>
            <p class="card-value">NVDA</p>
            <span class="card-change positive">+15.2%</span>
          </div>
        </div>
        
        <div class="performance-card">
          <div class="card-icon">📉</div>
          <div class="card-content">
            <h4>Worst Performer</h4>
            <p class="card-value">TSLA</p>
            <span class="card-change negative">-3.8%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Stock Allocation Chart -->
    <div class="stock-allocation">
      <h2>Stock Allocation</h2>
      <div class="allocation-chart">
        <div class="chart-placeholder">
          <div class="chart-icon">📊</div>
          <p>Stock Allocation Chart</p>
          <span>Visual breakdown of your stock portfolio by sector and market cap</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

const hoveredRow = ref(null)
const marketData = ref([])
const rowFlash = ref({})
const prevDataMap = ref({})
const currentPage = ref(1)
const pageSize = 10
const timer = ref(null)

const fetchMarketData = async () => {
  try {
    const res = await axios.get('/api/market/public-quotes')
    if (res.data && res.data.success) {
      const newData = res.data.data
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
    }
  } catch (e) {
    marketData.value = []
  }
}

onMounted(() => {
  fetchMarketData()
  timer.value = setInterval(fetchMarketData, 10000)
})

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value)
})

const totalPages = computed(() => Math.ceil(marketData.value.length / pageSize))
const pagedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return marketData.value.slice(start, start + pageSize)
})

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}
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

.login-notice {
  margin-top: 20px;
  padding: 12px 20px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.login-notice p {
  margin: 0;
  color: #856404;
  font-size: 0.9rem;
  font-weight: 500;
}

.stock-categories {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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

.market-data {
  margin-bottom: 50px;
}

.market-data h2 {
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
  padding: 60px 20px;
}

.chart-placeholder {
  color: #7f8c8d;
}

.chart-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.chart-placeholder p {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #2c3e50;
}

.chart-placeholder span {
  font-size: 1rem;
  opacity: 0.8;
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
}
</style> 