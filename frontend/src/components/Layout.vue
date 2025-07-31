<template>
  <div class="layout-container">
    <!-- Top Navigation Bar -->
    <header class="top-nav">
      <div class="nav-left">
        <div class="logo">
          <el-icon size="32" color="#409eff">
            <TrendCharts />
          </el-icon>
          <h2>Portfolio Manager</h2>
        </div>
        <nav class="nav-menu">
          <router-link v-for="route in menuRoutes" :key="route.path" :to="route.path" class="nav-link" active-class="active">
            <el-icon style="vertical-align: middle; margin-right: 4px;">
              <component :is="route.meta.icon" />
            </el-icon>
            <span>{{ route.meta.title }}</span>
          </router-link>
        </nav>
      </div>
      <div class="nav-right">
        <LanguageSwitcher />
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
    </header>

    <!-- Main Content -->
    <div class="main-content">
      <h1 class="page-title">{{ currentPageTitle }}</h1>
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
import LanguageSwitcher from './LanguageSwitcher.vue'
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
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  padding: 0 20px;
  height: 60px;
  z-index: 10;
}

.nav-left {
  display: flex;
  align-items: center;
  height:60PX
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 1.2rem;
  margin-right: 32px;
}

.logo h2 {
  color: #303133;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
}

.nav-menu {
  display: flex;
  gap: 24px;
}

.nav-link {
  color: #606266;
  text-decoration: none;
  font-size: 1rem;
  padding: 6px 0;
  display: flex;
  align-items: center;
  transition: color 0.2s, border-bottom 0.2s;
  border-bottom: 2px solid transparent;
  margin-right: 8px;
}

.nav-link.active,
.nav-link:hover {
  color: #409eff;
  border-bottom: 2px solid #409eff;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.main-content {
  flex: 1 1 auto;
  padding: 32px 24px 24px 24px;
  background: #f7f8fa;
  min-height: 0;
}

.page-title {
  color: #303133;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 18px 0;
}

.content-area {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  min-height: 400px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

@media (max-width: 768px) {
  .top-nav {
    flex-direction: column;
    height: auto;
    padding: 0 12px;
  }
  .logo {
    margin-right: 12px;
  }
  .nav-menu {
    gap: 12px;
  }
  .main-content {
    padding: 16px 6px 12px 6px;
  }
  .content-area {
    padding: 10px;
  }
  .page-title {
    font-size: 1.2rem;
  }
}
</style>