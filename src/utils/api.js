import axios from 'axios'

const BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    console.log('API请求:', config.url, config.data)
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    console.log('API响应:', response.config.url, response.data)
    return response.data
  },
  error => {
    console.error('API请求错误:', error)
    return Promise.reject(error)
  }
)

export default {
  // 基础分析接口
  getBasicAnalysis() {
    return api.get('/api/analysis/basic')
  },
  
  // 评分分析接口
  getRatingAnalysis(params = {}) {
    return api.get('/api/analysis/rating', { params })
  },
  
  // 时间序列分析接口
  getTimeSeriesAnalysis(params) {
    return api.get('/api/analysis/time-series', { params })
  },
  
  // 聚类分析接口
  getClusterAnalysis(params) {
    return api.get('/api/analysis/cluster', { params })
  },
  
  // 类型趋势分析接口
  getGenreTrendAnalysis(params = {}) {
    return api.get('/api/analysis/genre-trend', { params })
  },
  
  // 特征重要性分析接口
  getFeatureImportance() {
    return api.get('/api/analysis/feature-importance')
  },
  
  // 单个电影预测分析接口
  predictMovie(movieData) {
    return api.post('/api/movie/predict', movieData)
  }
} 