/**
 * API 路由 - 认证、同步、订阅相关
 */
import { Hono } from 'hono';
import type { Storage, User } from '../storage.js';
import { STORAGE_KEYS } from '../storage.js';
import type { AuthEnv } from '../auth.js';
import { login, authMiddleware, verifyToken, hashPassword, verifyPassword } from '../auth.js';
import type { SyncEnv } from '../sync.js';
import { syncSubscription, getSyncResult, getSyncStatus } from '../sync.js';

// 环境变量类型
type Env = AuthEnv & SyncEnv & { storage: Storage };

// 创建 API 路由
export function createApiRoutes() {
    const api = new Hono<{ Variables: { storage: Storage; env: Env } }>();

    /**
     * POST /api/auth/login - 用户登录
     */
    api.post('/auth/login', async (c) => {
        const body = await c.req.json<{ username: string; password: string }>();
        const { username, password } = body;

        if (!username || !password) {
            return c.json({ error: '用户名和密码不能为空' }, 400);
        }

        const storage = c.get('storage');
        const env = c.get('env');

        const result = await login(username, password, storage, env);

        if (!result.success) {
            return c.json({ error: result.error }, 401);
        }

        // 设置 Cookie（可选，用于浏览器）
        c.header('Set-Cookie', `token=${result.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`);

        return c.json({ success: true, token: result.token });
    });

    /**
     * POST /api/auth/logout - 登出
     */
    api.post('/auth/logout', (c) => {
        c.header('Set-Cookie', 'token=; Path=/; HttpOnly; Max-Age=0');
        return c.json({ success: true });
    });

    /**
     * GET /api/me - 获取当前用户信息
     */
    api.get('/me', async (c) => {
        const env = c.get('env');

        // 使用认证中间件逻辑
        const authHeader = c.req.header('Authorization');
        let token = authHeader?.startsWith('Bearer ')
            ? authHeader.substring(7)
            : c.req.header('Cookie')?.match(/token=([^;]+)/)?.[1];

        if (!token) {
            return c.json({ authenticated: false });
        }

        // const { verifyToken } = await import('../auth.js');
        const payload = await verifyToken(token, env.AUTH_SECRET);

        if (!payload) {
            return c.json({ authenticated: false });
        }

        return c.json({
            authenticated: true,
            username: payload.sub,
            isAdmin: payload.isAdmin,
        });
    });

    /**
     * PUT /api/me/password - 修改密码
     */
    api.put('/me/password', async (c) => {
        const env = c.get('env');
        const storage = c.get('storage');

        // 验证登录
        const authHeader = c.req.header('Authorization');
        let token = authHeader?.startsWith('Bearer ')
            ? authHeader.substring(7)
            : c.req.header('Cookie')?.match(/token=([^;]+)/)?.[1];

        if (!token) {
            return c.json({ error: '未登录' }, 401);
        }

        // const { verifyToken, hashPassword, verifyPassword } = await import('../auth.js');
        const payload = await verifyToken(token, env.AUTH_SECRET);

        if (!payload) {
            return c.json({ error: 'Token 无效' }, 401);
        }

        const body = await c.req.json<{ currentPassword: string; newPassword: string }>();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return c.json({ error: '当前密码和新密码不能为空' }, 400);
        }

        if (newPassword.length < 6) {
            return c.json({ error: '新密码长度至少 6 位' }, 400);
        }

        const username = payload.sub;

        // 检查是否为管理员
        if (username === env.ADMIN_USERNAME) {
            // 管理员密码验证
            if (currentPassword !== env.ADMIN_PASSWORD) {
                return c.json({ error: '当前密码错误' }, 400);
            }
            // 注意：管理员密码存储在环境变量中，无法通过 API 修改
            // 这里只是验证，实际修改需要更改环境变量
            return c.json({ error: '管理员密码请通过环境变量修改' }, 400);
        }

        // 普通用户修改密码
        const user = await storage.get<User>(`user:${username}`);

        if (!user) {
            return c.json({ error: '用户不存在' }, 404);
        }

        // 验证当前密码
        const isValid = await verifyPassword(currentPassword, user.passwordHash);
        if (!isValid) {
            return c.json({ error: '当前密码错误' }, 400);
        }

        // 更新密码
        user.passwordHash = await hashPassword(newPassword);
        await storage.set(`user:${username}`, user);

        return c.json({ success: true });
    });

    /**
     * GET /api/sync - 触发同步（需要 token 参数）
     */
    api.get('/sync', async (c) => {
        const token = c.req.query('token');
        const env = c.get('env');

        if (token !== env.SYNC_SECRET) {
            return c.json({ error: '无效的同步令牌' }, 403);
        }

        const storage = c.get('storage');
        const result = await syncSubscription(storage, env);

        return c.json(result);
    });

    /**
     * GET /api/status - 获取同步状态（公开）
     */
    api.get('/status', async (c) => {
        const storage = c.get('storage');
        const status = await getSyncStatus(storage);
        return c.json(status);
    });

    /**
     * GET /api/subscription - 获取订阅信息（需登录）
     */
    api.get('/subscription', async (c) => {
        const env = c.get('env');

        // 验证登录
        const authHeader = c.req.header('Authorization');
        let token = authHeader?.startsWith('Bearer ')
            ? authHeader.substring(7)
            : c.req.header('Cookie')?.match(/token=([^;]+)/)?.[1];

        if (!token) {
            return c.json({ error: '未登录' }, 401);
        }

        // const { verifyToken } = await import('../auth.js');
        const payload = await verifyToken(token, env.AUTH_SECRET);

        if (!payload) {
            return c.json({ error: 'Token 无效' }, 401);
        }

        const storage = c.get('storage');
        const username = payload.sub;

        // 如果是管理员，返回全局同步结果
        if (username === env.ADMIN_USERNAME) {
            const result = await getSyncResult(storage);
            if (!result) {
                return c.json({ error: '暂无订阅数据，请先执行同步' }, 404);
            }
            return c.json({
                lastSync: result.lastSync,
                nodeCount: result.nodeCount,
                earliestExpire: result.earliestExpire,
                totalRemainGB: result.totalRemainGB,
                protocols: result.protocols,
            });
        }

        // 普通用户，返回用户级订阅信息
        const user = await storage.get<User>(`${STORAGE_KEYS.USERS_PREFIX}${username}`);
        if (!user) {
            return c.json({ error: '用户不存在' }, 404);
        }

        if (!user.subscriptionConfig) {
            return c.json({ error: '未绑定订阅链接，请联系管理员' }, 404);
        }

        // 返回用户级同步结果
        if (user.lastSyncResult) {
            return c.json({
                lastSync: user.lastSyncResult.lastSync,
                nodeCount: user.lastSyncResult.nodeCount,
                earliestExpire: user.lastSyncResult.earliestExpire,
                totalRemainGB: user.lastSyncResult.totalRemainGB,
                subscriptionConfig: {
                    collectionName: user.subscriptionConfig.collectionName,
                    token: user.subscriptionConfig.token,
                },
            });
        }

        // 如果未同步过，返回绑定信息，提示用户同步
        return c.json({
            lastSync: null,
            nodeCount: 0,
            earliestExpire: null,
            totalRemainGB: null,
            subscriptionConfig: {
                collectionName: user.subscriptionConfig.collectionName,
                token: user.subscriptionConfig.token,
            },
            message: '订阅尚未同步，请等待自动同步或联系管理员手动同步',
        });
    });

    /**
     * GET /api/subscription/download - 下载订阅原始内容（需登录）
     */
    api.get('/subscription/download', async (c) => {
        const env = c.get('env');

        // 验证登录
        const authHeader = c.req.header('Authorization');
        let token = authHeader?.startsWith('Bearer ')
            ? authHeader.substring(7)
            : c.req.header('Cookie')?.match(/token=([^;]+)/)?.[1];

        if (!token) {
            return c.text('未登录', 401);
        }

        // const { verifyToken } = await import('../auth.js');
        const payload = await verifyToken(token, env.AUTH_SECRET);

        if (!payload) {
            return c.text('Token 无效', 401);
        }

        const storage = c.get('storage');
        const username = payload.sub;

        // 如果是管理员，返回全局订阅内容
        if (username === env.ADMIN_USERNAME) {
            const result = await getSyncResult(storage);
            if (!result) {
                return c.text('暂无订阅数据', 404);
            }
            const content = result.rawLines.join('\n');
            c.header('Content-Type', 'text/plain; charset=utf-8');
            c.header('Content-Disposition', 'attachment; filename="subscription.txt"');
            return c.body(content);
        }

        // 普通用户，根据订阅配置实时拉取
        const user = await storage.get<User>(`${STORAGE_KEYS.USERS_PREFIX}${username}`);
        if (!user || !user.subscriptionConfig) {
            return c.text('未绑定订阅链接', 404);
        }

        // 实时从 Sub-Store 获取订阅内容
        const { collectionName, token: subToken } = user.subscriptionConfig;
        const encodedName = encodeURIComponent(collectionName);
        const subUrl = `${env.SUBSTORE_SHARE_BASE}/share/col/${encodedName}?token=${subToken}`;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const response = await fetch(subUrl, {
                method: 'GET',
                headers: { 'User-Agent': 'SubSync/1.0' },
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                return c.text(`获取订阅失败: HTTP ${response.status}`, 502);
            }

            let text = await response.text();

            // Base64 解码
            const isBase64 = /^[A-Za-z0-9+/=\s]+$/.test(text.trim()) &&
                !text.includes('://') &&
                text.trim().length > 100;
            if (isBase64) {
                try {
                    text = atob(text.trim().replace(/\s/g, ''));
                } catch { }
            }

            c.header('Content-Type', 'text/plain; charset=utf-8');
            c.header('Content-Disposition', `attachment; filename="${username}_subscription.txt"`);
            return c.body(text);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return c.text(`获取订阅失败: ${message}`, 502);
        }
    });

    return api;
}
