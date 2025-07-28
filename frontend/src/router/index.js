import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/Layout.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: 'Investment Dashboard', icon: 'House' }
      },
      {
        path: '/holdings',
        name: 'Holdings',
        component: () => import('@/views/Holdings.vue'),
        meta: { title: 'Holdings', icon: 'Coin' }
      },
      {
        path: '/performance',
        name: 'Performance',
        component: () => import('@/views/Performance.vue'),
        meta: { title: 'Performance', icon: 'TrendCharts' }
      },
      {
        path: '/allocation',
        name: 'Allocation',
        component: () => import('@/views/Allocation.vue'),
        meta: { title: 'Allocation', icon: 'PieChart' }
      },
      {
        path: '/analytics',
        name: 'Analytics',
        component: () => import('@/views/Analytics.vue'),
        meta: { title: 'Analytics', icon: 'DataAnalysis' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  // Set page title
  if (to.meta.title) {
    document.title = `${to.meta.title} - Portfolio Manager`
  }
  next()
})

export default router