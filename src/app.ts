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
    try {
        // 增强的环境变量获取
        const env = {
            ...(typeof process !== 'undefined' ? (process.env || {}) : {}),
            ...(c.env || {})
        } as Env;

        // 预检核心环境变量
        const requiredEnv = ['AUTH_SECRET', 'ADMIN_USERNAME', 'ADMIN_PASSWORD'];
        const missingEnv = requiredEnv.filter(k => !env[k as keyof Env]);

        // 如果缺少配置或数据库，返回友好的引导页 (使用 200 状态码防止 Vercel 拦截 500 响应体)
        if (typeof EdgeRuntime !== 'undefined' && (!env.DATABASE_URL && !env.KV)) {
            return c.html(`
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; line-height: 1.6; max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                    <h1 style="color: #2d3748; font-size: 26px; margin-bottom: 8px;">👋 欢迎使用 SubHub！</h1>
                    <p style="color: #4a5568;">项目已成功在 Vercel Edge 启动，但检测到 <b>环境变量配置缺失</b>。</p>
                    <div style="background: #fff5f5; padding: 20px; border-radius: 12px; border: 1px solid #feb2b2; margin: 24px 0;">
                        <p style="margin-top: 0; font-weight: bold; color: #c53030;">请在 Vercel 控制台配置以下变量：</p>
                        <ul style="color: #2d3748; padding-left: 20px;">
                            <li style="margin-bottom: 4px;"><code>DATABASE_URL</code>: Neon PostgreSQL 连接字符串</li>
                            ${missingEnv.map(k => `<li style="margin-bottom: 4px;"><code>${k}</code>: 必需配置项</li>`).join('')}
                        </ul>
                    </div>
                    <p style="color: #718096; font-size: 14px;">📍 配置路径：<b>Vercel Project -> Settings -> Environment Variables</b></p>
                    <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 24px 0;">
                    <p style="font-size: 14px; color: #4a5568;">配置并保存后，请重新访问页面（环境生效通常有几十秒延迟）。</p>
                    <div style="text-align: right; color: #e2e8f0; font-size: 10px; margin-top: 20px;">SubHub Diagnostic v2.1</div>
                </div>
            `, 200);
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
    } catch (err: any) {
        console.error('[Middleware Crash]', err);
        return c.html(`
            <div style="padding: 40px; font-family: sans-serif; max-width: 800px; margin: auto;">
                <h2 style="color: #e74c3c;">🚀 运行时初始化失败</h2>
                <p>程序在启动时遇到了以下异常错误：</p>
                <code style="display: block; background: #2d3748; color: #a0aec0; padding: 20px; border-radius: 8px; overflow-x: auto; font-family: monospace;">${err.stack || err.message}</code>
                <p style="margin-top: 20px;"><b>排查建议：</b></p>
                <ol>
                    <li>检查 <code>DATABASE_URL</code> 环境变量是否为有效的 PostgreSQL 连接字符串。</li>
                    <li>确保 Neon 数据库没有防火墙限制，且允许来自 Vercel IP 的访问。</li>
                </ol>
            </div>
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
