import * as echarts from 'echarts/core'
import {
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  RadarChart,
  HeatmapChart,
  BoxplotChart
} from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  VisualMapComponent,
  ParallelComponent,
  TimelineComponent,
  ToolboxComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注册必要的组件
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  RadarChart,
  HeatmapChart,
  BoxplotChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  VisualMapComponent,
  ParallelComponent,
  TimelineComponent,
  ToolboxComponent,
  CanvasRenderer
])

// 统一配置主题
const theme = {
  color: ['#4db3ff', '#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074'],
  backgroundColor: 'rgba(0,0,0,0)',
  textStyle: {
    color: '#ffffff'
  },
  title: {
    textStyle: {
      color: '#ffffff'
    }
  },
  line: {
    itemStyle: {
      borderWidth: 2
    },
    lineStyle: {
      width: 2
    },
    symbolSize: 8
  },
  radar: {
    itemStyle: {
      borderWidth: 2
    },
    lineStyle: {
      width: 2
    },
    symbolSize: 8
  },
  bar: {
    itemStyle: {
      barBorderWidth: 0,
      barBorderColor: '#cccccc'
    }
  },
  pie: {
    itemStyle: {
      borderWidth: 0,
      borderColor: '#cccccc'
    }
  },
  scatter: {
    itemStyle: {
      borderWidth: 0,
      borderColor: '#cccccc'
    }
  },
  boxplot: {
    itemStyle: {
      borderWidth: 2
    }
  },
  parallel: {
    itemStyle: {
      borderWidth: 2
    }
  },
  sankey: {
    itemStyle: {
      borderWidth: 0
    }
  },
  funnel: {
    itemStyle: {
      borderWidth: 0
    }
  },
  gauge: {
    itemStyle: {
      borderWidth: 0
    }
  },
  candlestick: {
    itemStyle: {
      color: '#c23531',
      color0: '#314656',
      borderColor: '#c23531',
      borderColor0: '#314656',
      borderWidth: 1
    }
  },
  graph: {
    itemStyle: {
      borderWidth: 0
    },
    lineStyle: {
      width: 1,
      color: '#aaaaaa'
    },
    symbolSize: 8
  },
  categoryAxis: {
    axisLine: {
      show: true,
      lineStyle: {
        color: '#6e7079'
      }
    },
    axisTick: {
      show: true,
      lineStyle: {
        color: '#6e7079'
      }
    },
    axisLabel: {
      show: true,
      color: '#A4B1D7'
    },
    splitLine: {
      show: false,
      lineStyle: {
        color: [
          '#E0E6F1'
        ]
      }
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: [
          'rgba(250,250,250,0.2)',
          'rgba(210,219,238,0.2)'
        ]
      }
    }
  },
  valueAxis: {
    axisLine: {
      show: false,
      lineStyle: {
        color: '#6e7079'
      }
    },
    axisTick: {
      show: false,
      lineStyle: {
        color: '#6e7079'
      }
    },
    axisLabel: {
      show: true,
      color: '#A4B1D7'
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: [
          'rgba(255, 255, 255, 0.1)'
        ]
      }
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: [
          'rgba(250,250,250,0.2)',
          'rgba(210,219,238,0.2)'
        ]
      }
    }
  },
  timeline: {
    lineStyle: {
      color: '#dae1f5',
      width: 2
    },
    itemStyle: {
      normal: {
        color: '#A4B1D7',
        borderWidth: 1
      },
      emphasis: {
        color: '#FFF'
      }
    },
    controlStyle: {
      normal: {
        color: '#A4B1D7',
        borderColor: '#A4B1D7',
        borderWidth: 1
      },
      emphasis: {
        color: '#A4B1D7',
        borderColor: '#A4B1D7',
        borderWidth: 1
      }
    },
    checkpointStyle: {
      color: '#316bf3',
      borderColor: '#fff'
    },
    label: {
      normal: {
        textStyle: {
          color: '#A4B1D7'
        }
      },
      emphasis: {
        textStyle: {
          color: '#A4B1D7'
        }
      }
    }
  },
  toolbox: {
    iconStyle: {
      normal: {
        borderColor: '#999999'
      },
      emphasis: {
        borderColor: '#666666'
      }
    }
  },
  legend: {
    textStyle: {
      color: '#ffffff'
    }
  },
  tooltip: {
    backgroundColor: 'rgba(13, 28, 59, 0.9)',
    borderColor: '#1e3d7a',
    borderWidth: 1,
    textStyle: {
      color: '#ffffff'
    }
  }
}

// 初始化图表方法
export function initChart(el) {
  if (typeof el === 'string') {
    el = document.getElementById(el)
  }
  return echarts.init(el)
}

// 渲染图表方法
export function renderChart(chart, option) {
  if (!chart) {
    console.error('无效的图表实例')
    return
  }
  
  console.log('开始渲染图表，选项:', JSON.stringify(option, null, 2).substring(0, 500) + '...')
  
  if (!option || typeof option !== 'object' || Object.keys(option).length === 0) {
    console.warn('图表选项为空或无效，使用备用配置', option)
    // 使用备用空图表配置
    option = {
      title: { text: '无数据' },
      tooltip: {},
      xAxis: { type: 'category', data: ['暂无数据'] },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: [0] }]
    }
  }
  
  // 检查关键配置项是否存在
  if (!option.series || !Array.isArray(option.series) || option.series.length === 0) {
    console.warn('图表series配置缺失或为空数组，使用默认配置')
    option.series = [{ type: 'bar', data: [0] }]
  }
  
  if (!option.xAxis) {
    console.warn('图表xAxis配置缺失，使用默认配置')
    option.xAxis = { type: 'category', data: ['暂无数据'] }
  }
  
  if (!option.yAxis) {
    console.warn('图表yAxis配置缺失，使用默认配置')
    option.yAxis = { type: 'value' }
  }
  
  try {
    // 使用宏任务延迟确保在主进程之外执行
    setTimeout(() => {
      try {
        console.log('合并主题和选项...')
        // 应用主题
        const themeOption = Object.assign({}, theme, option)
        
        // 移除任何地图相关的配置，避免地图组件错误
        if (themeOption.geo) {
          console.warn('检测到geo配置，已移除以避免错误')
          delete themeOption.geo
        }
        
        if (themeOption.map) {
          console.warn('检测到map配置，已移除以避免错误')
          delete themeOption.map
        }
        
        // 移除series中的地图类型图表
        if (themeOption.series && Array.isArray(themeOption.series)) {
          themeOption.series = themeOption.series.filter(series => {
            if (series.type === 'map' || series.type === 'geo') {
              console.warn(`检测到${series.type}类型的series，已移除以避免错误`)
              return false
            }
            return true
          })
        }
        
        // 对boxplot类型进行特殊处理
        if (themeOption.series && Array.isArray(themeOption.series)) {
          themeOption.series.forEach((series, index) => {
            if (series.type === 'boxplot') {
              // 确保boxplot的数据格式正确
              if (series.data && Array.isArray(series.data)) {
                // 转换为标准格式
                series.data = series.data.map(item => {
                  if (typeof item === 'object' && item.value) {
                    return item
                  } else if (Array.isArray(item)) {
                    return { value: item }
                  }
                  return item
                })
                
                // 确保坐标轴设置正确 
                if (!themeOption.xAxis || !themeOption.yAxis) {
                  // 如果没有坐标轴设置，添加默认设置
                  if (!themeOption.xAxis) {
                    themeOption.xAxis = {
                      type: 'category',
                      data: Array.from({ length: series.data.length }, (_, i) => `类别${i+1}`)
                    }
                  }
                  
                  if (!themeOption.yAxis) {
                    themeOption.yAxis = {
                      type: 'value'
                    }
                  }
                }
                
                // 确保网格设置正确
                if (!themeOption.grid) {
                  themeOption.grid = {
                    top: '10%',
                    right: '10%',
                    bottom: '15%',
                    left: '10%',
                    containLabel: true
                  }
                }
              }
              
              // 使用替代方案 - 如果boxplot仍然有问题，转换为更简单的图表类型
              try {
                // 尝试预渲染检查boxplot配置
                const tempChart = document.createElement('div')
                tempChart.style.width = '100px'
                tempChart.style.height = '100px'
                document.body.appendChild(tempChart)
                const testChart = echarts.init(tempChart)
                
                const boxplotOnly = {
                  xAxis: themeOption.xAxis,
                  yAxis: themeOption.yAxis,
                  series: [series]
                }
                
                testChart.setOption(boxplotOnly)
                testChart.dispose()
                document.body.removeChild(tempChart)
              } catch (boxplotError) {
                console.warn('箱线图渲染测试失败，转换为替代图表', boxplotError)
                
                // 转换为柱状图作为替代
                series.type = 'bar'
                series.name = series.name || '数据分布'
                
                // 从boxplot数据提取中位数作为柱状图数据
                series.data = series.data.map((item, i) => {
                  const boxData = item.value || item
                  // boxplot数据格式是 [min, Q1, median, Q3, max]
                  const median = Array.isArray(boxData) ? boxData[2] : 0
                  return {
                    value: median,
                    itemStyle: item.itemStyle || {
                      color: themeOption.color[i % themeOption.color.length]
                    }
                  }
                })
              }
            }
          })
        }
        
        try {
          console.log('清除图表并设置新选项...')
          // 分开执行clear和setOption，避免连续调用引起的问题
          chart.clear()
          // 再次使用延迟确保清除操作完成后再设置选项
          setTimeout(() => {
            console.log('设置图表选项...')
            chart.setOption(themeOption, true)
            console.log('图表渲染完成!')
          }, 100)
        } catch (chartError) {
          console.error('设置图表选项时出错:', chartError)
          
          // 如果仍然失败，尝试渲染最简单的图表
          setTimeout(() => {
            const fallbackOption = {
              title: option.title || { text: '数据可视化' },
              tooltip: {},
              xAxis: {
                type: 'category',
                data: ['无数据']
              },
              yAxis: {
                type: 'value'
              },
              series: [{
                type: 'bar',
                data: [0]
              }]
            }
            
            chart.clear()
            setTimeout(() => {
              chart.setOption(fallbackOption)
            }, 100)
          }, 100)
        }
      } catch (innerError) {
        console.error('渲染图表时出错:', innerError)
      }
    }, 300)
  } catch (error) {
    console.error('渲染图表外部错误:', error)
  }
}

// 监听窗口大小变化，调整图表大小
export function setupChartResize(charts) {
  const resize = () => {
    charts.forEach(chart => {
      chart && chart.resize()
    })
  }
  
  window.addEventListener('resize', resize)
  
  // 返回一个清理函数
  return () => {
    window.removeEventListener('resize', resize)
  }
}

export default {
  echarts,
  initChart,
  renderChart,
  setupChartResize
} 