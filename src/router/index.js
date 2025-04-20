import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue')
  },
  {
    path: '/basic-analysis',
    name: 'BasicAnalysis',
    component: () => import('../views/BasicAnalysis.vue')
  },
  {
    path: '/rating-analysis',
    name: 'RatingAnalysis',
    component: () => import('../views/RatingAnalysis.vue')
  },
  {
    path: '/time-series',
    name: 'TimeSeries',
    component: () => import('../views/TimeSeries.vue')
  },
  {
    path: '/cluster-analysis',
    name: 'ClusterAnalysis',
    component: () => import('../views/ClusterAnalysis.vue')
  },
  {
    path: '/genre-trend',
    name: 'GenreTrend',
    component: () => import('../views/GenreTrend.vue')
  },
  {
    path: '/feature-importance',
    name: 'FeatureImportance',
    component: () => import('../views/FeatureImportance.vue')
  },
  {
    path: '/movie-predict',
    name: 'MoviePredict',
    component: () => import('../views/MoviePredict.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 