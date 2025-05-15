<template>
  <div class="rating-analysis-container">
    <el-card class="analysis-card">
      <template #header>
        <div class="card-header">
          <h2>评分分析</h2>
          <div class="header-actions">
            <el-button type="primary" @click="analyzeData">分析数据</el-button>
          </div>
        </div>
      </template>
      
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
    
    // 调用后端API获取其他分析结果
    const response = await api.getRatingAnalysis(params)
    console.log('评分分析响应:', response)
    
    // 尝试获取热力图数据，但不阻塞主流程
    let heatmapData = null;
    try {
      const heatmapResponse = await api.getRatingRuntimeHeatmap(params);
      console.log('评分与时长热力图响应:', heatmapResponse);
      if (heatmapResponse && heatmapResponse.data && heatmapResponse.data.rating_runtime_heatmap) {
        heatmapData = heatmapResponse.data.rating_runtime_heatmap;
      }
    } catch (heatmapError) {
      console.error('获取热力图数据失败:', heatmapError);
      // 热力图获取失败，继续使用原有数据，不中断流程
    }
    
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
      // 使用热力图数据渲染评分与时长关系图
      if (heatmapData) {
        renderRatingVsRuntime(heatmapData);
      } else {
        renderRatingVsRuntime(response.data.rating_vs_runtime);
      }
      renderRatingVsYear(response.data.rating_vs_year)
      renderGenreRatings(response.data.genre_ratings)
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
  
  console.log('热力图原始数据:', JSON.stringify(option).substring(0, 500) + '...');
  
  // 处理tooltip.formatter如果是字符串形式的函数
  if (option.tooltip && typeof option.tooltip.formatter === 'string' && 
      option.tooltip.formatter.startsWith('function')) {
    try {
      // 将字符串转换为函数
      const formatterStr = option.tooltip.formatter;
      // 移除开头的"function"关键字并执行
      const formatterFunc = new Function('return ' + formatterStr)();
      option.tooltip.formatter = formatterFunc;
    } catch (error) {
      console.error('转换tooltip.formatter失败:', error);
      // 如果转换失败，使用默认formatter
      option.tooltip.formatter = function(params) {
        return `时长: ${params.value[0]}分钟<br>评分: ${params.value[1]}<br>电影数量: ${params.value[2]}`;
      };
    }
  }
  
  // 确保series数据存在且正确
  if (option.series && option.series[0] && option.series[0].data) {
    console.log(`热力图数据点数量: ${option.series[0].data.length}`);
    
    // 移除可能导致热力图渲染问题的属性
    delete option.series[0].symbolSize; // 删除symbolSize属性，它会干扰热力图渲染
    
    // 确保热力图样式正确
    option.series[0].itemStyle = {
      ...option.series[0].itemStyle,
      borderWidth: 0 // 热力图不需要边框
    };
  }
  
  // 创建全新的配置，避免继承可能有问题的属性
  const newOption = {
    backgroundColor: 'rgba(45, 52, 70, 0.7)',
    title: {
      text: option.title?.text || '评分与时长关系热力图',
      textStyle: {
        color: '#fff'
      },
      left: 'center'
    },
    grid: {
      height: '70%',
      top: '10%',
      left: '5%',
      right: '5%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: option.xAxis?.data || [],
      name: option.xAxis?.name || '时长(分钟)',
      nameLocation: 'end',
      nameGap: 15,
      nameTextStyle: {
        color: '#fff',
        fontSize: 14
      },
      axisLine: {
        lineStyle: {
          color: '#6e7079'
        }
      },
      axisLabel: {
        color: '#fff',
        interval: 2  // 每隔2个标签显示一个
      },
      splitArea: {
        show: true
      }
    },
    yAxis: {
      type: 'category',
      data: option.yAxis?.data || [],
      name: option.yAxis?.name || '评分',
      nameLocation: 'end',
      nameGap: 15,
      nameTextStyle: {
        color: '#fff',
        fontSize: 14
      },
      axisLine: {
        lineStyle: {
          color: '#6e7079'
        }
      },
      axisLabel: {
        color: '#fff'
      },
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: 0,
      max: 100,  // 降低最大值，让更多数据点有明显颜色
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '5%',
      inRange: {
        // 使用更适合深色背景的颜色方案
        color: ['#5e4fa2', '#3288bd', '#66c2a5', '#abdda4', '#e6f598', '#fee08b', '#fdae61', '#f46d43', '#d53e4f', '#9e0142']
      },
      textStyle: {
        color: '#fff'
      }
    },
    series: [{
      name: '电影数量',
      type: 'heatmap',
      data: option.series?.[0]?.data || [],
      label: {
        show: false
      },
      // 增强热力图单元格效果
      itemStyle: {
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.2)'
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };
  
  try {
    // 添加调试信息，检查热力图数据
    console.log('热力图X轴数据:', JSON.stringify(newOption.xAxis.data));
    console.log('热力图Y轴数据:', JSON.stringify(newOption.yAxis.data));
    console.log('热力图数据点示例:', JSON.stringify(newOption.series[0].data.slice(0, 5)));
    
    // 检查并修复热力图数据格式问题
    if (newOption.series[0].data.length > 0) {
      // 检查是否所有数据点都是同一个X值
      const xValues = new Set(newOption.series[0].data.map(item => item[0]));
      console.log('热力图X值种类数量:', xValues.size, '应该有', newOption.xAxis.data.length);
      
      // 如果数据格式有问题，尝试修复
      if (xValues.size < newOption.xAxis.data.length) {
        console.warn('热力图数据可能有问题，尝试重新格式化数据');
        
        // 创建一个空的热力图数据矩阵
        const heatmapData = [];
        
        // 遍历所有可能的x和y值组合
        for (let i = 0; i < newOption.xAxis.data.length; i++) {
          for (let j = 0; j < newOption.yAxis.data.length; j++) {
            // 查找对应的数据点
            const x = newOption.xAxis.data[i];
            const y = newOption.yAxis.data[j];
            const dataPoint = newOption.series[0].data.find(item => 
              Math.abs(item[0] - x) < 0.001 && Math.abs(item[1] - y) < 0.001
            );
            
            // 如果找到数据点，添加到新数组，否则添加值为0的数据点
            if (dataPoint) {
              heatmapData.push([i, j, dataPoint[2]]);
            } else {
              heatmapData.push([i, j, 0]);
            }
          }
        }
        
        // 使用新的数据格式
        newOption.series[0].data = heatmapData;
        console.log('重新格式化后的数据点数量:', heatmapData.length);
      }
    }
    
    charts.ratingVsRuntime = echarts.init(ratingVsRuntimeChart.value)
    charts.ratingVsRuntime.setOption(newOption)
    
    // 添加额外的调试信息
    console.log('热力图渲染完成，配置:', JSON.stringify({
      xAxisData: newOption.xAxis.data?.length,
      yAxisData: newOption.yAxis.data?.length,
      seriesData: newOption.series[0].data?.length,
      visualMapRange: [newOption.visualMap?.min, newOption.visualMap?.max]
    }));
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
      name: '类型',
      nameLocation: 'end',
      nameGap: 30,
      nameTextStyle: {
        color: '#fff',
        fontSize: 14
      },
      axisLine: {
        lineStyle: {
          color: '#6e7079'
        }
      },
      axisLabel: {
        color: '#fff',
        interval: 0,
        rotate: 90,
        fontSize: 10,
        margin: 8
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
    },
    series: [
      {
        ...option.series[0],
        barWidth: 8
      }
    ]
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

.empty-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}
</style> 