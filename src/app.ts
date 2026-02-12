/**
 * 核心应用实例与路由定义
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
    KV?: KVNamespace;
    DATABASE_URL?: string;
}

// Cloudflare KV 类型定义
interface KVNamespace {
    get(key: string, options?: { type?: 'text' | 'json' }): Promise<string | null>;
    put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
    delete(key: string): Promise<void>;
    list(options?: { prefix?: string }): Promise<{ keys: { name: string }[] }>;
}

// 创建 Hono 应用
export const app = new Hono<{
    Bindings: Env;
    Variables: {
        storage: Storage;
        env: Env;
    };
}>();

// 全局中间件
app.use('*', logger());
app.use('*', cors());

// 健康检查路由 (无数据库依赖)
app.get('/api/health', (c) => {
    return c.json({ status: 'ok', runtime: typeof EdgeRuntime !== 'undefined' ? 'edge' : 'node' });
});

// 初始化存储和环境变量中间件
app.use('*', async (c, next) => {
    // 增强的环境变量获取：兼容 c.env (Worker/Vercel) 和 process.env (Node)
    const env = {
        ...(typeof process !== 'undefined' ? process.env : {}),
        ...(c.env || {})
    } as Env;

    // 预检核心环境变量
    const requiredEnv = ['AUTH_SECRET', 'ADMIN_USERNAME', 'ADMIN_PASSWORD'];
    const missingEnv = requiredEnv.filter(k => !env[k as keyof Env]);

    // 如果是 Vercel 环境但没有 DATABASE_URL，提示配置
    if (typeof EdgeRuntime !== 'undefined' && !env.DATABASE_URL && !env.KV) {
        return c.html(`
            <div style="font-family: sans-serif; padding: 40px; line-height: 1.6;">
                <h1 style="color: #e74c3c;">⚠️ 环境配置缺失</h1>
                <p>项目已成功部署在 Vercel Edge，但无法连接数据库。</p>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #e74c3c;">
                    <p><strong>请在 Vercel 项目设置中配置以下环境变量：</strong></p>
                    <ul>
                        <li><code>DATABASE_URL</code>: Neon PostgreSQL 连接字符串</li>
                        ${missingEnv.map(k => `<li><code>${k}</code>: 必需项</li>`).join('')}
                    </ul>
                </div>
                <p>配置完成后，请重新部署或稍等片刻即可访问。</p>
            </div>
        `, 500);
    }

    // 选择存储实现：KV > Neon > 内存
    let storage: Storage;
    if (env.KV) {
        storage = new KVStorage(env.KV);
    } else if (env.DATABASE_URL) {
        storage = new NeonStorage(env.DATABASE_URL);
    } else {
        storage = memoryStorage;
    }

    c.set('storage', storage);
    c.set('env', env);

    await next();
});

// 注册路由
app.route('/api', createApiRoutes());
app.route('/api/admin', createAdminRoutes());
app.route('/', createPageRoutes());

// 404/错误处理
app.notFound((c) => c.json({ error: '资源不存在' }, 404));
app.onError((err, c) => {
    console.error('[App Error]', err);
    return c.json({ error: err.message || '服务器内部错误' }, 500);
});

// 导出 EdgeRuntime 类型定义（用于 Vercel/Cloudflare 探测）
declare const EdgeRuntime: string | undefined;
