<template>
  <div class="chart-component">
    <div class="chart-header">
      <h3 v-if="title">{{ title }}</h3>
      <slot name="header-actions"></slot>
    </div>
    <div 
      :id="chartId" 
      class="chart-content" 
      :style="{ height: height + 'px' }"
    ></div>
    <div v-if="loading" class="chart-loading">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <p>加载中...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { initChart, renderChart } from '../utils/echarts'
import { Loading } from '@element-plus/icons-vue'

const props = defineProps({
  chartId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  options: {
    type: Object,
    default: () => ({})
  },
  height: {
    type: Number,
    default: 350
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const chart = ref(null)
let isChartInitialized = false
let renderTimeout = null

onMounted(() => {
  // 使用宏任务延迟确保DOM已完全渲染并且Vue处理完所有任务
  setTimeout(() => {
    initializeChart()
    isChartInitialized = true
    window.addEventListener('resize', handleResize)
  }, 500) // 增加延迟时间确保DOM已完全准备好
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (renderTimeout) {
    clearTimeout(renderTimeout)
  }
  disposeChart()
})

watch(() => props.options, (newOptions, oldOptions) => {
  if (!isChartInitialized || !chart.value) return
  
  // 防止频繁更新，使用防抖处理
  if (renderTimeout) {
    clearTimeout(renderTimeout)
  }
  
  // 检查是否有实际变化
  const hasChange = JSON.stringify(newOptions) !== JSON.stringify(oldOptions)
  
  if (hasChange && newOptions && Object.keys(newOptions).length > 0) {
    // 使用600ms的防抖延迟
    renderTimeout = setTimeout(() => {
      try {
        console.log(`更新图表 ${props.chartId}，数据已变化`)
        
        // 检查数据量大小，对大数据进行优化
        const dataSize = getDataSize(newOptions)
        if (dataSize > 1000) {
          console.log(`图表 ${props.chartId} 包含大量数据(${dataSize})，正在优化渲染...`)
          // 为大数据添加dataZoom
          if (!newOptions.dataZoom && isLineOrBarChart(newOptions)) {
            newOptions.dataZoom = [{
              type: 'inside',
              start: 0,
              end: Math.min(100, Math.max(5, 5000 / dataSize)) // 根据数据量自动计算显示比例
            }]
          }
          
          // 优化渲染过程
          chart.value.setOption(newOptions, {
            notMerge: true,
            lazyUpdate: true,
            silent: dataSize > 5000
          })
        } else {
          renderChart(chart.value, newOptions)
        }
      } catch (error) {
        console.error(`更新图表 ${props.chartId} 失败:`, error)
        showErrorChart()
      }
    }, 600)
  }
}, { deep: true })

// 初始化图表
const initializeChart = () => {
  try {
    const chartElement = document.getElementById(props.chartId)
    if (!chartElement) {
      console.error(`ID为 ${props.chartId} 的图表容器不存在`)
      return
    }
    
    if (!chart.value) {
      chart.value = initChart(props.chartId)
    }
    
    // 如果有选项，就渲染图表
    if (props.options && Object.keys(props.options).length > 0) {
      console.log(`初次渲染图表 ${props.chartId}`)
      
      // 延迟渲染以确保容器已经完全准备好
      setTimeout(() => {
        try {
          renderChart(chart.value, props.options)
        } catch (e) {
          console.error(`初始化图表 ${props.chartId} 时出错:`, e)
          showErrorChart()
        }
      }, 300)
    } else {
      console.warn(`图表 ${props.chartId} 没有提供选项`)
      renderChart(chart.value, {
        title: { text: props.title || '暂无数据' },
        tooltip: {},
        xAxis: { type: 'category', data: ['暂无数据'] },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', data: [0] }]
      })
    }
  } catch (error) {
    console.error('初始化图表出错:', error)
  }
}

// 显示错误图表
const showErrorChart = () => {
  if (!chart.value) return
  
  chart.value.setOption({
    title: {
      text: '图表渲染出错',
      textStyle: { color: '#ff4d4f' }
    },
    tooltip: {},
    xAxis: { type: 'category', data: ['加载失败'] },
    yAxis: { type: 'value' },
    series: [{ 
      type: 'bar', 
      data: [0],
      itemStyle: { color: '#ff4d4f' }
    }]
  })
}

// 销毁图表
const disposeChart = () => {
  if (chart.value) {
    chart.value.dispose()
    chart.value = null
  }
  isChartInitialized = false
}

// 计算图表数据大小
const getDataSize = (options) => {
  let size = 0
  if (options.series && Array.isArray(options.series)) {
    options.series.forEach(series => {
      if (series.data && Array.isArray(series.data)) {
        size += series.data.length
      }
    })
  }
  return size
}

// 检查是否为折线图或柱状图
const isLineOrBarChart = (options) => {
  if (!options.series || !Array.isArray(options.series)) return false
  return options.series.some(series => 
    ['line', 'bar'].includes(series.type)
  )
}

// 添加窗口大小变化事件监听
const handleResize = () => {
  if (!chart.value) return
  
  // 使用防抖技术避免频繁调整大小
  if (window.resizeTimeout) {
    clearTimeout(window.resizeTimeout)
  }
  
  window.resizeTimeout = setTimeout(() => {
    if (chart.value) {
      chart.value.resize()
    }
  }, 300)
}
</script>

<style scoped>
.chart-component {
  width: 100%;
  position: relative;
  overflow: hidden;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.chart-header h3 {
  margin: 0;
  font-size: 18px;
  color: #4db3ff;
}

.chart-content {
  width: 100%;
  min-height: 200px;
}

.chart-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(13, 28, 59, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.loading-icon {
  font-size: 36px;
  color: #4db3ff;
  margin-bottom: 10px;
  animation: rotate 1.5s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 