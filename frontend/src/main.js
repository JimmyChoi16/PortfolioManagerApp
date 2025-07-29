import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router'
import App from './App.vue'
import './style.css'
import './common.css'
import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    login: 'Login',
    heroTitle: 'Manage Your Portfolio Like a Pro',
    heroSubtitle: 'Track stocks, funds, bonds and more. Real-time data, smart analytics, all in one place.',
    assetCategories: 'Asset Categories',
    stock: 'Stock',
    fund: 'Fund',
    bond: 'Bond',
    marketRealtime: 'Market Realtime',
    aboutTitle: 'About PortfolioManager',
    aboutDesc: 'PortfolioManager helps you manage your investments efficiently, providing real-time data and insightful analytics to optimize your portfolio.'
  },
  zh: {
    login: '登录',
    heroTitle: '像专业人士一样管理您的投资组合',
    heroSubtitle: '追踪股票、基金、国债等多种资产。实时数据，智能分析，一站式管理。',
    assetCategories: '资产类别',
    stock: '股票',
    fund: '基金',
    bond: '国债',
    marketRealtime: '市场实时行情',
    aboutTitle: '关于 PortfolioManager',
    aboutDesc: 'PortfolioManager 帮助您高效管理投资，提供实时数据和深度分析，助您优化资产配置。'
  }
}

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages
})

const app = createApp(App)
const pinia = createPinia()

// Register Element Plus icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.use(i18n)

app.mount('#app')