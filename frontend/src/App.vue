<template>
  <el-container style="min-height: 100vh">
    <el-aside width="220px" class="aside">
      <div class="logo">Portfolio Manager</div>
      <el-menu :default-active="$route.path" class="el-menu-vertical">
        <el-menu-item index="/">
          <el-icon><i class="el-icon-house"></i></el-icon>
          <span>Home</span>
        </el-menu-item>
        <el-menu-item index="/holdings">
          <el-icon><i class="el-icon-pie-chart"></i></el-icon>
          <span>Holdings</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header height="60px" class="header">
        <h2>Investment Dashboard</h2>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

// Sync menu with route
import { watch } from 'vue';
watch(
  () => router.currentRoute.value.path,
  (newVal) => {
    const menu = document.querySelector('.el-menu-vertical');
    if (menu) menu.setAttribute('default-active', newVal);
  }
);
</script>

<style scoped>
.aside {
  background: #f8f9fa;
  border-right: 1px solid #e0e0e0;
  padding-top: 1rem;
}
.logo {
  font-weight: 600;
  font-size: 1.1rem;
  text-align: center;
  margin-bottom: 1rem;
}
.header {
  display: flex;
  align-items: center;
  padding-left: 1rem;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
}
.main {
  padding: 2rem;
  background: #fafafa;
}
</style>