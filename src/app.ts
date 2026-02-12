/**
 * 核心应用实例与路由定义
 * V2.2 - 防崩溃稳定版
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

// 全局中间件 - 日志与CORS
app.use('*', logger());
app.use('*', cors());

// 健康检查路由 (绝对安全路由)
app.get('/api/health', (c) => {
    return c.json({
        status: 'ok',
        runtime: typeof EdgeRuntime !== 'undefined' ? 'edge' : 'node',
        db: !!c.env?.DATABASE_URL ? 'connected' : 'missing'
    });
});

// 初始化核心中间件 (防崩溃设计)
app.use('*', async (c, next) => {
    let env: Partial<Env> = {};

    try {
        // 1. 获取环境变量 (尽可能多地收集)
        env = { ...(c.env || {}) };
        try {
            if (typeof process !== 'undefined' && process.env) {
                env = { ...process.env, ...env };
            }
        } catch { /* ignore */ }

        // 2. 检查核心依赖 (DATABASE_URL 或 KV)
        // 如果没有数据库连接，直接拦截并显示配置向导
        if (!env.DATABASE_URL && !env.KV) {
            // 计算缺失的变量，用于提示
            const requiredEnv = ['AUTH_SECRET', 'ADMIN_USERNAME', 'ADMIN_PASSWORD'];
            const missingEnv = requiredEnv.filter(k => !env[k as keyof Env]);

            return c.html(`
                <!DOCTYPE html>
                <html lang="zh-CN">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>SubHub 配置向导</title>
                    <style>
                        body { font-family: -apple-system, sans-serif; background: #f0f2f5; display: flex; justify-content: center; min-height: 100vh; padding-top: 50px; margin: 0; }
                        .card { background: white; width: 90%; max-width: 600px; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); height: fit-content; }
                        h1 { color: #1a202c; margin-top: 0; border-bottom: 2px solid #edf2f7; padding-bottom: 15px; }
                        .alert { background: #fff5f5; border-left: 4px solid #f56565; padding: 15px; color: #c53030; margin: 20px 0; border-radius: 4px; }
                        code { background: #edf2f7; padding: 2px 6px; border-radius: 4px; font-family: monospace; color: #2d3748; }
                        ul { color: #4a5568; line-height: 1.6; }
                        .btn { display: block; width: 100%; background: #3182ce; color: white; text-align: center; padding: 12px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 25px; }
                        .btn:hover { background: #2b6cb0; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h1>👋 开始使用 SubHub</h1>
                        
                        <div class="alert">
                            <strong>⚠️ 尚未配置数据库</strong><br>
                            应用已启动，但需要连接数据库才能工作。
                        </div>
                        
                        <p>请在部署平台（Vercel/Cloudflare）的环境变量设置中添加：</p>
                        
                        <ul>
                            <li><code>DATABASE_URL</code> (PostgreSQL 连接字符串)</li>
                            ${missingEnv.map(k => `<li><code>${k}</code></li>`).join('')}
                        </ul>

                        <p style="font-size: 13px; color: #718096; margin-top: 20px;">
                            提示：如果您是 Vercel 用户，请前往 <strong>Settings -> Environment Variables</strong>。
                        </p>

                        <a href="javascript:location.reload()" class="btn">已配置？刷新页面</a>
                    </div>
                </body>
                </html>
            `, 200); // 强制 200 状态码
        }

        // 3. 兜底默认值 (防止应用 crash)
        // 即使有 DB，如果缺 AUTH_SECRET 也会导致后续 jwt 签名崩溃，所以这里给一个默认值
        if (!env.AUTH_SECRET) {
            env.AUTH_SECRET = 'default-insecure-secret-for-setup-only-change-me';
            console.warn('[Warning] Using default insecure AUTH_SECRET');
        }
        if (!env.ADMIN_USERNAME) env.ADMIN_USERNAME = 'admin';
        if (!env.ADMIN_PASSWORD) env.ADMIN_PASSWORD = 'admin';

        // 4. 初始化存储
        let storage: Storage;
        if (env.KV) {
            storage = new KVStorage(env.KV);
        } else if (env.DATABASE_URL) {
            // 再次 try-catch 数据库连接，防止 URL 格式错误导致崩溃
            try {
                storage = new NeonStorage(env.DATABASE_URL);
            } catch (dbErr) {
                console.error('[DB Init Error]', dbErr);
                // 数据库连接失败降级为内存，或者直接报错
                return c.html(`<h1>数据库连接失败</h1><p>提供的 DATABASE_URL 无效。</p><pre>${(dbErr as Error).message}</pre>`, 200);
            }
        } else {
            storage = memoryStorage;
        }

        c.set('storage', storage);
        c.set('env', env as Env);

        await next();
    } catch (e: any) {
        console.error('[Fatal Error]', e);
        // 最终兜底：绝对不返回 500，返回自定义错误页
        return c.html(`
            <div style="padding: 20px;">
                <h1>System Recoverable Error</h1>
                <pre>${e.message}</pre>
                <p>Please check server logs.</p>
            </div>
        `, 200);
    }
});

// 注册路由
app.route('/api', createApiRoutes());
app.route('/api/admin', createAdminRoutes());
app.route('/', createPageRoutes());

// 404
app.notFound((c) => c.json({ error: 'Not Found' }, 404));
// 500
app.onError((err, c) => {
    console.error('[App Error]', err);
    return c.json({ error: err.message }, 500);
});

// 类型声明
declare const EdgeRuntime: string | undefined;
