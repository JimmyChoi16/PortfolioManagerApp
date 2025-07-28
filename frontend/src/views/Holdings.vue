<template>
  <div class="holdings">
    <!-- Header with Actions -->
    <div class="holdings-header">
      <div class="header-info">
        <h2>Your Holdings</h2>
        <p>Manage your portfolio assets</p>
      </div>
      <div class="header-actions">
        <el-button
          type="primary"
          :icon="Plus"
          @click="openAddDialog"
          class="btn-add"
        >
          Add Holding
        </el-button>
        <el-button
          :icon="Refresh"
          @click="updatePrices"
          :loading="isUpdatingPrices"
        >
          Update Prices
        </el-button>
      </div>
    </div>

    <!-- Holdings Table -->
    <el-card class="custom-card">
      <el-table
        :data="holdings"
        v-loading="loading"
        class="holdings-table"
        stripe
        :header-cell-style="{ background: '#fafafa' }"
      >
        <el-table-column prop="symbol" label="Symbol" width="100">
          <template #default="scope">
            <el-tag type="primary" size="small">{{ scope.row.symbol }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="name" label="Name" min-width="200" />
        
        <el-table-column prop="type" label="Type" width="100">
          <template #default="scope">
            <el-tag 
              :type="getTypeTagType(scope.row.type)" 
              size="small"
            >
              {{ scope.row.type.toUpperCase() }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="quantity" label="Quantity" width="120" align="right">
          <template #default="scope">
            {{ formatNumber(scope.row.quantity) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="purchase_price" label="Purchase Price" width="140" align="right">
          <template #default="scope">
            ${{ formatCurrency(scope.row.purchase_price) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="current_price" label="Current Price" width="140" align="right">
          <template #default="scope">
            ${{ formatCurrency(scope.row.current_price) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="current_value" label="Market Value" width="140" align="right">
          <template #default="scope">
            ${{ formatCurrency(scope.row.current_value) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="unrealized_gain" label="Gain/Loss" width="140" align="right">
          <template #default="scope">
            <span :class="{
              'gain-positive': scope.row.unrealized_gain >= 0,
              'gain-negative': scope.row.unrealized_gain < 0
            }">
              {{ scope.row.unrealized_gain >= 0 ? '+' : '' }}${{ formatCurrency(Math.abs(scope.row.unrealized_gain)) }}
              ({{ scope.row.gain_percent >= 0 ? '+' : '' }}{{ scope.row.gain_percent }}%)
            </span>
          </template>
        </el-table-column>
        
        <el-table-column prop="purchase_date" label="Purchase Date" width="130">
          <template #default="scope">
            {{ formatDate(scope.row.purchase_date) }}
          </template>
        </el-table-column>
        
        <el-table-column label="Actions" width="120" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              :icon="Edit"
              size="small"
              @click="openEditDialog(scope.row)"
              link
            />
            <el-button
              type="danger"
              :icon="Delete"
              size="small"
              @click="confirmDelete(scope.row)"
              link
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Add/Edit Dialog -->
    <el-dialog
      :title="dialogMode === 'add' ? 'Add New Holding' : 'Edit Holding'"
      v-model="dialogVisible"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="120px"
        class="holding-form"
      >
        <el-form-item label="Symbol" prop="symbol">
          <el-input
            v-model="form.symbol"
            placeholder="e.g., AAPL"
            @input="form.symbol = form.symbol.toUpperCase()"
          />
        </el-form-item>
        
        <el-form-item label="Name" prop="name">
          <el-input
            v-model="form.name"
            placeholder="e.g., Apple Inc."
          />
        </el-form-item>
        
        <el-form-item label="Type" prop="type">
          <el-select v-model="form.type" placeholder="Select asset type">
            <el-option label="Stock" value="stock" />
            <el-option label="Bond" value="bond" />
            <el-option label="Fund/ETF" value="fund" />
            <el-option label="Crypto" value="crypto" />
            <el-option label="Cash" value="cash" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="Quantity" prop="quantity">
          <el-input-number
            v-model="form.quantity"
            :min="0.000001"
            :precision="6"
            :step="0.1"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="Purchase Price" prop="purchase_price">
          <el-input-number
            v-model="form.purchase_price"
            :min="0.01"
            :precision="2"
            :step="0.01"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="Purchase Date" prop="purchase_date">
          <el-date-picker
            v-model="form.purchase_date"
            type="date"
            placeholder="Select date"
            style="width: 100%"
            :disabled-date="disableFutureDate"
          />
        </el-form-item>
        
        <el-form-item v-if="dialogMode === 'edit'" label="Current Price" prop="current_price">
          <el-input-number
            v-model="form.current_price"
            :min="0.01"
            :precision="2"
            :step="0.01"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">Cancel</el-button>
          <el-button
            type="primary"
            @click="submitForm"
            :loading="isSubmitting"
          >
            {{ dialogMode === 'add' ? 'Add Holding' : 'Update Holding' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, 
  Edit, 
  Delete, 
  Refresh 
} from '@element-plus/icons-vue'

const portfolioStore = usePortfolioStore()

// Reactive state
const dialogVisible = ref(false)
const dialogMode = ref('add') // 'add' or 'edit'
const isSubmitting = ref(false)
const isUpdatingPrices = ref(false)
const formRef = ref()

// Form data
const form = ref({
  symbol: '',
  name: '',
  type: 'stock',
  quantity: 1,
  purchase_price: 0,
  purchase_date: '',
  current_price: 0
})

const editingId = ref(null)

// Computed properties
const holdings = computed(() => portfolioStore.holdings)
const loading = computed(() => portfolioStore.loading)

// Form validation rules
const formRules = {
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
    { type: 'number', min: 0.01, message: 'Price must be positive', trigger: 'blur' }
  ],
  purchase_date: [
    { required: true, message: 'Purchase date is required', trigger: 'change' }
  ]
}

// Methods
const openAddDialog = () => {
  dialogMode.value = 'add'
  dialogVisible.value = true
  resetForm()
}

const openEditDialog = (holding) => {
  dialogMode.value = 'edit'
  dialogVisible.value = true
  editingId.value = holding.id
  
  form.value = {
    symbol: holding.symbol,
    name: holding.name,
    type: holding.type,
    quantity: holding.quantity,
    purchase_price: holding.purchase_price,
    purchase_date: holding.purchase_date,
    current_price: holding.current_price
  }
}

const resetForm = () => {
  form.value = {
    symbol: '',
    name: '',
    type: 'stock',
    quantity: 1,
    purchase_price: 0,
    purchase_date: '',
    current_price: 0
  }
  editingId.value = null
  formRef.value?.clearValidate()
}

const submitForm = async () => {
  try {
    await formRef.value.validate()
    isSubmitting.value = true
    
    const formData = {
      ...form.value,
      purchase_date: formatDateForAPI(form.value.purchase_date)
    }
    
    if (dialogMode.value === 'add') {
      await portfolioStore.createHolding(formData)
      ElMessage.success('Holding added successfully')
    } else {
      await portfolioStore.updateHolding(editingId.value, formData)
      ElMessage.success('Holding updated successfully')
    }
    
    dialogVisible.value = false
    resetForm()
  } catch (error) {
    console.error('Error submitting form:', error)
  } finally {
    isSubmitting.value = false
  }
}

const confirmDelete = async (holding) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete ${holding.symbol}?`,
      'Confirm Delete',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    )
    
    await portfolioStore.deleteHolding(holding.id)
    ElMessage.success('Holding deleted successfully')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Error deleting holding:', error)
    }
  }
}

const updatePrices = async () => {
  try {
    isUpdatingPrices.value = true
    await portfolioStore.updateCurrentPrices()
    ElMessage.success('Prices updated successfully')
  } catch (error) {
    console.error('Error updating prices:', error)
  } finally {
    isUpdatingPrices.value = false
  }
}

// Utility functions
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

const formatNumber = (value) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6
  }).format(value)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US')
}

const formatDateForAPI = (date) => {
  if (typeof date === 'string') return date
  return date.toISOString().split('T')[0]
}

const disableFutureDate = (date) => {
  return date > new Date()
}

const getTypeTagType = (type) => {
  const typeMap = {
    stock: 'primary',
    bond: 'success',
    fund: 'warning',
    crypto: 'danger',
    cash: 'info'
  }
  return typeMap[type] || 'primary'
}

// Lifecycle
onMounted(async () => {
  await portfolioStore.fetchHoldings()
})
</script>

<style scoped>
.holdings {
  max-width: 1400px;
  margin: 0 auto;
}

.holdings-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.header-info h2 {
  margin: 0 0 4px 0;
  color: #303133;
  font-weight: 600;
}

.header-info p {
  margin: 0;
  color: #909399;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.holdings-table {
  width: 100%;
}

.gain-positive {
  color: #67c23a;
  font-weight: 600;
}

.gain-negative {
  color: #f56c6c;
  font-weight: 600;
}

.holding-form {
  padding: 0 20px;
}

.dialog-footer {
  text-align: right;
}

@media (max-width: 768px) {
  .holdings-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: flex-end;
  }
}
</style>