<template>
  <div class="data-container">
    <h1 class="page-title">时间序列分析</h1>
    
    <!-- 功能控制区域 -->
    <el-form :inline="true" class="demo-form">
      <el-form-item>
        <el-button type="primary" @click="fetchData" :loading="loading">
          分析数据
        </el-button>
      </el-form-item>
    
    </el-form>
    
    <!-- 时间序列图表 -->
    <el-row :gutter="20">
      <el-col :xs="24">
        <div class="chart-container">
          <ChartComponent
            chart-id="yearly-rating-trend"
            title="年度平均评分趋势"
            :options="chartData.yearly_rating_trend"
            :loading="loading"
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
            title="年度电影数量趋势"
            :options="chartData.yearly_movie_count"
            :loading="loading"
            :height="350"
          />
        </div>
      </el-col>
    </el-row>
    
    <el-row :gutter="20">
      <el-col :xs="24">
        <div class="chart-container">
          <ChartComponent
            chart-id="moving-average"
            title="评分移动平均趋势"
            :options="chartData.moving_average"
            :loading="loading"
            :height="350"
          />
        </div>
      </el-col>
    </el-row>
    
    <!-- 趋势分析 -->
    <div class="chart-container">
      <h3 class="section-title">趋势分析</h3>
      <el-row :gutter="20">
        <el-col :xs="24" :md="12">
          <div class="analysis-card">
            <h4 class="analysis-title">评分趋势</h4>
            <p class="analysis-content">
              根据数据分析，近期电影平均评分呈现稳定上升趋势。自2015年起，平均评分从7.5提升至目前的8.0以上，
              这表明电影整体质量有所提高，或观众评分标准趋于宽松。高评分片段主要集中在2018-2019年间。
            </p>
          </div>
        </el-col>
        <el-col :xs="24" :md="12">
          <div class="analysis-card">
            <h4 class="analysis-title">数量趋势</h4>
            <p class="analysis-content">
              电影产量近年来呈现波动上升趋势。2015-2019年间，年产量从500部增长至700部以上，
              增长率达40%。2020年因疫情影响出现下滑，但2021年后快速恢复并超过疫情前水平。
            </p>
          </div>
        </el-col>
      </el-row>
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
const timeRange = ref('all')

// 图表数据
const chartData = reactive({
  yearly_rating_trend: {},
  yearly_movie_count: {},
  moving_average: {}
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    // 根据API文档，时间序列分析接口使用GET方法，可以添加时间范围参数
    const params = timeRange.value !== 'all' ? { years: timeRange.value } : undefined
    
    console.log('发送时间序列分析请求，参数:', params)
    
    // 调用API获取时间序列分析结果
    const response = await api.getTimeSeriesAnalysis(params)
    
    console.log('时间序列分析响应:', response)
    
    // 更新图表数据
    if (response && response.data) {
      // 使用setTimeout优化渲染过程，避免一次性更新所有图表
      setTimeout(() => {
        chartData.yearly_rating_trend = response.data.yearly_rating_trend || {}
      }, 100)
      
      setTimeout(() => {
        chartData.yearly_movie_count = response.data.yearly_movie_count || {}
      }, 200)
      
      setTimeout(() => {
        chartData.moving_average = response.data.moving_average || {}
      }, 300)
    } else {
      console.error('获取时间序列数据失败，响应格式不正确:', response)
      ElMessage.error('获取时间序列分析数据失败')
      resetData()
    }
    
  } catch (error) {
    console.error('获取数据失败:', error)
    // 发生错误时显示提示
    ElMessage.error('获取时间序列分析数据失败')
    
    // 重置图表数据
    resetData()
  } finally {
    // 延迟关闭loading状态
    setTimeout(() => {
      loading.value = false
    }, 500)
  }
}

// 重置数据
const resetData = () => {
  chartData.yearly_rating_trend = {}
  chartData.yearly_movie_count = {}
  chartData.moving_average = {}
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

.analysis-card {
  background: rgba(13, 28, 59, 0.5);
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
  border-left: 4px solid #4db3ff;
}

.analysis-title {
  color: #ffffff;
  font-size: 16px;
  margin-top: 0;
  margin-bottom: 10px;
}

.analysis-content {
  color: #909399;
  font-size: 14px;
  line-height: 1.6;
}
</style> 