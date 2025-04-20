# 电影数据分析可视化系统

这是一个基于Vue 3 + ECharts的电影数据分析可视化系统，为电影数据分析提供直观的界面展示。

## 功能特点

- **多样化数据分析**：支持基础分析、评分分析、时间序列分析、聚类分析、类型趋势分析和特征重要性分析
- **电影评分预测**：基于机器学习模型预测电影评分
- **美观的数据可视化**：采用ECharts实现多种图表展示
- **响应式设计**：支持在不同设备上良好显示
- **暗色主题**：采用符合大数据展示的暗色主题设计

## 项目截图

![仪表盘](./screenshots/dashboard.png)
![基础分析](./screenshots/basic-analysis.png)
![电影预测](./screenshots/movie-predict.png)

## 技术栈

- **前端框架**：Vue 3
- **构建工具**：Vite
- **UI组件库**：Element Plus
- **图表库**：ECharts
- **HTTP请求**：Axios
- **路由**：Vue Router

## 安装与运行

### 环境要求

- Node.js 14.0+
- npm 6.0+

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run dev
```

访问 http://localhost:3000 查看应用

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run serve
```

## 后端API

本项目需要配合后端API使用，API文档详见 [api_documentation.md](./api_documentation.md)

## 项目结构

```
├── public/             # 静态资源
├── src/                # 源代码
│   ├── assets/         # 资源文件
│   ├── components/     # 公共组件
│   ├── router/         # 路由配置
│   ├── utils/          # 工具函数
│   ├── views/          # 页面视图
│   ├── App.vue         # 根组件
│   └── main.js         # 入口文件
├── .gitignore          # Git忽略文件
├── index.html          # HTML模板
├── package.json        # 项目依赖
├── README.md           # 项目说明
└── vite.config.js      # Vite配置
```

## 自定义配置

如需修改后端API地址，请编辑 `src/utils/api.js` 文件中的 `BASE_URL` 常量。

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

MIT 