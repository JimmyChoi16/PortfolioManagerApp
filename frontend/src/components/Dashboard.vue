<template>
  <div class="dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <h1>Welcome back! 👋</h1>
        <p>Here's your portfolio overview</p>
        <div class="header-actions">
          <el-button type="primary" @click="refreshData" :loading="loading">
            <el-icon><Refresh /></el-icon>
            Refresh Data
          </el-button>
          <el-button @click="logout">
            <el-icon><SwitchButton /></el-icon>
            Logout
          </el-button>
        </div>
      </div>
    </div>

    <!-- Portfolio Summary Cards -->
    <div class="summary-cards" v-if="portfolioSummary">
      <div class="summary-card total-value">
        <div class="card-icon">💰</div>
        <div class="card-content">
          <h3>Total Value</h3>
          <p class="card-value">${{ formatNumber(portfolioSummary.total_value) }}</p>
          <span class="card-change" :class="portfolioSummary.total_gain >= 0 ? 'positive' : 'negative'">
            {{ portfolioSummary.total_gain >= 0 ? '+' : '' }}${{ formatNumber(portfolioSummary.total_gain) }}
            ({{ portfolioSummary.avg_gain_percent >= 0 ? '+' : '' }}{{ portfolioSummary.avg_gain_percent }}%)
          </span>
        </div>
      </div>

      <div class="summary-card holdings-count">
        <div class="card-icon">📊</div>
        <div class="card-content">
          <h3>Total Holdings</h3>
          <p class="card-value">{{ portfolioSummary.total_holdings }}</p>
          <span class="card-subtitle">Active investments</span>
        </div>
      </div>

      <div class="summary-card avg-return">
        <div class="card-icon">📈</div>
        <div class="card-content">
          <h3>Avg Return</h3>
          <p class="card-value" :class="portfolioSummary.avg_gain_percent >= 0 ? 'positive' : 'negative'">
            {{ portfolioSummary.avg_gain_percent >= 0 ? '+' : '' }}{{ portfolioSummary.avg_gain_percent }}%
          </p>
          <span class="card-subtitle">Portfolio average</span>
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
        <el-button @click="updatePrices">
          <el-icon><Refresh /></el-icon>
          Update Prices
        </el-button>
        <el-button @click="viewAnalysis">
          <el-icon><DataAnalysis /></el-icon>
          View Analysis
        </el-button>
      </div>
    </div>

    <!-- Holdings Table -->
    <div class="holdings-section">
      <div class="section-header">
        <h2>Your Holdings</h2>
        <div class="table-actions">
          <el-input
            v-model="searchQuery"
            placeholder="Search holdings..."
            prefix-icon="Search"
            clearable
            style="width: 300px"
          />
        </div>
      </div>

      <el-table
        :data="filteredHoldings"
        style="width: 100%"
        :loading="loading"
        stripe
        border
      >
        <el-table-column prop="symbol" label="Symbol" width="100" />
        <el-table-column prop="name" label="Name" min-width="200" />
        <el-table-column prop="type" label="Type" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="Quantity" width="120" />
        <el-table-column prop="current_price" label="Current Price" width="120">
          <template #default="{ row }">
            ${{ formatNumber(row.current_price) }}
          </template>
        </el-table-column>
        <el-table-column prop="current_value" label="Current Value" width="140">
          <template #default="{ row }">
            ${{ formatNumber(row.current_value) }}
          </template>
        </el-table-column>
        <el-table-column prop="gain_percent" label="Gain/Loss" width="120">
          <template #default="{ row }">
            <span :class="row.gain_percent >= 0 ? 'positive' : 'negative'">
              {{ row.gain_percent >= 0 ? '+' : '' }}{{ row.gain_percent }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="editHolding(row)">Edit</el-button>
            <el-button size="small" type="danger" @click="deleteHolding(row.id)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
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

    <!-- Analysis Dialog -->
    <el-dialog
      v-model="showAnalysis"
      title="Portfolio Analysis"
      width="800px"
    >
      <el-tabs v-model="activeAnalysisTab">
        <el-tab-pane label="Allocation" name="allocation">
          <div v-if="allocationData.length > 0">
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
        </el-tab-pane>

        <el-tab-pane label="Performance" name="performance">
          <div v-if="performanceData" class="performance-summary">
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
        </el-tab-pane>

        <el-tab-pane label="Sector Analysis" name="sector">
          <div v-if="sectorData.length > 0">
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
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, SwitchButton, Plus, DataAnalysis, Search } from '@element-plus/icons-vue'
import portfolioAPI from '../api/portfolio.js'

const emit = defineEmits(['goToAssetPage'])

// Reactive data
const loading = ref(false)
const saving = ref(false)
const showAddHolding = ref(false)
const showAnalysis = ref(false)
const activeAnalysisTab = ref('allocation')
const searchQuery = ref('')
const editingHolding = ref(null)

// Data
const holdings = ref([])
const portfolioSummary = ref(null)
const allocationData = ref([])
const performanceData = ref(null)
const sectorData = ref([])

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

// Computed
const filteredHoldings = computed(() => {
  if (!searchQuery.value) return holdings.value
  const query = searchQuery.value.toLowerCase()
  return holdings.value.filter(holding => 
    holding.symbol.toLowerCase().includes(query) ||
    holding.name.toLowerCase().includes(query) ||
    holding.type.toLowerCase().includes(query)
  )
})

// Methods
const loadData = async () => {
  loading.value = true
  try {
    const [holdingsRes, summaryRes] = await Promise.all([
      portfolioAPI.getHoldings(),
      portfolioAPI.getPortfolioSummary()
    ])
    
    if (holdingsRes.data.success) {
      holdings.value = holdingsRes.data.data
    }
    
    if (summaryRes.data.success) {
      portfolioSummary.value = summaryRes.data.data.summary
    }
  } catch (error) {
    ElMessage.error('Failed to load portfolio data')
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadData()
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

const viewAnalysis = async () => {
  showAnalysis.value = true
  try {
    const [allocationRes, performanceRes, sectorRes] = await Promise.all([
      portfolioAPI.getAllocationAnalysis(),
      portfolioAPI.getPerformanceAnalysis(),
      portfolioAPI.getSectorAnalysis()
    ])
    
    if (allocationRes.data.success) {
      allocationData.value = allocationRes.data.data
    }
    
    if (performanceRes.data.success) {
      performanceData.value = performanceRes.data.data
    }
    
    if (sectorRes.data.success) {
      sectorData.value = sectorRes.data.data
    }
  } catch (error) {
    ElMessage.error('Failed to load analysis data')
    console.error('Error loading analysis:', error)
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

const deleteHolding = async (id) => {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to delete this holding?',
      'Confirm Delete',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )
    
    await portfolioAPI.deleteHolding(id)
    ElMessage.success('Holding deleted successfully')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to delete holding')
      console.error('Error deleting holding:', error)
    }
  }
}

const logout = () => {
  // Clear localStorage and emit logout event
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('activePage')
  emit('logout')
}

const getTypeTagType = (type) => {
  const types = {
    stock: 'primary',
    bond: 'success',
    fund: 'warning',
    cash: 'info',
    crypto: 'danger'
  }
  return types[type] || 'default'
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
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.dashboard-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 40px;
  text-align: center;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.dashboard-header p {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 24px;
}

.header-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-4px);
}

.card-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.card-content h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.card-value {
  font-size: 1.8rem;
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

.holdings-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.positive {
  color: #27ae60;
}

.negative {
  color: #e74c3c;
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
  background: #f8f9fa;
  border-radius: 8px;
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

@media (max-width: 768px) {
  .dashboard {
    padding: 20px 10px;
  }
  
  .dashboard-header {
    padding: 24px;
  }
  
  .dashboard-header h1 {
    font-size: 2rem;
  }
  
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .header-actions {
    flex-direction: column;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
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
}
</style> 