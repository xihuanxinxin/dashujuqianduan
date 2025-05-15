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
    
    // 处理获取到的数据
      if (response && response.data) {
      // 更新评分分布数据
          chartData.rating_distribution = response.data.rating_distribution || {}
        
      // 处理类型分布数据
          const genre = response.data.genre_distribution || {}
          if (genre.xAxis && genre.series && genre.series[0] && Array.isArray(genre.xAxis.data) && Array.isArray(genre.series[0].data)) {
            chartData.genre_distribution = {
              title: { text: '电影类型分布', left: 'center' },
              tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
          legend: { show: false },
              series: [
                {
                  name: '电影类型',
                  type: 'pie',
                  radius: ['40%', '70%'],
                  avoidLabelOverlap: false,
                  itemStyle: {
                    borderRadius: 10,
                    borderColor: '#0d1c3b',
                    borderWidth: 2
                  },
              label: { show: true, color: '#fff' },
                  emphasis: {
                    label: { show: true, fontSize: '18', fontWeight: 'bold' }
                  },
              labelLine: { show: true },
                  data: genre.xAxis.data.map((name, idx) => ({ name, value: genre.series[0].data[idx] }))
                }
              ]
            }
          } else {
            chartData.genre_distribution = genre
          }
        
      // 处理时长分布数据
          const runtime = response.data.runtime_distribution || {}
          if (runtime.xAxis && runtime.series && runtime.series[0] && Array.isArray(runtime.xAxis.data) && Array.isArray(runtime.series[0].data)) {
            chartData.runtime_distribution = {
              title: { text: '电影时长分布', left: 'center' },
              tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
          legend: { show: false },
              series: [
                {
                  name: '时长区间',
                  type: 'pie',
                  radius: ['40%', '70%'],
                  avoidLabelOverlap: false,
                  itemStyle: {
                    borderRadius: 10,
                    borderColor: '#0d1c3b',
                    borderWidth: 2
                  },
              label: { show: true, color: '#fff' },
                  emphasis: {
                    label: { show: true, fontSize: '18', fontWeight: 'bold' }
                  },
              labelLine: { show: true },
                  data: runtime.xAxis.data.map((name, idx) => ({ name, value: runtime.series[0].data[idx] }))
                }
              ]
            }
          } else {
            chartData.runtime_distribution = runtime
          }
        
        // 如果后端返回了原始数据，则更新表格，但是限制数据量
        if (response.data.original_data) {
          // 限制展示的原始数据数量，避免表格渲染过慢
          originalData.value = response.data.original_data.slice(0, 100)
        }
      } else {
        ElMessage.warning('未获取到有效的分析数据')
      }
  } catch (error) {
    console.error('获取数据失败:', error)
    // 显示错误提示
    ElMessage.error('获取数据失败，请重试')
  } finally {
    // 关闭loading状态
      loading.value = false
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

:deep(.echarts-pager), :deep(.echarts-pager-content) {
  display: none !important;
}
</style> 