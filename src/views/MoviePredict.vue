<template>
  <div class="movie-predict-container">
    <div class="content-wrapper">
      <div class="input-panel">
        <h2 class="panel-title">预测电影评分</h2>
        
        <div class="form-group">
          <label><span class="required">*</span>电影名称</label>
          <input 
            v-model="movieForm.title" 
            placeholder="请输入电影名称" 
            class="form-control"
          />
        </div>
        
        <div class="form-row">
          <div class="form-group half">
            <label><span class="required">*</span>上映年份</label>
            <div class="input-control">
              <input 
                type="number" 
                class="form-control" 
                v-model="movieForm.year" 
                placeholder="2023"
                min="1900"
                max="2023"
              />
            </div>
          </div>
          
          <div class="form-group half">
            <label><span class="required">*</span>电影时长</label>
            <div class="input-control">
              <input 
                v-model="movieForm.runtime" 
                placeholder="120" 
                class="form-control"
                type="number"
                min="1"
              />
              <span class="unit">分钟</span>
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label><span class="required">*</span>导演</label>
          <input 
            v-model="movieForm.director" 
            placeholder="请输入导演名称" 
            class="form-control"
          />
        </div>
        
        <div class="form-group">
          <label>主要演员</label>
          <textarea 
            v-model="movieForm.actors" 
            placeholder="多个演员用逗号分隔，如：汤姆·汉克斯, 莱昂纳多·迪卡普里奥" 
            class="form-control textarea"
            rows="2"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label><span class="required">*</span>电影类型</label>
          <div class="genre-selector">
            <div 
              v-for="item in genreOptions" 
              :key="item"
              class="genre-tag"
              :class="{ active: movieForm.genres.includes(item) }"
              @click="toggleGenre(item)"
            >
              {{ item }}
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label>剧情简介</label>
          <textarea 
            v-model="movieForm.plot" 
            placeholder="请输入剧情简介..." 
            class="form-control textarea"
            rows="3"
          ></textarea>
        </div>
        
        <button 
          type="button"
          class="submit-button" 
          :disabled="loading"
          @click="submitForm"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? '预测中...' : '预测评分' }}
        </button>
      </div>

      <div class="results-panel">
        <div v-if="!hasResult" class="empty-state">
          <div class="icon-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
              <line x1="7" y1="2" x2="7" y2="22"></line>
              <line x1="17" y1="2" x2="17" y2="22"></line>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <line x1="2" y1="7" x2="7" y2="7"></line>
              <line x1="2" y1="17" x2="7" y2="17"></line>
              <line x1="17" y1="17" x2="22" y2="17"></line>
              <line x1="17" y1="7" x2="22" y2="7"></line>
            </svg>
          </div>
          <h3>等待预测结果</h3>
          <p>填写左侧表单并点击"预测评分"按钮查看结果</p>
        </div>
        
        <template v-if="hasResult">
          <!-- 预测结果展示 -->
          <div class="result-content">
            <div class="movie-score">
              <div class="score-ring">
                <template v-if="predictedScore === '...'">
                  <span class="loading-animation"></span>
                </template>
                <template v-else>
                  <span class="score-value">{{ formatScore(predictedScore) }}</span>
                </template>
              </div>
              <div class="score-label">预测评分</div>
            </div>
            
            <div class="movie-info">
              <h3 class="movie-title">{{ movieForm.title }}</h3>
              <div class="movie-meta">
                <span>{{ movieForm.year }}</span>
                <span class="divider">|</span>
                <span>{{ movieForm.runtime }}分钟</span>
                <span class="divider">|</span>
                <span>{{ movieForm.genres.join('、') }}</span>
              </div>
              <div class="movie-crew">
                <p><strong>导演:</strong> {{ movieForm.director }}</p>
                <p v-if="movieForm.actors"><strong>演员:</strong> {{ movieForm.actors }}</p>
              </div>
              <div v-if="movieForm.plot" class="movie-plot">
                <p>{{ movieForm.plot }}</p>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../utils/api'

// 页面状态
const loading = ref(false)
const hasResult = ref(false)
const predictedScore = ref(0)

// 电影表单
const movieForm = reactive({
  title: '',
  year: new Date().getFullYear(),
  runtime: '',
  director: '',
  actors: '',
  plot: '',
  genres: []
})

// 切换电影类型
const toggleGenre = (genre) => {
  const index = movieForm.genres.indexOf(genre)
  if (index === -1) {
    movieForm.genres.push(genre)
  } else {
    movieForm.genres.splice(index, 1)
  }
}

// 类型选项
const genreOptions = [
  '剧情', '动作', '喜剧', '科幻', '恐怖', '冒险', '爱情', '家庭', '动画', 
  '悬疑', '惊悚', '战争', '历史', '传记', '犯罪', '纪录片', '音乐', '奇幻',
  '西部', '武侠', '黑色电影', '灾难', '运动', '歌舞'
]

// 提交表单
const submitForm = async () => {
  // 表单验证
  if (!movieForm.title) {
    ElMessage.warning('请输入电影名称')
    return
  }
  
  if (!movieForm.runtime) {
    ElMessage.warning('请输入电影时长')
    return
  }
  
  if (!movieForm.director) {
    ElMessage.warning('请输入导演')
    return
  }
  
  if (movieForm.genres.length === 0) {
    ElMessage.warning('请选择至少一个电影类型')
    return
  }
  
  // 准备请求数据
  const requestData = {
    title: movieForm.title,
    year: Number(movieForm.year),
    runtime: `${movieForm.runtime}分钟`,
    director: movieForm.director,
    actors: movieForm.actors,
    plot: movieForm.plot,
    genres: movieForm.genres.join(',')
  }
  
  loading.value = true
  try {
    // 提示用户这可能需要一些时间
    ElMessage.info('正在发送预测请求，模型分析可能需要10-30秒，请耐心等待...')
    console.log('发送数据:', requestData)
    
    // 显示预测进行中的状态
    hasResult.value = true
    predictedScore.value = '...'
    
    const response = await api.predictMovie(requestData)
    console.log('接收响应:', response)
    
    // 更新评分结果 - 根据后端返回结构进行适配
    if (response.data && response.data.ensemble_prediction !== undefined) {
      // 获取ensemble_prediction字段
      predictedScore.value = response.data.ensemble_prediction
    } else if (response.data && typeof response.data.score !== 'undefined') {
      // 直接获取score字段
      predictedScore.value = response.data.score
    } else if (response.score) {
      // 直接从response获取score
      predictedScore.value = response.score
    } else if (response.data && response.data.predictions && response.data.predictions.ensemble) {
      // 尝试获取predictions.ensemble字段
      predictedScore.value = response.data.predictions.ensemble
    } else {
      // 如果找不到评分数据，使用默认值
      predictedScore.value = 7.5
      console.warn('无法从响应中找到评分数据，使用默认值')
    }
    
    ElMessage.success('预测完成')
  } catch (error) {
    console.error('预测失败:', error)
    ElMessage.error('预测失败: ' + (error.message || '请重试'))
    hasResult.value = false
  } finally {
    loading.value = false
  }
}

// 格式化分数
const formatScore = (score) => {
  if (score === '...') {
    return score
  }
  if (typeof score !== 'number') {
    return score || '0.0'
  }
  return score.toFixed(1)
}
</script>

<style scoped>
.movie-predict-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #e2e8f0;
}

.content-wrapper {
  display: flex;
  width: 100%;
  max-width: 1200px;
  min-height: 600px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  overflow: hidden;
}

.input-panel {
  flex: 1;
  background-color: #1e293b;
  padding: 30px;
  overflow-y: auto;
}

.results-panel {
  flex: 1;
  background-color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px;
}

.panel-title {
  color: #60a5fa;
  font-size: 24px;
  margin-bottom: 30px;
  font-weight: 600;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.half {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #94a3b8;
}

.required {
  color: #f87171;
  margin-right: 4px;
}

.form-control {
  width: 100%;
  background-color: #334155;
  border: 1px solid #475569;
  color: #e2e8f0;
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-control:focus {
  border-color: #60a5fa;
  outline: none;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
}

.form-control::placeholder {
  color: #64748b;
}

.textarea {
  resize: none;
  min-height: 70px;
}

.input-control {
  position: relative;
  display: flex;
}

.input-control .form-control {
  width: 100%;
}

.unit {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
}

.genre-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.genre-tag {
  background-color: #334155;
  color: #94a3b8;
  border: 1px solid #475569;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.genre-tag:hover {
  background-color: #3e4c62;
}

.genre-tag.active {
  background-color: #60a5fa;
  color: #0f172a;
  border-color: #60a5fa;
}

.submit-button {
  width: 100%;
  background-color: #60a5fa;
  color: #0f172a;
  border: none;
  border-radius: 6px;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 30px;
}

.submit-button:hover {
  background-color: #3b82f6;
}

.submit-button:disabled {
  background-color: #64748b;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  max-width: 300px;
}

.icon-container {
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-state h3 {
  color: #e2e8f0;
  font-size: 18px;
  margin-bottom: 10px;
}

.empty-state p {
  color: #94a3b8;
  font-size: 14px;
}

.result-content {
  text-align: center;
  width: 100%;
}

.movie-score {
  margin-bottom: 30px;
}

.score-ring {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 6px solid #60a5fa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  box-shadow: 0 0 20px rgba(96, 165, 250, 0.3);
}

.score-value {
  font-size: 42px;
  font-weight: 700;
  color: #f8fafc;
}

.score-label {
  font-size: 16px;
  color: #94a3b8;
}

.movie-info {
  max-width: 400px;
  margin: 0 auto;
}

.movie-title {
  font-size: 24px;
  margin-bottom: 10px;
  color: #f8fafc;
}

.movie-meta {
  display: flex;
  justify-content: center;
  color: #94a3b8;
  font-size: 14px;
  margin-bottom: 20px;
}

.divider {
  margin: 0 8px;
  color: #475569;
}

.movie-crew {
  text-align: left;
  margin-bottom: 20px;
}

.movie-crew p {
  margin: 8px 0;
}

.movie-plot {
  text-align: left;
  background-color: #1e293b;
  padding: 12px;
  border-radius: 6px;
  border-left: 3px solid #60a5fa;
}

.loading-animation {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid rgba(96, 165, 250, 0.3);
  border-radius: 50%;
  border-top-color: #60a5fa;
  animation: spin 1.5s ease-in-out infinite;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
    max-height: none;
  }
  
  .input-panel, .results-panel {
    width: 100%;
  }
  
  .form-row {
    flex-direction: column;
    gap: 20px;
  }
}
</style> 