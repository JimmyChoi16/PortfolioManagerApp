<template>
  <div class="fund-section">
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
        :key="category.key"
        class="fund-category-card"
        :class="{ active: selectedCategory === category.key }"
        @click="selectCategory(category.key)"
      >
        <div class="category-icon">{{ category.icon }}</div>
        <h3>{{ category.name }}</h3>
        <p>{{ category.description }}</p>
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
           <el-button size="small" type="primary" plain @click.stop="viewCategoryFunds(category.key)">
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
           
           <el-table-column prop="type" label="Category" width="120">
            <template #default="scope">
              <el-tag :type="getCategoryTagType(scope.row.type)">
                {{ getCategoryName(scope.row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          
                     <el-table-column label="Current Value" width="120">
            <template #default="scope">
              <span class="value">${{ (scope.row.quantity * scope.row.current_price).toLocaleString() }}</span>
            </template>
          </el-table-column>
          
          <el-table-column label="YTD" width="100">
            <template #default="scope">
              <span :class="scope.row.ytd >= 0 ? 'positive' : 'negative'">
                {{ scope.row.ytd >= 0 ? '+' : '' }}{{ scope.row.ytd }}%
              </span>
            </template>
          </el-table-column>
          
          <el-table-column label="1年" width="100">
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

    <!-- Fund Allocation Chart -->
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
               <span class="value">{{ userFunds.length }}</span>
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
                :key="category.key"
                class="breakdown-item"
              >
                <span class="category-name">{{ category.name }}:</span>
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
import * as echarts from 'echarts'

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

// 交易表单
const tradeForm = ref({
  quantity: 0,
  price: 0,
  notes: ''
})

// 模拟数据 - 用户持有的基金
const userFunds = ref([
  {
    id: 1,
    symbol: 'VTSAX',
    name: 'Vanguard Total Stock Market Index Fund',
    type: 'index',
    quantity: 100.5,
    purchase_price: 85.20,
    purchase_date: '2023-01-15',
    current_price: 92.45,
    sector: 'Large Blend',
    ytd: 12.5,
    return_1y: 18.2,
    volatility_3y: 15.2,
    volatility_1y: 12.8,
    volatility_6m: 8.5,
    volatility_3m: 5.2,
    expense_ratio: 0.04,
    is_active: 1
  },
  {
    id: 2,
    symbol: 'FXAIX',
    name: 'Fidelity 500 Index Fund',
    type: 'index',
    quantity: 75.25,
    purchase_price: 78.90,
    purchase_date: '2023-03-20',
    current_price: 89.30,
    sector: 'Large Blend',
    ytd: 11.8,
    return_1y: 17.5,
    volatility_3y: 14.8,
    volatility_1y: 12.1,
    volatility_6m: 7.9,
    volatility_3m: 4.8,
    expense_ratio: 0.015,
    is_active: 1
  },
  {
    id: 3,
    symbol: 'AGTHX',
    name: 'American Funds Growth Fund of America',
    type: 'growth',
    quantity: 50.0,
    purchase_price: 45.60,
    purchase_date: '2023-06-10',
    current_price: 52.80,
    sector: 'Large Growth',
    ytd: 15.2,
    return_1y: 22.1,
    volatility_3y: 18.5,
    volatility_1y: 16.2,
    volatility_6m: 12.3,
    volatility_3m: 8.7,
    expense_ratio: 0.64,
    is_active: 1
  },
  {
    id: 4,
    symbol: 'VTIAX',
    name: 'Vanguard Total International Stock Index Fund',
    type: 'international',
    quantity: 60.0,
    purchase_price: 32.40,
    purchase_date: '2023-02-28',
    current_price: 35.20,
    sector: 'Foreign Large Blend',
    ytd: 8.7,
    return_1y: 14.3,
    volatility_3y: 16.8,
    volatility_1y: 14.5,
    volatility_6m: 9.2,
    volatility_3m: 6.1,
    expense_ratio: 0.11,
    is_active: 1
  }
])

// 模拟数据 - 可搜索的基金列表（包含未持有的基金）
const allFunds = ref([
  ...userFunds.value,
  {
    id: 5,
    symbol: 'VBMFX',
    name: 'Vanguard Total Bond Market Index Fund',
    type: 'bond',
    quantity: 0,
    purchase_price: 0,
    purchase_date: null,
    current_price: 11.25,
    sector: 'Intermediate Core Bond',
    ytd: 4.2,
    return_1y: 6.8,
    volatility_3y: 5.2,
    volatility_1y: 4.8,
    volatility_6m: 3.1,
    volatility_3m: 2.5,
    expense_ratio: 0.15,
    is_active: 1
  },
  {
    id: 6,
    symbol: 'FSKAX',
    name: 'Fidelity Total Market Index Fund',
    type: 'index',
    quantity: 0,
    purchase_price: 0,
    purchase_date: null,
    current_price: 95.60,
    sector: 'Large Blend',
    ytd: 13.1,
    return_1y: 19.5,
    volatility_3y: 15.8,
    volatility_1y: 13.2,
    volatility_6m: 8.9,
    volatility_3m: 5.6,
    expense_ratio: 0.015,
    is_active: 1
  }
])

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
    funds = funds.filter(fund => fund.type === selectedCategory.value)
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
        return b.ytd - a.ytd
      case '1y':
        return b.return_1y - a.return_1y
      default:
        return 0
    }
  })

  return funds
})

const totalValue = computed(() => {
  return userFunds.value.reduce((total, fund) => {
    return total + (fund.quantity * fund.current_price)
  }, 0)
})

const totalYTD = computed(() => {
  const totalPurchaseValue = userFunds.value.reduce((total, fund) => {
    return total + (fund.quantity * fund.purchase_price)
  }, 0)
  
  if (totalPurchaseValue === 0) return 0
  
  return ((totalValue.value - totalPurchaseValue) / totalPurchaseValue * 100).toFixed(1)
})

const averageExpense = computed(() => {
  if (userFunds.value.length === 0) return 0
  const totalExpense = userFunds.value.reduce((total, fund) => {
    return total + fund.expense_ratio
  }, 0)
  return (totalExpense / userFunds.value.length).toFixed(2)
})

const fundCategories = computed(() => {
  const categories = {
    index: { name: 'Index Funds', icon: '📊', count: 0, value: 0, ytd: 0 },
    active: { name: 'Active Funds', icon: '🎯', count: 0, value: 0, ytd: 0 },
    international: { name: 'International', icon: '🌍', count: 0, value: 0, ytd: 0 },
    sector: { name: 'Sector Funds', icon: '🏢', count: 0, value: 0, ytd: 0 },
    bond: { name: 'Bond Funds', icon: '💰', count: 0, value: 0, ytd: 0 },
    growth: { name: 'Growth Funds', icon: '🚀', count: 0, value: 0, ytd: 0 }
  }

  userFunds.value.forEach(fund => {
    if (categories[fund.type]) {
      categories[fund.type].count++
      categories[fund.type].value += fund.quantity * fund.current_price
      categories[fund.type].ytd += fund.ytd
    }
  })

  // 计算百分比
  Object.keys(categories).forEach(key => {
    if (categories[key].count > 0) {
      categories[key].ytd = (categories[key].ytd / categories[key].count).toFixed(1)
      categories[key].percentage = ((categories[key].value / totalValue.value) * 100).toFixed(1)
    }
  })

  return categories
})

// 方法
const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
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

const refreshData = () => {
  ElMessage.success('Data refreshed successfully')
  // 这里可以调用API刷新数据
}

const exportData = () => {
  ElMessage.success('Export feature is under development')
}

const showFundDetail = (fund) => {
  selectedFund.value = fund
  fundDetailVisible.value = true
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
    // 这里应该调用API执行交易
    if (tradeType.value === 'buy') {
      // 买入逻辑
      const newFund = {
        ...selectedFund.value,
        quantity: (selectedFund.value.quantity || 0) + tradeForm.value.quantity,
        purchase_price: tradeForm.value.price,
        purchase_date: new Date().toISOString().split('T')[0]
      }
      
      if (selectedFund.value.quantity > 0) {
        // 更新现有基金
        const index = userFunds.value.findIndex(f => f.id === selectedFund.value.id)
        if (index !== -1) {
          userFunds.value[index] = newFund
        }
      } else {
        // 添加新基金
        newFund.id = Date.now()
        userFunds.value.push(newFund)
      }
      
      ElMessage.success('Buy order executed successfully')
    } else {
      // 卖出逻辑
      if (tradeForm.value.quantity > selectedFund.value.quantity) {
        ElMessage.error('Sell quantity cannot exceed held quantity')
        return
      }
      
      const remainingQuantity = selectedFund.value.quantity - tradeForm.value.quantity
      if (remainingQuantity === 0) {
        // 完全卖出，从列表中移除
        const index = userFunds.value.findIndex(f => f.id === selectedFund.value.id)
        if (index !== -1) {
          userFunds.value.splice(index, 1)
        }
      } else {
        // 部分卖出，更新数量
        const index = userFunds.value.findIndex(f => f.id === selectedFund.value.id)
        if (index !== -1) {
          userFunds.value[index].quantity = remainingQuantity
        }
      }
      
      ElMessage.success('Sell order executed successfully')
    }
    
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

const getCategoryName = (type) => {
  const names = {
    index: 'Index Funds',
    active: 'Active Funds',
    international: 'International',
    sector: 'Sector Funds',
    bond: 'Bond Funds',
    growth: 'Growth Funds'
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
  if (!pieChart.value) return

  const chart = echarts.init(pieChart.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: Object.values(fundCategories.value).map(cat => cat.name)
    },
         series: [
       {
         name: 'Fund Allocation',
         type: 'pie',
         radius: '50%',
         data: Object.entries(fundCategories.value)
           .filter(([key, cat]) => cat.value > 0)
           .map(([key, cat]) => ({
             value: cat.value,
             name: cat.name
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

// 生命周期
onMounted(() => {
  nextTick(() => {
    initPieChart()
  })
})
</script>

<style scoped>
.fund-section {
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