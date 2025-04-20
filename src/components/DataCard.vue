<template>
  <div class="data-card" :class="{ 'is-clickable': clickable }" @click="handleClick">
    <div class="data-card-icon" :style="{ backgroundColor: iconBgColor }">
      <slot name="icon"></slot>
    </div>
    <div class="data-card-content">
      <h3 class="data-card-title">{{ title }}</h3>
      <div class="data-card-value">{{ value }}</div>
      <div v-if="subValue" class="data-card-sub-value">
        <el-icon v-if="trend === 'up'" class="trend-icon up"><CaretTop /></el-icon>
        <el-icon v-if="trend === 'down'" class="trend-icon down"><CaretBottom /></el-icon>
        {{ subValue }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CaretTop, CaretBottom } from '@element-plus/icons-vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  subValue: {
    type: String,
    default: ''
  },
  trend: {
    type: String,
    default: '',
    validator: (value) => ['up', 'down', ''].includes(value)
  },
  iconBgColor: {
    type: String,
    default: '#1e3d7a'
  },
  clickable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}
</script>

<style scoped>
.data-card {
  background: rgba(13, 28, 59, 0.8);
  border: 1px solid #1e3d7a;
  border-radius: 4px;
  padding: 20px;
  display: flex;
  align-items: center;
  min-height: 120px;
  transition: all 0.3s;
}

.is-clickable {
  cursor: pointer;
}

.is-clickable:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  border-color: #4db3ff;
}

.data-card-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 26px;
  color: #ffffff;
}

.data-card-content {
  flex: 1;
}

.data-card-title {
  margin: 0 0 5px;
  font-size: 14px;
  color: #909399;
  font-weight: normal;
}

.data-card-value {
  font-size: 24px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 5px;
}

.data-card-sub-value {
  font-size: 14px;
  color: #909399;
  display: flex;
  align-items: center;
}

.trend-icon {
  margin-right: 5px;
  font-size: 16px;
}

.trend-icon.up {
  color: #67c23a;
}

.trend-icon.down {
  color: #f56c6c;
}
</style> 