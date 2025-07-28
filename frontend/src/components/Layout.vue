<template>
  <div class="layout-container">
    <!-- Sidebar -->
    <div class="sidebar">
      <div class="logo-container">
        <div class="logo">
          <el-icon size="32" color="#409eff">
            <TrendCharts />
          </el-icon>
          <h2>Portfolio Manager</h2>
        </div>
        <p class="subtitle">Investment Dashboard</p>
      </div>
      
      <el-menu
        :default-active="$route.path"
        router
        class="sidebar-menu"
      >
        <el-menu-item 
          v-for="route in menuRoutes" 
          :key="route.path"
          :index="route.path"
        >
          <el-icon>
            <component :is="route.meta.icon" />
          </el-icon>
          <span>{{ route.meta.title }}</span>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Header -->
      <div class="header">
        <div class="header-content">
          <h1 class="page-title">{{ currentPageTitle }}</h1>
          <div class="header-actions">
            <el-button
              type="primary"
              :icon="Refresh"
              @click="refreshData"
              :loading="isRefreshing"
              size="small"
            >
              Refresh
            </el-button>
            <el-dropdown trigger="click">
              <el-button :icon="Setting" circle size="small" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>Settings</el-dropdown-item>
                  <el-dropdown-item>Export Data</el-dropdown-item>
                  <el-dropdown-item divided>Help</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>

      <!-- Content Area -->
      <div class="content-area">
        <transition name="fade" mode="out-in">
          <router-view />
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePortfolioStore } from '@/stores/portfolio'
import { 
  TrendCharts, 
  House, 
  Coin, 
  PieChart, 
  DataAnalysis, 
  Refresh, 
  Setting 
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const portfolioStore = usePortfolioStore()

const isRefreshing = ref(false)

// Menu routes
const menuRoutes = computed(() => {
  return router.getRoutes()
    .filter(route => route.meta?.title)
    .map(route => ({
      path: route.path,
      meta: route.meta
    }))
})

// Current page title
const currentPageTitle = computed(() => {
  return route.meta?.title || 'Portfolio Manager'
})

// Refresh data
const refreshData = async () => {
  try {
    isRefreshing.value = true
    await portfolioStore.refreshAll()
    ElMessage.success('Data refreshed successfully')
  } catch (error) {
    ElMessage.error('Failed to refresh data')
  } finally {
    isRefreshing.value = false
  }
}
</script>

<style scoped>
.logo-container {
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
  text-align: center;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 8px;
}

.logo h2 {
  color: #303133;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
}

.subtitle {
  color: #909399;
  font-size: 0.8rem;
  margin: 0;
}

.sidebar-menu {
  border-right: none;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.page-title {
  color: #303133;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

@media (max-width: 768px) {
  .logo h2 {
    display: none;
  }
  
  .page-title {
    font-size: 1.2rem;
  }
}
</style>