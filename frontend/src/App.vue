<template>
  <el-container class="app-container">
    <!-- 导航栏 -->
    <el-header height="70px" class="app-navbar">
      <div class="logo" @click="goHome" style="cursor: pointer;">PortfolioManager</div>
      <div class="nav-actions">
        <!-- Asset dropdown - always visible -->
        <el-dropdown trigger="click" class="asset-dropdown">
          <el-button class="asset-btn" :title="'Current: ' + currentPageDisplay + ' - Click to change'">
            <span>{{ currentPageDisplay }}</span>
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu class="asset-menu">
              <el-dropdown-item @click="setActivePage('dashboard')" v-if="isLoggedIn">
                📊
                <span>{{ $t('nav.dashboard') }}</span>
              </el-dropdown-item>
              <el-dropdown-item @click="setActivePage('home')" v-if="!isLoggedIn">
                🏠
                <span>{{ $t('nav.home') }}</span>
              </el-dropdown-item>
              <el-dropdown-item @click="setActivePage('stock')">
                📈
                <span>{{ $t('nav.stock') }}</span>
              </el-dropdown-item>
              <el-dropdown-item @click="setActivePage('fund')">
                💰
                <span>{{ $t('nav.fund') }}</span>
              </el-dropdown-item>
              <el-dropdown-item @click="setActivePage('bond')">
                💳
                <span>{{ $t('nav.bonds') }}</span>
              </el-dropdown-item>
              <el-dropdown-item @click="setActivePage('cash')">
                💵
                <span>{{ $t('nav.cash') }}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <LanguageSwitcher />
        
        <!-- Show login/logout button based on auth status -->
        <el-button 
          v-if="!isLoggedIn" 
          type="primary" 
          class="login-btn" 
          @click="goLogin"
        >
          {{ $t('nav.login') }}
        </el-button>
        <el-button 
          v-else 
          @click="logout" 
          class="logout-btn"
        >
          {{ $t('nav.logout') }}
        </el-button>
      </div>
    </el-header>

    <el-main class="app-main">
      <!-- Dashboard (logged in only) -->
      <template v-if="isLoggedIn && activePage === 'dashboard'">
        <NewDashboard @logout="handleLogout" />
      </template>

      <!-- <template v-if="isLoggedIn && activePage === 'dashboard'">
        <Dashboard @logout="handleLogout" />
      </template> -->
      
      <!-- Asset Pages (both logged in and not logged in) -->
      <template v-else-if="activePage === 'stock'">
        <StockSection :isLoggedIn="isLoggedIn" />
      </template>
      
      <template v-else-if="activePage === 'fund'">
        <FundSection :isLoggedIn="isLoggedIn" />
      </template>
      
      <template v-else-if="activePage === 'bond'">
        <BondSection :isLoggedIn="isLoggedIn" />
      </template>
      
      <template v-else-if="activePage === 'cash'">
        <CashSection :isLoggedIn="isLoggedIn" />
      </template>
      
      <!-- Home Page (not logged in) -->
      <template v-else-if="activePage === 'home'">
        <!-- Banner Section -->
        <section class="section-banner">
          <div class="section-content">
            <transition name="fade-slide">
              <div class="banner-content" v-if="showBanner">
                <h1 class="banner-title">{{ $t('home.title') }}</h1>
                <div class="banner-desc">
                  <p>{{ $t('home.description') }}</p>
                  <p>{{ $t('home.subtitle') }}</p>
                  <p>{{ $t('home.description') }}</p>
                </div>
              </div>
            </transition>
          </div>
        </section>

        <!-- About Section -->
        <section class="section-about">
          <div class="section-content">
            <transition name="fade-slide" appear>
              <div class="about-split">
                <div class="about-left">
                  <h2 class="about-title">{{ $t('home.aboutTitle') }}</h2>
                  <p class="about-description">{{ $t('home.aboutDesc') }}</p>
                </div>
                <div class="about-divider"></div>
                <div class="about-right">
                  <h3 class="features-title">{{ $t('home.features.title') }}</h3>
                  <ul class="features-list">
                    <li><strong>{{ $t('home.features.portfolio') }}</strong> </li>
                    <li><strong>{{ $t('home.features.realTime') }}</strong> </li>
                    <li><strong>{{ $t('home.features.analytics') }}</strong> </li>
                    <li><strong>{{ $t('home.features.privacy') }}</strong> </li>
                  </ul>
                </div>
              </div>
            </transition>
          </div>
        </section>

        <!-- Features Section -->
        <section class="section-features">
          <div class="section-content">
            <div class="features-grid">
              <div
                v-for="(feature, idx) in features"
                :key="feature.key"
                class="feature-card"
                @click="openFeature(idx)"
                @mouseenter="hoveredFeature = idx"
                @mouseleave="hoveredFeature = null"
                :class="['feature-card', 'feature-' + feature.key, { hovered: hoveredFeature === idx }]"
                tabindex="0"
              >
                <div class="feature-title">{{ feature.title }}</div>
                <div class="feature-brief">{{ feature.brief }}</div>
              </div>
            </div>
            
            <!-- Feature Modal -->
            <transition name="modal-fade">
              <div v-if="showModal" class="modal-mask" @click.self="closeModal">
                <div class="modal-dialog" :class="'modal-' + features[modalIndex].key">
                  <button class="modal-close" @click="closeModal">×</button>
                  <div class="modal-title">{{ features[modalIndex].title }}</div>
                  <div class="modal-content">
                    {{ features[modalIndex].content }}
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </section>
      </template>
      
      <!-- Login Page -->
      <template v-else-if="!isLoggedIn && activePage === 'login'">
        <LoginPage @goBack="goHome" @loginSuccess="handleLoginSuccess" />
      </template>
    </el-main>

    <el-footer class="footer">
      <div class="footer-content">© 2025 Team 3JS. All rights reserved.</div>
    </el-footer>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import StockSection from './components/StockSection.vue'
import FundSection from './components/FundSection.vue'
import BondSection from './components/BondSection.vue'
import CashSection from './components/CashSection.vue'
import LoginPage from './components/LoginPage.vue'
import Dashboard from './components/Dashboard.vue'
import NewDashboard from './components/NewDashboard.vue'
import LanguageSwitcher from './components/LanguageSwitcher.vue'

const router = useRouter()
const { locale, t } = useI18n()
const activePage = ref('home')
const showBanner = ref(false)
const hoveredFeature = ref(null)
const showModal = ref(false)
const modalIndex = ref(0)
const isLoggedIn = ref(false)

// Computed properties
const currentPageDisplay = computed(() => {
  const pageMap = {
    'dashboard': t('nav.dashboard'),
    'home': t('nav.home'),
    'stock': t('nav.stock'),
    'fund': t('nav.fund'),
    'bond': t('nav.bonds'),
    'cash': t('nav.cash')
  }
  return pageMap[activePage.value] || 'Asset Categories'
})

// Features data
const features = ref([
  {
    key: 'dashboard',
    title: 'Unified Dashboard',
    brief: 'Effortlessly manage all your investments in a single, organized dashboard.',
    content: 'Effortlessly manage all your investments—stocks, bonds, funds, cash, and more—in a single, organized dashboard. Portfolio Manager brings clarity to your financial life by consolidating your holdings and showing you the big picture at a glance.'
  },
  {
    key: 'realtime',
    title: 'Real-Time Data',
    brief: 'Get up-to-the-minute market prices and portfolio updates.',
    content: 'Get up-to-the-minute market prices and portfolio updates. Portfolio Manager fetches live data for your assets, ensuring you always know the current value of your investments. Make timely decisions based on accurate, real-world information.'
  },
  {
    key: 'insights',
    title: 'Performance Insights',
    brief: 'Visualize your portfolio\'s growth with interactive charts and clear summaries.',
    content: 'Visualize your portfolio\'s growth with interactive charts and clear summaries. Instantly see your gains, losses, and asset performance over time, helping you spot trends and optimize your investment strategy.'
  },
  {
    key: 'privacy',
    title: 'Simple, Secure & Private',
    brief: 'Quick sign-up, no complexity.',
    content: 'Quick sign-up, no complexity. Portfolio Manager is designed for seamless, single-user access—making it easy to get started while keeping your financial data private, secure, and fully under your control.'
  }
])

// Methods
const goLogin = () => {
  activePage.value = 'login'
  localStorage.setItem('activePage', 'login')
}

const goHome = () => {
  if (isLoggedIn.value) {
    activePage.value = 'dashboard'
    localStorage.setItem('activePage', 'dashboard')
  } else {
    // Allow non-logged in users to access all pages
    activePage.value = 'home'
    localStorage.setItem('activePage', 'home')
  }
}

const handleLoginSuccess = () => {
  isLoggedIn.value = true
  activePage.value = 'dashboard'
  // Save login state to localStorage
  localStorage.setItem('isLoggedIn', 'true')
  localStorage.setItem('activePage', 'dashboard')
}

const handleLogout = () => {
  isLoggedIn.value = false
  activePage.value = 'home'
  // Clear login state from localStorage
  localStorage.removeItem('isLoggedIn')
  localStorage.setItem('activePage', 'home')
}

const logout = () => {
  handleLogout()
}

const setActivePage = (page) => {
  activePage.value = page
  localStorage.setItem('activePage', page)
}

const openFeature = (index) => {
  modalIndex.value = index
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

// Lifecycle
onMounted(() => {
  // Restore login state from localStorage
  const savedLoginState = localStorage.getItem('isLoggedIn')
  const savedPage = localStorage.getItem('activePage')
  
  if (savedLoginState === 'true') {
    isLoggedIn.value = true
    activePage.value = savedPage || 'dashboard'
  } else {
    isLoggedIn.value = false
    // Allow non-logged in users to access all pages, default to home
    activePage.value = savedPage || 'home'
  }
  
  setTimeout(() => { showBanner.value = true }, 200)
})
</script>

<style>
/* @import './style.css'; */

/* App Container */
.app-container {
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
}

/* Navigation */
.app-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255,255,255,0.95);
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  padding: 0 48px;
}

.logo {
  font-size: 2rem;
  font-weight: 600;
  letter-spacing: 1px;
  margin-right: 32px;
  transition: color 0.2s;
}

.logo:hover {
  color: #0071e3;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Asset Dropdown Styles */
.asset-dropdown {
  margin-right: 8px;
}

.asset-btn {
  background: linear-gradient(135deg, #f8b500 0%, #f8b500 100%);
  border: none;
  color: white;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  min-width: 120px;
  position: relative;
}

.asset-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.asset-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #fceabb 0%, #f8b500 100%);
}

.asset-menu {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: none;
  padding: 8px 0;
  min-width: 160px;
}

.asset-menu .el-dropdown-menu__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  font-size: 14px;
  color: #333;
  transition: all 0.2s ease;
}

.asset-menu .el-dropdown-menu__item:hover {
  background: linear-gradient(135deg, #f0f4ff 0%, #e8f4fd 100%);
  color: #000000;
  transform: translateX(4px);
}

.asset-menu .el-dropdown-menu__item .el-icon {
  font-size: 16px;
  color: #0071e3;
}

.login-btn {
  border-radius: 20px;
  font-weight: 500;
}

.logout-btn {
  border-radius: 20px;
  font-weight: 500;
  background: #f8f9fa;
  border: 1px solid #e1e8ed;
  color: #2c3e50;
}

.logout-btn:hover {
  background: #e9ecef;
  border-color: #0071e3;
  color: #0071e3;
}

.app-main {
  flex: 1;
  padding: 0;
  background: #fff;
}

/* Element Plus Overrides */
.el-button.active {
  font-weight: bold;
  color: #0071e3;
}

.el-header {
  background: transparent;
}

.el-footer {
  background: #23272f;
  color: #fff;
}

.el-button.active {
  font-weight: bold;
  color: #0071e3;
}

/* Footer */
.footer {
  width: 100vw;
  background: #23272f;
  color: #fff;
  text-align: center;
  font-size: 1rem;
  padding: 32px 0 18px 0;
  letter-spacing: 0.5px;
}

.footer-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Home Page Sections */
.section-banner {
  width: 100vw;
  background: url('../public/images/Home_pic1.png') no-repeat center center;
  background-size: cover;
  padding: 90px 0 60px 0;
  position: relative;
  margin-bottom: 0;
}

.section-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.section-banner .section-content {
  position: relative;
  z-index: 2;
}

/* White spacing between sections */
.section-banner + .section-about {
  margin-top: 10px;
}

.section-about {
  width: 100vw;
  background:rgba(235, 237, 241, 0.78);
  padding: 80px 0 60px 0;
  margin-bottom: 0;
}

.section-about + .section-features {
  margin-top: 10px;
}

.section-features {
  width: 100vw;
  background: linear-gradient(120deg, #f7faff 0%, #eaf3fc 100%);
  padding: 80px 0 60px 0;
}

.section-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Banner Styles */
.banner-content {
  max-width: 700px;
  margin: 0 auto;
  animation: fadeIn 1.2s;
}

.banner-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 18px;
  letter-spacing: 1px;
  text-align: center;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
}

.banner-desc {
  font-size: 1.25rem;
  color: #fff;
  line-height: 1.7;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.banner-desc p {
  margin: 0 0 10px 0;
}

/* About Split Layout */
.about-split {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 48px;
  display: flex;
  align-items: flex-start;
  gap: 40px;
  animation: fadeIn 1.2s;
}

.about-left {
  flex: 1;
  text-align: left;
  padding-right: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.about-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 40px;
  color: #1a1a1a;
  line-height: 1.3;
  white-space: nowrap;
}

.about-description {
  font-size: 1.1rem;
  line-height: 2.2;
  color: #333;
  margin-bottom: 0;
  width: 80%;
}

.about-divider {
  width: 2px;
  background: linear-gradient(to bottom, #e0e0e0, #c0c0c0, #e0e0e0);
  margin: 0 20px;
  align-self: stretch;
  border-radius: 1px;
}

.about-right {
  flex: 1;
  text-align: left;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.features-title {
  font-size: 2rem;
  font-weight: 700;
  margin-top:10px;
  margin-bottom: 40px;
  color: #1a1a1a;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.features-list li {
  margin-bottom: 24px;
  line-height: 2.3;
  color: #333;
  position: relative;
  padding-left: 20px;
  font-size: 1.2rem;
}

.features-list li::before {
  content: "•";
  position: absolute;
  left: 0;
  top: 0;
  color: #0071e3;
  font-size: 1.2rem;
  font-weight: bold;
}

.features-list strong {
  color: #1a1a1a;
  font-weight: 600;
}

/* Features Grid */
.features-grid {
  display: flex;
  gap: 32px;
  justify-content: center;
  flex-wrap: wrap;
}

.feature-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.07);
  padding: 38px 32px 32px 32px;
  min-width: 220px;
  max-width: 270px;
  flex: 1 1 220px;
  cursor: pointer;
  transition: box-shadow 0.22s, transform 0.22s, background 0.22s;
  text-align: center;
  outline: none;
  border: 2px solid transparent;
  margin-bottom: 18px;
}

.feature-card:hover, .feature-card.hovered, .feature-card:focus {
  box-shadow: 0 8px 32px rgba(0,0,0,0.13);
  background: #f0f4ff;
  transform: translateY(-6px) scale(1.04);
  border: 2px solid #0071e3;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 14px;
}

.feature-brief {
  font-size: 1.05rem;
  color: #555;
}

.feature-dashboard {
  background: linear-gradient(120deg, #e3f0ff 0%, #eafcfa 100%);
}

.feature-realtime {
  background: linear-gradient(120deg, #fef6e4 0%, #f7e9e3 100%);
}

.feature-insights {
  background: linear-gradient(120deg, #f3e8ff 0%, #e9eafc 100%);
}

.feature-privacy {
  background: linear-gradient(120deg, #eafbe7 0%, #e3f7f7 100%);
}

/* Modal Styles */
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.35s;
}

.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}

.modal-mask {
  position: fixed;
  z-index: 1000;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(30, 34, 40, 0.32);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s;
}

.modal-dialog {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.18);
  max-width: 600px;
  width: 96vw;
  padding: 54px 40px 44px 40px;
  position: relative;
  text-align: center;
  animation: popIn 0.35s;
}

@keyframes popIn {
  0% { transform: scale(0.85); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.modal-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 24px;
}

.modal-content {
  font-size: 1.25rem;
  color: #444;
  line-height: 1.8;
}

.modal-close {
  position: absolute;
  right: 18px;
  top: 12px;
  background: none;
  border: none;
  font-size: 1.7rem;
  color: #aaa;
  cursor: pointer;
  transition: color 0.18s;
}

.modal-close:hover {
  color: #0071e3;
}

.modal-dashboard {
  background: linear-gradient(120deg, #e3f0ff 0%, #eafcfa 100%);
}

.modal-realtime {
  background: linear-gradient(120deg, #fef6e4 0%, #f7e9e3 100%);
}

.modal-insights {
  background: linear-gradient(120deg, #f3e8ff 0%, #e9eafc 100%);
}

.modal-privacy {
  background: linear-gradient(120deg, #eafbe7 0%, #e3f7f7 100%);
}

/* Animations */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 0.8s, transform 0.8s;
}

.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(40px);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive */
@media (max-width: 900px) {
  .features-grid {
    flex-direction: column;
    gap: 18px;
    align-items: center;
  }
  
  .feature-card {
    min-width: 0;
    width: 90vw;
    max-width: 400px;
  }
  
  .modal-dialog {
    max-width: 98vw;
    padding: 32px 8px 28px 8px;
  }
  
  .modal-title {
    font-size: 1.3rem;
  }
  
  .modal-content {
    font-size: 1.08rem;
  }
  
  .banner-title {
    font-size: 4rem;
  }
  
  .about-split {
    flex-direction: column;
    padding: 30px 20px;
    gap: 30px;
  }
  
  .about-divider {
    width: 100%;
    height: 2px;
    margin: 0;
    background: linear-gradient(to right, #e0e0e0, #c0c0c0, #e0e0e0);
  }
  
  .about-title {
    font-size: 1.8rem;
  }
  
  .features-title {
    font-size: 1.3rem;
  }
  
  .market-table {
    min-width: 400px;
  }
}
</style>