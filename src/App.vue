<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import HelloWorld from './components/HelloWorld.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { 
  Monitor, 
  DataLine, 
  Star, 
  Timer, 
  Connection, 
  Film, 
  Histogram, 
  MagicStick, 
  ArrowDown 
} from '@element-plus/icons-vue'

const route = useRoute()
const pageTitle = computed(() => {
  const routeMap = {
    '/': '仪表盘',
    '/basic-analysis': '基础分析',
    '/rating-analysis': '评分分析',
    '/time-series': '时间序列分析',
    '/cluster-analysis': '聚类分析',
    '/genre-trend': '类型趋势分析',
    '/feature-importance': '特征重要性分析',
    '/movie-predict': '电影评分预测'
  }
  return routeMap[route.path] || ''
})
</script>

<template>
  <div class="app-container">
    <el-container>
      <el-aside width="250px">
        <div class="sidebar">
          <div class="logo">
            <h2>电影数据分析</h2>
          </div>
          <el-menu 
            router
            background-color="#0d1c3b" 
            text-color="#ffffff" 
            active-text-color="#4db3ff"
            :default-active="$route.path">
            <el-menu-item index="/">
              <el-icon><Monitor /></el-icon>
              <span>仪表盘</span>
            </el-menu-item>
            <el-menu-item index="/basic-analysis">
              <el-icon><DataLine /></el-icon>
              <span>基础分析</span>
            </el-menu-item>
            <el-menu-item index="/rating-analysis">
              <el-icon><Star /></el-icon>
              <span>评分分析</span>
            </el-menu-item>
            <el-menu-item index="/time-series">
              <el-icon><Timer /></el-icon>
              <span>时间序列分析</span>
            </el-menu-item>
            <el-menu-item index="/cluster-analysis">
              <el-icon><Connection /></el-icon>
              <span>聚类分析</span>
            </el-menu-item>
            <el-menu-item index="/genre-trend">
              <el-icon><Film /></el-icon>
              <span>类型趋势</span>
            </el-menu-item>
            <el-menu-item index="/feature-importance">
              <el-icon><Histogram /></el-icon>
              <span>特征重要性</span>
            </el-menu-item>
            <el-menu-item index="/movie-predict">
              <el-icon><MagicStick /></el-icon>
              <span>电影评分预测</span>
            </el-menu-item>
          </el-menu>
        </div>
      </el-aside>
      <el-container>
        <el-header height="60px">
          <div class="header">
            <h3>{{ pageTitle }}</h3>
          </div>
        </el-header>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
.app-container {
  height: 100%;
  width: 100%;
}

.sidebar {
  height: 100%;
  background-color: #0d1c3b;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4db3ff;
  border-bottom: 1px solid #1e3d7a;
}

.header {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #1e3d7a;
  padding: 0 20px;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-dropdown {
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.el-header {
  background-color: #0d1c3b;
  padding: 0;
}

.el-main {
  padding: 0;
  background-color: #0f1c38;
}

.el-aside {
  overflow: hidden;
}
</style>
