# 电影数据分析API接口文档

## 基础信息

## 接口列表

### 1. 基础分析接口

获取电影评分分布、类型分布和时长分布的分析图表数据。

- **URL**: `/api/analysis/basic`
- **方法**: GET
- **参数**: 无
- **返回示例**:
  ```json
  {
    "status": "success",
    "data": {
      "rating_distribution": {
        "title": {"text": "评分分布"},
        "tooltip": {"trigger": "axis"},
        "xAxis": {...},
        "yAxis": {...},
        "series": [...]
      },
      "genre_distribution": {...},
      "runtime_distribution": {...}
    }
  }
  ```

### 2. 评分分析接口

提供评分与时长、年份等特征的关系分析图表数据。

- **URL**: `/api/analysis/rating`
- **方法**: GET
- **参数**: 
  - `sample_size`: 当不使用分箱时，抽样数据点数量，默认100（可选）
  - `use_bins`: 是否使用分箱聚合数据，默认true（可选）
- **返回示例**:
  ```json
  {
    "status": "success",
    "data": {
      "rating_vs_runtime": {...},
      "rating_vs_year": {...},
      "genre_ratings": {...}
    }
  }
  ```

### 3. 时间序列分析接口

提供随时间变化的电影评分、数量趋势分析数据。

- **URL**: `/api/analysis/time-series`
- **方法**: GET
- **参数**: 无
- **返回示例**:
  ```json
  {
    "status": "success",
    "data": {
      "yearly_rating_trend": {...},
      "yearly_movie_count": {...},
      "moving_average": {...}
    }
  }
  ```

### 4. 类型趋势分析接口

提供电影类型随时间的变化趋势数据。

- **URL**: `/api/analysis/genre-trend`
- **方法**: GET
- **参数**: 无
- **返回示例**:
  ```json
  {
    "status": "success",
    "data": {
      "genre_trend_by_year": {...},
      "genre_percentage": {...}
    }
  }
  ```

### 5. 聚类分析接口

基于电影特征（评分、时长、年份）进行聚类分析。

- **URL**: `/api/analysis/cluster`
- **方法**: GET
- **参数**: 无
- **返回示例**:
  ```json
  {
    "status": "success",
    "data": {
      "cluster_scatter": {...},
      "cluster_feature_means": {...}
    }
  }
  ```

### 6. 特征重要性分析接口

提供影响电影评分的各特征重要性分析。

- **URL**: `/api/analysis/feature-importance`
- **方法**: GET
- **参数**: 无
- **返回示例**:
  ```json
  {
    "status": "success",
    "data": {
      "feature_importance": {...}
    }
  }
  ```

### 7. 电影评分预测接口

预测单个电影的评分。

- **URL**: `/api/movie/predict`
- **方法**: POST
- **请求体**:
  ```json
  {
    "title": "电影标题",
    "year": 2023,
    "runtime": "120分钟", // 可选
    "director": "导演姓名", // 可选
    "actors": "演员1,演员2,演员3", // 可选
    "plot": "电影剧情简介", // 可选
    "genres": "剧情,动作,科幻" // 可选
  }
  ```
- **返回示例**:
  ```json
  {
    "status": "success",
    "data": {
      "title": "电影标题",
      "rf_prediction": 8.5,
      "dl_prediction": 7.9,
      "ensemble_prediction": 8.3,
      "features": {
        "runtime": 120,
        "actor_count": 3,
        "plot_sentiment": 0.45,
        "genres": ["剧情", "动作", "科幻"]
      }
    }
  }
  ```

## 错误处理

所有接口在发生错误时会返回适当的HTTP状态码和详细的错误信息。

- **示例**:
  ```json
  {
    "detail": "数据文件不存在: D:/dashuju/data/cleaned_douban_movies.csv"
  }
  ```

## 备注

1. 所有分析接口（除预测接口外）均从本地CSV文件加载数据
2. 图表数据使用ECharts格式，可直接用于前端绘制
3. 预测接口结合了随机森林模型和深度学习(BERT)模型的结果
