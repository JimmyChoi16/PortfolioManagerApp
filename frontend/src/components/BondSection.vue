<template>
  <div class="bond-section">
    <!-- Login Warning -->
    <div v-if="!currentLoginState" class="login-warning">
      <el-alert
        :title="t('bond.loginWarning')"
        type="warning"
        :closable="false"
        show-icon
      />
    </div>

    <!-- Header -->
    <div class="section-header">
      <h1>{{ t('bond.title') }}</h1>
      <p>{{ t('bond.subtitle') }}</p>
    </div>

    <!-- Bond Types Overview -->
    <div class="bond-types">
      <div class="bond-type-card" v-for="(stats, type) in bondTypeStats" :key="type">
        <div class="type-icon">{{ getBondTypeIcon(type) }}</div>
        <h3>{{ getBondTypeName(type) }}</h3>
        <p>{{ getBondTypeDescription(type) }}</p>
        <div class="bond-metrics">
          <div class="metric">
            <span class="label">{{ t('bond.yield') }}</span>
            <span class="value">{{ stats.count > 0 && !isNaN(stats.yield) ? stats.yield + '%' : 'N/A' }}</span>
          </div>
          <div class="metric">
            <span class="label">{{ t('bond.duration') }}</span>
            <span class="value">{{ stats.count > 0 && !isNaN(stats.duration) ? stats.duration + ' ' + t('bond.years') : 'N/A' }}</span>
          </div>
        </div>
      </div>

      <!-- Show message if no bonds -->
      <div v-if="totalBondCount === 0" class="no-bonds-message">
        <div class="type-icon">📊</div>
        <h3>{{ t('bond.noBondsYet') }}</h3>
        <p>{{ t('bond.noBondsYetDesc') }}</p>
      </div>
    </div>

    <!-- Bond Holdings Table -->
    <div class="bond-holdings">
      <div class="holdings-header">
        <div class="header-left">
          <h2>{{ t('bond.currentBondHoldings') }}</h2>
          <span class="bond-count">({{ bonds.length }} {{ t('bond.bonds') }})</span>
        </div>
        <!-- Only show buy bond button if logged in -->
        <el-button v-if="isLoggedIn" type="primary" @click="showAddBondDialog = true" :icon="Plus">
          {{ t('bond.buyBond') }}
        </el-button>
      </div>
      <!-- Demo Notice -->
      <div v-if="!currentLoginState && bonds.length === 0" class="demo-notice">
        <p>{{ t('bond.demoMode') }}</p>
      </div>

      <div class="holdings-table">
        <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>{{ t('bond.tableHeaders.bondName') }}</th>
              <th>{{ t('bond.tableHeaders.ticker') }}</th>
              <th>{{ t('bond.tableHeaders.type') }}</th>
              <th>{{ t('bond.tableHeaders.faceValue') }}</th>
              <th>{{ t('bond.tableHeaders.couponRate') }}</th>
              <th>{{ t('bond.tableHeaders.maturity') }}</th>
              <th>{{ t('bond.tableHeaders.currentYield') }}</th>
              <th v-if="currentLoginState">{{ t('bond.tableHeaders.action') }}</th>
            </tr>
          </thead>
          <tbody>
              <tr v-for="bond in bonds" :key="bond.id">
                <td>{{ bond.name }}</td>
                <td>{{ bond.symbol }}</td>
                <td>{{ getBondTypeDisplayName(bond) }}</td>
                <td>${{ formatNumber(bond.face_value) }}</td>
                <td>{{ bond.coupon_rate }}%</td>
                <td>{{ formatDate(bond.maturity_date) }}</td>
                <!-- <td>{{ formatMaturityDate(bond.maturity_date) }}</td> -->
                <td class="positive">{{ bond.current_yield }}%</td>
                <td v-if="currentLoginState">
                  <el-button v-size="small" type="danger" @click="sellBond(bond.id)" :icon="Delete">{{ t('bond.sell') }}</el-button>
                </td>
            </tr>
              <tr v-if="bonds.length === 0">
                <td :colspan="currentLoginState ? 8 : 7" class="no-data">{{ t('bond.noBondsFound') }}</td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>

    <!-- Add/Edit Bond Dialog -->
    <el-dialog 
      v-model="showAddBondDialog" 
      title="Buy New Bond"
      width="600px"
    >
      <el-form :model="bondForm" :rules="bondRules" ref="bondFormRef" label-width="120px">
        <el-form-item label="Bond Name" prop="name">
          <el-input v-model="bondForm.name" placeholder="e.g., U.S. Treasury 10-Year" />
        </el-form-item>
        
        <el-form-item label="Symbol" prop="symbol">
          <el-input v-model="bondForm.symbol" placeholder="e.g., UST10Y" />
        </el-form-item>
        
        <el-form-item label="Type" prop="type">
          <el-select v-model="bondForm.type" placeholder="Select bond type">
            <el-option label="Government" value="government" />
            <el-option label="Corporate" value="corporate" />
            <el-option label="Municipal" value="municipal" />
            <el-option label="International" value="international" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="Quantity" prop="quantity">
          <el-input-number v-model="bondForm.quantity" :min="0" :precision="2" />
        </el-form-item>
        
        <el-form-item label="Purchase Price" prop="purchase_price">
          <el-input-number v-model="bondForm.purchase_price" :min="0" :precision="2" />
        </el-form-item>
        
        <el-form-item label="Purchase Date" prop="purchase_date">
          <el-date-picker v-model="bondForm.purchase_date" type="date" placeholder="Select date" />
        </el-form-item>
        
        <el-form-item label="Coupon Rate (%)" prop="coupon_rate">
          <el-input-number v-model="bondForm.coupon_rate" :min="0" :max="100" :precision="2" />
        </el-form-item>
        
        <el-form-item label="Maturity Date" prop="maturity_date">
          <el-date-picker 
            v-model="bondForm.maturity_date" 
            type="date" 
            placeholder="Select date"
            :disabled-date="disabledDate"
          />
        </el-form-item>
        
        <el-form-item label="Face Value" prop="face_value">
          <el-input-number v-model="bondForm.face_value" :min="0" :precision="2" />
        </el-form-item>
        
        <el-form-item label="Sector" prop="sector">
          <el-input v-model="bondForm.sector" placeholder="e.g., Government, Technology" />
        </el-form-item>
        
        <el-form-item label="Notes" prop="notes">
          <el-input v-model="bondForm.notes" type="textarea" :rows="3" placeholder="Additional notes..." />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showAddBondDialog = false">Cancel</el-button>
        <el-button type="primary" @click="buyBond" :loading="saving">
          Buy Bond
        </el-button>
      </template>
    </el-dialog>

    <!-- Yield Curve -->
    <div class="yield-curve">
      <div class="curve-chart">
        <!-- Chart Title Inside the Frame -->
        <h2 class="chart-title-inside-frame">Yield Curve Analysis</h2>
        <!-- Chart Description Below Title -->
        <p class="chart-description-below-title">Visualizes the relationship between bond yields and their maturity durations</p>
        
        <div v-if="loading" class="chart-loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <p>Loading bond data...</p>
        </div>
        <div v-else-if="yieldCurveData.length > 0" class="yield-curve-chart">
          <!-- Simplified Professional Chart -->
          <div class="chart-container-new">
            <!-- Chart with integrated axes -->
            <div class="chart-with-axes">
              <!-- Y-axis title at top -->
              <div class="y-axis-title-top">Yield (%)</div>
              
              <!-- Y-axis labels -->
              <div class="y-axis-labels">
                <div 
                  v-for="(tick, index) in yAxisTicks" 
                  :key="tick" 
                  class="y-label"
                  :style="{ bottom: `${(index / (yAxisTicks.length - 1)) * 100}%` }"
                >
                  {{ tick.toFixed(1) }}%
                </div>
              </div>
              
              <!-- Main chart area with SVG -->
              <div class="chart-main">
                <svg class="full-chart-svg" :viewBox="`0 0 ${chartWidth} ${chartHeight}`">
                  <!-- Grid lines -->
                  <g class="grid">
                    <!-- Horizontal grid lines -->
                    <line 
                      v-for="(tick, index) in yAxisTicks" 
                      :key="`h-${tick}`"
                      x1="0" 
                      :y1="chartHeight - (index / (yAxisTicks.length - 1)) * chartHeight"
                      :x2="chartWidth" 
                      :y2="chartHeight - (index / (yAxisTicks.length - 1)) * chartHeight"
                      stroke="#e5e7eb" 
                      stroke-width="1"
                      stroke-dasharray="2,2"
                    />
                    <!-- Vertical grid lines -->
                    <line 
                      v-for="(tick, index) in xAxisTicks" 
                      :key="`v-${tick}`"
                      :x1="(index / (xAxisTicks.length - 1)) * chartWidth" 
                      y1="0"
                      :x2="(index / (xAxisTicks.length - 1)) * chartWidth" 
                      :y2="chartHeight"
                      stroke="#e5e7eb" 
                      stroke-width="1"
                      stroke-dasharray="2,2"
                    />
                  </g>
                  
                  <!-- Yield curve line -->
                  <polyline 
                    :points="correctCurvePoints" 
                    fill="none" 
                    stroke="#2563eb" 
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  
                  <!-- Data points -->
                  <circle
                    v-for="(point, index) in sortedYieldData"
                    :key="index"
                    :cx="getCorrectX(point.duration)"
                    :cy="getCorrectY(point.yield)"
                    r="6"
                    fill="#2563eb"
                    stroke="white"
                    stroke-width="2"
                    class="data-circle"
                    @mouseover="showPointTooltip($event, point)"
                    @mouseleave="hidePointTooltip"
                  >
                    <title>{{ point.symbol }}: {{ point.yield }}% yield, {{ point.duration }} years</title>
                  </circle>
                </svg>
              </div>
              
              <!-- Custom Tooltip -->
              <div 
                v-if="showTooltip && tooltipData" 
                class="chart-tooltip"
                :style="{ 
                  left: tooltipPosition.x + 'px', 
                  top: tooltipPosition.y + 'px' 
                }"
              >
                <div class="tooltip-header">{{ tooltipData.symbol }}</div>
                <div class="tooltip-row">
                  <span class="tooltip-label">Yield:</span>
                  <span class="tooltip-value">{{ tooltipData.yield.toFixed(2) }}%</span>
                </div>
                <div class="tooltip-row">
                  <span class="tooltip-label">Duration:</span>
                  <span class="tooltip-value">{{ tooltipData.duration.toFixed(1) }} years</span>
                </div>
                <div class="tooltip-row">
                  <span class="tooltip-label">Maturity:</span>
                  <span class="tooltip-value">
                    {{ formatMaturityDate(tooltipData.maturityDate) }}
                  </span>
                </div>
              </div>
              
              <!-- X-axis labels -->
              <div class="x-axis-labels">
                <div 
                  v-for="(tick, index) in xAxisTicks" 
                  :key="tick" 
                  class="x-label"
                  :style="{ left: `${(index / (xAxisTicks.length - 1)) * 100}%` }"
                >
                  {{ tick }}y
                </div>
                <!-- X-axis title -->
                <div class="x-axis-title">Duration (Years)</div>
              </div>
            </div>
          </div>
          
          <!-- Chart Statistics -->
          <div class="chart-stats">
            <div class="stat-item">
              <span class="stat-label">Average Yield:</span>
              <span class="stat-value">{{ averageYield }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Average Maturity:</span>
              <span class="stat-value">{{ averageDuration }} years</span>
            </div>
          </div>
        </div>
        <div v-else class="chart-placeholder">
          <div class="chart-icon">📊</div>
          <p>No Yield Curve Data</p>
          <span>Add bonds to your portfolio to see yield curve analysis</span>
        </div>
      </div>
    </div>

    <!-- Bond Ladder -->
    <div class="bond-ladder">
      <h2>Bond Ladder Strategy</h2>
      
      <!-- Ladder Analysis Dashboard -->
      <div class="ladder-dashboard">
        <div class="dashboard-cards">
          <div class="dashboard-card">
            <div class="card-icon">🎯</div>
            <div class="card-content">
              <h3>Total Ladder Value</h3>
              <p class="card-value">${{ ladderStats.totalValue.toLocaleString() }}</p>
            </div>
          </div>
          <div class="dashboard-card">
            <div class="card-icon">📅</div>
            <div class="card-content">
              <h3>Average Maturity</h3>
              <p class="card-value">{{ ladderStats.avgMaturity }} years</p>
            </div>
          </div>
          <div class="dashboard-card">
            <div class="card-icon">📊</div>
            <div class="card-content">
              <h3>Weighted Yield</h3>
              <p class="card-value">{{ ladderStats.weightedYield }}%</p>
            </div>
          </div>
          <div class="dashboard-card">
            <div class="card-icon">⚖️</div>
            <div class="card-content">
              <h3>Ladder Health</h3>
              <p class="card-value" :class="ladderHealthClass">{{ ladderStats.health }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Ladder Steps Analysis -->
      <div class="ladder-analysis">
        <h3>Ladder Distribution Analysis</h3>
        <div class="ladder-steps-new">
          <div 
            v-for="step in ladderSteps" 
            :key="step.period"
            class="ladder-step-new"
            :class="{ 'has-gaps': step.hasGaps }"
          >
            <div class="step-header">
              <div class="step-period">{{ step.period }}</div>
              <div class="step-count">{{ step.bonds.length }} bonds</div>
            </div>
            <div class="step-content">
              <div class="step-value">${{ step.totalValue.toLocaleString() }}</div>
              <div class="step-yield">{{ step.avgYield }}% avg yield</div>
              <div class="step-bonds">
                <div 
                  v-for="bond in step.bonds" 
                  :key="bond.id"
                  class="step-bond"
                  :style="{ backgroundColor: getBondColor(bond.bond_type) }"
                >
                  {{ bond.symbol }}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isLoggedIn: {
    type: Boolean,
    default: false
  }
})
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Loading } from '@element-plus/icons-vue'
import bondsAPI from '@/api/bonds'

const { t } = useI18n()

// Reactive data
const bonds = ref([])
const showAddBondDialog = ref(false)
const saving = ref(false)
const loading = ref(false) // Added loading state
const bondFormRef = ref(null) // Add missing form reference

// Mock data for unlogged users
const mockBonds = [
  {
    id: 1,
    symbol: 'UST10Y',
    name: 'U.S. Treasury 10-Year',
    bond_type: 'government',
    coupon_rate: '4.25',
    maturity_date: '2034-05-14',
    face_value: '50000.00',
    current_yield: '4.28',
    credit_rating: 'AAA',
    issuer: 'U.S. Treasury',
    quantity: '100.000000',
    purchase_price: '150.00',
    purchase_date: '2023-01-14',
    current_price: '175.50',
    sector: 'Government',
    notes: 'Core government holding'
  },
  {
    id: 2,
    symbol: 'AAPL5Y',
    name: 'Apple Inc. 5-Year',
    bond_type: 'corporate',
    coupon_rate: '3.85',
    maturity_date: '2029-03-14',
    face_value: '25000.00',
    current_yield: '4.12',
    credit_rating: 'AA+',
    issuer: 'Apple Inc.',
    quantity: '50.000000',
    purchase_price: '400.00',
    purchase_date: '2023-02-09',
    current_price: '520.00',
    sector: 'Technology',
    notes: 'Tech sector exposure'
  },
  {
    id: 3,
    symbol: 'CAMUNI7',
    name: 'California Muni 7-Year',
    bond_type: 'municipal',
    coupon_rate: '3.45',
    maturity_date: '2031-08-19',
    face_value: '30000.00',
    current_yield: '3.52',
    credit_rating: 'AA',
    issuer: 'State of California',
    quantity: '75.000000',
    purchase_price: '280.00',
    purchase_date: '2023-03-04',
    current_price: '420.00',
    sector: 'Municipal',
    notes: 'Tax-advantaged income'
  },
  {
    id: 4,
    symbol: 'DEBUND5',
    name: 'German Bund 5-Year',
    bond_type: 'international',
    coupon_rate: '2.15',
    maturity_date: '2029-12-09',
    face_value: '20000.00',
    current_yield: '2.18',
    credit_rating: 'AAA',
    issuer: 'German Government',
    quantity: '25.000000',
    purchase_price: '200.00',
    purchase_date: '2023-04-11',
    current_price: '250.00',
    sector: 'International',
    notes: 'International diversification'
  },
  {
    id: 5,
    symbol: 'UST30Y',
    name: 'U.S. Treasury 30-Year',
    bond_type: 'government',
    coupon_rate: '3.75',
    maturity_date: '2053-01-14',
    face_value: '100000.00',
    current_yield: '3.95',
    credit_rating: 'AAA',
    issuer: 'U.S. Treasury',
    quantity: '40.000000',
    purchase_price: '130.00',
    purchase_date: '2023-05-31',
    current_price: '145.00',
    sector: 'Government',
    notes: 'Long-term government bond'
  },
  {
    id: 6,
    symbol: 'MSFT7Y',
    name: 'Microsoft Corp. 7-Year',
    bond_type: 'corporate',
    coupon_rate: '4.15',
    maturity_date: '2030-02-19',
    face_value: '75000.00',
    current_yield: '4.05',
    credit_rating: 'AA+',
    issuer: 'Microsoft Corp.',
    quantity: '200.000000',
    purchase_price: '200.00',
    purchase_date: '2023-01-24',
    current_price: '245.00',
    sector: 'Technology',
    notes: 'Tech corporate bond'
  }
]

// Use the prop for login state, with fallback to localStorage
const currentLoginState = computed(() => {
  return props.isLoggedIn || localStorage.getItem('isLoggedIn') === 'true'
})

// Initialize login state from localStorage (for backward compatibility)
const initializeLoginState = () => {
  // This is now handled by the computed property
}

// Listen for localStorage changes (when user logs in/out in another tab or component)
const handleStorageChange = (event) => {
  if (event.key === 'isLoggedIn') {
    // Reload bonds data when login state changes
    loadBonds()
  }
}

// Tooltip state
const showTooltip = ref(false)
const tooltipData = ref(null)
const tooltipPosition = ref({ x: 0, y: 0 })

// Form data
const bondForm = ref({
  name: '',
  symbol: '',
  type: 'government',
  quantity: 0,
  purchase_price: 0,
  purchase_date: '',
  coupon_rate: 0,
  maturity_date: '',
  face_value: 0,
  sector: '',
  notes: ''
})

// Form validation rules
const bondRules = {
  name: [{ required: true, message: 'Bond name is required', trigger: 'blur' }],
  symbol: [{ required: true, message: 'Symbol is required', trigger: 'blur' }],
  type: [{ required: true, message: 'Bond type is required', trigger: 'change' }],
  quantity: [{ required: true, message: 'Quantity is required', trigger: 'blur' }],
  purchase_price: [{ required: true, message: 'Purchase price is required', trigger: 'blur' }],
  purchase_date: [{ required: true, message: 'Purchase date is required', trigger: 'change' }],
  coupon_rate: [{ required: true, message: 'Coupon rate is required', trigger: 'blur' }],
  maturity_date: [{ required: true, message: 'Maturity date is required', trigger: 'change' }],
  face_value: [{ required: true, message: 'Face value is required', trigger: 'blur' }]
}

// Methods
// Test API function for debugging
const testAPIDirectly = async () => {
  try {
    // Test with fetch API directly
    const fetchResponse = await fetch('/api/bonds')
    const fetchData = await fetchResponse.json()
    
    // Test with bondsAPI
    const apiResponse = await bondsAPI.getBonds()
    
    return { fetchData, apiResponse }
  } catch (error) {
    console.error('Direct API test failed:', error)
  }
}

// Load bonds from database
const loadBonds = async () => {
  try {
    loading.value = true
    
    if (!currentLoginState.value) {
      // Use mock data for unlogged users
      bonds.value = mockBonds
      return
    }
    
    // Load real data from API for logged in users
    
    // First test API directly
    await testAPIDirectly()
    
    const response = await bondsAPI.getBonds()
    
    // Check if response has the expected structure
    if (response && response.data && response.data.success && Array.isArray(response.data.data)) {
      bonds.value = response.data.data
    } else if (response && response.data && Array.isArray(response.data)) {
      bonds.value = response.data
    } else {
      console.warn('Unexpected API response structure:', response)
      bonds.value = []
    }
    
  } catch (error) {
    console.error('Failed to load bonds:', error)
    console.error('Error details:', error.response?.data || error.message)
    
    if (currentLoginState.value) {
      // Only show error for logged in users
      ElMessage.error('Failed to load bonds: ' + (error.response?.data?.message || error.message))
    }
    
    // Fallback to mock data on error
    bonds.value = mockBonds
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  const today = new Date()
  const maturityDate = new Date()
  maturityDate.setFullYear(today.getFullYear() + 5) // Default 5 years from today
  
  bondForm.value = {
    name: '',
    symbol: '',
    type: 'government',
    quantity: 100,
    purchase_price: 100.00,
    purchase_date: today.toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    coupon_rate: 4.00,
    maturity_date: maturityDate.toISOString().split('T')[0], // 5 years from today
    face_value: 10000,
    sector: 'Government',
    notes: ''
  }
}

const buyBond = async () => {
  if (!bondFormRef.value) {
    console.error('bondFormRef.value is null or undefined')
    ElMessage.error('Form reference not found. Please try again.')
    return
  }
  
  try {
    await bondFormRef.value.validate()
    saving.value = true
    
    if (!currentLoginState.value) {
      // For unlogged users, add to mock data
      const newBond = {
        id: Date.now(), // Generate a temporary ID
        ...bondForm.value,
        bond_type: bondForm.value.type,
        current_yield: bondForm.value.coupon_rate,
        current_price: bondForm.value.purchase_price,
        face_value: bondForm.value.purchase_price * bondForm.value.quantity
      }
      bonds.value.push(newBond)
      ElMessage.success('Bond purchased successfully (demo mode)')
      showAddBondDialog.value = false
      resetForm()
      return
    }
    
    // Prepare bond data with proper mapping for backend
    const bondData = {
      symbol: bondForm.value.symbol,
      name: bondForm.value.name,
      bond_type: bondForm.value.type, // Map 'type' to 'bond_type'
      quantity: parseFloat(bondForm.value.quantity),
      purchase_price: parseFloat(bondForm.value.purchase_price),
      purchase_date: formatDateForMySQL(bondForm.value.purchase_date),
      current_price: parseFloat(bondForm.value.purchase_price), // Initially same as purchase price
      coupon_rate: parseFloat(bondForm.value.coupon_rate),
      maturity_date: formatDateForMySQL(bondForm.value.maturity_date),
      face_value: parseFloat(bondForm.value.face_value),
      current_yield: parseFloat(bondForm.value.coupon_rate), // Initially same as coupon rate
      credit_rating: 'A', // Default credit rating
      issuer: bondForm.value.sector || 'Unknown',
      sector: bondForm.value.sector,
      notes: bondForm.value.notes || ''
    }
    
    const response = await bondsAPI.createBond(bondData)
    ElMessage.success('Bond purchased successfully')
    showAddBondDialog.value = false
    resetForm()
    await loadBonds()
  } catch (error) {
    console.error('Failed to buy bond:', error)
    ElMessage.error('Failed to buy bond: ' + (error.response?.data?.message || error.message))
  } finally {
    saving.value = false
  }
}

const sellBond = async (bondId) => {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to sell this bond?',
      'Sell Bond',
      {
        confirmButtonText: 'Sell',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )
    
    if (!currentLoginState.value) {
      // For unlogged users, just remove from mock data
      bonds.value = bonds.value.filter(bond => bond.id !== bondId)
      ElMessage.success('Bond sold successfully (demo mode)')
      return
    }
    
    await bondsAPI.deleteBond(bondId)
    ElMessage.success(t('bond.bondSoldSuccessfully'))
    await loadBonds()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to sell bond:', error)
      ElMessage.error(t('bond.failedToSellBond'))
    }
  }
}

const formatNumber = (value) => {
  return new Intl.NumberFormat().format(value)
}

// Format maturity date to YY-MM-DD HH:MM:SS format
const formatMaturityDate = (dateString) => {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Invalid Date'
  
  const year = date.getFullYear().toString().slice(-2) // 取年份后两位
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toISOString().split('T')[0] // YYYY-MM-DD format
}

// Helper functions for date handling
const disabledDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7 // Disable past dates
}

// Format date for MySQL (YYYY-MM-DD)
const formatDateForMySQL = (dateString) => {
  if (!dateString) return null
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

// Calculate duration in years from maturity date
const calculateDuration = (maturityDate) => {
  if (!maturityDate) return 0
  const today = new Date()
  const maturity = new Date(maturityDate)
  const diffTime = maturity.getTime() - today.getTime()
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25)
  return Math.max(0, parseFloat(diffYears.toFixed(1)))
}

const calculateMaturityDate = (force = false) => {
  // Auto-calculate maturity date based on bond type
  if (bondForm.value.type && bondForm.value.purchase_date && (force || !bondForm.value.maturity_date)) {
    const purchaseDate = new Date(bondForm.value.purchase_date)
    let yearsToAdd = 5 // Default 5 years
    
    switch (bondForm.value.type) {
      case 'government':
        yearsToAdd = 5 // 5-year Treasury note
        break
      case 'corporate':
        yearsToAdd = 3 // 3-year corporate bond
        break
      case 'municipal':
        yearsToAdd = 5 // 5-year municipal bond
        break
      case 'international':
        yearsToAdd = 3 // 3-year international bond
        break
    }
    
    const maturityDate = new Date(purchaseDate)
    maturityDate.setFullYear(maturityDate.getFullYear() + yearsToAdd)
    bondForm.value.maturity_date = maturityDate.toISOString().split('T')[0] // YYYY-MM-DD format
  }
}

// Bond type statistics computed property
const bondTypeStats = computed(() => {
  const stats = {
    government: { yield: 0, duration: 0, count: 0, totalValue: 0 },
    corporate: { yield: 0, duration: 0, count: 0, totalValue: 0 },
    municipal: { yield: 0, duration: 0, count: 0, totalValue: 0 },
    international: { yield: 0, duration: 0, count: 0, totalValue: 0 }
  }
  
  bonds.value.forEach(bond => {
    // Use bond_type from the new bond table
    const bondType = bond.bond_type || 'government'
    
    if (stats[bondType]) {
      // 确保 current_yield 是数字，处理null、undefined、空字符串等情况
      let currentYield = 0
      if (bond.current_yield !== null && bond.current_yield !== undefined && bond.current_yield !== '') {
        currentYield = parseFloat(bond.current_yield)
        if (isNaN(currentYield)) {
          currentYield = 0
        }
      }
      
      const duration = calculateDuration(bond.maturity_date) || 0
      const value = (bond.quantity || 0) * (bond.current_price || 0)
      
      stats[bondType].yield += currentYield
      stats[bondType].duration += duration
      stats[bondType].count += 1
      stats[bondType].totalValue += value
    }
  })
  
  // Calculate averages
  Object.keys(stats).forEach(type => {
    if (stats[type].count > 0) {
      const avgYield = stats[type].yield / stats[type].count
      const avgDuration = stats[type].duration / stats[type].count
      
      // 确保结果不是NaN
      if (!isNaN(avgYield)) {
        stats[type].yield = avgYield.toFixed(2)
      } else {
        stats[type].yield = '0.00'
      }
      
      if (!isNaN(avgDuration)) {
        stats[type].duration = avgDuration.toFixed(1)
      } else {
        stats[type].duration = '0.0'
      }
    }
  })
  
  return stats
})

// Total bond count
const totalBondCount = computed(() => {
  return bonds.value.length
})

// Yield curve data computed property - updated to use real database data
const yieldCurveData = computed(() => {
  return bonds.value
    .filter(bond => {
      // Filter out bonds without required data for yield curve
      const hasYield = bond.current_yield !== null && bond.current_yield !== undefined && bond.current_yield !== ''
      const hasMaturity = bond.maturity_date !== null && bond.maturity_date !== undefined && bond.maturity_date !== ''
      
      return hasYield && hasMaturity
    })
    .map(bond => {
      const duration = calculateDuration(bond.maturity_date)
      const yield_value = parseFloat(bond.current_yield)
      
      return {
        symbol: bond.symbol,
        yield: yield_value,
        duration: duration,
        bond_type: bond.bond_type,
        name: bond.name,
        maturityDate: bond.maturity_date // Add maturityDate to the point object
      }
    })
    .filter(point => {
      // Filter out invalid points
      const isValid = !isNaN(point.yield) && !isNaN(point.duration) && point.duration > 0
      return isValid
    })
    .sort((a, b) => a.duration - b.duration)
})

// Chart statistics
const maxYield = computed(() => {
  if (yieldCurveData.value.length === 0) return 1
  return Math.max(...yieldCurveData.value.map(point => point.yield))
})

const minYield = computed(() => {
  if (yieldCurveData.value.length === 0) return 0
  return Math.min(...yieldCurveData.value.map(point => point.yield))
})

const maxDuration = computed(() => {
  if (yieldCurveData.value.length === 0) return 1
  return Math.max(...yieldCurveData.value.map(point => point.duration))
})

const minDuration = computed(() => {
  if (yieldCurveData.value.length === 0) return 0
  return Math.min(...yieldCurveData.value.map(point => point.duration))
})

const averageYield = computed(() => {
  if (yieldCurveData.value.length === 0) return 0
  const total = yieldCurveData.value.reduce((sum, point) => sum + point.yield, 0)
  return (total / yieldCurveData.value.length).toFixed(2)
})

const averageDuration = computed(() => {
  if (yieldCurveData.value.length === 0) return 0
  const total = yieldCurveData.value.reduce((sum, point) => sum + point.duration, 0)
  return (total / yieldCurveData.value.length).toFixed(1)
})

const curveSlope = computed(() => {
  if (yieldCurveData.value.length < 2) return 'Insufficient Data'
  
  const sortedData = yieldCurveData.value.sort((a, b) => a.duration - b.duration)
  const shortTerm = sortedData[0]
  const longTerm = sortedData[sortedData.length - 1]
  
  const slope = (longTerm.yield - shortTerm.yield) / (longTerm.duration - shortTerm.duration)
  
  if (slope > 0.1) return 'Steep'
  if (slope > 0.05) return 'Normal'
  if (slope > -0.05) return 'Flat'
  return 'Inverted'
})

const curveSlopeClass = computed(() => {
  const slope = curveSlope.value
  if (slope === 'Steep') return 'positive'
  if (slope === 'Normal') return 'positive'
  if (slope === 'Flat') return 'neutral'
  if (slope === 'Inverted') return 'negative'
  return 'neutral'
})

// Chart ticks and padding
const padding = 40

// Y-axis ticks (yield percentages) - always start from 0, with extra margin at top
const yAxisTicks = computed(() => {
  if (yieldCurveData.value.length === 0) return [0, 1, 2, 3, 4, 5]
  
  const dataMaxYield = Math.max(...yieldCurveData.value.map(point => point.yield))
  // Add 2-3 percentage points margin above the highest data point
  const maxYield = Math.ceil(dataMaxYield + 2.5)
  const step = Math.max(0.5, maxYield / 5)
  const ticks = []
  
  for (let i = 0; i <= maxYield; i += step) {
    ticks.push(parseFloat(i.toFixed(1)))
  }
  
  return ticks.length > 0 ? ticks : [0, 1, 2, 3, 4, 5]
})

// X-axis ticks (duration years) - already starts from 0
const xAxisTicks = computed(() => {
  if (yieldCurveData.value.length === 0) return [0, 2, 4, 6, 8, 10]
  
  const maxDuration = Math.ceil(Math.max(...yieldCurveData.value.map(point => point.duration)))
  const step = Math.max(1, maxDuration / 5)
  const ticks = []
  
  for (let i = 0; i <= maxDuration; i += step) {
    ticks.push(Math.round(i))
  }
  
  return ticks.length > 0 ? ticks : [0, 2, 4, 6, 8, 10]
})

// Chart dimensions
const chartWidth = 500
const chartHeight = 300

// Sorted yield data for consistent ordering
const sortedYieldData = computed(() => {
  return [...yieldCurveData.value].sort((a, b) => a.duration - b.duration)
})

// SVG coordinate calculation functions - both axes start from 0
const getCorrectX = (duration) => {
  if (sortedYieldData.value.length === 0) return 0
  const maxDuration = Math.max(...sortedYieldData.value.map(point => point.duration))
  // X-axis starts from 0, so duration is directly proportional
  return maxDuration > 0 ? (duration / maxDuration) * chartWidth : chartWidth / 2
}

const getCorrectY = (yield_value) => {
  if (sortedYieldData.value.length === 0) return chartHeight / 2
  
  // Use the same calculation as yAxisTicks to ensure consistency
  const dataMaxYield = Math.max(...sortedYieldData.value.map(point => point.yield))
  const maxYield = Math.ceil(dataMaxYield + 2.5)
  
  // Y-axis starts from 0, invert Y coordinate (SVG Y increases downward, but we want higher yields at top)
  return maxYield > 0 ? chartHeight - (yield_value / maxYield) * chartHeight : chartHeight / 2
}

// SVG curve points for polyline
const correctCurvePoints = computed(() => {
  if (sortedYieldData.value.length === 0) return ''
  
  return sortedYieldData.value.map(point => {
    const x = getCorrectX(point.duration)
    const y = getCorrectY(point.yield)
    return `${x},${y}`
  }).join(' ')
})

// Helper functions for bond type display
const getBondTypeIcon = (type) => {
  const icons = {
    government: '🏛️',
    corporate: '🏢',
    municipal: '🏘️',
    international: '🌍'
  }
  return icons[type] || '📊'
}

const getBondTypeName = (type) => {
  const names = {
    government: t('bond.types.government'),
    corporate: t('bond.types.corporate'),
    municipal: t('bond.types.municipal'),
    international: t('bond.types.international')
  }
  return names[type] || 'Other Bonds'
}

const getBondTypeDescription = (type) => {
  const descriptions = {
    government: t('bond.typeDescriptions.government'),
    corporate: t('bond.typeDescriptions.corporate'),
    municipal: t('bond.typeDescriptions.municipal'),
    international: t('bond.typeDescriptions.international')
  }
  return descriptions[type] || 'Fixed income securities'
}



// Get display name for bond type
const getBondTypeDisplayName = (bond) => {
  // Use bond_type from the new bond table
  const bondType = bond.bond_type || 'government'
  
  // Return display name
  const displayNames = {
    'government': t('bond.types.government'),
    'corporate': t('bond.types.corporate'),
    'municipal': t('bond.types.municipal'),
    'international': t('bond.types.international')
  }
  
  return displayNames[bondType] || 'Bond'
}

// Tooltip functions
const showPointTooltip = (event, point) => {
  tooltipData.value = point
  const rect = event.target.getBoundingClientRect()
  const container = event.target.closest('.chart-container-new').getBoundingClientRect()
  
  tooltipPosition.value = {
    x: rect.left - container.left + rect.width / 2,
    y: rect.top - container.top - 10
  }
  showTooltip.value = true
}

const hidePointTooltip = () => {
  showTooltip.value = false
  tooltipData.value = null
}

// Bond Ladder Analysis Functions
const ladderStats = computed(() => {
  if (bonds.value.length === 0) {
    return {
      totalValue: 0,
      avgMaturity: '0.0',
      weightedYield: '0.00',
      health: 'No Data'
    }
  }

  const totalValue = bonds.value.reduce((sum, bond) => {
    return sum + (bond.quantity * bond.current_price)
  }, 0)

  const weightedYieldSum = bonds.value.reduce((sum, bond) => {
    const bondValue = bond.quantity * bond.current_price
    const yield_value = parseFloat(bond.current_yield) || 0
    return sum + (bondValue * yield_value)
  }, 0)

  const avgMaturity = bonds.value.reduce((sum, bond) => {
    return sum + calculateDuration(bond.maturity_date)
  }, 0) / bonds.value.length

  const weightedYield = totalValue > 0 ? weightedYieldSum / totalValue : 0

  // Calculate ladder health based on distribution
  const health = calculateLadderHealth()

  return {
    totalValue,
    avgMaturity: avgMaturity.toFixed(1),
    weightedYield: weightedYield.toFixed(2),
    health
  }
})

const calculateLadderHealth = () => {
  if (bonds.value.length === 0) return 'No Data'
  if (bonds.value.length < 3) return 'Poor'
  
  const years = bonds.value.map(bond => {
    const maturity = new Date(bond.maturity_date)
    return maturity.getFullYear()
  })
  
  const uniqueYears = [...new Set(years)].sort()
  const yearGaps = []
  
  for (let i = 1; i < uniqueYears.length; i++) {
    const gap = uniqueYears[i] - uniqueYears[i-1]
    if (gap > 2) yearGaps.push(gap)
  }
  
  if (yearGaps.length === 0) return 'Excellent'
  if (yearGaps.length <= 2) return 'Good'
  return 'Needs Improvement'
}

const ladderHealthClass = computed(() => {
  const health = ladderStats.value.health
  if (health === 'Excellent') return 'health-excellent'
  if (health === 'Good') return 'health-good'
  if (health === 'Needs Improvement') return 'health-poor'
  return 'health-neutral'
})

// Ladder Steps Analysis
const ladderSteps = computed(() => {
  const currentYear = new Date().getFullYear()
  const steps = [
    { period: 'Short-term (1-3 years)', minYear: currentYear + 1, maxYear: currentYear + 3, bonds: [], hasGaps: false },
    { period: 'Medium-term (4-7 years)', minYear: currentYear + 4, maxYear: currentYear + 7, bonds: [], hasGaps: false },
    { period: 'Long-term (8+ years)', minYear: currentYear + 8, maxYear: currentYear + 20, bonds: [], hasGaps: false }
  ]
  
  // Categorize bonds into steps
  bonds.value.forEach(bond => {
    const maturityYear = new Date(bond.maturity_date).getFullYear()
    
    for (let step of steps) {
      if (maturityYear >= step.minYear && maturityYear <= step.maxYear) {
        step.bonds.push(bond)
        break
      }
    }
  })
  
  // Calculate statistics for each step
  steps.forEach(step => {
    step.totalValue = step.bonds.reduce((sum, bond) => sum + (bond.quantity * bond.current_price), 0)
    step.avgYield = step.bonds.length > 0 
      ? (step.bonds.reduce((sum, bond) => sum + parseFloat(bond.current_yield), 0) / step.bonds.length).toFixed(2)
      : '0.00'
    
    // Check for gaps
    step.hasGaps = step.bonds.length === 0 || step.totalValue < 50000
  })
  
  return steps
})

// Lifecycle
onMounted(() => {
  // Check if user is logged in (you can implement your own logic)
  initializeLoginState()
  
  // Listen for localStorage changes
  window.addEventListener('storage', handleStorageChange)
  
  // Initialize form with default values
  resetForm()
  
  // Always load bonds data (mock for unlogged, real for logged)
  loadBonds()
})

// Cleanup on unmount
onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
})

// Watch for bond type changes to auto-calculate maturity date
watch(() => bondForm.value.type, (newType) => {
  if (newType && bondForm.value.purchase_date && !bondForm.value.maturity_date) {
    // Only auto-calculate if maturity date is empty
    calculateMaturityDate()
  }
})

const getBondColor = (bondType) => {
  const colors = {
    government: '#3b82f6',
    corporate: '#10b981',
    municipal: '#f59e0b',
    international: '#8b5cf6'
  }
  return colors[bondType] || '#6b7280'
}

// Ladder Steps Analysis
</script>

<style scoped>
.bond-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* Component-specific styles only */
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

.bond-types {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 50px;
}

.bond-type-card {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
  padding: 32px 24px;
  border-radius: 16px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.bond-type-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(17, 153, 142, 0.3);
}

.type-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.bond-type-card h3 {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.bond-type-card p {
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 20px;
  line-height: 1.5;
}

.bond-metrics {
  display: flex;
  justify-content: space-around;
  gap: 16px;
}

.no-bonds-message {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  color: #6c757d;
  padding: 32px 24px;
  border-radius: 16px;
  text-align: center;
  grid-column: 1 / -1;
  border: 2px dashed #dee2e6;
}

.no-bonds-message .type-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.6;
}

.no-bonds-message h3 {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #495057;
}

.no-bonds-message p {
  font-size: 1rem;
  opacity: 0.8;
  margin: 0;
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

.bond-holdings {
  margin-bottom: 50px;
}

.holdings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.holdings-header h2 {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.bond-count {
  font-size: 1rem;
  color: #7f8c8d;
  font-weight: 500;
}

.demo-notice {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  text-align: center;
}

.demo-notice p {
  margin: 0;
  color: #856404;
  font-size: 0.9rem;
  font-weight: 500;
}

.holdings-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-container {
  max-height: 400px; /* 限制最大高度，大约6行数据 */
  overflow-y: auto; /* 垂直滚动 */
  overflow-x: auto; /* 水平滚动，以防表格太宽 */
}

.table-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.holdings-table table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px; /* 确保表格有最小宽度 */
}

.holdings-table th,
.holdings-table td {
  padding: 16px 20px;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

.holdings-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.holdings-table tr:hover {
  background: #f8f9fa;
}

.positive {
  color: #27ae60;
  font-weight: 600;
}

.no-data {
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
  padding: 40px 20px;
}

.holdings-table td:last-child {
  text-align: center;
}

.holdings-table .el-button {
  margin: 0 4px;
}

.yield-curve {
  margin-bottom: 50px;
  text-align: center;
}

.yield-curve h2 {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 24px;
}

.curve-chart {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 40px 20px;
}

.yield-curve-chart {
  text-align: center;
}

.chart-header {
  margin-bottom: 30px;
}

.chart-header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.chart-header p {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0;
}

.chart-container-new {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin: 20px 0;
  position: relative; /* Added for tooltip positioning */
}

.chart-title-inside-frame {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 24px;
  text-align: center;
}

.chart-description-below-title {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-top: 8px;
  margin-bottom: 24px;
  font-style: italic;
  text-align: center;
}

.chart-with-axes {
  position: relative;
  display: grid;
  grid-template-columns: 60px 1fr;
  grid-template-rows: 1fr auto;
  gap: 10px;
  height: 350px;
}

.y-axis-labels {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 0;
}

.y-label {
  position: absolute;
  right: 8px;
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
  transform: translateY(50%);
}

.y-axis-title-top {
  position: absolute;
  top: 5px;
  left: -25px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
  transform: rotate(-90deg);
  transform-origin: center;
  white-space: nowrap;
}

.chart-main {
  position: relative;
  background: #fafafa;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.full-chart-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.data-circle {
  cursor: pointer;
  transition: all 0.2s ease;
}

.data-circle:hover {
  r: 8;
  filter: drop-shadow(0 2px 8px rgba(37, 99, 235, 0.4));
}

.x-axis-labels {
  grid-column: 2;
  position: relative;
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.x-label {
  position: absolute;
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
  transform: translateX(-50%);
}

.x-axis-title {
  position: absolute;
  right: 0;
  bottom: -25px;
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 600;
}

.axis-titles {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.y-axis-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  transform: rotate(-90deg);
  margin-left: -20px;
}

.x-axis-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin-right: 50px;
}



.curve-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.curve-line::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(52, 152, 219, 0.3) 50%, transparent 70%);
  border-radius: 2px;
}

.chart-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 30px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.stat-label {
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 500;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2c3e50;
}

.stat-value.positive {
  color: #27ae60;
}

.stat-value.negative {
  color: #e74c3c;
}

.stat-value.neutral {
  color: #f39c12;
}

.chart-placeholder {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}

.chart-loading {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.chart-loading .el-icon {
  font-size: 2rem;
  margin-bottom: 12px;
  color: #409eff;
}

.chart-loading p {
  margin: 0;
  font-size: 1rem;
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

.bond-ladder {
  padding: 40px 20px;
  text-align: center;
}

.bond-ladder h2 {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 32px;
}

.bond-ladder h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 32px 0 20px 0;
}

/* Dashboard Cards */
.ladder-dashboard {
  margin-bottom: 40px;
}

.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.dashboard-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.dashboard-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.card-icon {
  font-size: 2rem;
  margin-bottom: 12px;
}

.card-content h3 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #6b7280;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.health-excellent { color: #10b981; }
.health-good { color: #3b82f6; }
.health-poor { color: #ef4444; }
.health-neutral { color: #6b7280; }

/* Ladder Steps Analysis */
.ladder-analysis {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.ladder-steps-new {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.ladder-step-new {
  background: linear-gradient(135deg, #fffbeb 0%, #fbbf24 100%);
  border-radius: 12px;
  padding: 24px;
  border: none;
  transition: all 0.3s ease;
}

.ladder-step-new.has-gaps {
  background: linear-gradient(135deg, #fef3c7 0%, #f59e0b 100%);
  border: none;
}

.ladder-step-new:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.step-period {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
}

.step-count {
  font-size: 0.9rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 4px 12px;
  border-radius: 20px;
}

.step-content {
  text-align: left;
}

.step-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #059669;
  margin-bottom: 8px;
}

.step-yield {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 16px;
}

.step-bonds {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.step-bond {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  color: white;
  font-weight: 600;
}

/* Tooltip Styles */
.chart-tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px 15px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  pointer-events: none;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.tooltip-header {
  font-size: 1rem;
  font-weight: 700;
  color: #f39c12;
  margin-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 5px;
}

.tooltip-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.tooltip-label {
  color: #b8c2cc;
}

.tooltip-value {
  color: #f39c12;
}

/* Legacy ladder styles - keep for compatibility */
.ladder-visualization {
  display: flex;
  justify-content: center;
  gap: 32px;
  flex-wrap: wrap;
}

.ladder-step {
  background: linear-gradient(135deg, #fceabb 0%, #f8b500 100%);
  padding: 24px 20px;
  border-radius: 12px;
  min-width: 200px;
  text-align: center;
  transition: transform 0.3s ease;
}

.ladder-step:hover {
  transform: translateY(-4px);
}

.step-number {
  width: 40px;
  height: 40px;
  background: #2c3e50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  margin: 0 auto 16px;
}

.step-info h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.step-info p {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin: 0;
}

@media (max-width: 768px) {
  .bond-types {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .section-header h1 {
    font-size: 2rem;
  }
  
  .table-container {
    max-height: 300px; /* 移动端稍微降低高度 */
  }
  
  .holdings-table table {
    min-width: 700px;
  }
  
  .ladder-visualization {
    flex-direction: column;
    align-items: center;
  }
  
  /* New Bond Ladder Mobile Styles */
  .dashboard-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .dashboard-card {
    padding: 16px;
  }
  
  .card-value {
    font-size: 1.4rem;
  }
  
  .ladder-steps-new {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .ladder-step-new {
    padding: 16px;
  }
}
</style> 