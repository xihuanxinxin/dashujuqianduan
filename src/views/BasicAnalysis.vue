<template>
  <div class="data-container">
    <h1 class="page-title">基础分析</h1>
    
    <!-- 控制区域 -->
    <el-form :inline="true" class="demo-form">
      <el-form-item>
        <el-button type="primary" @click="fetchData" :loading="loading">
          分析数据
        </el-button>
      </el-form-item>
      <el-form-item>
        <el-button @click="resetData">
          重置数据
        </el-button>
      </el-form-item>
    </el-form>
    
    <!-- 图表展示区域 -->
    <el-row :gutter="20">
      <el-col :xs="24" :lg="8">
        <div class="chart-container">
          <ChartComponent
            chart-id="rating-distribution"
            title="评分分布"
            :options="chartData.rating_distribution"
            :loading="loading"
            :height="400"
          />
        </div>
      </el-col>
      <el-col :xs="24" :lg="8">
        <div class="chart-container">
          <ChartComponent
            chart-id="genre-distribution"
            title="类型分布"
            :options="chartData.genre_distribution"
            :loading="loading"
            :height="400"
          />
        </div>
      </el-col>
      <el-col :xs="24" :lg="8">
        <div class="chart-container">
          <ChartComponent
            chart-id="runtime-distribution"
            title="时长分布"
            :options="chartData.runtime_distribution"
            :loading="loading"
            :height="400"
          />
        </div>
      </el-col>
    </el-row>
    
    <!-- 数据表格 -->
    <div class="chart-container" v-if="originalData.length > 0">
      <h3 class="section-title">数据详情</h3>
      <el-table 
        :data="originalData"
        style="width: 100%"
        height="400"
        border
        stripe
        :header-cell-style="{backgroundColor: '#0d1c3b', color: '#ffffff'}">
        <el-table-column
          prop="rating"
          label="评分"
          width="120"
        />
        <el-table-column
          prop="runtime"
          label="时长(分钟)"
          width="120"
        />
        <el-table-column
          prop="year"
          label="年份"
          width="120"
        />
        <el-table-column
          prop="genres"
          label="类型"
        />
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import ChartComponent from '../components/ChartComponent.vue'
import api from '../utils/api.js'
import { ElMessage } from 'element-plus'

// 页面状态
const loading = ref(false)
const originalData = ref([]) // 用来存储原始数据

// 图表数据
const chartData = reactive({
  rating_distribution: {},
  genre_distribution: {},
  runtime_distribution: {}
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    // 调用API获取基础分析结果，API文档显示不需要参数
    const response = await api.getBasicAnalysis()
    
    console.log('后端返回数据:', response) // 添加日志查看返回数据
    
    // 延迟更新图表数据，确保DOM已完全渲染
    setTimeout(() => {
      // 确保响应数据存在并且有效
      if (response && response.data) {
        // 逐个更新图表数据，避免一次性更新过多数据导致渲染问题
        setTimeout(() => {
          chartData.rating_distribution = response.data.rating_distribution || {}
        }, 100)
        
        setTimeout(() => {
          chartData.genre_distribution = response.data.genre_distribution || {}
        }, 200)
        
        setTimeout(() => {
          chartData.runtime_distribution = response.data.runtime_distribution || {}
        }, 300)
        
        // 如果后端返回了原始数据，则更新表格，但是限制数据量
        if (response.data.original_data) {
          // 限制展示的原始数据数量，避免表格渲染过慢
          originalData.value = response.data.original_data.slice(0, 100)
        }
      } else {
        ElMessage.warning('未获取到有效的分析数据')
      }
    }, 500) // 延迟500ms确保DOM已渲染完成
    
  } catch (error) {
    console.error('获取数据失败:', error)
    // 显示错误提示
    ElMessage.error('获取数据失败，请重试')
  } finally {
    // 延迟关闭loading状态，确保用户能看到加载中的提示
    setTimeout(() => {
      loading.value = false
    }, 800)
  }
}

// 重置数据
const resetData = () => {
  chartData.rating_distribution = {}
  chartData.genre_distribution = {}
  chartData.runtime_distribution = {}
  originalData.value = []
}

// 页面加载时自动获取数据
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.demo-form {
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  margin-bottom: 15px;
  color: #4db3ff;
}

/* 自定义表格样式 */
:deep(.el-table) {
  background-color: transparent !important;
  color: #ffffff;
}

:deep(.el-table tr) {
  background-color: transparent !important;
}

:deep(.el-table--border th) {
  border-color: #1e3d7a;
}

:deep(.el-table--border td) {
  border-color: #1e3d7a;
}

:deep(.el-table--border) {
  border-color: #1e3d7a;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: rgba(30, 61, 122, 0.3);
}

:deep(.el-table__body tr.hover-row > td) {
  background-color: rgba(77, 179, 255, 0.1) !important;
}
</style> 