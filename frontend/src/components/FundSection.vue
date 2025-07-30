<template>
  <div class="fund-section">
    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>Loading fund data...</span>
    </div>

    <!-- Header -->
    <div class="section-header">
      <h1>📊 Fund Management</h1>
      <p>Track and manage your investment funds with real-time data and insights</p>
      <div class="login-notice">
        <p>⚠️ You are not logged in. All data shown is for demonstration purposes only.</p>
      </div>
    </div>

    <!-- Search & Filter Bar -->
    <div class="search-filter-bar">
      <div class="search-section">
        <el-input
          v-model="searchQuery"
          placeholder="🔍 Search funds by name or ticker..."
          prefix-icon="Search"
          clearable
          @input="handleSearch"
        />
      </div>
      
      <div class="filter-section">
        <el-select v-model="selectedCategory" placeholder="All Categories" @change="handleFilter">
          <el-option label="All Categories" value="" />
          <el-option label="Index Funds" value="index" />
          <el-option label="Active Funds" value="active" />
          <el-option label="International" value="international" />
          <el-option label="Sector Funds" value="sector" />
          <el-option label="Bond Funds" value="bond" />
          <el-option label="Growth Funds" value="growth" />
        </el-select>
        
        <el-select v-model="sortBy" placeholder="Sort by" @change="handleSort">
          <el-option label="Sort by Name" value="name" />
          <el-option label="Sort by Ticker" value="symbol" />
          <el-option label="Sort by Value" value="value" />
          <el-option label="Sort by YTD" value="ytd" />
          <el-option label="Sort by 1Y" value="1y" />
        </el-select>
        
        <div class="view-toggle">
          <el-radio-group v-model="viewMode" @change="handleViewChange">
            <el-radio-button label="table">Table View</el-radio-button>
            <el-radio-button label="cards">Card View</el-radio-button>
          </el-radio-group>
        </div>
      </div>
      
      <div class="quick-stats">
        <span>📊 Quick Stats: {{ filteredFunds.length }} Funds | ${{ totalValue.toLocaleString() }} Total | {{ totalYTD }}% YTD</span>
      </div>
    </div>

    <!-- Fund Categories Grid -->
    <div class="fund-categories">
      <div 
        v-for="category in fundCategories" 
        :key="category.type"
        class="fund-category-card"
        :class="{ active: selectedCategory === category.type }"
        @click="selectCategory(category.type)"
      >
        <div class="category-icon">{{ getCategoryIcon(category.type) }}</div>
        <h3>{{ getCategoryName(category.type) }}</h3>
        <p>{{ getCategoryDescription(category.type) }}</p>
        <div class="category-stats">
          <div class="stat-item">
            <span class="stat-label">Fund Count</span>
            <span class="stat-value">{{ category.count }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total Value</span>
            <span class="stat-value">${{ category.value.toLocaleString() }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">YTD Return</span>
            <span class="stat-value" :class="category.ytd >= 0 ? 'positive' : 'negative'">
              {{ category.ytd >= 0 ? '+' : '' }}{{ category.ytd }}%
            </span>
          </div>
        </div>
        <div class="category-actions">
          <el-button size="small" type="primary" plain @click.stop="viewCategoryFunds(category.type)">
            View Funds
          </el-button>
        </div>
      </div>
    </div>

    <!-- Fund Performance Table -->
    <div class="fund-performance">
      <div class="performance-header">
        <h2>Fund Performance List</h2>
        <div class="performance-actions">
          <el-button type="primary" @click="refreshData">
            <el-icon><Refresh /></el-icon>
            Refresh Data
          </el-button>
          <el-button @click="exportData">
            <el-icon><Download /></el-icon>
            Export Data
          </el-button>
        </div>
      </div>

      <div class="performance-table">
        <el-table 
          :data="filteredFunds" 
          style="width: 100%"
          @row-click="showFundDetail"
          :row-class-name="getRowClassName"
        >
          <el-table-column prop="name" label="Fund Name" min-width="200">
            <template #default="scope">
              <div class="fund-name">
                <div class="name">{{ scope.row.name }}</div>
                <div class="symbol">{{ scope.row.symbol }}</div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="symbol" label="Ticker" width="100" />
          
          <el-table-column label="Current Value" width="120">
            <template #default="scope">
              <span class="value">${{ (scope.row.quantity * scope.row.current_price).toLocaleString() }}</span>
            </template>
          </el-table-column>
          
          <el-table-column label="YTD" width="100">
            <template #default="scope">
              <span :class="scope.row.ytd_return >= 0 ? 'positive' : 'negative'">
                {{ scope.row.ytd_return >= 0 ? '+' : '' }}{{ scope.row.ytd_return }}%
              </span>
            </template>
          </el-table-column>
          
          <el-table-column label="1 Year" width="100">
            <template #default="scope">
              <span :class="scope.row.return_1y >= 0 ? 'positive' : 'negative'">
                {{ scope.row.return_1y >= 0 ? '+' : '' }}{{ scope.row.return_1y }}%
              </span>
            </template>
          </el-table-column>
          
          <el-table-column label="Actions" width="150" fixed="right">
            <template #default="scope">
              <el-button size="small" @click.stop="showFundDetail(scope.row)">
                Details
              </el-button>
              <el-button 
                v-if="scope.row.quantity > 0" 
                size="small" 
                type="danger" 
                @click.stop="showTradeModal(scope.row, 'sell')"
              >
                Sell
              </el-button>
              <el-button 
                v-else 
                size="small" 
                type="success" 
                @click.stop="showTradeModal(scope.row, 'buy')"
              >
                Buy
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- Fund Allocation -->
    <div class="fund-allocation">
      <h2>Fund Allocation Chart</h2>
      <div class="allocation-container">
        <div class="allocation-chart">
          <div ref="pieChart" class="chart-container"></div>
        </div>
        <div class="allocation-summary">
          <h3>Portfolio Summary</h3>
          <div class="summary-stats">
            <div class="summary-item">
              <span class="label">Total Value:</span>
              <span class="value">${{ totalValue.toLocaleString() }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Fund Count:</span>
              <span class="value">{{ portfolioSummary.total_holdings || userFunds.length }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Avg Expense:</span>
              <span class="value">{{ averageExpense }}%</span>
            </div>
            <div class="summary-item">
              <span class="label">YTD Return:</span>
              <span class="value" :class="totalYTD >= 0 ? 'positive' : 'negative'">
                {{ totalYTD >= 0 ? '+' : '' }}{{ totalYTD }}%
              </span>
            </div>
          </div>
          <div class="category-breakdown">
            <h4>Category Breakdown</h4>
            <div class="breakdown-list">
              <div 
                v-for="category in fundCategories" 
                :key="category.type"
                class="breakdown-item"
              >
                <span class="category-name">{{ getCategoryName(category.type) }}:</span>
                <span class="category-percentage">{{ category.percentage }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fund Detail Modal -->
    <el-dialog 
      v-model="fundDetailVisible" 
      :title="selectedFund?.name" 
      width="80%"
      class="fund-detail-modal"
    >
      <div v-if="selectedFund" class="fund-detail-content">
        <div class="fund-basic-info">
          <div class="fund-header">
            <div class="fund-title">
              <h3>{{ selectedFund.name }}</h3>
              <p class="fund-symbol">{{ selectedFund.symbol }}</p>
            </div>
            <div class="fund-actions">
              <el-button 
                v-if="selectedFund.quantity > 0" 
                type="danger" 
                @click="showTradeModal(selectedFund, 'sell')"
              >
                Sell
              </el-button>
              <el-button 
                type="success" 
                @click="showTradeModal(selectedFund, 'buy')"
              >
                Buy
              </el-button>
            </div>
          </div>

          <div class="fund-stats-grid">
            <div class="stat-card">
              <div class="stat-label">Current Price</div>
              <div class="stat-value">${{ selectedFund.current_price }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Quantity Held</div>
              <div class="stat-value">{{ selectedFund.quantity || 0 }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Purchase Price</div>
              <div class="stat-value">${{ selectedFund.purchase_price }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Purchase Date</div>
              <div class="stat-value">{{ formatDate(selectedFund.purchase_date) }}</div>
            </div>
          </div>
        </div>

        <div class="fund-performance-chart">
          <h4>Historical Performance</h4>
          <div ref="performanceChart" class="chart-container"></div>
        </div>
        
        <div class="fund-volatility">
          <h4>Volatility Analysis</h4>
          <div class="volatility-grid">
            <div class="volatility-item">
              <span class="period">3 Years</span>
              <span class="value" :class="getVolatilityClass(selectedFund.volatility_3y)">
                {{ selectedFund.volatility_3y }}%
              </span>
            </div>
            <div class="volatility-item">
              <span class="period">1 Year</span>
              <span class="value" :class="getVolatilityClass(selectedFund.volatility_1y)">
                {{ selectedFund.volatility_1y }}%
              </span>
            </div>
            <div class="volatility-item">
              <span class="period">6 Months</span>
              <span class="value" :class="getVolatilityClass(selectedFund.volatility_6m)">
                {{ selectedFund.volatility_6m }}%
              </span>
            </div>
            <div class="volatility-item">
              <span class="period">3 Months</span>
              <span class="value" :class="getVolatilityClass(selectedFund.volatility_3m)">
                {{ selectedFund.volatility_3m }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- Trade Modal -->
    <el-dialog 
      v-model="tradeModalVisible" 
      :title="tradeType === 'buy' ? 'Buy Fund' : 'Sell Fund'" 
      width="500px"
    >
      <div v-if="selectedFund" class="trade-form">
        <div class="trade-info">
          <h4>{{ selectedFund.name }} ({{ selectedFund.symbol }})</h4>
          <p>Current Price: ${{ selectedFund.current_price }}</p>
          <p v-if="selectedFund.quantity > 0">Quantity Held: {{ selectedFund.quantity }}</p>
        </div>
        
        <el-form :model="tradeForm" label-width="100px">
          <el-form-item label="Trade Type">
            <el-tag :type="tradeType === 'buy' ? 'success' : 'danger'">
              {{ tradeType === 'buy' ? 'Buy' : 'Sell' }}
            </el-tag>
          </el-form-item>
          
          <el-form-item label="Quantity">
            <el-input-number 
              v-model="tradeForm.quantity" 
              :min="0.01" 
              :precision="2"
              :step="0.01"
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="Price">
            <el-input-number 
              v-model="tradeForm.price" 
              :min="0.01" 
              :precision="2"
              :step="0.01"
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="Total Amount">
            <span class="total-amount">
              ${{ (tradeForm.quantity * tradeForm.price).toFixed(2) }}
            </span>
          </el-form-item>
          
          <el-form-item label="Notes">
            <el-input 
              v-model="tradeForm.notes" 
              type="textarea" 
              :rows="3"
              placeholder="Trade notes (optional)"
            />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="tradeModalVisible = false">Cancel</el-button>
          <el-button type="primary" @click="executeTrade">
            {{ tradeType === 'buy' ? 'Buy' : 'Sell' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import portfolioAPI from '../api/portfolio'

// 响应式数据
const searchQuery = ref('')
const selectedCategory = ref('')
const sortBy = ref('name')
const viewMode = ref('table')
const fundDetailVisible = ref(false)
const tradeModalVisible = ref(false)
const selectedFund = ref(null)
const tradeType = ref('buy')
const pieChart = ref(null)
const performanceChart = ref(null)
const loading = ref(false)

// 交易表单
const tradeForm = ref({
  quantity: 0,
  price: 0,
  notes: ''
})

// 真实数据 - 从API获取
const userFunds = ref([])
const allFunds = ref([])
const fundCategoriesData = ref([])
const portfolioSummary = ref({})

// 计算属性
const filteredFunds = computed(() => {
  let funds = allFunds.value

  // 搜索过滤
  if (searchQuery.value) {
    funds = funds.filter(fund => 
      fund.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      fund.symbol.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // 分类过滤
  if (selectedCategory.value) {
    funds = funds.filter(fund => fund.sector === selectedCategory.value)
  }

  // 排序
  funds = [...funds].sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'symbol':
        return a.symbol.localeCompare(b.symbol)
      case 'value':
        return (b.quantity * b.current_price) - (a.quantity * a.current_price)
      case 'ytd':
        return b.ytd_return - a.ytd_return
      case '1y':
        return b.return_1y - a.return_1y
      default:
        return 0
    }
  })

  return funds
})

const totalValue = computed(() => {
  return portfolioSummary.value.total_value || 0
})

const totalYTD = computed(() => {
  return portfolioSummary.value.avg_gain_percent || 0
})

const averageExpense = computed(() => {
  if (userFunds.value.length === 0) return 0
  const totalExpense = userFunds.value.reduce((total, fund) => {
    return total + (fund.expense_ratio || 0)
  }, 0)
  return (totalExpense / userFunds.value.length).toFixed(2)
})

const fundCategories = computed(() => {
  return fundCategoriesData.value
})

// 方法
const handleSearch = () => {
  searchFunds(searchQuery.value)
}

const handleFilter = () => {
  // 筛选逻辑已在计算属性中处理
}

const handleSort = () => {
  // 排序逻辑已在计算属性中处理
}

const handleViewChange = () => {
  // 视图切换逻辑
}

const selectCategory = (category) => {
  selectedCategory.value = selectedCategory.value === category ? '' : category
}

const viewCategoryFunds = (category) => {
  selectedCategory.value = category
}

const refreshData = async () => {
  try {
    loading.value = true
    await loadFundData()
    ElMessage.success('Data refreshed successfully')
  } catch (error) {
    ElMessage.error('Failed to refresh data: ' + error.message)
  } finally {
    loading.value = false
  }
}

const exportData = () => {
  ElMessage.success('Export feature is under development')
}

const showFundDetail = async (fund) => {
  selectedFund.value = fund
  fundDetailVisible.value = true
  
  // 加载基金波动数据
  const volatilityData = await loadFundVolatility(fund.symbol)
  selectedFund.value = {
    ...fund,
    ...volatilityData
  }
  
  nextTick(() => {
    initPerformanceChart()
  })
}

const showTradeModal = (fund, type) => {
  selectedFund.value = fund
  tradeType.value = type
  tradeForm.value = {
    quantity: 0,
    price: fund.current_price,
    notes: ''
  }
  tradeModalVisible.value = true
}

const executeTrade = async () => {
  try {
    const tradeData = {
      symbol: selectedFund.value.symbol,
      action: tradeType.value,
      quantity: tradeForm.value.quantity,
      price: tradeForm.value.price,
      notes: tradeForm.value.notes
    }

    await portfolioAPI.executeTrade(tradeData)
    
    // 重新加载数据
    await loadFundData()
    
    ElMessage.success(`${tradeType.value === 'buy' ? 'Buy' : 'Sell'} order executed successfully`)
    tradeModalVisible.value = false
  } catch (error) {
    ElMessage.error('Trade failed: ' + error.message)
  }
}

const getRowClassName = ({ row }) => {
  return row.quantity > 0 ? 'held-fund' : 'available-fund'
}

const getCategoryTagType = (type) => {
  const types = {
    index: 'primary',
    active: 'success',
    international: 'warning',
    sector: 'info',
    bond: 'danger',
    growth: 'success'
  }
  return types[type] || 'info'
}


const getCategoryIcon = (type) => {
  const icons = {
    'Large Blend': '📊',
    'Large Growth': '🚀',
    'Foreign Large Blend': '🌍',
    'Intermediate Core Bond': '🛡️',
    'Diversified Emerging Mkts': '🌏',
    'Real Estate': '🏢',
    'Precious Metals': '🥇',
    'Technology': '💻',
    'Energy': '⚡',
    'Health': '🏥',
    'Commodities': '📦',
    'Leveraged Bond': '📈',
    'Leveraged Equity': '📊',
    'fund': '📊'
  }
  return icons[type] || '📊'
}

const getCategoryDescription = (type) => {
  const descriptions = {
    'Large Blend': 'Broad market exposure with low expense ratios',
    'Large Growth': 'High-growth potential companies',
    'Foreign Large Blend': 'Global diversification opportunities',
    'Intermediate Core Bond': 'Income-generating investments',
    'Diversified Emerging Mkts': 'Emerging markets exposure',
    'Real Estate': 'Real estate investment opportunities',
    'Precious Metals': 'Precious metals and commodities',
    'Technology': 'Technology sector exposure',
    'Energy': 'Energy sector investments',
    'Health': 'Healthcare sector exposure',
    'Commodities': 'Commodity-based investments',
    'Leveraged Bond': 'Leveraged bond exposure',
    'Leveraged Equity': 'Leveraged equity exposure',
    'fund': 'General investment funds'
  }
  return descriptions[type] || 'Investment fund'
}

const getCategoryName = (type) => {
  const names = {
    'Large Blend': 'Large Blend',
    'Large Growth': 'Large Growth', 
    'Foreign Large Blend': 'International',
    'Intermediate Core Bond': 'Bonds',
    'Diversified Emerging Mkts': 'Emerging Markets',
    'Real Estate': 'Real Estate',
    'Precious Metals': 'Precious Metals',
    'Technology': 'Technology',
    'Energy': 'Energy',
    'Health': 'Healthcare',
    'Commodities': 'Commodities',
    'Leveraged Bond': 'Leveraged Bonds',
    'Leveraged Equity': 'Leveraged Equity',
    'fund': 'General Funds'
  }
  return names[type] || type
}

const getVolatilityClass = (volatility) => {
  if (volatility < 5) return 'low'
  if (volatility < 10) return 'medium'
  return 'high'
}

const formatDate = (date) => {
  if (!date) return 'Not Held'
  return new Date(date).toLocaleDateString('en-US')
}

const initPieChart = () => {
  if (!pieChart.value || !fundCategories.value.length) return
  
  const chart = echarts.init(pieChart.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: fundCategories.value.map(cat => cat.type)
    },
    series: [
      {
        name: 'Fund Allocation',
        type: 'pie',
        radius: '50%',
        data: fundCategories.value
          .filter(cat => cat.value > 0)
          .map(cat => ({
            value: cat.value,
            name: cat.type
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
  }
  
  chart.setOption(option)
}

const initPerformanceChart = () => {
  if (!performanceChart.value || !selectedFund.value) return

  const chart = echarts.init(performanceChart.value)
  
  // 模拟历史数据
  const dates = ['2021', '2022', '2023', '2024']
  const prices = [100, 95, 110, selectedFund.value.current_price]
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: {
      type: 'value'
    },
        series: [
      {
        name: 'Price',
        type: 'line',
        data: prices,
        smooth: true,
        lineStyle: {
          color: '#667eea'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
              { offset: 1, color: 'rgba(102, 126, 234, 0.1)' }
            ]
          }
        }
      }
    ]
  }
  
  chart.setOption(option)
}

// 数据加载函数
const loadFundData = async () => {
  try {
    loading.value = true
    
    // 并行加载所有数据
    const [fundsResponse, categoriesResponse, summaryResponse] = await Promise.all([
      portfolioAPI.getFunds(),
      portfolioAPI.getFundCategories(),
      portfolioAPI.getPortfolioSummary()
    ])
    
    console.log('Funds response:', fundsResponse)
    console.log('Categories response:', categoriesResponse)
    console.log('Summary response:', summaryResponse)
    
    userFunds.value = fundsResponse.data || []
    allFunds.value = fundsResponse.data || []
    fundCategoriesData.value = categoriesResponse.data || []
    portfolioSummary.value = summaryResponse.data || {}
    
    // 初始化图表
    nextTick(() => {
      initPieChart()
    })
  } catch (error) {
    console.error('Error loading fund data:', error)
    ElMessage.error('Failed to load fund data: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 搜索基金
const searchFunds = async (query) => {
  if (!query.trim()) {
    allFunds.value = userFunds.value
    return
  }
  
  try {
    const response = await portfolioAPI.searchFunds(query)
    allFunds.value = response.data || []
  } catch (error) {
    console.error('Error searching funds:', error)
    ElMessage.error('Failed to search funds: ' + error.message)
  }
}

// 获取基金波动数据
const loadFundVolatility = async (symbol) => {
  try {
    const response = await portfolioAPI.getFundVolatility(symbol)
    return response.data
  } catch (error) {
    console.error('Error loading fund volatility:', error)
    return {
      volatility_3y: 0,
      volatility_1y: 0,
      volatility_6m: 0,
      volatility_3m: 0
    }
  }
}

// 生命周期
onMounted(() => {
  loadFundData()
})
</script>

<style scoped>
.fund-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-overlay p {
  margin-top: 16px;
  color: #6c757d;
  font-size: 1rem;
}

.loading-overlay .el-icon {
  font-size: 2rem;
  color: #667eea;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
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

/* Search & Filter Bar */
.search-filter-bar {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.search-section {
  margin-bottom: 16px;
}

.filter-section {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}

.view-toggle {
  margin-left: auto;
}

.quick-stats {
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #6c757d;
}

/* Fund Categories */
.fund-categories {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 50px;
}

.fund-category-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
  border-radius: 16px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.fund-category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.3);
}

.fund-category-card.active {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.category-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.fund-category-card h3 {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.fund-category-card p {
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 16px;
  line-height: 1.5;
}

.category-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.stat-value {
  font-weight: 600;
  font-size: 1rem;
}

.category-actions {
  display: flex;
  justify-content: center;
}

/* Fund Performance */
.fund-performance {
  margin-bottom: 50px;
}

.performance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.performance-header h2 {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.performance-actions {
  display: flex;
  gap: 12px;
}

.performance-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.fund-name {
  display: flex;
  flex-direction: column;
}

.fund-name .name {
  font-weight: 600;
  color: #2c3e50;
}

.fund-name .symbol {
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 4px;
}

.value {
  font-weight: 600;
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

/* Table row styles */
:deep(.held-fund) {
  background-color: #f8fff8;
}

:deep(.available-fund) {
  background-color: #fff8f8;
}

:deep(.held-fund:hover) {
  background-color: #e8f5e8 !important;
}

:deep(.available-fund:hover) {
  background-color: #ffe8e8 !important;
}

/* Fund Allocation */
.fund-allocation {
  margin-bottom: 50px;
}

.fund-allocation h2 {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 24px;
  text-align: center;
}

.allocation-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: start;
}

.allocation-chart {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.allocation-summary {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.allocation-summary h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 20px;
}

.summary-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.summary-item .label {
  font-weight: 500;
  color: #6c757d;
}

.summary-item .value {
  font-weight: 600;
  color: #2c3e50;
}

.category-breakdown h4 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
}

.breakdown-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.category-name {
  font-weight: 500;
  color: #6c757d;
}

.category-percentage {
  font-weight: 600;
  color: #2c3e50;
}

/* Fund Detail Modal */
.fund-detail-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.fund-basic-info {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
}

.fund-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.fund-title h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.fund-symbol {
  font-size: 1.1rem;
  color: #6c757d;
  margin: 0;
}

.fund-actions {
  display: flex;
  gap: 12px;
}

.fund-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  background: white;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
}

.fund-performance-chart {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.fund-performance-chart h4 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
}

.fund-volatility {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.fund-volatility h4 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
}

.volatility-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.volatility-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.volatility-item .period {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 8px;
}

.volatility-item .value {
  font-size: 1.2rem;
  font-weight: 600;
}

.volatility-item .value.low {
  color: #27ae60;
}

.volatility-item .value.medium {
  color: #f39c12;
}

.volatility-item .value.high {
  color: #e74c3c;
}

/* Trade Modal */
.trade-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.trade-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.trade-info h4 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.trade-info p {
  margin: 4px 0;
  color: #6c757d;
}

.total-amount {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
}

/* Responsive Design */
@media (max-width: 768px) {
  .fund-categories {
    grid-template-columns: 1fr;
  }
  
  .section-header h1 {
    font-size: 2rem;
  }
  
  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .view-toggle {
    margin-left: 0;
  }
  
  .performance-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .allocation-container {
    grid-template-columns: 1fr;
  }
  
  .fund-stats-grid {
    grid-template-columns: 1fr;
  }
  
  .volatility-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .fund-header {
    flex-direction: column;
    gap: 16px;
  }
}
</style> 