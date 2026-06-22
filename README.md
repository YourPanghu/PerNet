# 🏠 PerNet Blog — 个人博客网站

基于 **React + Ant Design**（前端）和 **Spring Boot + SQLite**（后端）的全栈个人博客系统。

## 功能特性

- 🏠 **博客首页** — 浏览已发布文章，支持分页
- 📖 **文章详情** — 阅读完整文章，自动统计阅读量
- 🔍 **站内搜索** — 按标题和内容搜索文章
- 🔐 **管理后台** — JWT 认证登录，保护管理功能
- ✏️ **文章管理** — 新建、编辑、删除文章（完整增删改查）
- 📝 **富文本编辑器** — 使用 Quill 编辑器编写格式化文章
- 🎨 **现代化界面** — 基于 Ant Design 5，响应式布局

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | React 18, Ant Design 5, React Router 6, Vite | 现代化前端开发 |
| 后端 | Java 17, Spring Boot 3.4, Spring Security, JPA | 企业级后端框架 |
| 数据库 | SQLite | 嵌入式数据库，零配置，数据即文件 |
| 认证 | JWT (JSON Web Token) | 无状态认证，Token 有效期 24 小时 |
| 编辑器 | React Quill | 所见即所得富文本编辑器 |

## 环境要求

| 软件 | 最低版本 | 检查命令 | 下载地址 |
|------|---------|---------|---------|
| JDK | 17+ | `java -version` | https://adoptium.net |
| Maven | 3.9+ | `mvn -version` | https://maven.apache.org |
| Node.js | 18+ | `node -v` | https://nodejs.org |

## 本地部署

### 1. 启动后端

```bash
cd backend
mvn spring-boot:run
```

启动成功后会看到 `Started PerNetBlogApplication`，服务运行在 **http://localhost:8080**。

> 首次启动会自动创建数据库，并初始化默认管理员账号 `admin` / `admin123` 和 5 篇示例文章。

### 2. 启动前端

```bash
cd frontend
npm install    # 仅首次需要
npm run dev
```

前端运行在 **http://localhost:5173**，发往 `/api` 的请求会自动代理到后端。

### 3. 访问

| 地址 | 说明 |
|------|------|
| http://localhost:5173 | 博客首页 |
| http://localhost:5173/admin/login | 管理后台登录 |
| http://localhost:5173/admin | 文章管理（登录后） |

## API 接口

所有接口统一返回格式：

```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

### 公开接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/articles?page=1&size=10` | 获取已发布文章列表 |
| GET | `/api/articles/{id}` | 获取文章详情 |
| GET | `/api/articles/search?keyword=xxx` | 搜索文章 |

### 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 管理员登录，参数 `{username, password}` |

### 管理接口（需携带 `Authorization: Bearer <token>`）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/articles` | 获取所有文章（含草稿） |
| POST | `/api/admin/articles` | 新建文章 |
| PUT | `/api/admin/articles/{id}` | 更新文章 |
| DELETE | `/api/admin/articles/{id}` | 删除文章 |

## 常见问题

**端口被占用？** 修改 `backend/src/main/resources/application.yml` 中的 `server.port`，并同步修改 `frontend/vite.config.js` 中的代理目标地址。

**修改默认密码？** 删除 `backend/data/pernet.db` 数据库文件，重启后端即可重建，或修改 `application.yml` 中的 `app.admin.default-password` 后重建数据库。

**数据库备份？** SQLite 数据库即文件，直接复制 `backend/data/pernet.db` 即可。

**部署到服务器？** 后端执行 `mvn package -DskipTests` 得到 jar 包，前端执行 `npm run build` 得到 `dist/` 目录，配合 Nginx 反向代理部署即可。
