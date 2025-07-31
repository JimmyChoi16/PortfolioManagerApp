<template>
  <div class="home">
    <!-- Top Navigation Bar -->
    <header class="top-nav">
      <div class="nav-left">
        <div class="logo">
          <h1>Portfolio Manager</h1>
        </div>
        <nav class="nav-menu">
          <router-link to="/app/dashboard" class="nav-link">Investment Dashboard</router-link>
          <router-link to="/app/holdings" class="nav-link">Holdings</router-link>
          <router-link to="/app/performance" class="nav-link">Performance</router-link>
          <router-link to="/app/allocation" class="nav-link">Allocation</router-link>
          <router-link to="/app/analytics" class="nav-link">Analytics</router-link>
        </nav>
      </div>
      <div class="nav-right">
        <el-button type="primary" @click="showLogin = true">Login</el-button>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-left">
        <div class="hero-content">
          <div class="content-background">
            <div class="subtitle">PORTFOLIO MANAGEMENT PLATFORM</div>
            <h2 class="main-headline">智能投资组合管理系统</h2>
            <p class="hero-description">
              我们提供专业的投资组合管理解决方案，帮助投资者实时监控资产表现、分析投资风险、优化资产配置。
              通过先进的数据分析和可视化技术，让您的投资决策更加科学和精准。
            </p>
            <div class="features">
              <div class="feature-item">
                <el-icon><TrendCharts /></el-icon>
                <span>实时市场数据</span>
              </div>
              <div class="feature-item">
                <el-icon><PieChart /></el-icon>
                <span>资产配置分析</span>
              </div>
              <div class="feature-item">
                <el-icon><DataAnalysis /></el-icon>
                <span>风险评估</span>
              </div>
            </div>
            <el-button class="cta-button" @click="navigateToDashboard">
              <el-icon><ArrowRight /></el-icon>
              开始使用投资仪表板
            </el-button>
          </div>
        </div>
      </div>
      <div class="hero-right">
        <div class="hero-image">
          <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" alt="Investment Analytics" />
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="contact-info">
          <div class="contact-item">
            <el-icon><Phone /></el-icon>
            <span>电话：400-123-4567</span>
          </div>
          <div class="contact-item">
            <el-icon><Message /></el-icon>
            <span>邮箱：contact@yourcompany.com</span>
          </div>
          <div class="contact-item">
            <el-icon><Location /></el-icon>
            <span>地址：北京市朝阳区投资大厦123号</span>
          </div>
        </div>
      </div>
    </footer>

    <!-- Login Modal -->
    <el-dialog v-model="showLogin" title="登录" width="400px" center>
      <el-form :model="loginForm" ref="loginFormRef" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showLogin = false">取消</el-button>
        <el-button type="primary" @click="handleLogin">登录</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, TrendCharts, PieChart, DataAnalysis, Phone, Message, Location } from '@element-plus/icons-vue'

const router = useRouter()
const showLogin = ref(false)
const loginForm = ref({
  username: '',
  password: ''
})

const navigateToDashboard = () => {
  router.push('/app/dashboard')
}

const handleLogin = () => {
  // Handle login logic here
  console.log('Login attempt:', loginForm.value)
  showLogin.value = false
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Top Navigation */
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 0 32px;
  height: 60px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  z-index: 10;
}

.nav-left {
  display: flex;
  align-items: center;
}

.logo h1 {
  color: #303133;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  margin-right: 48px;
}

.nav-menu {
  display: flex;
  gap: 32px;
}

.nav-link {
  color: #606266;
  text-decoration: none;
  font-size: 1rem;
  padding: 6px 0;
  transition: color 0.2s;
  border-bottom: 2px solid transparent;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #6A95CC;
  border-bottom: 2px solid #6A95CC;
}

.nav-right {
  display: flex;
  align-items: center;
}

/* Hero Section */
.hero-section {
  display: flex;
  min-height: calc(100vh - 60px - 100px);
}

.hero-left {
  flex: 1;
  background: #fff;
  color: #303133;
  padding: 60px 40px;
  display: flex;
  align-items: center;
}

.hero-content {
  max-width: 700px;
  width: 100%;
}

.content-background {
  background-color: #f5f7fa;
  padding: 50px 40px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin: 20px 0;
}

.subtitle {
  color: #ff4444;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 24px;
}

.main-headline {
  font-size: 2.8rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 24px;
  color: #303133;
}

.hero-description {
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 32px;
  color: #606266;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.1rem;
  color: #606266;
}

.feature-item .el-icon {
  color: #6A95CC;
  font-size: 1.3rem;
}

.cta-button {
  background: #6A95CC;
  color: #fff;
  border: 1px solid #6A95CC;
  padding: 14px 28px;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.cta-button:hover {
  background: #337ecc;
  transform: translateY(-2px);
}

.hero-right {
  flex: 1;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* Footer */
.footer {
  background: #181818;
  color: #fff;
  padding: 40px;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
}

.contact-info {
  display: flex;
  justify-content: center;
  gap: 60px;
  flex-wrap: wrap;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1rem;
  color: #fff;
}

.contact-item .el-icon {
  color: #6A95CC;
  font-size: 1.2rem;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .hero-section {
    flex-direction: column;
  }
  
  .hero-left {
    padding: 50px 30px;
  }
  
  .content-background {
    padding: 40px 30px;
  }
  
  .main-headline {
    font-size: 2.2rem;
  }
  
  .contact-info {
    gap: 40px;
  }
}

@media (max-width: 768px) {
  .top-nav {
    padding: 0 16px;
  }
  
  .nav-menu {
    gap: 16px;
  }
  
  .logo h1 {
    margin-right: 24px;
  }
  
  .hero-left {
    padding: 30px 20px;
  }
  
  .content-background {
    padding: 30px 20px;
    margin: 15px 0;
  }
  
  .main-headline {
    font-size: 1.8rem;
  }
  
  .hero-description {
    font-size: 1.1rem;
  }
  
  .feature-item {
    font-size: 1rem;
  }
  
  .contact-info {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .footer {
    padding: 30px 20px;
  }
}

@media (max-width: 480px) {
  .nav-menu {
    display: none;
  }
  
  .hero-left {
    padding: 20px 15px;
  }
  
  .content-background {
    padding: 25px 15px;
    margin: 10px 0;
  }
  
  .main-headline {
    font-size: 1.5rem;
  }
  
  .hero-description {
    font-size: 1rem;
  }
  
  .features {
    gap: 12px;
  }
  
  .feature-item {
    font-size: 0.9rem;
  }
  
  .cta-button {
    padding: 12px 24px;
    font-size: 1rem;
  }
}
</style> 