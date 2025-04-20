<template>
  <div class="data-container">
    <h1 class="page-title">特征重要性分析</h1>
    
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
      <el-form-item label="模型选择">
        <el-select v-model="modelType" @change="fetchData">
          <el-option label="随机森林" value="random_forest"></el-option>
          <el-option label="梯度提升树" value="gradient_boosting"></el-option>
          <el-option label="深度学习" value="deep_learning"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="目标变量">
        <el-select v-model="targetVariable" @change="fetchData">
          <el-option label="评分(IMDb)" value="imdb_rating"></el-option>
          <el-option label="票房" value="box_office"></el-option>
          <el-option label="奖项数" value="awards"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    
    <!-- 特征重要性图表 -->
    <el-row :gutter="20">
      <el-col :xs="24" :lg="12">
        <div class="chart-container">
          <ChartComponent
            chart-id="feature-importance"
            title="特征重要性"
            :options="chartData.feature_importance"
            :loading="loading"
            :height="500"
          />
        </div>
      </el-col>
      <el-col :xs="24" :lg="12">
        <div class="chart-container">
          <ChartComponent
            chart-id="cumulative-importance"
            title="累积特征重要性"
            :options="chartData.cumulative_importance"
            :loading="loading"
            :height="500"
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

// 页面状态
const loading = ref(false)
const modelType = ref('random_forest')
const targetVariable = ref('imdb_rating')

// 图表数据
const chartData = reactive({
  feature_importance: {},
  cumulative_importance: {}
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    // 构建符合API文档格式的请求数据
    // API只需要importance_df字段，包含feature和importance两个数组
    const importanceDf = {
      feature: [
        'Runtime', 'Year', 'Director_Rating', 'Actor_Rating', 'Budget', 
        'Genre_Action', 'Genre_Drama', 'Genre_Comedy', 'Genre_SciFi', 
        'Genre_Horror', 'Release_Season', 'Franchise', 'Studio_Rating'
      ],
      importance: [0.2, 0.15, 0.12, 0.1, 0.09, 0.07, 0.06, 0.05, 0.04, 0.03, 0.04, 0.02, 0.03]
    }
    
    // 添加请求参数
    const requestParams = {
      model_type: modelType.value,
      target_variable: targetVariable.value
    }
    
    console.log('发送特征重要性请求:', { importance_df: importanceDf, ...requestParams })
    
    // 调用API获取特征重要性分析结果
    const response = await api.getFeatureImportance({ importance_df: importanceDf, ...requestParams })
    
    console.log('收到特征重要性响应:', response)
    
    // 更新图表数据
    if (response && response.data) {
      chartData.feature_importance = response.data.feature_importance || {}
      chartData.cumulative_importance = response.data.cumulative_importance || {}
    } else {
      console.error('获取特征重要性数据失败，响应格式不正确:', response)
      ElMessage.error('获取特征重要性数据失败')
    }
  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('获取特征重要性分析数据失败')
  } finally {
    loading.value = false
  }
}

// 重置数据
const resetData = () => {
  chartData.feature_importance = {}
  chartData.cumulative_importance = {}
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

.metric-values {
  display: flex;
  gap: 30px;
}

.metric {
  display: flex;
  align-items: center;
}

.metric-name {
  font-weight: bold;
  margin-right: 10px;
}

.metric-value {
  font-size: 16px;
  color: #4db3ff;
}

.feature-list {
  margin-top: 10px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px dashed #1e3d7a;
}

.feature-item:last-child {
  border-bottom: none;
}

.feature-rank {
  width: 25px;
  height: 25px;
  background-color: #4db3ff;
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  margin-right: 15px;
  margin-top: 2px;
}

.feature-info {
  flex: 1;
}

.feature-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.feature-desc {
  color: #909399;
  font-size: 13px;
}

.feature-importance-value {
  font-weight: bold;
  color: #4db3ff;
  min-width: 60px;
  text-align: right;
}

.model-conclusion {
  color: #909399;
  line-height: 1.6;
}

.model-conclusion p {
  margin-bottom: 10px;
}

.model-conclusion ul {
  padding-left: 20px;
  margin-bottom: 15px;
}

.model-conclusion li {
  margin-bottom: 8px;
}
</style> 