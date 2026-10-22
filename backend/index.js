// 最早加载环境变量（只在此处加载一次）
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const { initialize } = require('./db');

// 初始化数据库
initialize();

const app = express();
const PORT = process.env.PORT || 3000;

// ===== 中间件 =====
app.use(cors());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());

// 请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} ${req.method} ${req.url}`);
  next();
});

// ===== 路由 =====
app.use('/api/auth', require('./routes/auth'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/students', require('./routes/students'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/feedbacks', require('./routes/feedbacks'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/institutions', require('./routes/institutions'));
app.use('/api/teacher/questions', require('./routes/teacher-questions'));
app.use('/api/teacher/questions/import', require('./routes/question-import'));
app.use('/api/ai', require('./routes/ai'));

// ===== 健康检查 =====
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ===== SPA fallback =====
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: '接口不存在' });
  }
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ===== 全局错误处理 =====
app.use((err, req, res, _next) => {
  console.error('服务器错误:', err);
  // 不暴露内部错误细节给客户端
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : '服务器内部错误'
  });
});

// ===== 启动 =====
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n📚 家教管理后端已启动: http://localhost:${PORT}`);
    console.log(`🏢 多机构 SaaS 模式已启用`);
    console.log(`📋 API: POST /api/auth/login | /api/dashboard/stats | /api/ai/generate-lesson-plan\n`);
  });
}

module.exports = app;
