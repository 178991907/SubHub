# Sub-Hub 订阅管理平台

用户/管理员订阅管理中台。支持从 Sub-Store 实例拉取组合订阅，自动解析节点信息并提供专属分享链接。

## 功能特性

- 🔄 自动/手动同步 Sub-Store 订阅
- 📊 自动解析节点到期日期和剩余流量
- 📱 用户个人订阅二维码分享
- 👥 多用户管理（管理员创建用户、绑定 Token）
- 🔗 Token 管理（自动获取 Sub-Store 分享 Token 列表，一键绑定）
- 📋 用户列表视图切换（卡片/列表）
- 🔁 一键批量同步所有已绑定用户
- 📥 CSV 数据导出

## 技术架构

- **框架**: [Hono](https://hono.dev/)（兼容 Cloudflare Workers + Vercel Edge）
- **认证**: [jose](https://github.com/panva/jose)（JWT）
- **存储**:
  - Cloudflare KV（Cloudflare Workers 环境）
  - Neon PostgreSQL（Vercel 环境）
  - 内存存储（本地开发）
- **二维码**: qrcode
- **打包**: esbuild

## 项目结构

```
├── src/
│   ├── index.ts              # 应用入口，存储初始化
│   ├── auth.ts               # JWT 认证模块
│   ├── sync.ts               # 订阅同步核心逻辑
│   ├── scheduler.ts          # 定时任务调度
│   ├── storage.ts            # 存储接口定义
│   ├── storage/
│   │   ├── kv.ts             # Cloudflare KV 存储实现
│   │   ├── neon.ts           # Neon PostgreSQL 存储实现
│   │   └── memory.ts         # 内存存储实现（开发用）
│   ├── routes/
│   │   ├── api.ts            # API 路由
│   │   ├── admin.ts          # 管理后台 API
│   │   └── pages.ts          # 页面渲染
│   └── utils/
│       └── parse-node.ts     # 节点解析工具
├── _worker.js                # 打包后的单文件（可直接部署）
├── wrangler.toml             # Cloudflare Workers 配置
└── package.json
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 本地开发

创建 `.dev.vars` 文件：

```env
AUTH_SECRET=dev-secret-at-least-32-characters-long
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-password
SYNC_SECRET=dev-sync-secret
```

启动开发服务器：

```bash
npm run dev
```

访问 `http://localhost:54530`

## 部署

### 方式一：Cloudflare Workers（推荐）

使用 Cloudflare KV 作为持久化存储。

#### 步骤

**1. 创建 KV 命名空间**

```bash
npx wrangler kv:namespace create "KV"
npx wrangler kv:namespace create "KV" --preview
```

**2. 配置 `wrangler.toml`**

将上一步返回的 ID 填入：

```toml
[[kv_namespaces]]
binding = "KV"
id = "你的 KV ID"
preview_id = "你的预览 KV ID"

[vars]
ADMIN_USERNAME = "admin"
```

**3. 设置 Secrets（敏感信息）**

```bash
npx wrangler secret put AUTH_SECRET       # JWT 密钥（≥32字符）
npx wrangler secret put ADMIN_PASSWORD    # 管理员密码
npx wrangler secret put SYNC_SECRET       # 同步令牌
```

**4. 部署**

```bash
npm run deploy
```

#### 使用 _worker.js 直接部署

也可以使用 Pages 部署预打包的 `_worker.js`：

```bash
# 生成 _worker.js
npm run build:worker

# 在 Cloudflare Dashboard 中：
# Pages → 创建项目 → 直接上传 → 上传 _worker.js
# 或放入 Pages 项目根目录
```

---

### 方式二：Vercel + Neon PostgreSQL

使用 [Neon](https://neon.tech) 作为持久化存储。

#### 步骤

**1. 创建 Neon 数据库**

前往 [Neon 控制台](https://console.neon.tech) 创建项目，复制连接字符串。

**2. Vercel 环境变量配置**

在 Vercel 项目 → Settings → Environment Variables 中设置：

| 变量 | 说明 | 示例 |
|------|------|------|
| `DATABASE_URL` | Neon 连接字符串 | `postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require` |
| `AUTH_SECRET` | JWT 签名密钥（≥32字符） | `my-super-secret-key-at-least-32-chars` |
| `ADMIN_USERNAME` | 管理员用户名 | `admin` |
| `ADMIN_PASSWORD` | 管理员密码 | `your-password` |
| `SYNC_SECRET` | 同步令牌 | `my-sync-secret` |

**3. 部署**

```bash
npm run deploy:vercel
```

> 首次访问会自动创建数据库表，无需手动执行 SQL。

---

### 环境变量说明

| 变量 | 必需 | 说明 |
|------|:----:|------|
| `AUTH_SECRET` | ✅ | JWT Token 签名密钥，至少 32 个字符 |
| `ADMIN_USERNAME` | ✅ | 管理员登录用户名 |
| `ADMIN_PASSWORD` | ✅ | 管理员登录密码 |
| `SYNC_SECRET` | ✅ | 外部调用同步 API 的认证令牌 |
| `DATABASE_URL` | Vercel | Neon PostgreSQL 连接字符串 |
| `SUBSTORE_SHARE_BASE` | ❌ | Sub-Store 地址（可在管理后台配置） |
| `SUBSTORE_COLLECTION_NAME` | ❌ | 默认组合名（可在管理后台配置） |
| `SUBSTORE_TOKEN` | ❌ | 默认分享 Token（可在管理后台配置） |

> `SUBSTORE_SHARE_BASE`、`SUBSTORE_COLLECTION_NAME`、`SUBSTORE_TOKEN` 三个变量可在管理后台的 **Sub-Store 配置** 页面中设置，管理后台配置优先于环境变量。

## 使用说明

### 首次使用

1. 部署完成后，使用 `ADMIN_USERNAME` 和 `ADMIN_PASSWORD` 登录
2. 进入管理后台 → **Sub-Store 配置**，填写 Sub-Store 地址和后端路径前缀
3. 在 **Token 管理** 中获取分享 Token 列表
4. 创建用户并绑定 Token
5. 用户登录后即可看到专属订阅链接和二维码

### 页面说明

| 路径 | 描述 |
|------|------|
| `/login` | 登录页面 |
| `/` | 用户主页（订阅链接、二维码、节点统计） |
| `/admin` | 管理后台（用户管理、Token 管理、同步配置） |

### API 端点

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/auth/login` | 用户登录 |
| GET | `/api/me` | 当前用户信息 |
| GET | `/api/sync?token=xxx` | 外部触发同步 |
| GET | `/api/subscription` | 获取订阅信息 |
| GET | `/api/subscription/download` | 下载订阅文件 |
| GET | `/api/admin/users` | 用户列表（管理员） |
| POST | `/api/admin/users` | 创建用户（管理员） |
| GET | `/api/admin/export` | 导出 CSV（管理员） |
| GET | `/api/admin/substore/tokens/unbound` | 获取未绑定 Token（管理员） |
| POST | `/api/admin/users/:username/subscription` | 绑定 Token（管理员） |
| POST | `/api/admin/users/:username/sync` | 同步用户订阅（管理员） |
| POST | `/api/admin/sync/all` | 批量同步所有已绑定用户（管理员） |

## 构建

```bash
# 生成独立的 _worker.js（打包所有依赖为单文件）
npm run build:worker

# TypeScript 类型检查
npm run typecheck
```

## 许可证

MIT
