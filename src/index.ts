/**
 * 应用入口 - Hono 框架（Cloudflare Workers 兼容）
 */
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { Storage } from './storage';
import { memoryStorage } from './storage/memory';
import { KVStorage } from './storage/kv';
import { NeonStorage } from './storage/neon';
import { createApiRoutes } from './routes/api';
import { createAdminRoutes } from './routes/admin';
import { createPageRoutes } from './routes/pages';
import type { AuthEnv } from './auth';
import type { SyncEnv } from './sync';

// 环境变量类型
export interface Env extends AuthEnv, SyncEnv {
    // Cloudflare KV 绑定
    KV?: KVNamespace;
    // Neon PostgreSQL 连接字符串（用于 Vercel 部署）
    DATABASE_URL?: string;
}

// Cloudflare KV 类型
interface KVNamespace {
    get(key: string, options?: { type?: 'text' | 'json' }): Promise<string | null>;
    put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
    delete(key: string): Promise<void>;
    list(options?: { prefix?: string }): Promise<{ keys: { name: string }[] }>;
}

// 创建 Hono 应用
const app = new Hono<{
    Bindings: Env;
    Variables: {
        storage: Storage;
        env: Env;
    };
}>();

// 全局中间件
app.use('*', logger());
app.use('*', cors());

// 初始化存储和环境变量中间件
app.use('*', async (c, next) => {
    // 获取环境变量
    const env = c.env;

    // 选择存储实现：KV > Neon > 内存
    let storage: Storage;
    if (env.KV) {
        // Cloudflare Workers 环境，使用 KV
        storage = new KVStorage(env.KV);
    } else if (env.DATABASE_URL) {
        // Vercel 环境，使用 Neon PostgreSQL
        storage = new NeonStorage(env.DATABASE_URL);
    } else {
        // 开发环境，使用内存存储
        storage = memoryStorage;
    }

    // 设置上下文变量
    c.set('storage', storage);
    c.set('env', env);

    await next();
});

// 注册路由
app.route('/api', createApiRoutes());
app.route('/api/admin', createAdminRoutes());
app.route('/', createPageRoutes());

// 404 处理
app.notFound((c) => {
    return c.json({ error: '页面不存在' }, 404);
});

// 错误处理
app.onError((err, c) => {
    console.error('[Error]', err);
    return c.json({ error: err.message || '服务器错误' }, 500);
});

// Scheduled 事件处理（Cloudflare Workers Cron 触发）
async function handleScheduled(
    event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext
): Promise<void> {
    console.log('[Cron] 定时任务触发:', new Date().toISOString());

    // 初始化存储
    const { KVStorage } = await import('./storage/kv');
    const { memoryStorage } = await import('./storage/memory');
    const { syncAllUsers, getAutoSyncConfig } = await import('./scheduler');

    const storage = env.KV ? new KVStorage(env.KV) : memoryStorage;

    // 检查自动同步是否启用
    const config = await getAutoSyncConfig(storage);
    if (!config.enabled) {
        console.log('[Cron] 自动同步未启用，跳过');
        return;
    }

    // 执行全量同步
    const result = await syncAllUsers(storage, env);
    console.log(`[Cron] 同步完成: 总计 ${result.total}，成功 ${result.success}，失败 ${result.failed}`);
}

// Cloudflare Workers Scheduled Event 类型
interface ScheduledEvent {
    scheduledTime: number;
    cron: string;
}

interface ExecutionContext {
    waitUntil(promise: Promise<unknown>): void;
    passThroughOnException(): void;
}

// 导出用于 Cloudflare Workers
export default {
    fetch: app.fetch,
    scheduled: handleScheduled,
};
