<template>
  <div class="rating-analysis-container">
    <el-card class="analysis-card">
      <template #header>
        <div class="card-header">
          <h2>评分分析</h2>
          <div class="header-actions">
            <el-button type="primary" @click="analyzeData">分析数据</el-button>
            <el-button @click="resetAnalysis">重置</el-button>
          </div>
        </div>
      </template>
      
      <div class="filter-section">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="选择年份范围">
              <el-date-picker
                v-model="yearRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始年份"
                end-placeholder="结束年份"
                value-format="YYYY"
                format="YYYY"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="选择评分范围">
              <el-slider
                v-model="ratingRange"
                range
                :min="0"
                :max="10"
                :step="0.5"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <div v-loading="loading" class="charts-section">
        <el-row :gutter="20" v-if="!loading && dataLoaded">
          <el-col :span="24" class="chart-container">
            <h3>评分与时长关系</h3>
            <div ref="ratingVsRuntimeChart" class="chart"></div>
          </el-col>
          
          <el-col :span="24" class="chart-container">
            <h3>评分与年份关系</h3>
            <div ref="ratingVsYearChart" class="chart"></div>
          </el-col>

          <el-col :span="24" class="chart-container">
            <h3>各类型平均评分</h3>
            <div ref="genreRatingsChart" class="chart"></div>
          </el-col>
        </el-row>
        
        <div v-if="!loading && !dataLoaded" class="empty-data">
          <el-empty description="暂无数据，请点击'分析数据'按钮进行分析"></el-empty>
        </div>
      </div>

      <div v-if="!loading && dataLoaded" class="statistics-section">
        <h3>评分统计信息</h3>
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-title">平均评分</div>
              <div class="stat-value">{{ statistics.mean.toFixed(2) }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-title">中位数评分</div>
              <div class="stat-value">{{ statistics.median.toFixed(2) }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-title">最高评分</div>
              <div class="stat-value">{{ statistics.max.toFixed(2) }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-title">最低评分</div>
              <div class="stat-value">{{ statistics.min.toFixed(2) }}</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import api from '../utils/api.js'

// 页面状态
const yearRange = ref(['2010', '2023'])
const ratingRange = ref([0, 10])
const loading = ref(false)
const dataLoaded = ref(false)
const ratingData = ref([])

// 统计数据
const statistics = reactive({
        mean: 0,
        median: 0,
        max: 0,
        min: 0,
        std: 0
})

// 图表引用
const ratingVsRuntimeChart = ref(null)
const ratingVsYearChart = ref(null)
const genreRatingsChart = ref(null)

// 图表实例
const charts = reactive({
  ratingVsRuntime: null,
  ratingVsYear: null,
  genreRatings: null
})

// 获取数据
const fetchData = async () => {
  try {
    loading.value = true
    
    // 根据API文档，评分分析接口使用GET方法和可选参数
    const params = {
      sample_size: 100,
      use_bins: true,
      // 添加筛选条件
      year_min: yearRange.value[0],
      year_max: yearRange.value[1], 
      rating_min: ratingRange.value[0],
      rating_max: ratingRange.value[1]
    }
    
    console.log('发送评分分析请求，参数:', params)
    
    // 调用后端API获取分析结果
    const response = await api.getRatingAnalysis(params)
    
    console.log('评分分析响应:', response)
    
    // 保存响应中的数据
    dataLoaded.value = true
    
    // 处理返回数据
    if (response.data && response.data.original_data) {
      ratingData.value = response.data.original_data
      calculateStatistics()
    } else {
      // 如果后端没有返回原始数据，至少需要计算统计信息
      extractDataFromCharts(response.data)
    }
    
    // 渲染图表 - 添加一点延迟确保DOM已完全渲染
    setTimeout(() => {
      renderCharts(response.data)
    }, 300)
    
  } catch (error) {
    console.error('获取评分数据失败:', error)
    ElMessage.error('获取评分数据失败，请重试')
    
    // 重置数据状态
    dataLoaded.value = false
    ratingData.value = []
  } finally {
    loading.value = false
  }
}

// 从图表数据中提取统计信息
const extractDataFromCharts = (chartData) => {
  if (!chartData) return
  
  try {
    // 尝试从散点图提取评分数据
    if (chartData.rating_vs_runtime && chartData.rating_vs_runtime.series && 
        chartData.rating_vs_runtime.series[0] && chartData.rating_vs_runtime.series[0].data) {
      
      const scatterData = chartData.rating_vs_runtime.series[0].data
      const ratings = scatterData.map(point => point[1]) // 评分是第二个值 [runtime, rating]
      
      // 使用提取的评分数据计算统计信息
      if (ratings.length > 0) {
        statistics.mean = ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        const sortedRatings = [...ratings].sort((a, b) => a - b)
        const mid = Math.floor(sortedRatings.length / 2)
        statistics.median = sortedRatings.length % 2 === 0
          ? (sortedRatings[mid - 1] + sortedRatings[mid]) / 2
          : sortedRatings[mid]
        statistics.max = Math.max(...ratings)
        statistics.min = Math.min(...ratings)
        
        // 计算标准差
        const variance = ratings.reduce((sum, r) => sum + Math.pow(r - statistics.mean, 2), 0) / ratings.length
        statistics.std = Math.sqrt(variance)
      }
    }
  } catch (e) {
    console.error('从图表数据提取统计信息失败:', e)
  }
}

// 计算统计数据
const calculateStatistics = () => {
  const ratings = ratingData.value.map(item => item.rating)
      
      // 计算统计量
  statistics.mean = ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      
      // 计算中位数
  const sortedRatings = [...ratings].sort((a, b) => a - b)
  const mid = Math.floor(sortedRatings.length / 2)
  statistics.median = sortedRatings.length % 2 === 0
        ? (sortedRatings[mid - 1] + sortedRatings[mid]) / 2
    : sortedRatings[mid]
      
  statistics.max = Math.max(...ratings)
  statistics.min = Math.min(...ratings)
      
      // 计算标准差
  const mean = statistics.mean
  const variance = ratings.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / ratings.length
  statistics.std = Math.sqrt(variance)
}

// 渲染图表
const renderCharts = (chartData) => {
  // 使用nextTick确保DOM已经完全渲染
  nextTick(() => {
    renderRatingVsRuntime(chartData.rating_vs_runtime)
    renderRatingVsYear(chartData.rating_vs_year)
    renderGenreRatings(chartData.genre_ratings)
  })
}

// 渲染评分与时长关系图
const renderRatingVsRuntime = (option) => {
  if (!ratingVsRuntimeChart.value) return
  
  if (charts.ratingVsRuntime) {
    charts.ratingVsRuntime.dispose()
  }
  
  // 修改图表配置适应深色背景
  const darkThemeOption = {
    ...option,
    backgroundColor: 'rgba(45, 52, 70, 0.7)',
    textStyle: {
      color: '#fff'
    },
    title: {
      ...option.title,
      textStyle: {
        color: '#fff'
      }
    },
    xAxis: {
      ...option.xAxis,
      axisLine: {
        lineStyle: {
          color: '#6e7079'
        }
      },
      axisLabel: {
        color: '#fff'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    yAxis: {
      ...option.yAxis,
      axisLine: {
        lineStyle: {
          color: '#6e7079'
        }
      },
      axisLabel: {
        color: '#fff'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  }
  
  try {
    charts.ratingVsRuntime = echarts.init(ratingVsRuntimeChart.value)
    charts.ratingVsRuntime.setOption(darkThemeOption)
  } catch (error) {
    console.error('渲染评分与时长关系图表失败:', error)
  }
}

// 渲染评分与年份关系图
const renderRatingVsYear = (option) => {
  if (!ratingVsYearChart.value) return
  
  if (charts.ratingVsYear) {
    charts.ratingVsYear.dispose()
  }
  
  // 修改图表配置适应深色背景
  const darkThemeOption = {
    ...option,
    backgroundColor: 'rgba(45, 52, 70, 0.7)',
    textStyle: {
      color: '#fff'
    },
    title: {
      ...option.title,
      textStyle: {
        color: '#fff'
      }
    },
    xAxis: {
      ...option.xAxis,
      axisLine: {
        lineStyle: {
          color: '#6e7079'
        }
      },
          axisLabel: {
        color: '#fff'
          },
          splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
          }
        },
        yAxis: {
      ...option.yAxis,
      axisLine: {
        lineStyle: {
          color: '#6e7079'
        }
      },
      axisLabel: {
        color: '#fff'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  }
  
  try {
    charts.ratingVsYear = echarts.init(ratingVsYearChart.value)
    charts.ratingVsYear.setOption(darkThemeOption)
  } catch (error) {
    console.error('渲染评分与年份关系图表失败:', error)
  }
}

// 渲染各类型平均评分图
const renderGenreRatings = (option) => {
  if (!genreRatingsChart.value) return
  
  if (charts.genreRatings) {
    charts.genreRatings.dispose()
  }
  
  // 修改图表配置适应深色背景
  const darkThemeOption = {
    ...option,
    backgroundColor: 'rgba(45, 52, 70, 0.7)',
    textStyle: {
      color: '#fff'
    },
    title: {
      ...option.title,
      textStyle: {
        color: '#fff'
      }
    },
        xAxis: {
      ...option.xAxis,
      axisLine: {
        lineStyle: {
          color: '#6e7079'
        }
      },
      axisLabel: {
        color: '#fff'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    yAxis: {
      ...option.yAxis,
      axisLine: {
            lineStyle: {
          color: '#6e7079'
        }
      },
      axisLabel: {
        color: '#fff'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  }
  
  try {
    charts.genreRatings = echarts.init(genreRatingsChart.value)
    charts.genreRatings.setOption(darkThemeOption)
  } catch (error) {
    console.error('渲染各类型平均评分图表失败:', error)
  }
}

// 分析数据
const analyzeData = () => {
  // 根据当前筛选条件重新获取数据
  fetchData()
}

// 重置分析
const resetAnalysis = () => {
  // 重置年份范围和评分范围
  yearRange.value = ['2010', '2023']
  ratingRange.value = [0, 10]
  
  // 重置数据
  dataLoaded.value = false
  ratingData.value = []
  
    // 销毁图表
  Object.values(charts).forEach(chart => {
      if (chart) {
      chart.dispose()
    }
  })
  
  // 重新获取数据
  fetchData()
}

// 窗口大小变化时重新调整图表大小
const resizeCharts = () => {
  Object.values(charts).forEach(chart => {
        if (chart) {
      chart.resize()
    }
  })
}

// 组件挂载
onMounted(() => {
  window.addEventListener('resize', resizeCharts)
  // 页面加载时自动分析数据
  fetchData()
})

// 组件卸载
onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts)
  // 销毁图表
  Object.values(charts).forEach(chart => {
    if (chart) {
      chart.dispose()
    }
  })
})
</script>

<style scoped>
.rating-analysis-container {
  padding: 20px;
}

.analysis-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-section {
  margin-bottom: 20px;
}

.charts-section {
  min-height: 400px;
}

.chart-container {
  margin-bottom: 30px;
}

.chart {
  height: 350px;
  width: 100%;
  background-color: rgba(45, 52, 70, 0.7);
  border-radius: 4px;
  padding: 10px;
}

.statistics-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.stat-card {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 15px;
  text-align: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.stat-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.empty-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}
</style> 