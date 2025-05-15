<template>
  <div class="data-container dashboard">
    <h1 class="page-title">电影数据分析仪表盘</h1>
    
    <!-- 数据卡片 -->
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="6">
        <DataCard 
          title="电影总数" 
          :value="movieCount" 
          trend="up" 
          icon-bg-color="#4db3ff">
          <template #icon>
            <el-icon><Film /></el-icon>
          </template>
        </DataCard>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <DataCard 
          title="平均评分" 
          :value="averageRating" 
          trend="up" 
          icon-bg-color="#67c23a">
          <template #icon>
            <el-icon><Star /></el-icon>
          </template>
        </DataCard>
      </el-col>
      
      
    </el-row>
    
    <!-- 分析模块导航 -->
    <h2 class="dashboard-subtitle">分析模块</h2>
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="(module, index) in analysisModules" :key="index">
        <div class="dashboard-card" @click="navigateTo(module.path)">
          <el-icon :size="40" :color="module.color" class="dashboard-card-icon">
            <component :is="module.icon"></component>
          </el-icon>
          <h3 class="dashboard-card-title">{{ module.title }}</h3>
          <p class="dashboard-card-desc">{{ module.description }}</p>
        </div>
      </el-col>
    </el-row>
    
    <!-- 仪表板图表 -->
    <h2 class="dashboard-subtitle">数据概览</h2>
    <el-row :gutter="20">
      <el-col :xs="24" :lg="12">
        <div class="chart-container genre-overview-up">
          <ChartComponent
            chart-id="genre-overview"
            title="类型分布概览"
            :options="genreDistributionOptions"
            :height="350"
          />
        </div>
      </el-col>
      <el-col :xs="24" :lg="12">
        <div class="chart-container">
          <ChartComponent
            chart-id="rating-overview"
            title="评分分布概览"
            :options="ratingTrendOptions"
            :height="350"
          />
        </div>
      </el-col>
    </el-row>
    
    <el-row :gutter="20">
      <el-col :xs="24">
        <div class="chart-container">
          <ChartComponent
            chart-id="yearly-movie-count"
            title="年度电影数量统计"
            :options="yearlyMovieCountOptions"
            :height="350"
          />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts/core'
import DataCard from '../components/DataCard.vue'
import ChartComponent from '../components/ChartComponent.vue'
import api from '../utils/api.js'
import { ElMessage } from 'element-plus'
import { 
  Film, Star, DataAnalysis, 
  DataLine, Connection, Timer,
  MagicStick, Histogram 
} from '@element-plus/icons-vue'

const router = useRouter()

// 页面状态
const loading = ref(false)
const movieCount = ref('5,890')
const averageRating = ref('7.6')

// 分析模块数据
const analysisModules = [
  {
    title: '基础分析',
    description: '电影基础数据分析，包括评分、类型、时长等',
    icon: DataLine,
    color: '#4db3ff',
    path: '/basic-analysis'
  },
  {
    title: '评分分析',
    description: '电影评分相关的深入分析',
    icon: Star,
    color: '#67c23a',
    path: '/rating-analysis'
  },
  {
    title: '时间序列',
    description: '电影数据随时间变化的趋势分析',
    icon: Timer,
    color: '#e6a23c',
    path: '/time-series'
  },
  {
    title: '聚类分析',
    description: '基于电影特征的聚类分析',
    icon: Connection,
    color: '#f56c6c',
    path: '/cluster-analysis'
  },
  {
    title: '类型趋势',
    description: '电影类型随时间变化的趋势',
    icon: Film,
    color: '#909399',
    path: '/genre-trend'
  },
  {
    title: '特征重要性',
    description: '电影评分的关键特征分析',
    icon: Histogram,
    color: '#9254de',
    path: '/feature-importance'
  },
  {
    title: '电影预测',
    description: '预测单个电影的评分',
    icon: MagicStick,
    color: '#13c2c2',
    path: '/movie-predict'
  }
]

// 图表数据配置
const genreDistributionOptions = reactive({
  title: {
    
    left: 'center'
  },
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)'
  },
  legend: {
    show: false
  },
  series: [
    {
      name: '电影类型',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '42%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#0d1c3b',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '18',
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: []
    }
  ]
})

const ratingTrendOptions = reactive({
  title: {

    left: 'center'
  },
  tooltip: {
    trigger: 'axis'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '15%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: [],
    name: '评分'
  },
  yAxis: {
    type: 'value',
    name: '电影数量'
  },
  series: [
    {
      name: '电影数量',
      type: 'bar',
      data: []
    }
  ]
})

const yearlyMovieCountOptions = reactive({
  title: {
    
    left: 'center'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: []
  },
  yAxis: {
    type: 'value',
    name: '电影数量'
  },
  series: [
    {
      name: '电影数量',
      type: 'bar',
      data: [],
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#4db3ff' },
            { offset: 1, color: '#1e3d7a' }
          ]
        }
      }
    }
  ]
})

// 导航到分析模块
const navigateTo = (path) => {
  router.push(path)
}

// 获取仪表板概览数据
const fetchDashboardData = async () => {
  loading.value = true
  try {
    // 获取电影总数
    try {
      const countResponse = await api.getMovieCount()
      if (countResponse && countResponse.data) {
        // 更新电影总数卡片的值
        movieCount.value = countResponse.data.total_count.toLocaleString()
      }
    } catch (countError) {
      console.error('获取电影总数失败:', countError)
    }

    // 获取平均分
    try {
      const ratingResponse = await api.getAverageRating()
      if (ratingResponse && ratingResponse.data) {
        // 更新平均分卡片的值，保留一位小数
        averageRating.value = Number(ratingResponse.data.average_rating).toFixed(1)
      }
    } catch (ratingError) {
      console.error('获取平均分失败:', ratingError)
    }

    // 调用基础分析API获取类型分布数据
    const response = await api.getBasicAnalysis()
    
    if (response && response.data) {
      // 更新类型分布数据
      if (response.data.genre_distribution) {
        const xData = response.data.genre_distribution.xAxis.data
        const yData = response.data.genre_distribution.series[0].data
        genreDistributionOptions.series[0].data = xData.map((name, idx) => ({
          name,
          value: yData[idx]
        }))
      }
      
      // 获取年度数据 - 从时间序列API获取
      try {
        const timeSeriesResponse = await api.getTimeSeriesAnalysis()
        
        if (timeSeriesResponse && timeSeriesResponse.data) {
          // 更新年度电影数量
          if (timeSeriesResponse.data.yearly_movie_count) {
            yearlyMovieCountOptions.xAxis.data = timeSeriesResponse.data.yearly_movie_count.xAxis.data || []
            yearlyMovieCountOptions.series[0].data = timeSeriesResponse.data.yearly_movie_count.series[0].data || []
          }
        }
      } catch (timeSeriesError) {
        console.error('获取时间序列数据失败:', timeSeriesError)
      }

      // 更新评分分布数据
      if (response.data.rating_distribution) {
        ratingTrendOptions.xAxis.data = response.data.rating_distribution.xAxis.data
        ratingTrendOptions.series[0].data = response.data.rating_distribution.series[0].data
      }
    }
  } catch (error) {
    console.error('获取仪表板数据失败:', error)
    ElMessage.error('获取仪表板数据失败')
  } finally {
    loading.value = false
  }
}

// 页面加载时的初始化
onMounted(() => {
  // 加载仪表板数据
  fetchDashboardData()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.dashboard-subtitle {
  font-size: 18px;
  margin: 30px 0 20px;
  color: #ffffff;
  font-weight: bold;
}

.dashboard-card {
  background: rgba(13, 28, 59, 0.8);
  border: 1px solid #1e3d7a;
  border-radius: 4px;
  padding: 20px;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 20px;
  transition: all 0.3s;
  cursor: pointer;
}

.dashboard-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  border-color: #4db3ff;
}

.dashboard-card-icon {
  margin-bottom: 15px;
}

.dashboard-card-title {
  font-size: 18px;
  margin: 0 0 10px;
  color: #ffffff;
}

.dashboard-card-desc {
  font-size: 14px;
  color: #909399;
  flex: 1;
}

.el-row {
  margin-bottom: 20px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .el-col {
    margin-bottom: 20px;
  }
}

.genre-overview-up {
  padding-top: 6px;
  margin-top: 0 !important;
}

:deep(.echarts-pager), :deep(.echarts-pager-content) {
  display: none !important;
}
</style> 