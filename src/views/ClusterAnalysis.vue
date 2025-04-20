<template>
  <div class="data-container">
    <h1 class="page-title">聚类分析</h1>
    
    <!-- 功能控制区域 -->
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
      <el-form-item label="聚类数量">
        <el-select v-model="clusterCount" @change="fetchData">
          <el-option label="2" :value="2"></el-option>
          <el-option label="3" :value="3"></el-option>
          <el-option label="4" :value="4"></el-option>
          <el-option label="5" :value="5"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="特征组合">
        <el-select v-model="featureCombination" @change="fetchData">
          <el-option label="时长 vs 评分" value="runtime_rating"></el-option>
          <el-option label="年份 vs 评分" value="year_rating"></el-option>
          <el-option label="时长 vs 年份" value="runtime_year"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    
    <!-- 聚类分析图表 -->
    <el-row :gutter="20">
      <el-col :xs="24">
        <div class="chart-container">
          <ChartComponent
            chart-id="cluster-scatter"
            title="电影聚类分析"
            :options="chartData.cluster_scatter"
            :loading="loading"
            :height="450"
          />
        </div>
      </el-col>
    </el-row>
    
    <el-row :gutter="20">
      <el-col :xs="24" :lg="12">
        <div class="chart-container">
          <div class="chart-header">
            <h3 class="chart-title">特征的聚类分布</h3>
            <el-select v-model="selectedFeatureIndex" @change="handleFeatureChange" size="small" class="feature-selector">
              <el-option 
                v-for="(feature, index) in featureNames" 
                :key="index" 
                :label="feature" 
                :value="index"
              ></el-option>
            </el-select>
          </div>
          <ChartComponent
            chart-id="cluster-features"
            :options="featureOptions"
            :loading="loading"
            :height="350"
          />
        </div>
      </el-col>
      <el-col :xs="24" :lg="12">
        <div class="chart-container">
          <ChartComponent
            chart-id="cluster-centers"
            title="聚类中心特征"
            :options="chartData.cluster_centers"
            :loading="loading"
            :height="350"
          />
        </div>
      </el-col>
    </el-row>
    
    <!-- 聚类说明 -->
    <div class="chart-container">
      <h3 class="section-title">聚类分析解读</h3>
      <el-row :gutter="20">
        <el-col :xs="24">
          <div class="cluster-explanation">
            <h4>聚类结果解释</h4>
            <div class="cluster-groups">
              <div v-for="(cluster, index) in clusterExplanations" :key="index" class="cluster-group">
                <div class="cluster-name" :style="{backgroundColor: cluster.color}">
                  聚类 {{ index }}
                </div>
                <div class="cluster-description">
                  {{ cluster.description }}
                </div>
              </div>
            </div>
            <div class="cluster-summary">
              <p>通过聚类分析，我们可以将电影数据分为不同的组，每组具有相似的特征。这有助于我们理解电影的分布模式和各类特征之间的关系。以上结果可用于：</p>
              <ul>
                <li>电影类型分类与定位</li>
                <li>个性化电影推荐系统</li>
                <li>电影市场细分分析</li>
                <li>制片决策与投资风险评估</li>
              </ul>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import ChartComponent from '../components/ChartComponent.vue'
import api from '../utils/api.js'
import { ElMessage } from 'element-plus'

// 页面状态
const loading = ref(false)
const clusterCount = ref(3)
const featureCombination = ref('runtime_rating')
const selectedFeatureIndex = ref(0)

// 特征名称列表
const featureNames = reactive(['评分(imdbRating)', '时长(Runtime)', '年份(Year)', '动作(Action)', '剧情(Drama)', '喜剧(Comedy)'])

// 处理特征选择变化
const handleFeatureChange = (index) => {
  console.log('选择了特征:', featureNames[index])
  // 不需要做其他处理，computed属性会自动更新
}

// 图表数据
const chartData = ref({
  cluster_scatter: {},
  cluster_features: [],
  cluster_centers: {}
})

// 聚类解释
const clusterExplanations = reactive([
  {
    color: '#4db3ff',
    description: '中等时长、高评分电影组。这类电影平均时长130分钟，平均评分8.3，主要集中在2010-2015年间。典型类型包括经典剧情片和高质量动作片。'
  },
  {
    color: '#67c23a',
    description: '较长时长、中等评分电影组。这类电影平均时长155分钟，平均评分7.5，年份分布较均匀。典型类型包括史诗类电影和复杂剧情电影。'
  },
  {
    color: '#f56c6c',
    description: '长时长、极高评分电影组。这类电影平均时长175分钟，平均评分8.8，多为近5年作品。典型类型包括高投资制作和获奖艺术片。'
  }
])

// 计算特征分布图表选项
const featureOptions = computed(() => {
  try {
    // 确保cluster_features数组存在且不为空
    if (!chartData.value.cluster_features || !Array.isArray(chartData.value.cluster_features) || chartData.value.cluster_features.length === 0) {
      console.log('cluster_features不存在或为空数组，返回空对象')
      return {}
    }
    
    // 安全检查索引是否有效
    const index = Math.min(selectedFeatureIndex.value, chartData.value.cluster_features.length - 1);
    
    // 创建一个深拷贝避免直接引用可能导致的重渲染问题
    const options = JSON.parse(JSON.stringify(chartData.value.cluster_features[index]));
    
    // 确保图表配置完整
    if (options && options.series) {
      // 为boxplot图表添加itemStyle以确保稳定显示
      options.series.forEach(series => {
        if (series.type === 'boxplot' && !series.itemStyle) {
          series.itemStyle = {
            borderWidth: 2,
            borderColor: '#1e3d7a'
          };
        }
      });
      
      // 添加grid配置以稳定布局
      if (!options.grid) {
        options.grid = {
          top: '15%',
          right: '5%',
          bottom: '15%',
          left: '5%',
          containLabel: true
        };
      }
    }
    
    return options;
  } catch (error) {
    console.error('计算featureOptions时出错:', error)
    return {}
  }
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    // 构建请求参数，根据API文档，聚类分析接口使用GET方法
    const params = {
      n_clusters: clusterCount.value,
      feature_combination: featureCombination.value
    }
    
    console.log('发送聚类分析请求，参数:', params)
    
    // 调用API获取聚类分析结果
    const response = await api.getClusterAnalysis(params)
    
    console.log('收到聚类分析响应:', response)
    
    // 处理API返回的数据
    if (response && response.data) {
      chartData.value = response.data
      
      // 如果存在热力图数据，确保添加visualMap组件配置
      if (chartData.value.cluster_centers && 
          chartData.value.cluster_centers.series && 
          chartData.value.cluster_centers.series.length > 0 && 
          chartData.value.cluster_centers.series[0].type === 'heatmap') {
        
        // 添加visualMap配置
        if (!chartData.value.cluster_centers.visualMap) {
          chartData.value.cluster_centers.visualMap = {
            min: 0,
            max: 10,
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: '5%',
            inRange: {
              color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', 
                      '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
            }
          }

          // 从heatmap数据中获取实际的最小值和最大值
          if (chartData.value.cluster_centers.series[0].data && 
              chartData.value.cluster_centers.series[0].data.length > 0) {
            const values = chartData.value.cluster_centers.series[0].data.map(item => item[2]);
            if (values.length > 0) {
              const min = Math.min(...values);
              const max = Math.max(...values);
              chartData.value.cluster_centers.visualMap.min = min;
              chartData.value.cluster_centers.visualMap.max = max;
            }
          }
        }
      }
    } else {
      console.error('获取聚类分析数据失败，响应格式不正确:', response)
      ElMessage.error('获取聚类分析数据失败')
      resetData()
    }
  } catch (error) {
    console.error('聚类分析请求出错:', error)
    ElMessage.error('聚类分析请求出错')
    resetData()
  } finally {
    loading.value = false
  }
}

// 重置数据
const resetData = () => {
  chartData.value = {
    cluster_scatter: {},
    cluster_features: [],
    cluster_centers: {}
  }
}

// 页面加载时自动获取数据
onMounted(() => {
  // 延迟一点获取数据，确保组件已完全挂载
  setTimeout(() => {
    fetchData()
  }, 100)
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

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.chart-title {
  margin: 0;
  font-size: 18px;
  color: #4db3ff;
}

.feature-selector {
  width: 180px;
}

.cluster-explanation {
  padding: 10px;
}

.cluster-explanation h4 {
  font-size: 16px;
  margin-bottom: 15px;
  color: #ffffff;
}

.cluster-groups {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.cluster-group {
  flex: 1;
  min-width: 250px;
  border: 1px solid #1e3d7a;
  border-radius: 4px;
  overflow: hidden;
}

.cluster-name {
  padding: 8px 15px;
  color: #ffffff;
  font-weight: bold;
}

.cluster-description {
  padding: 12px;
  color: #909399;
  font-size: 14px;
  line-height: 1.5;
}

.cluster-summary {
  color: #909399;
  font-size: 14px;
  line-height: 1.6;
  border-top: 1px dashed #1e3d7a;
  padding-top: 15px;
  margin-top: 10px;
}

.cluster-summary ul {
  padding-left: 20px;
  margin-top: 10px;
}

.cluster-summary li {
  margin-bottom: 5px;
}
</style> 