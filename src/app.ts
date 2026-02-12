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
    VERCEL?: string;
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
    // 简单的健康检查，返回当前环境信息
    return c.json({
        status: 'ok',
        runtime: typeof EdgeRuntime !== 'undefined' ? 'edge' : 'node',
        isVercel: c.env?.VERCEL === '1'
    });
});

// 初始化存储和环境变量中间件
app.use('*', async (c, next) => {
    let env: Partial<Env> = {};

    try {
        // 1. 安全合并环境变量
        // 优先使用 c.env (Worker/Vercel Edge 注入)
        env = { ...(c.env || {}) };

        // 尝试合并 process.env (Node 兼容环境)
        try {
            if (typeof process !== 'undefined' && process.env) {
                env = { ...process.env, ...env };
            }
        } catch { /* 忽略 process 访问错误 */ }

        // 2. 识别是否为 Vercel 环境
        // Vercel 会自动注入 VERCEL=1，或者我们可以通过 EdgeRuntime 全局变量辅助判断
        const isVercel = env.VERCEL === '1' || typeof EdgeRuntime !== 'undefined';

        // 3. 检查核心配置 (仅在 Vercel 生产环境强制检查)
        // 本地开发通常使用内存存储，不需要 DATABASE_URL，所以仅当明确在 Vercel 环境且无 KV 时才拦截
        if (isVercel && !env.DATABASE_URL && !env.KV) {
            const requiredEnv = ['AUTH_SECRET', 'ADMIN_USERNAME', 'ADMIN_PASSWORD'];
            const missingEnv = requiredEnv.filter(k => !env[k as keyof Env]);

            // 返回 200 状态码的 HTML 页面，防止 Vercel 拦截 500 错误页
            return c.html(`
                <!DOCTYPE html>
                <html lang="zh-CN">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>SubHub 环境配置向导</title>
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f7fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
                        .card { background: white; width: 100%; max-width: 600px; padding: 40px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
                        h1 { color: #2d3748; margin-top: 0; font-size: 24px; display: flex; align-items: center; gap: 10px; }
                        .tag { background: #fed7d7; color: #c53030; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
                        .config-box { background: #fff5f5; border: 1px solid #feb2b2; border-radius: 8px; padding: 20px; margin: 20px 0; }
                        ul { margin: 0; padding-left: 20px; color: #4a5568; }
                        li { margin-bottom: 8px; font-family: monospace; }
                        .btn { display: inline-block; background: #000; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px; margin-top: 20px; }
                        .btn:hover { background: #333; }
                        .footer { margin-top: 30px; font-size: 12px; color: #a0aec0; text-align: center; border-top: 1px solid #edf2f7; padding-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h1>👋 欢迎使用 SubHub <span class="tag">待配置</span></h1>
                        <p style="color: #4a5568;">检测到当前为 Vercel 部署环境，但尚未连接数据库。请完成以下配置以激活服务。</p>
                        
                        <div class="config-box">
                            <p style="margin-top: 0; font-weight: bold; color: #c53030; margin-bottom: 12px;">🔴 必需的环境变量：</p>
                            <ul>
                                <li><strong>DATABASE_URL</strong>: Neon 数据库连接字符串</li>
                                ${missingEnv.map(k => `<li><strong>${k}</strong></li>`).join('')}
                            </ul>
                        </div>

                        <p style="font-size: 14px; color: #718096;">
                            请前往 <strong>Vercel Dashboard</strong> &rarr; <strong>Settings</strong> &rarr; <strong>Environment Variables</strong> 进行添加。
                        </p>

                        <div style="text-align: center;">
                            <a href="https://vercel.com/dashboard" target="_blank" class="btn">前往配置</a>
                            <a href="javascript:location.reload()" class="btn" style="background: white; color: #333; border: 1px solid #e2e8f0; margin-left: 10px;">刷新页面</a>
                        </div>

                        <div class="footer">
                            SubHub Setup Wizard • Runtime: ${typeof EdgeRuntime !== 'undefined' ? 'Edge' : 'Node'}
                        </div>
                    </div>
                </body>
                </html>
            `, 200);
        }

        // 初始化存储
        let storage: Storage;
        if (env.KV) {
            storage = new KVStorage(env.KV);
        } else if (env.DATABASE_URL) {
            storage = new NeonStorage(env.DATABASE_URL);
        } else {
            storage = memoryStorage;
        }

        c.set('storage', storage);
        c.set('env', env as Env);

        await next();
    } catch (err: any) {
        console.error('[App Crash]', err);
        // 捕获所有中间件层面的异常，并返回 200 状态码的错误页
        return c.html(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Critical Error</title>
                <style>
                    body { font-family: monospace; padding: 20px; background: #fff0f0; }
                    .error-box { background: white; padding: 20px; border: 1px solid #ffcccc; border-radius: 8px; }
                    h1 { color: #cc0000; }
                    pre { background: #f8f8f8; padding: 10px; overflow-x: auto; }
                </style>
            </head>
            <body>
                <div class="error-box">
                    <h1>🚀 Serverless Function Crashed</h1>
                    <p>The application encountered a critical error during initialization.</p>
                    <pre>${err.stack || err.message}</pre>
                    <p>Please check your environment variables and database connection.</p>
                </div>
            </body>
            </html>
        `, 200);
    }
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

// 用于 Vercel/Cloudflare 探测
declare const EdgeRuntime: string | undefined;
