import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import Holdings from '../views/Holdings.vue';

const routes = [
  { path: '/', component: Dashboard },
  { path: '/holdings', component: Holdings }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;