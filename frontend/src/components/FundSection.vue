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

    <!-- Fund Types Overview -->
    <div class="fund-types-container">
      <h2>Fund Categories ({{ fundCategories.length }})</h2>
      <div class="fund-types-scroll">
        <div 
          v-for="category in fundCategories" 
          :key="category.type"
          class="fund-type-card"
        >
          <div class="type-icon">{{ getCategoryIcon(category.type) }}</div>
          <h3>{{ getCategoryName(category.type) }}</h3>
          <p>{{ getCategoryDescription(category.type) }}</p>
          <div class="fund-metrics">
            <div class="metric">
              <span class="label">YTD Return</span>
                              <span class="value" :class="category.ytd >= 0 ? 'positive' : 'negative'">
                  {{ category.ytd >= 0 ? '+' : '' }}{{ parseFloat(category.ytd || 0).toFixed(2) }}%
                </span>
            </div>
            <div class="metric">
              <span class="label">Expense Ratio</span>
                              <span class="value">{{ parseFloat(category.expense_ratio || 0).toFixed(2) }}%</span>
            </div>
            <div class="metric">
              <span class="label">Fund Count</span>
                              <span class="value">{{ parseFloat(category.count || 0).toFixed(0) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Holdings Table -->
    <div class="holdings-section">
      <div class="holdings-header">
        <h2>Current Fund Holdings</h2>
        <div class="holdings-actions">
          <el-button type="primary" @click="showAddFundModal">
            Add Fund Holdings
          </el-button>
          <el-button @click="exportData">
            <el-icon><Download /></el-icon>
            Export Data
          </el-button>
        </div>
      </div>

      <div class="holdings-table">
        <div v-if="holdingsData.length === 0" style="padding: 20px; text-align: center; color: #999;">
          No data available. Data length: {{ holdingsData.length }}
        </div>
        <el-table 
          v-else
          :data="paginatedHoldingsData" 
          style="width: 100%"
          @row-click="showFundDetail"
          :row-class-name="getRowClassName"
        >
          <el-table-column prop="symbol" label="Symbol" width="120">
            <template #default="scope">
              <div class="symbol-cell">
                <span class="symbol">{{ scope.row.symbol }}</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="name" label="Name" min-width="200">
            <template #default="scope">
              <div class="name-cell">
                <div class="name">{{ scope.row.name }}</div>
                <div class="sector">{{ scope.row.sector }}</div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="quantity" label="Quantity" width="120" align="right">
            <template #default="scope">
                              <span>{{ parseFloat(scope.row.quantity || 0).toFixed(2) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="current_price" label="Current Price" width="130" align="right">
            <template #default="scope">
              <span class="price">${{ parseFloat(scope.row.current_price || 0).toFixed(2) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column label="Current Value" width="140" align="right">
            <template #default="scope">
                              <span class="value">${{ (parseFloat(scope.row.quantity || 0) * parseFloat(scope.row.current_price || 0)).toFixed(2) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column label="Gain/Loss" width="140" align="right">
            <template #default="scope">
                              <span :class="getGainLoss(scope.row) >= 0 ? 'positive' : 'negative'">
                  {{ getGainLoss(scope.row) >= 0 ? '+' : '' }}${{ getGainLoss(scope.row).toFixed(2) }}
                </span>
            </template>
          </el-table-column>
          
          <el-table-column label="Gain/Loss %" width="120" align="right">
            <template #default="scope">
              <span :class="getGainLossPercent(scope.row) >= 0 ? 'positive' : 'negative'">
                {{ getGainLossPercent(scope.row) >= 0 ? '+' : '' }}{{ getGainLossPercent(scope.row).toFixed(2) }}%
              </span>
            </template>
          </el-table-column>
          
          <el-table-column label="YTD" width="80" align="right">
            <template #default="scope">
              <span :class="parseFloat(scope.row.ytd || 0) >= 0 ? 'positive' : 'negative'">
                {{ parseFloat(scope.row.ytd || 0) >= 0 ? '+' : '' }}{{ parseFloat(scope.row.ytd || 0).toFixed(2) }}%
              </span>
            </template>
          </el-table-column>
          
          <el-table-column label="1Y" width="80" align="right">
            <template #default="scope">
              <span :class="parseFloat(scope.row.return_1y || 0) >= 0 ? 'positive' : 'negative'">
                {{ parseFloat(scope.row.return_1y || 0) >= 0 ? '+' : '' }}{{ parseFloat(scope.row.return_1y || 0).toFixed(2) }}%
              </span>
            </template>
          </el-table-column>
          
          <el-table-column label="3Y" width="80" align="right">
            <template #default="scope">
              <span :class="parseFloat(scope.row.return_3y || 0) >= 0 ? 'positive' : 'negative'">
                {{ parseFloat(scope.row.return_3y || 0) >= 0 ? '+' : '' }}{{ parseFloat(scope.row.return_3y || 0).toFixed(2) }}%
              </span>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页组件 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[6, 12, 24, 48]"
            :total="holdingsData.length"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
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
                              <span class="value">${{ parseFloat(totalValue || 0).toFixed(2) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Fund Count:</span>
              <span class="value">{{ parseFloat(portfolioSummary.summary?.total_holdings || holdingsData.length).toLocaleString() }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Avg Expense:</span>
              <span class="value">{{ averageExpense }}%</span>
            </div>
            <div class="summary-item">
              <span class="label">YTD Return:</span>
                              <span class="value" :class="totalYTD >= 0 ? 'positive' : 'negative'">
                  {{ totalYTD >= 0 ? '+' : '' }}{{ parseFloat(totalYTD || 0).toFixed(2) }}%
                </span>
            </div>
          </div>
          <div class="portfolio-analysis">
            <h4>Portfolio Analysis</h4>
            <div class="analysis-list">
              <div class="analysis-item">
                <div class="analysis-icon positive">📈</div>
                <div class="analysis-content">
                  <div class="analysis-title">Risk Level</div>
                  <div class="analysis-value">Moderate</div>
                </div>
              </div>
              <div class="analysis-item">
                <div class="analysis-icon neutral">⚖️</div>
                <div class="analysis-content">
                  <div class="analysis-title">Diversification</div>
                  <div class="analysis-value">Good</div>
                </div>
              </div>
              <div class="analysis-item">
                <div class="analysis-icon positive">🎯</div>
                <div class="analysis-content">
                  <div class="analysis-title">Performance</div>
                  <div class="analysis-value">Above Avg</div>
                </div>
              </div>
              <div class="analysis-item">
                <div class="analysis-icon warning">⚠️</div>
                <div class="analysis-content">
                  <div class="analysis-title">Volatility</div>
                  <div class="analysis-value">Medium</div>
                </div>
              </div>
            </div>
            
            <div class="prediction-section">
              <h5>Market Outlook</h5>
              <div class="prediction-content">
                <div class="prediction-item">
                  <span class="prediction-label">3-Month Forecast:</span>
                  <span class="prediction-value positive">+8.50%</span>
                </div>
                <div class="prediction-item">
                  <span class="prediction-label">6-Month Forecast:</span>
                  <span class="prediction-value positive">+12.30%</span>
                </div>
                <div class="prediction-item">
                  <span class="prediction-label">1-Year Forecast:</span>
                  <span class="prediction-value positive">+18.70%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fund Detail Modal -->
    <el-dialog 
      v-model="fundDetailVisible" 
      width="80%"
      class="fund-detail-modal"
      :show-close="true"
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
                <div class="stat-value">${{ parseFloat(selectedFund.current_price || 0).toFixed(2) }}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Quantity Held</div>
                <div class="stat-value">{{ parseFloat(selectedFund.quantity || 0).toFixed(2) }}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Purchase Price</div>
                <div class="stat-value">${{ parseFloat(selectedFund.purchase_price || 0).toFixed(2) }}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Purchase Date</div>
                <div class="stat-value">{{ formatDate(selectedFund.purchase_date) }}</div>
              </div>
            </div>
        
          <div class="fund-performance-chart">
            <h4>Historical Performance</h4>
            <div ref="performanceChart" class="chart-container"></div>
          </div>
          
          <div class="fund-volatility">
            <h4>Return Analysis</h4>
            <div class="volatility-grid">
              <div class="volatility-item">
                <span class="period">3 Years</span>
                <span class="value" :class="getReturnClass(selectedFund.return_3y)">
                  {{ parseFloat(selectedFund.return_3y || 0) >= 0 ? '+' : '' }}{{ parseFloat(selectedFund.return_3y || 0).toFixed(2) }}%
                </span>
              </div>
              <div class="volatility-item">
                <span class="period">1 Year</span>
                <span class="value" :class="getReturnClass(selectedFund.return_1y)">
                  {{ parseFloat(selectedFund.return_1y || 0) >= 0 ? '+' : '' }}{{ parseFloat(selectedFund.return_1y || 0).toFixed(2) }}%
                </span>
              </div>
              <div class="volatility-item">
                <span class="period">6 Months</span>
                <span class="value" :class="getReturnClass(selectedFund.return_6m)">
                  {{ parseFloat(selectedFund.return_6m || 0) >= 0 ? '+' : '' }}{{ parseFloat(selectedFund.return_6m || 0).toFixed(2) }}%
                </span>
              </div>
              <div class="volatility-item">
                <span class="period">3 Months</span>
                <span class="value" :class="getReturnClass(selectedFund.return_3m)">
                  {{ parseFloat(selectedFund.return_3m || 0) >= 0 ? '+' : '' }}{{ parseFloat(selectedFund.return_3m || 0).toFixed(2) }}%
                </span>
              </div>
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
          <p>Current Price: ${{ parseFloat(selectedFund.current_price || 0).toFixed(2) }}</p>
          <p v-if="selectedFund.quantity > 0">Quantity Held: {{ parseFloat(selectedFund.quantity || 0).toFixed(2) }}</p>
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

    <!-- Add Fund Holdings Modal -->
    <el-dialog 
      v-model="addFundModalVisible" 
      title="Add Fund Holdings" 
      width="600px"
    >
      <div class="add-fund-form">
        <el-form :model="addFundForm" :rules="addFundRules" ref="addFundFormRef" label-width="120px">
          <el-form-item label="Fund Symbol" prop="symbol">
            <el-input 
              v-model="addFundForm.symbol" 
              placeholder="Enter fund symbol (e.g., VTI, SPY)"
              maxlength="10"
            />
          </el-form-item>
          
          <el-form-item label="Fund Name" prop="name">
            <el-input 
              v-model="addFundForm.name" 
              placeholder="Enter fund name"
            />
          </el-form-item>
          
          <el-form-item label="Sector" prop="sector">
            <el-select v-model="addFundForm.sector" placeholder="Select sector" style="width: 100%">
              <el-option label="Index Funds" value="Index Funds" />
              <el-option label="Growth Funds" value="Growth Funds" />
              <el-option label="International Funds" value="International Funds" />
              <el-option label="Bond Funds" value="Bond Funds" />
              <el-option label="Sector Funds" value="Sector Funds" />
              <el-option label="Money Market" value="Money Market" />
              <el-option label="Real Estate" value="Real Estate" />
              <el-option label="Commodity" value="Commodity" />
              <el-option label="Emerging Markets" value="Emerging Markets" />
              <el-option label="Healthcare" value="Healthcare" />
              <el-option label="Technology" value="Technology" />
              <el-option label="Energy" value="Energy" />
              <el-option label="Financial" value="Financial" />
              <el-option label="Consumer" value="Consumer" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="Quantity" prop="quantity">
            <el-input-number 
              v-model="addFundForm.quantity" 
              :min="0.01" 
              :precision="2"
              :step="0.01"
              style="width: 100%"
              placeholder="Enter quantity"
            />
          </el-form-item>
          
          <el-form-item label="Purchase Price" prop="purchase_price">
            <el-input-number 
              v-model="addFundForm.purchase_price" 
              :min="0.01" 
              :precision="2"
              :step="0.01"
              style="width: 100%"
              placeholder="Enter purchase price per share"
            />
          </el-form-item>
          
          <el-form-item label="Purchase Date" prop="purchase_date">
            <el-date-picker
              v-model="addFundForm.purchase_date"
              type="date"
              placeholder="Select purchase date"
              style="width: 100%"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          
          <el-form-item label="Notes">
            <el-input 
              v-model="addFundForm.notes" 
              type="textarea" 
              :rows="3"
              placeholder="Additional notes (optional)"
            />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addFundModalVisible = false">Cancel</el-button>
          <el-button type="primary" @click="addFundHoldings" :loading="addingFund">
            Add Fund Holdings
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading, Download, View, Plus, Minus } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import portfolioAPI from '../api/portfolio.js'

// 响应式数据
const loading = ref(true)
const holdingsData = ref([])
const fundCategoriesData = ref([])
const portfolioSummary = ref({})
const fundDetailVisible = ref(false)
const tradeModalVisible = ref(false)
const selectedFund = ref(null)
const tradeType = ref('buy')
const tradeForm = ref({
  quantity: 0,
  price: 0,
  notes: ''
})

// Add Fund Holdings Modal
const addFundModalVisible = ref(false)
const addFundFormRef = ref(null)
const addingFund = ref(false)
const addFundForm = ref({
  symbol: '',
  name: '',
  sector: '',
  quantity: 0,
  purchase_price: 0,
  purchase_date: '',
  notes: ''
})

const addFundRules = {
  symbol: [
    { required: true, message: 'Please enter fund symbol', trigger: 'blur' },
    { min: 1, max: 10, message: 'Symbol must be between 1 and 10 characters', trigger: 'blur' }
  ],
  name: [
    { required: true, message: 'Please enter fund name', trigger: 'blur' }
  ],
  sector: [
    { required: true, message: 'Please select sector', trigger: 'change' }
  ],
  quantity: [
    { required: true, message: 'Please enter quantity', trigger: 'blur' },
    { type: 'number', min: 0.01, message: 'Quantity must be greater than 0', trigger: 'blur' }
  ],
  purchase_price: [
    { required: true, message: 'Please enter purchase price', trigger: 'blur' },
    { type: 'number', min: 0.01, message: 'Purchase price must be greater than 0', trigger: 'blur' }
  ],
  purchase_date: [
    { required: true, message: 'Please select purchase date', trigger: 'change' }
  ]
}

// 分页相关数据
const currentPage = ref(1)
const pageSize = ref(6)

// 图表引用
const pieChart = ref(null)
const performanceChart = ref(null)

// 计算属性
const totalValue = computed(() => {
  console.log('Portfolio Summary:', portfolioSummary.value)
  return portfolioSummary.value?.summary?.total_value || portfolioSummary.value?.total_value || 0
})

const totalYTD = computed(() => {
  return portfolioSummary.value?.summary?.avg_gain_percent || portfolioSummary.value?.avg_gain_percent || 0
})

const averageExpense = computed(() => {
  if (holdingsData.value.length === 0) return 0
  const totalExpense = holdingsData.value.reduce((total, fund) => {
    return total + parseFloat(fund.expense_ratio || 0)
  }, 0)
  return (totalExpense / holdingsData.value.length).toFixed(2)
})

const fundCategories = computed(() => {
  console.log('Fund Categories Data:', fundCategoriesData.value)
  return fundCategoriesData.value
})

// 添加holdingsData的调试
const debugHoldingsData = computed(() => {
  console.log('Holdings Data Length:', holdingsData.value.length)
  console.log('Holdings Data:', holdingsData.value)
  return holdingsData.value
})

// 分页计算属性
const paginatedHoldingsData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return holdingsData.value.slice(start, end)
})

// 方法
const getGainLoss = (holding) => {
  const currentPrice = parseFloat(holding.current_price || 0)
  const purchasePrice = parseFloat(holding.purchase_price || 0)
  const quantity = parseFloat(holding.quantity || 0)
  return parseFloat(((currentPrice - purchasePrice) * quantity).toFixed(2))
}

const getGainLossPercent = (holding) => {
  const currentPrice = parseFloat(holding.current_price || 0)
  const purchasePrice = parseFloat(holding.purchase_price || 0)
  if (purchasePrice === 0) return 0
  return parseFloat((((currentPrice - purchasePrice) / purchasePrice) * 100).toFixed(2))
}



// 分页处理方法
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

const exportData = () => {
  const data = {
    holdings: holdingsData.value,
    categories: fundCategoriesData.value,
    summary: portfolioSummary.value
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'fund-portfolio-data.json'
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('Data exported successfully')
}

const showFundDetail = async (fund) => {
  selectedFund.value = fund
  fundDetailVisible.value = true
  
  // 获取基金的收益率数据
  try {
    const response = await portfolioAPI.getFundReturns(fund.symbol)
    if (response.data.success) {
      // 将收益率数据添加到选中的基金对象中
      selectedFund.value = {
        ...selectedFund.value,
        ...response.data.data
      }
    }
  } catch (error) {
    console.error('Error fetching fund returns:', error)
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
    // 添加调试信息
    console.log('Trade form data:', tradeForm.value)
    console.log('Quantity raw:', tradeForm.value.quantity, 'Type:', typeof tradeForm.value.quantity)
    console.log('Price raw:', tradeForm.value.price, 'Type:', typeof tradeForm.value.price)
    
    const tradeData = {
      symbol: selectedFund.value.symbol,
      action: tradeType.value,
      quantity: Number(tradeForm.value.quantity),
      price: Number(tradeForm.value.price),
      notes: tradeForm.value.notes
    }
    
    console.log('Sending trade data:', tradeData)
    console.log('Quantity converted:', tradeData.quantity, 'Type:', typeof tradeData.quantity)
    console.log('Price converted:', tradeData.price, 'Type:', typeof tradeData.price)
    
    const response = await portfolioAPI.executeTrade(tradeData)
    
    if (response.data.success) {
      ElMessage.success('Trade executed successfully')
      tradeModalVisible.value = false
      await loadFundData()
      
      // 更新弹窗中显示的基金数据
      if (selectedFund.value) {
        const updatedFund = holdingsData.value.find(fund => fund.symbol === selectedFund.value.symbol)
        if (updatedFund) {
          selectedFund.value = updatedFund
        }
      }
    }
  } catch (error) {
    console.error('Error executing trade:', error)
    ElMessage.error('Failed to execute trade')
  }
}

const getRowClassName = ({ row }) => {
  return row.quantity > 0 ? 'held-fund' : 'available-fund'
}

const getCategoryIcon = (type) => {
  const icons = {
    'Index Funds': '📈',
    'Growth Funds': '🚀',
    'International Funds': '🌍',
    'Bond Funds': '🛡️',
    'Sector Funds': '🏢',
    'Money Market': '💰',
    'Real Estate': '🏠',
    'Commodity': '🪙',
    'Emerging Markets': '🌱',
    'Healthcare': '🏥',
    'Technology': '💻',
    'Energy': '⚡',
    'Financial': '🏦',
    'Consumer': '🛒'
  }
  return icons[type] || '📊'
}

const getCategoryName = (type) => {
  return type
}

const getCategoryDescription = (type) => {
  const descriptions = {
    'Index Funds': 'Passive investment tracking market indices',
    'Growth Funds': 'High-growth potential equity investments',
    'International Funds': 'Global diversification opportunities',
    'Bond Funds': 'Fixed income stability and income',
    'Sector Funds': 'Targeted sector-specific investments',
    'Money Market': 'Short-term, low-risk investments',
    'Real Estate': 'Real estate investment trusts',
    'Commodity': 'Commodity and natural resource exposure',
    'Emerging Markets': 'Developing market opportunities',
    'Healthcare': 'Healthcare and biotechnology sector',
    'Technology': 'Technology sector investments',
    'Energy': 'Energy sector exposure',
    'Financial': 'Financial services sector',
    'Consumer': 'Consumer goods and services'
  }
  return descriptions[type] || 'Diversified investment fund'
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

const getVolatilityClass = (volatility) => {
  if (volatility < 10) return 'low'
  if (volatility < 20) return 'medium'
  return 'high'
}

const getReturnClass = (returnValue) => {
  const value = parseFloat(returnValue || 0)
  if (value >= 0) return 'positive'
  return 'negative'
}

const initPieChart = () => {
  if (!pieChart.value) return
  
  const chart = echarts.init(pieChart.value)
  
  // 获取容器宽度以确定响应式设置
  const containerWidth = pieChart.value.offsetWidth
  const isMobile = containerWidth < 768
  const isTablet = containerWidth >= 768 && containerWidth < 1200
  
  console.log('Container width:', containerWidth, 'isMobile:', isMobile, 'isTablet:', isTablet)
  
  // 定义更美观的颜色方案
  const colors = [
    '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
    '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#2f4554',
    '#61a0a8', '#d48265', '#749f83', '#ca8622'
  ]
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        return `${params.seriesName}<br/>
                <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${params.color};"></span>
                ${params.name}: $${params.value.toLocaleString()} (${params.percent}%)`
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e1e8ed',
      borderWidth: 1,
      textStyle: {
        color: '#2c3e50'
      }
    },
    legend: {
      orient: isMobile ? 'horizontal' : 'vertical',
      left: isMobile ? 'center' : '5%',
      top: isMobile ? 'bottom' : 'middle',
      itemGap: isMobile ? 8 : 12,
      itemWidth: isMobile ? 12 : 14,
      itemHeight: isMobile ? 12 : 14,
      textStyle: {
        fontSize: isMobile ? 10 : 12,
        color: '#2c3e50'
      },
      formatter: function(name) {
        const category = fundCategories.value.find(cat => cat.type === name)
        if (category) {
          return `${name} (${category.percentage}%)`
        }
        return name
      }
    },
    series: [
      {
        name: 'Fund Allocation',
        type: 'pie',
        radius: isMobile ? ['30%', '60%'] : ['40%', '70%'],
        center: isMobile ? ['50%', '45%'] : ['65%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: isMobile ? 14 : 16,
            fontWeight: 'bold',
            color: '#2c3e50'
          },
          itemStyle: {
            shadowBlur: 15,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        },
        labelLine: {
          show: false
        },
        data: fundCategories.value.map((cat, index) => ({
          value: cat.value,
          name: cat.type,
          itemStyle: {
            color: colors[index % colors.length]
          }
        }))
      }
    ]
  }
  chart.setOption(option)
  
  // 添加窗口大小变化监听器
  const handleResize = () => {
    chart.resize()
  }
  window.addEventListener('resize', handleResize)
  
  // 清理监听器
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    chart.dispose()
  })
}

const initPerformanceChart = async () => {
  if (!performanceChart.value || !selectedFund.value) return
  
  const chart = echarts.init(performanceChart.value)
  
  try {
    // 获取真实的性能历史数据
    const response = await portfolioAPI.getFundPerformanceHistory(selectedFund.value.symbol)
    let dates = []
    let performanceData = []
    
    if (response.data.success && response.data.data.dates.length > 0) {
      dates = response.data.data.dates
      performanceData = response.data.data.performanceData
    } else {
      // 如果没有数据，生成模拟数据
      const today = new Date()
      const totalDays = 3 * 365 // 三年
      const intervalDays = 7 // 每7天一个数据点
      
      for (let i = 0; i <= totalDays; i += intervalDays) {
        const date = new Date(today)
        date.setDate(date.getDate() - (totalDays - i))
        dates.push(date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit' 
        }))
        
        // 模拟性能数据
        const baseValue = 100
        const growth = Math.random() * 0.005 - 0.0025 // -0.25% to +0.25% daily variation
        const cumulativeGrowth = Math.pow(1 + growth, i / intervalDays)
        performanceData.push((baseValue * cumulativeGrowth - baseValue).toFixed(2))
      }
    }
    
    const option = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        const data = params[0]
        return `${data.name}<br/>
                <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${data.color};"></span>
                Performance: ${data.value}%`
      }
    },
          xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          rotate: 0, // 字体横放
          fontSize: 10,
          interval: function(index, value) {
            // 从最后一天往前算半年，每半年一个刻度
            const totalPoints = dates.length
            const halfYearInterval = Math.floor(totalPoints / 6) // 每半年一个刻度（6个刻度点）
            
            // 从最后一个点开始，每隔 halfYearInterval 个点显示一个刻度
            const lastIndex = totalPoints - 1
            const targetIndices = []
            
            for (let i = 0; i < 6; i++) {
              targetIndices.push(lastIndex - (i * halfYearInterval))
            }
            
            return targetIndices.includes(index)
          }
        },
        axisTick: {
          show: true,
          alignWithLabel: true,
          length: 8, // 突出的刻度线长度
          lineStyle: {
            color: '#666',
            width: 2
          }
        }
      },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: 'Performance',
        type: 'line',
        data: performanceData,
        smooth: true,
        lineStyle: {
          color: '#409eff',
          width: 2
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
            ]
          }
        }
      }
    ]
  }
  chart.setOption(option)
  } catch (error) {
    console.error('Error loading performance history:', error)
    // 如果出错，使用模拟数据
    const today = new Date()
    const totalDays = 3 * 365
    const intervalDays = 7
    const dates = []
    const performanceData = []
    
    for (let i = 0; i <= totalDays; i += intervalDays) {
      const date = new Date(today)
      date.setDate(date.getDate() - (totalDays - i))
      dates.push(date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      }))
      
      const baseValue = 100
      const growth = Math.random() * 0.005 - 0.0025
      const cumulativeGrowth = Math.pow(1 + growth, i / intervalDays)
      performanceData.push((baseValue * cumulativeGrowth - baseValue).toFixed(2))
    }
    
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: function(params) {
          const data = params[0]
          return `${data.name}<br/>
                  <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${data.color};"></span>
                  Performance: ${data.value}%`
        }
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          rotate: 0,
          fontSize: 10,
          interval: function(index, value) {
            const totalPoints = dates.length
            const halfYearInterval = Math.floor(totalPoints / 6)
            const lastIndex = totalPoints - 1
            const targetIndices = []
            
            for (let i = 0; i < 6; i++) {
              targetIndices.push(lastIndex - (i * halfYearInterval))
            }
            
            return targetIndices.includes(index)
          }
        },
        axisTick: {
          show: true,
          alignWithLabel: true,
          length: 8,
          lineStyle: {
            color: '#666',
            width: 2
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value}%'
        }
      },
      series: [
        {
          name: 'Performance',
          type: 'line',
          data: performanceData,
          smooth: true,
          lineStyle: {
            color: '#409eff',
            width: 2
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
                { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
              ]
            }
          }
        }
      ]
    }
    chart.setOption(option)
  }
}

const loadFundData = async () => {
  try {
    const [performanceResponse, categoriesResponse, summaryResponse] = await Promise.all([
      portfolioAPI.getFundPerformance(),
      portfolioAPI.getFundCategories(),
      portfolioAPI.getPortfolioSummary()
    ])

    console.log('Performance Response:', performanceResponse)
    console.log('Categories Response:', categoriesResponse)
    console.log('Summary Response:', summaryResponse)

    // 尝试不同的数据访问路径
    holdingsData.value = performanceResponse.data?.data || performanceResponse.data || []
    fundCategoriesData.value = categoriesResponse.data?.data || categoriesResponse.data || []
    portfolioSummary.value = summaryResponse.data?.data || summaryResponse.data || {}

    console.log('Holdings Data:', holdingsData.value)
    console.log('Categories Data:', fundCategoriesData.value)
    console.log('Summary Data:', portfolioSummary.value)

    nextTick(() => {
      initPieChart()
    })
  } catch (error) {
    console.error('Error loading fund data:', error)
    ElMessage.error('Failed to load fund data')
  }
}

const addFundHoldings = async () => {
  if (!addFundFormRef.value) return
  await addFundFormRef.value.validate(async (valid) => {
    if (valid) {
      addingFund.value = true
      try {
        const response = await portfolioAPI.addFundHoldings({
          symbol: addFundForm.value.symbol,
          name: addFundForm.value.name,
          type: 'fund',
          sector: addFundForm.value.sector,
          quantity: addFundForm.value.quantity,
          purchase_price: addFundForm.value.purchase_price,
          purchase_date: addFundForm.value.purchase_date,
          notes: addFundForm.value.notes
        })

        if (response.data.success) {
          ElMessage.success('Fund holdings added successfully')
          addFundModalVisible.value = false
          await loadFundData()
          
          // 如果当前有基金详情弹窗打开，更新其数据
          if (selectedFund.value && fundDetailVisible.value) {
            const updatedFund = holdingsData.value.find(fund => fund.symbol === selectedFund.value.symbol)
            if (updatedFund) {
              selectedFund.value = updatedFund
            }
          }
        } else {
          ElMessage.error(response.data.message || 'Failed to add fund holdings')
        }
      } catch (error) {
        console.error('Error adding fund holdings:', error)
        ElMessage.error('Failed to add fund holdings')
      } finally {
        addingFund.value = false
      }
    }
  })
}

const showAddFundModal = () => {
  addFundModalVisible.value = true
  addFundForm.value = {
    symbol: '',
    name: '',
    sector: '',
    quantity: 0,
    purchase_price: 0,
    purchase_date: '',
    notes: ''
  }
  addFundFormRef.value?.resetFields()
}

// 生命周期
onMounted(async () => {
  await loadFundData()
  loading.value = false
})
</script>

<style scoped>
.fund-section {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  background: #f5f7fa;
  min-height: 100vh;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  gap: 15px;
}

.loading-overlay .el-icon {
  font-size: 2em;
  color: #409eff;
}

/* Header */
.section-header {
  text-align: center;
  margin-bottom: 30px;
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.section-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 2.5em;
  font-weight: 700;
}

.section-header p {
  color: #7f8c8d;
  font-size: 1.1em;
  margin-bottom: 15px;
}

.login-notice {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 15px;
  color: #856404;
  font-size: 0.9em;
  max-width: 500px;
  margin: 0 auto;
}

/* Fund Types Overview */
.fund-types-container {
  margin-bottom: 40px;
}

.fund-types-container h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.5em;
  font-weight: 600;
}

.fund-types-scroll {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 10px 0;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

.fund-types-scroll::-webkit-scrollbar {
  height: 8px;
}

.fund-types-scroll::-webkit-scrollbar-track {
  background: #f7fafc;
  border-radius: 4px;
}

.fund-types-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 4px;
}

.fund-types-scroll::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

.fund-type-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #e1e8ed;
  min-width: 280px;
  flex-shrink: 0;
}

.fund-type-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.type-icon {
  font-size: 2.5em;
  margin-bottom: 15px;
  text-align: center;
}

.fund-type-card h3 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 1.3em;
  text-align: center;
}

.fund-type-card p {
  color: #7f8c8d;
  text-align: center;
  margin-bottom: 20px;
  line-height: 1.5;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fund-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.metric {
  text-align: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
}

.metric .label {
  display: block;
  font-size: 0.7em;
  color: #6c757d;
  margin-bottom: 5px;
  font-weight: 500;
}

.metric .value {
  display: block;
  font-weight: bold;
  color: #2c3e50;
  font-size: 1em;
}

.metric .value.positive {
  color: #27ae60;
}

.metric .value.negative {
  color: #e74c3c;
}

/* Holdings Table */
.holdings-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.holdings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.holdings-header h2 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.5em;
}

.holdings-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}



.holdings-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;
  overflow-x: auto;
  max-width: 100%;
}

/* 自定义滚动条样式 */
.holdings-table::-webkit-scrollbar {
  height: 8px;
}

.holdings-table::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.holdings-table::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.holdings-table::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Table Styles */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  min-width: 1200px;
}

:deep(.el-table .cell) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.el-table th .cell) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
  padding: 8px 4px;
}

:deep(.el-table th) {
  background: #f8f9fa;
  color: #2c3e50;
  font-weight: 600;
}

:deep(.el-table td) {
  color: #2c3e50;
}

:deep(.held-fund) {
  background: #f0f9ff;
}

:deep(.available-fund) {
  background: #fff;
}

.symbol-cell {
  display: flex;
  flex-direction: column;
}

.symbol-cell .symbol {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1.1em;
}

.name-cell {
  display: flex;
  flex-direction: column;
}

.name-cell .name {
  font-weight: 600;
  color: #2c3e50;
}

.name-cell .sector {
  font-size: 0.8em;
  color: #7f8c8d;
}

.value {
  font-weight: 600;
  color: #2c3e50;
}

.price {
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

/* Fund Allocation */
.fund-allocation {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.fund-allocation h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.5em;
}

.allocation-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  align-items: stretch;
  min-height: 500px;
}

.allocation-chart {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
}

.chart-container {
  width: 100%;
  flex: 1;
  min-height: 400px;
}

.allocation-summary {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 30px;
  min-width: 320px;
  height: 500px;
  border: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.allocation-summary h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.3rem;
  font-weight: 600;
  text-align: center;
}

/* Custom scrollbar for allocation summary */
.allocation-summary::-webkit-scrollbar {
  width: 6px;
}

.allocation-summary::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.allocation-summary::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.allocation-summary::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.summary-stats {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-bottom: 30px;
  flex: 1;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.summary-item:hover {
  background: #e9ecef;
  transform: translateY(-1px);
}

.summary-item .label {
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
}

.summary-item .value {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1rem;
}

.portfolio-analysis h4 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
}

.analysis-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  flex: 1;
}

.analysis-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.analysis-item:hover {
  background: #e9ecef;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.analysis-icon {
  font-size: 1.2rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: white;
}

.analysis-content {
  flex: 1;
}

.analysis-title {
  color: #6c757d;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 2px;
}

.analysis-value {
  color: #2c3e50;
  font-size: 0.95rem;
  font-weight: 600;
}

.prediction-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.prediction-section h5 {
  color: #2c3e50;
  margin-bottom: 12px;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
}

.prediction-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.prediction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.prediction-label {
  color: #6c757d;
  font-size: 0.85rem;
  font-weight: 500;
}

.prediction-value {
  font-weight: 600;
  font-size: 0.9rem;
}

.prediction-value.positive {
  color: #27ae60;
}

.prediction-value.negative {
  color: #e74c3c;
}

/* Modal Styles */
:deep(.fund-detail-modal) {
  border-radius: 12px;
}

.fund-detail-content {
  max-height: 70vh;
  overflow-y: auto;
}

.fund-basic-info {
  margin-bottom: 30px;
}

.fund-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.fund-title h3 {
  color: #2c3e50;
  margin-bottom: 5px;
  font-size: 1.5em;
}

.fund-symbol {
  color: #7f8c8d;
  font-size: 1.1em;
  margin: 0;
}

.fund-actions {
  display: flex;
  gap: 10px;
}

.fund-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.stat-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  border: 1px solid #e1e8ed;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.9em;
  margin-bottom: 5px;
  display: block;
}

.stat-value {
  color: #2c3e50;
  font-weight: 600;
  font-size: 1.2em;
}

.fund-performance-chart {
  margin-bottom: 30px;
}

.fund-performance-chart h4 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 1.2em;
}

.fund-volatility h4 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 1.2em;
}

.volatility-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.volatility-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e1e8ed;
}

.volatility-item .period {
  color: #7f8c8d;
  font-size: 0.9em;
}

.volatility-item .value {
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

.volatility-item .value.positive {
  color: #27ae60;
}

.volatility-item .value.negative {
  color: #e74c3c;
}

/* Trade Modal */
.trade-form {
  padding: 20px 0;
}

.trade-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid #e1e8ed;
}

.trade-info h4 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 1.2em;
}

.trade-info p {
  color: #7f8c8d;
  margin: 5px 0;
  font-size: 0.9em;
}

.total-amount {
  font-size: 1.2em;
  font-weight: 600;
  color: #409eff;
}

/* Add Fund Holdings Modal */
.add-fund-form {
  padding: 20px 0;
}

.add-fund-form .el-form-item {
  margin-bottom: 20px;
}

.add-fund-form .el-input,
.add-fund-form .el-select,
.add-fund-form .el-input-number,
.add-fund-form .el-date-picker {
  width: 100%;
}

.add-fund-form .el-textarea__inner {
  resize: vertical;
  min-height: 80px;
}

/* 分页容器样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
  background: white;
  border-top: 1px solid #e1e8ed;
}

/* Responsive Design */
@media (max-width: 768px) {
  .fund-section {
    padding: 15px;
  }
  
  .fund-types-scroll {
    gap: 15px;
  }
  
  .fund-type-card {
    min-width: 250px;
    padding: 20px;
  }
  
  .holdings-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .holdings-actions {
    justify-content: center;
  }
  
  .allocation-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .allocation-chart {
    padding: 20px;
    min-height: 350px;
  }
  
  .chart-container {
    height: 350px;
  }
  
  .allocation-summary {
    padding: 20px;
    height: 400px;
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
    align-items: stretch;
  }
  
  .fund-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .fund-actions {
    justify-content: center;
  }
  
  .summary-stats {
    grid-template-columns: 1fr;
  }
  
  .volatility-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .section-header h1 {
    font-size: 2em;
  }
  
  .fund-metrics {
    flex-direction: column;
  }
  
  .category-stats {
    grid-template-columns: 1fr;
  }
}
</style> 