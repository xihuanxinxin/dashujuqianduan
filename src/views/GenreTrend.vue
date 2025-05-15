<template>
  <div class="data-container">
    <h1 class="page-title">类型趋势分析</h1>
    
    <!-- 功能控制区域 -->
    <el-form :inline="true" class="demo-form">
      <el-form-item>
        <el-button type="primary" @click="fetchData" :loading="loading">
          分析数据
        </el-button>
      </el-form-item>
      <el-form-item>

      </el-form-item>

      
    </el-form>
    
    <!-- 提示信息 -->
    <div class="chart-tip">
      <i class="el-icon-info"></i> 将鼠标悬停在图表上可查看各类型详细数据
    </div>
    
    <!-- 类型趋势图表 -->
    <el-row :gutter="20">
      <el-col :xs="24">
        <div class="chart-container">
          <ChartComponent
            chart-id="genre-count-trend"
            title="各类型电影数量趋势"
            :options="chartData.genre_count_trend"
            :loading="loading"
            :height="400"
            @chart-ready="handleChartReady('count')"
          />
        </div>
      </el-col>
    </el-row>
    
    <el-row :gutter="20">
      <el-col :xs="24">
        <div class="chart-container">
          <ChartComponent
            chart-id="genre-rating-trend"
            title="各类型电影平均评分趋势"
            :options="chartData.genre_rating_trend"
            :loading="loading"
            :height="400"
            @chart-ready="handleChartReady('rating')"
          />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import ChartComponent from '../components/ChartComponent.vue'
import api from '../utils/api.js'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

// 页面状态
const loading = ref(false)
const timeRange = ref('all')

// 类型选择
const availableGenres = [
  '动作', '剧情', '喜剧', '科幻', '恐怖', '冒险',
  '爱情', '家庭', '动画', '悬疑', '惊悚'
]
const selectedGenres = ref(['动作', '剧情', '喜剧'])

// 图表数据
const chartData = reactive({
  genre_count_trend: {},
  genre_rating_trend: {}
})

// 图表实例引用
const chartInstances = reactive({
  count: null,
  rating: null
})

// 处理图表准备完成
const handleChartReady = (type) => {
  console.log(`${type} 图表准备完成`);
  // 这里可以获取图表实例并进行额外配置
  if (type === 'count' && chartData.genre_count_trend) {
    // 确保tooltip显示
    setTimeout(() => {
      const chart = document.querySelector('#genre-count-trend');
      if (chart) {
        const echartInstance = echarts.getInstanceByDom(chart);
        if (echartInstance) {
          chartInstances.count = echartInstance;
          // 强制更新tooltip配置
          echartInstance.setOption({
            tooltip: {
              show: true,
              trigger: 'axis',
              confine: true,
              enterable: true,
              backgroundColor: 'rgba(50,50,50,0.9)',
              borderColor: '#333',
              borderWidth: 1,
              padding: [8, 12],
              textStyle: {
                color: '#fff',
                fontSize: 14
              },
              axisPointer: {
                type: 'line',
                lineStyle: {
                  color: 'rgba(255,255,255,0.3)',
                  width: 1
                },
                label: {
                  backgroundColor: '#6a7985'
                }
              },
              formatter: function(params) {
                if (!params || params.length === 0) return '';
                
                let year = params[0].name;
                if (isNaN(parseInt(year))) year = year;
                else year = year + '年';
                
                let result = `<div style="font-weight:bold;margin-bottom:5px;">${year}</div>`;
                
                // 按值从大到小排序，突出显示重要数据
                params.sort((a, b) => b.value - a.value);
                
                // 只显示前3个最重要的类型数据
                const topParams = params.slice(0, 3);
                const hiddenCount = params.length - topParams.length;
                
                topParams.forEach(param => {
                  if (!param.seriesName || param.value === undefined) return;
                  
                  // 使用不同颜色的小圆点标识不同的线
                  result += `<div style="display:flex;align-items:center;margin:3px 0;">
                    <span style="display:inline-block;margin-right:8px;border-radius:50%;width:10px;height:10px;background-color:${param.color};"></span>
                    <span style="flex:1;">${param.seriesName}:</span>
                    <span style="font-weight:bold;margin-left:5px;">${param.value}部</span>
                  </div>`;
                });
                
                // 如果有被隐藏的数据，添加提示信息
                if (hiddenCount > 0) {
                  result += `<div style="margin-top:5px;font-style:italic;opacity:0.8;font-size:12px;">还有${hiddenCount}种类型未显示</div>`;
                }
                
                return result;
              }
            }
          }, {notMerge: false});
        }
      }
    }, 500);
  } else if (type === 'rating' && chartData.genre_rating_trend) {
    // 确保tooltip显示
    setTimeout(() => {
      const chart = document.querySelector('#genre-rating-trend');
      if (chart) {
        const echartInstance = echarts.getInstanceByDom(chart);
        if (echartInstance) {
          chartInstances.rating = echartInstance;
          // 强制更新tooltip配置
          echartInstance.setOption({
            tooltip: {
              show: true,
              trigger: 'axis',
              confine: true,
              enterable: true,
              backgroundColor: 'rgba(50,50,50,0.9)',
              borderColor: '#333',
              borderWidth: 1,
              padding: [8, 12],
              textStyle: {
                color: '#fff',
                fontSize: 14
              },
              axisPointer: {
                type: 'line',
                lineStyle: {
                  color: 'rgba(255,255,255,0.3)',
                  width: 1
                },
                label: {
                  backgroundColor: '#6a7985'
                }
              },
              formatter: function(params) {
                if (!params || params.length === 0) return '';
                
                let year = params[0].name;
                if (isNaN(parseInt(year))) year = year;
                else year = year + '年';
                
                let result = `<div style="font-weight:bold;margin-bottom:5px;">${year}</div>`;
                
                // 按评分从高到低排序
                params.sort((a, b) => b.value - a.value);
                
                // 只显示前3个最高评分的类型
                const topParams = params.slice(0, 3);
                const hiddenCount = params.length - topParams.length;
                
                topParams.forEach(param => {
                  if (!param.seriesName || param.value === undefined) return;
                  
                  // 计算评分，保留一位小数
                  let score = typeof param.value === 'number' ? param.value.toFixed(1) : param.value;
                  
                  // 使用不同颜色的小圆点标识不同的线
                  result += `<div style="display:flex;align-items:center;margin:3px 0;">
                    <span style="display:inline-block;margin-right:8px;border-radius:50%;width:10px;height:10px;background-color:${param.color};"></span>
                    <span style="flex:1;">${param.seriesName}:</span>
                    <span style="font-weight:bold;margin-left:5px;">${score}分</span>
                  </div>`;
                });
                
                // 如果有被隐藏的数据，添加提示信息
                if (hiddenCount > 0) {
                  result += `<div style="margin-top:5px;font-style:italic;opacity:0.8;font-size:12px;">还有${hiddenCount}种类型未显示</div>`;
                }
                
                return result;
              }
            }
          }, {notMerge: false});
        }
      }
    }, 500);
  }
}

// 更新类型过滤器
const updateGenreFilter = () => {
  if (selectedGenres.value.length > 0) {
    fetchData()
  }
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    // 根据API文档，类型趋势分析接口使用GET方法
    const params = {
      time_range: timeRange.value,
      selected_genres: selectedGenres.value.join(',') // 将数组转为逗号分隔的字符串
    }
    
    console.log('发送类型趋势分析请求，参数:', params)
    
    // 调用API获取类型趋势分析结果
    const response = await api.getGenreTrendAnalysis(params)
    
    console.log('类型趋势分析响应:', response)
    
    // 更新图表数据
    if (response && response.data) {
      // 检查属性名，可能有多种可能的响应格式
      let countTrendData = response.data.genre_trend_by_year || 
                             response.data.genre_count_trend || 
                             response.data.count_trend || 
                             createMockCountTrendData(); // 如果以上都不存在，使用模拟数据
      let ratingTrendData = response.data.genre_percentage || 
                              response.data.genre_rating_trend || 
                              response.data.rating_trend || 
                              createMockRatingTrendData(); // 如果以上都不存在，使用模拟数据
      
      // 移除title字段
      if (countTrendData.title) delete countTrendData.title;
      if (ratingTrendData.title) delete ratingTrendData.title;
      
      // 隐藏图例，增强tooltip
      if (countTrendData.legend) {
        countTrendData.legend.show = false;
      } else {
        countTrendData.legend = { show: false };
      }
      
      if (ratingTrendData.legend) {
        ratingTrendData.legend.show = false;
      } else {
        ratingTrendData.legend = { show: false };
      }
      
      // 修改网格，为右侧标签留出空间
      if (countTrendData.grid) {
        countTrendData.grid.right = '10%';
      } else {
        countTrendData.grid = {
          left: '3%',
          right: '10%',
          bottom: '3%',
          containLabel: true
        };
      }
      
      if (ratingTrendData.grid) {
        ratingTrendData.grid.right = '10%';
      } else {
        ratingTrendData.grid = {
          left: '3%',
          right: '10%',
          bottom: '3%',
          containLabel: true
        };
      }
      
      // 为每个系列添加标签
      if (countTrendData.series && countTrendData.series.length > 0) {
        countTrendData.series.forEach(series => {
          // 标签默认不显示
          series.label = {
            show: false,
            position: 'right',
            formatter: '{a}',
            fontSize: 12,
            color: '#fff',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: [3, 5],
            borderRadius: 3
          };
          // 强调状态下显示标签
          series.emphasis = {
            focus: 'series',
            label: {
              show: true,
              position: 'right',
              formatter: '{a}',
              fontSize: 12,
              color: '#fff',
              backgroundColor: 'rgba(0,0,0,0.7)',
              padding: [3, 5],
              borderRadius: 3
            }
          };
        });
      }
      
      if (ratingTrendData.series && ratingTrendData.series.length > 0) {
        ratingTrendData.series.forEach(series => {
          // 标签默认不显示
          series.label = {
            show: false,
            position: 'right',
            formatter: '{a}',
            fontSize: 12,
            color: '#fff',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: [3, 5],
            borderRadius: 3
          };
          // 强调状态下显示标签
          series.emphasis = {
            focus: 'series',
            label: {
              show: true,
              position: 'right',
              formatter: '{a}',
              fontSize: 12,
              color: '#fff',
              backgroundColor: 'rgba(0,0,0,0.7)',
              padding: [3, 5],
              borderRadius: 3
            }
          };
        });
      }
      
      // 移除底部播放控件
      countTrendData.dataZoom = [];
      ratingTrendData.dataZoom = [];
      
      // 增强tooltip
      countTrendData.tooltip = {
        show: true,
        trigger: 'axis',
        confine: true,
        enterable: true,
        z: 100,
        backgroundColor: 'rgba(50,50,50,0.9)',
        borderColor: '#333',
        borderWidth: 1,
        padding: [8, 12],
        textStyle: {
          color: '#fff',
          fontSize: 14
        },
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: 'rgba(255,255,255,0.3)',
            width: 1
          },
          label: {
            backgroundColor: '#6a7985'
          }
        },
        formatter: function(params) {
          if (!params || params.length === 0) return '';
          
          let year = params[0].name;
          if (isNaN(parseInt(year))) year = year;
          else year = year + '年';
          
          let result = `<div style="font-weight:bold;margin-bottom:5px;">${year}</div>`;
          
          // 按值从大到小排序，突出显示重要数据
          params.sort((a, b) => b.value - a.value);
          
          // 只显示前3个最重要的类型数据
          const topParams = params.slice(0, 3);
          const hiddenCount = params.length - topParams.length;
          
          topParams.forEach(param => {
            if (!param.seriesName || param.value === undefined) return;
            
            // 使用不同颜色的小圆点标识不同的线
            result += `<div style="display:flex;align-items:center;margin:3px 0;">
              <span style="display:inline-block;margin-right:8px;border-radius:50%;width:10px;height:10px;background-color:${param.color};"></span>
              <span style="flex:1;">${param.seriesName}:</span>
              <span style="font-weight:bold;margin-left:5px;">${param.value}部</span>
            </div>`;
          });
          
          // 如果有被隐藏的数据，添加提示信息
          if (hiddenCount > 0) {
            result += `<div style="margin-top:5px;font-style:italic;opacity:0.8;font-size:12px;">还有${hiddenCount}种类型未显示</div>`;
          }
          
          return result;
        }
      };
      
      ratingTrendData.tooltip = {
        show: true,
        trigger: 'axis',
        confine: true,
        enterable: true,
        z: 100,
        backgroundColor: 'rgba(50,50,50,0.9)',
        borderColor: '#333',
        borderWidth: 1,
        padding: [8, 12],
        textStyle: {
          color: '#fff',
          fontSize: 14
        },
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: 'rgba(255,255,255,0.3)',
            width: 1
          },
          label: {
            backgroundColor: '#6a7985'
          }
        },
        formatter: function(params) {
          if (!params || params.length === 0) return '';
          
          let year = params[0].name;
          if (isNaN(parseInt(year))) year = year;
          else year = year + '年';
          
          let result = `<div style="font-weight:bold;margin-bottom:5px;">${year}</div>`;
          
          // 按评分从高到低排序
          params.sort((a, b) => b.value - a.value);
          
          // 只显示前3个最高评分的类型
          const topParams = params.slice(0, 3);
          const hiddenCount = params.length - topParams.length;
          
          topParams.forEach(param => {
            if (!param.seriesName || param.value === undefined) return;
            
            // 计算评分，保留一位小数
            let score = typeof param.value === 'number' ? param.value.toFixed(1) : param.value;
            
            // 使用不同颜色的小圆点标识不同的线
            result += `<div style="display:flex;align-items:center;margin:3px 0;">
              <span style="display:inline-block;margin-right:8px;border-radius:50%;width:10px;height:10px;background-color:${param.color};"></span>
              <span style="flex:1;">${param.seriesName}:</span>
              <span style="font-weight:bold;margin-left:5px;">${score}分</span>
            </div>`;
          });
          
          // 如果有被隐藏的数据，添加提示信息
          if (hiddenCount > 0) {
            result += `<div style="margin-top:5px;font-style:italic;opacity:0.8;font-size:12px;">还有${hiddenCount}种类型未显示</div>`;
          }
          
          return result;
        }
      };
      
      console.log('处理后的count趋势数据:', countTrendData);
      console.log('处理后的rating趋势数据:', ratingTrendData);
      
      // 使用setTimeout优化渲染过程，避免一次性更新所有图表
      setTimeout(() => {
        chartData.genre_count_trend = countTrendData;
      }, 100)
      
      setTimeout(() => {
        chartData.genre_rating_trend = ratingTrendData;
      }, 200)
    } else {
      console.error('获取类型趋势数据失败，响应格式不正确:', response)
      ElMessage.error('获取类型趋势分析数据失败')
      
      // 如果没有返回有效数据，使用模拟数据
      setTimeout(() => {
        chartData.genre_count_trend = createMockCountTrendData();
      }, 100)
      
      setTimeout(() => {
        chartData.genre_rating_trend = createMockRatingTrendData();
      }, 200)
    }
  } catch (error) {
    console.error('获取数据失败:', error)
    // 发生错误时显示提示
    ElMessage.error('获取类型趋势分析数据失败')
    
    // 使用模拟数据以保持界面可用
    setTimeout(() => {
      chartData.genre_count_trend = createMockCountTrendData();
    }, 100)
    
    setTimeout(() => {
      chartData.genre_rating_trend = createMockRatingTrendData();
    }, 200)
  } finally {
    // 延迟关闭loading状态
    setTimeout(() => {
      loading.value = false
    }, 500)
  }
}

// 创建模拟数据 - 各类型电影数量趋势
const createMockCountTrendData = () => {
  const years = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022'];
  const selectedGenresList = selectedGenres.value;
  
  return {
    tooltip: { 
      trigger: 'axis',
      confine: true,
      backgroundColor: 'rgba(50,50,50,0.9)',
      borderColor: '#333',
      borderWidth: 1,
      padding: [8, 12],
      textStyle: {
        color: '#fff',
        fontSize: 14
      },
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: 'rgba(255,255,255,0.3)',
          width: 1
        },
        label: {
          backgroundColor: '#6a7985'
        }
      },
      formatter: function(params) {
        if (!params || params.length === 0) return '';
        
        let result = `<div style="font-weight:bold;margin-bottom:5px;">${params[0].name}年</div>`;
        
        // 按值从大到小排序
        params.sort((a, b) => b.value - a.value);
        
        // 只显示前3个最重要的类型数据
        const topParams = params.slice(0, 3);
        const hiddenCount = params.length - topParams.length;
        
        topParams.forEach(param => {
          if (!param.seriesName || param.value === undefined) return;
          
          // 使用不同颜色的小圆点标识不同的线
          result += `<div style="display:flex;align-items:center;margin:3px 0;">
            <span style="display:inline-block;margin-right:8px;border-radius:50%;width:10px;height:10px;background-color:${param.color};"></span>
            <span style="flex:1;">${param.seriesName}:</span>
            <span style="font-weight:bold;margin-left:5px;">${param.value}部</span>
          </div>`;
        });
        
        // 如果有被隐藏的数据，添加提示信息
        if (hiddenCount > 0) {
          result += `<div style="margin-top:5px;font-style:italic;opacity:0.8;font-size:12px;">还有${hiddenCount}种类型未显示</div>`;
        }
        
        return result;
      }
    },
    legend: { 
      show: false // 隐藏图例
    },
    grid: {
      left: '3%',
      right: '10%', // 增加右侧边距，为标签留出空间
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: years,
      axisLabel: { color: '#fff' }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#fff' }
    },
    series: selectedGenresList.map(genre => ({
      name: genre,
      type: 'line',
      data: years.map(() => Math.floor(Math.random() * 50) + 10),
      // 标签只在强调时显示
      label: {
        show: false,
        position: 'right',
        formatter: '{a}',
        fontSize: 12,
        color: '#fff',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: [3, 5],
        borderRadius: 3
      },
      // 强调状态下的样式
      emphasis: {
        focus: 'series',
        label: {
          show: true,
          position: 'right',
          formatter: '{a}',
          fontSize: 12,
          color: '#fff',
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: [3, 5],
          borderRadius: 3
        }
      }
    }))
  };
};

// 创建模拟数据 - 各类型电影平均评分趋势
const createMockRatingTrendData = () => {
  const years = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022'];
  const selectedGenresList = selectedGenres.value;
  
  return {
    tooltip: { 
      trigger: 'axis',
      confine: true,
      backgroundColor: 'rgba(50,50,50,0.9)',
      borderColor: '#333',
      borderWidth: 1,
      padding: [8, 12],
      textStyle: {
        color: '#fff',
        fontSize: 14
      },
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: 'rgba(255,255,255,0.3)',
          width: 1
        },
        label: {
          backgroundColor: '#6a7985'
        }
      },
      formatter: function(params) {
        if (!params || params.length === 0) return '';
        
        let result = `<div style="font-weight:bold;margin-bottom:5px;">${params[0].name}年</div>`;
        
        // 按评分从高到低排序
        params.sort((a, b) => b.value - a.value);
        
        // 只显示前3个最高评分的类型
        const topParams = params.slice(0, 3);
        const hiddenCount = params.length - topParams.length;
        
        topParams.forEach(param => {
          if (!param.seriesName || param.value === undefined) return;
          
          // 计算评分，保留一位小数
          let score = typeof param.value === 'number' ? param.value.toFixed(1) : param.value;
          
          // 使用不同颜色的小圆点标识不同的线
          result += `<div style="display:flex;align-items:center;margin:3px 0;">
            <span style="display:inline-block;margin-right:8px;border-radius:50%;width:10px;height:10px;background-color:${param.color};"></span>
            <span style="flex:1;">${param.seriesName}:</span>
            <span style="font-weight:bold;margin-left:5px;">${score}分</span>
          </div>`;
        });
        
        // 如果有被隐藏的数据，添加提示信息
        if (hiddenCount > 0) {
          result += `<div style="margin-top:5px;font-style:italic;opacity:0.8;font-size:12px;">还有${hiddenCount}种类型未显示</div>`;
        }
        
        return result;
      }
    },
    legend: { 
      show: false // 隐藏图例
    },
    grid: {
      left: '3%',
      right: '10%', // 增加右侧边距，为标签留出空间
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: years,
      axisLabel: { color: '#fff' }
    },
    yAxis: {
      type: 'value',
      min: 5,
      max: 10,
      axisLabel: { color: '#fff' }
    },
    series: selectedGenresList.map(genre => ({
      name: genre,
      type: 'line',
      data: years.map(() => (Math.random() * 2 + 7).toFixed(1)),
      // 标签默认不显示
      label: {
        show: false,
        position: 'right',
        formatter: '{a}',
        fontSize: 12,
        color: '#fff',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: [3, 5],
        borderRadius: 3
      },
      // 强调状态下的样式
      emphasis: {
        focus: 'series',
        label: {
          show: true,
          position: 'right',
          formatter: '{a}',
          fontSize: 12,
          color: '#fff',
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: [3, 5],
          borderRadius: 3
        }
      }
    }))
  };
};

// 重置数据
const resetData = () => {
  chartData.genre_count_trend = {}
  chartData.genre_rating_trend = {}
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

.chart-tip {
  margin-bottom: 15px;
  color: #909399;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.chart-tip i {
  margin-right: 5px;
  font-size: 16px;
}
</style> 