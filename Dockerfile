# 使用 Node.js 20 作为基础镜像
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和锁文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 构建 Worker
RUN npm run build:worker

# 使用轻量级 Node.js 运行时作为最终镜像
FROM node:20-alpine

WORKDIR /app

# 从构建阶段复制构建产物 (如果需要作为独立的 Node 服务运行，这里可能需要适配)
# 由于项目主要是 Cloudflare Worker，Docker 镜像可能主要用于 Vercel/Self-hosted 模拟环境
# 这里我们假设用户想要运行 Hono 应用
COPY --from=builder /app/_worker.js .
COPY --from=builder /app/package.json .

# 安装生产依赖 (如果 _worker.js 已经 bundle 了所有依赖，这一步可能不需要，由 esbuild 配置决定)
# 这里的 esbuild 配置 bundle 了依赖，但排除了 node:*，所以如果是 node 环境运行可能需要一些 polyfill 或依赖
# 但 Hono 的 _worker.js 通常是为 Edge 设计的。
# 为了通用性，我们直接运行 _worker.js (假设它是一个 ES Module)
# 注意：直接运行 _worker.js 在 Node 环境可能需要适配器，或者使用 Wrangler dev
# 这里我们简单地提供文件，或者假设用户使用通过 Node 运行的入口。

# 更稳妥的方式是：Docker 镜像用于构建好的文件分发，或者运行一个基于 Node 的 Hono 适配器。
# 鉴于 `src/index.ts` 是 Hono 应用，我们可以使用 @hono/node-server 运行它。
# 但当前 build:worker 产生的是 Cloudflare Worker 格式。

# 为了简单起见，我们将 Docker 镜像定义为 "构建环境 + 源码"，或者如果用户要在 Docker 中运行，
# 我们应该添加一个 `start` 脚本使用 `tsx` 或 `@hono/node-server`。
# 查看 package.json，`dev` 使用 `wrangler dev`。
# 让我们创建一个通用的 Dockerfile，用于自行托管。

# 重新调整策略：
# 为了让 Docker 镜像有用，它应该能运行服务。
# 我们需要一个入口点。
# 让我们使用 `tsx` 直接运行 `src/index.ts` (开发模式风格) 或者构建一个 Node 适配器版本。
# 但为了不修改代码，我们使用 `wrangler dev` 的模拟或者是简单的 node 运行。
# 考虑到依赖，直接复制源码并安装依赖运行是兼容性最好的。

COPY . .
RUN npm install

EXPOSE 8787

CMD ["npm", "run", "dev"]
