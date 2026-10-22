# 家教管理平台

面向家教机构的教学管理平台，包含管理员、老师和家长端的教学协作流程。当前仓库保存应用源码与开发配置，不包含本地数据库、密钥、依赖目录或桌面打包文件。

## 功能

- 管理员看板、教师和学生管理
- 课程排期、日历查看和教师时间冲突检查
- 教师课后反馈与家长查看
- 教师私有题库及批量导入
- AI 辅助反馈和备课接口
- 多角色登录及机构上下文
- UniApp 前端，可构建 H5、微信小程序和 App；Electron 桌面端配置
- Express/SQLite 后端 API

## 技术栈

- 前端：Vue 3、UniApp
- 后端：Node.js、Express、SQLite (`better-sqlite3`)
- 桌面端：Electron
- 身份认证：JWT

## 项目结构

```text
backend/       Express API、SQLite schema、静态资源与启动脚本
  src/routes/  登录、教师、学生、课程、反馈、题库、AI 等路由
  src/         服务端源码
  public/      后端静态页面和图标
  .env.example 环境变量模板

tutor-app/     UniApp 前端源码与 Electron 构建配置
```

## 本地启动

1. 安装 Node.js。
2. 在 `backend/` 下安装依赖：`npm install`。
3. 复制 `.env.example` 为 `.env`，设置仅本机使用的随机 `JWT_SECRET`。
4. 启动 API：`npm start`（默认 `http://localhost:3000`）。
5. 在 `tutor-app/` 下安装依赖：`npm install`，然后运行 `npm run dev:h5` 或相应 UniApp 构建命令。

首次启动会初始化 SQLite schema。运行 `npm run seed` 会写入演示数据。不要将个人 `.env`、数据库文件或真实用户数据提交到 Git。

## 配置

后端从 `backend/.env` 读取环境变量。支持 `PORT`、`JWT_SECRET` 和 `DATA_DIR`。`JWT_SECRET` 必须替换为随机值；生产部署还需要设置受限的 CORS、HTTPS、备份和权限策略。

## 项目状态

这是一个持续迭代的项目原型。仓库中没有包含线上部署凭据或真实数据库，也不包含自动化测试报告。