/**
 * 管理员 API 路由
 */
import { Hono } from 'hono';
import type { Storage, User, SyncResult, AutoSyncConfig } from '../storage.js';
import { STORAGE_KEYS } from '../storage.js';
import type { AuthEnv } from '../auth.js';
import { hashPassword, verifyToken } from '../auth.js';
import type { SyncEnv } from '../sync.js';
import { getAutoSyncConfig, setAutoSyncConfig, syncUserSubscription, syncAllUsers } from '../scheduler.js';

// 环境变量类型
type Env = AuthEnv & SyncEnv & { storage: Storage };

// 创建管理员路由
export function createAdminRoutes() {
    const admin = new Hono<{ Variables: { storage: Storage; env: Env } }>();

    // 所有管理员路由需要认证
    admin.use('/*', async (c, next) => {
        const env = c.get('env');

        const authHeader = c.req.header('Authorization');
        let token = authHeader?.startsWith('Bearer ')
            ? authHeader.substring(7)
            : c.req.header('Cookie')?.match(/token=([^;]+)/)?.[1];

        if (!token) {
            return c.json({ error: '未登录' }, 401);
        }

        const payload = await verifyToken(token, env.AUTH_SECRET);
        if (!payload) {
            return c.json({ error: 'Token 无效' }, 401);
        }

        if (!payload.isAdmin) {
            return c.json({ error: '需要管理员权限' }, 403);
        }

        await next();
    });

    /**
     * GET /api/admin/users - 获取用户列表
     */
    admin.get('/users', async (c) => {
        const storage = c.get('storage');
        const env = c.get('env');

        // 获取用户列表
        const userKeys = await storage.list(STORAGE_KEYS.USERS_PREFIX);
        const users: Array<{
            username: string;
            isAdmin: boolean;
            createdAt: string;
            lastLogin?: string;
            customNote?: string;
            membershipLevel?: string;
            subscriptionConfig?: { collectionName: string; token: string };
            lastSyncResult?: { lastSync: string; nodeCount: number; earliestExpire: string | null; totalRemainGB: number | null };
        }> = [];

        // 添加管理员
        users.push({
            username: env.ADMIN_USERNAME,
            isAdmin: true,
            createdAt: '系统管理员',
            membershipLevel: 'VIP用户',
        });

        // 获取其他用户
        for (const key of userKeys) {
            const user = await storage.get<User>(key);
            if (user) {
                users.push({
                    username: user.username,
                    isAdmin: user.isAdmin,
                    createdAt: user.createdAt,
                    lastLogin: user.lastLogin,
                    customNote: user.customNote,
                    membershipLevel: user.membershipLevel,
                    subscriptionConfig: user.subscriptionConfig,
                    lastSyncResult: user.lastSyncResult,
                });
            }
        }

        // 按创建时间排序 (管理员在最前，其余按时间升序)
        users.sort((a, b) => {
            if (a.createdAt === '系统管理员') return -1;
            if (b.createdAt === '系统管理员') return 1;
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });

        return c.json({ users });
    });

    /**
     * POST /api/admin/users - 创建用户
     */
    admin.post('/users', async (c) => {
        const storage = c.get('storage');
        const body = await c.req.json<{
            username: string;
            password: string;
            isAdmin?: boolean;
            customNote?: string;
            membershipLevel?: string;
            subscriptionConfig?: { collectionName: string; token: string };
        }>();

        if (!body.username || !body.password) {
            return c.json({ error: '用户名和密码不能为空' }, 400);
        }

        // 检查用户是否已存在
        const existing = await storage.get<User>(`${STORAGE_KEYS.USERS_PREFIX}${body.username}`);
        if (existing) {
            return c.json({ error: '用户已存在' }, 400);
        }

        const user: User = {
            username: body.username,
            passwordHash: await hashPassword(body.password),
            isAdmin: body.isAdmin || false,
            createdAt: new Date().toISOString(),
            customNote: body.customNote,
            membershipLevel: body.membershipLevel,
            subscriptionConfig: body.subscriptionConfig,
        };

        await storage.set(`${STORAGE_KEYS.USERS_PREFIX}${body.username}`, user);

        return c.json({ success: true, username: body.username });
    });

    /**
     * PUT /api/admin/users/:username - 更新用户
     */
    admin.put('/users/:username', async (c) => {
        const storage = c.get('storage');
        const username = c.req.param('username');
        const body = await c.req.json<{
            password?: string;
            isAdmin?: boolean;
            customNote?: string;
            membershipLevel?: string;
            subscriptionConfig?: { collectionName: string; token: string };
        }>();

        const user = await storage.get<User>(`${STORAGE_KEYS.USERS_PREFIX}${username}`);
        if (!user) {
            return c.json({ error: '用户不存在' }, 404);
        }

        // 更新字段
        if (body.password) {
            user.passwordHash = await hashPassword(body.password);
        }
        if (body.isAdmin !== undefined) {
            user.isAdmin = body.isAdmin;
        }
        if (body.customNote !== undefined) {
            user.customNote = body.customNote;
        }
        if (body.membershipLevel !== undefined) {
            user.membershipLevel = body.membershipLevel;
        }
        if (body.subscriptionConfig !== undefined) {
            user.subscriptionConfig = body.subscriptionConfig;
        }

        await storage.set(`${STORAGE_KEYS.USERS_PREFIX}${username}`, user);

        return c.json({ success: true });
    });

    /**
     * DELETE /api/admin/users/:username - 删除用户
     */
    admin.delete('/users/:username', async (c) => {
        const storage = c.get('storage');
        const username = c.req.param('username');

        await storage.delete(`${STORAGE_KEYS.USERS_PREFIX}${username}`);

        return c.json({ success: true });
    });

    /**
     * GET /api/admin/config/membership - 获取会员等级配置
     */
    admin.get('/config/membership', async (c) => {
        const storage = c.get('storage');
        const config = await storage.get<{ levels: string[] }>(STORAGE_KEYS.MEMBERSHIP_CONFIG);
        // 默认等级
        const levels = config?.levels || ['普通用户', 'VIP会员', '高级VIP'];
        return c.json({ levels });
    });

    /**
     * POST /api/admin/config/membership - 保存会员等级配置
     */
    admin.post('/config/membership', async (c) => {
        const storage = c.get('storage');
        const body = await c.req.json<{ levels: string[] }>();

        if (!body.levels || !Array.isArray(body.levels)) {
            return c.json({ error: '无效的配置格式' }, 400);
        }

        await storage.set(STORAGE_KEYS.MEMBERSHIP_CONFIG, { levels: body.levels });
        return c.json({ success: true });
    });

    /**
     * GET /api/admin/config/notification - 获取通知配置
     */
    admin.get('/config/notification', async (c) => {
        const storage = c.get('storage');
        const config = await storage.get(STORAGE_KEYS.NOTIFICATION_CONFIG);
        // 默认配置
        const defaultConfig = {
            login: { enabled: false, content: '', type: 'info' },
            home: { enabled: false, content: '', title: '' }
        };
        return c.json(config || defaultConfig);
    });

    /**
     * POST /api/admin/config/notification - 保存通知配置
     */
    admin.post('/config/notification', async (c) => {
        const storage = c.get('storage');
        const body = await c.req.json();

        // 简单验证
        if (!body.login || !body.home) {
            return c.json({ error: '无效的配置格式' }, 400);
        }

        await storage.set(STORAGE_KEYS.NOTIFICATION_CONFIG, body);
        return c.json({ success: true });
    });

    /**
     * GET /api/admin/export - 导出 CSV
     */
    admin.get('/export', async (c) => {
        const storage = c.get('storage');
        const env = c.get('env');

        // 获取同步结果
        const syncResult = await storage.get<SyncResult>(STORAGE_KEYS.SYNC_RESULT);

        // 获取所有用户
        const userKeys = await storage.list(STORAGE_KEYS.USERS_PREFIX);
        const rows: string[] = ['用户名,会员等级,节点数,最早到期,剩余流量GB,标签'];

        // 添加管理员
        const adminTag = getExpireTag(syncResult?.earliestExpire);
        rows.push(`${env.ADMIN_USERNAME},VIP用户,${syncResult?.nodeCount || 0},${syncResult?.earliestExpire || 'N/A'},${syncResult?.totalRemainGB || 'N/A'},${adminTag}`);

        // 添加其他用户
        for (const key of userKeys) {
            const user = await storage.get<User>(key);
            if (user) {
                const tag = getExpireTag(syncResult?.earliestExpire);
                const level = user.membershipLevel || (user.isAdmin ? '管理员' : '普通用户');
                rows.push(`${user.username},${level},${syncResult?.nodeCount || 0},${syncResult?.earliestExpire || 'N/A'},${syncResult?.totalRemainGB || 'N/A'},${tag}`);
            }
        }

        const csv = rows.join('\n');
        c.header('Content-Type', 'text/csv; charset=utf-8');
        c.header('Content-Disposition', 'attachment; filename="users_export.csv"');
        return c.body('\uFEFF' + csv); // 添加 BOM 以支持 Excel 中文
    });

    /**
     * PUT /api/admin/users/:username/subscription - 绑定用户订阅
     */
    admin.put('/users/:username/subscription', async (c) => {
        const storage = c.get('storage');
        const username = c.req.param('username');
        const body = await c.req.json<{
            collectionName: string;
            token: string;
        }>();

        if (!body.collectionName || !body.token) {
            return c.json({ error: '组合名称和 token 不能为空' }, 400);
        }

        const user = await storage.get<User>(`${STORAGE_KEYS.USERS_PREFIX}${username}`);
        if (!user) {
            return c.json({ error: '用户不存在' }, 404);
        }

        user.subscriptionConfig = {
            collectionName: body.collectionName,
            token: body.token,
        };

        await storage.set(`${STORAGE_KEYS.USERS_PREFIX}${username}`, user);
        return c.json({ success: true });
    });

    /**
     * POST /api/admin/users/:username/sync - 手动同步单个用户
     */
    admin.post('/users/:username/sync', async (c) => {
        const storage = c.get('storage');
        const env = c.get('env');
        const username = c.req.param('username');

        const user = await storage.get<User>(`${STORAGE_KEYS.USERS_PREFIX}${username}`);
        if (!user) {
            return c.json({ error: '用户不存在' }, 404);
        }

        if (!user.subscriptionConfig) {
            return c.json({ error: '用户未绑定订阅' }, 400);
        }

        // 优先从存储配置读取 Sub-Store 地址
        const substoreConfig = await storage.get<{
            baseUrl: string;
            backendPrefix?: string;
        }>(STORAGE_KEYS.SUBSTORE_CONFIG);
        const baseUrl = substoreConfig?.baseUrl || env.SUBSTORE_SHARE_BASE || '';

        if (!baseUrl) {
            return c.json({ error: '请先配置 Sub-Store 地址' }, 400);
        }

        // 调试日志：打印同步参数
        console.log(`[Sync] 用户: ${username}, baseUrl: ${baseUrl}, collectionName: ${user.subscriptionConfig.collectionName}, token: ${user.subscriptionConfig.token}`);

        const result = await syncUserSubscription(storage, user, baseUrl);
        return c.json(result);
    });

    /**
     * GET /api/admin/sync/config - 获取自动同步配置
     */
    admin.get('/sync/config', async (c) => {
        const storage = c.get('storage');
        const config = await getAutoSyncConfig(storage);
        return c.json(config);
    });

    /**
     * POST /api/admin/sync/config - 设置自动同步配置
     */
    admin.post('/sync/config', async (c) => {
        const storage = c.get('storage');
        const body = await c.req.json<Partial<AutoSyncConfig>>();
        const config = await setAutoSyncConfig(storage, body);
        return c.json({ success: true, config });
    });

    /**
     * POST /api/admin/sync/all - 立即同步所有用户
     */
    admin.post('/sync/all', async (c) => {
        const storage = c.get('storage');
        const env = c.get('env');
        const result = await syncAllUsers(storage, env);
        return c.json(result);
    });

    /**
     * GET /api/admin/substore/config - 获取 Sub-Store 配置
     */
    admin.get('/substore/config', async (c) => {
        const storage = c.get('storage');
        const env = c.get('env');

        // 优先从存储读取
        let config = await storage.get<{
            baseUrl: string;
            backendPrefix?: string;
            collections: Array<{ name: string; displayName?: string }>;
        }>(STORAGE_KEYS.SUBSTORE_CONFIG);

        // 如果没有存储配置，从环境变量初始化
        if (!config) {
            const baseUrl = env.SUBSTORE_SHARE_BASE || '';
            const collectionsEnv = env.SUBSTORE_COLLECTIONS || env.SUBSTORE_COLLECTION_NAME || '';

            // 解析环境变量中的组合列表（逗号分隔）
            const collections = collectionsEnv
                .split(',')
                .map((name: string) => name.trim())
                .filter((name: string) => name.length > 0)
                .map((name: string) => ({ name }));

            config = { baseUrl, backendPrefix: '', collections };
        }

        return c.json(config);
    });

    /**
     * POST /api/admin/substore/config - 保存 Sub-Store 配置
     */
    admin.post('/substore/config', async (c) => {
        const storage = c.get('storage');
        const body = await c.req.json<{
            baseUrl: string;
            backendPrefix?: string;
            collections: Array<{ name: string; displayName?: string }>;
        }>();

        // 验证必填字段
        if (!body.baseUrl) {
            return c.json({ error: 'Sub-Store 地址不能为空' }, 400);
        }

        await storage.set(STORAGE_KEYS.SUBSTORE_CONFIG, {
            baseUrl: body.baseUrl.replace(/\/$/, ''),  // 去掉末尾斜杠
            backendPrefix: body.backendPrefix?.replace(/\/$/, '') || '',  // 去掉末尾斜杠
            collections: body.collections || [],
        });

        return c.json({ success: true });
    });

    /**
     * POST /api/admin/substore/collections/add - 添加订阅组合
     */
    admin.post('/substore/collections/add', async (c) => {
        const storage = c.get('storage');
        const body = await c.req.json<{ name: string; displayName?: string }>();

        if (!body.name) {
            return c.json({ error: '组合名称不能为空' }, 400);
        }

        // 获取现有配置
        let config = await storage.get<{
            baseUrl: string;
            backendPrefix?: string;
            collections: Array<{ name: string; displayName?: string }>;
        }>(STORAGE_KEYS.SUBSTORE_CONFIG);

        if (!config) {
            return c.json({ error: '请先配置 Sub-Store 地址' }, 400);
        }

        // 检查是否已存在
        if (config.collections.some(c => c.name === body.name)) {
            return c.json({ error: '该组合已存在' }, 400);
        }

        // 添加新组合
        config.collections.push({
            name: body.name,
            displayName: body.displayName,
        });

        await storage.set(STORAGE_KEYS.SUBSTORE_CONFIG, config);

        return c.json({ success: true, collections: config.collections });
    });

    /**
     * GET /api/admin/substore/tokens - 从 Sub-Store 查询分享 token 列表
     */
    admin.get('/substore/tokens', async (c) => {
        const storage = c.get('storage');
        const env = c.get('env');

        // 获取 Sub-Store 配置
        let config = await storage.get<{
            baseUrl: string;
            backendPrefix?: string;
            collections: Array<{ name: string; displayName?: string }>;
        }>(STORAGE_KEYS.SUBSTORE_CONFIG);

        const baseUrl = config?.baseUrl || env.SUBSTORE_SHARE_BASE || '';
        const backendPrefix = config?.backendPrefix || '';

        if (!baseUrl) {
            return c.json({ error: '请先配置 Sub-Store 地址' }, 400);
        }

        if (!backendPrefix) {
            return c.json({ error: '请先配置后端路径前缀' }, 400);
        }

        // 构建 Sub-Store 后端 API 地址
        const apiUrl = `${baseUrl}${backendPrefix}/api/tokens`;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: { 'User-Agent': 'SubSync/1.0' },
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                return c.json({ error: `Sub-Store 返回 ${response.status}` }, 502);
            }

            const result = await response.json() as { status: string; data: unknown };
            // Sub-Store 返回格式: { status: 'success', data: [...] }
            const tokens = result?.data || result;
            return c.json({ success: true, tokens });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return c.json({ error: `查询失败: ${message}` }, 502);
        }
    });

    /**
     * GET /api/admin/substore/tokens/unbound - 获取未绑定用户的分享 token 列表
     * 从 Sub-Store 获取全部 token，过滤掉已与平台用户绑定的 token
     */
    admin.get('/substore/tokens/unbound', async (c) => {
        const storage = c.get('storage');
        const env = c.get('env');

        // 获取 Sub-Store 配置
        let config = await storage.get<{
            baseUrl: string;
            backendPrefix?: string;
            collections: Array<{ name: string; displayName?: string }>;
        }>(STORAGE_KEYS.SUBSTORE_CONFIG);

        const baseUrl = config?.baseUrl || env.SUBSTORE_SHARE_BASE || '';
        const backendPrefix = config?.backendPrefix || '';

        if (!baseUrl || !backendPrefix) {
            return c.json({ error: '请先配置 Sub-Store 地址和后端路径前缀', needConfig: true }, 400);
        }

        // 1. 从 Sub-Store 获取所有 token
        const apiUrl = `${baseUrl}${backendPrefix}/api/tokens`;
        let allTokens: any[] = [];

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: { 'User-Agent': 'SubSync/1.0' },
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                return c.json({ error: `Sub-Store 返回 ${response.status}` }, 502);
            }

            const result = await response.json() as { status: string; data: unknown };
            const tokensData = result?.data || result;
            allTokens = Array.isArray(tokensData) ? tokensData : [];
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return c.json({ error: `查询失败: ${message}` }, 502);
        }

        // 2. 获取所有已绑定的 token 值 和 用户列表
        const userKeys = await storage.list(STORAGE_KEYS.USERS_PREFIX);
        const boundTokenValues = new Set<string>();
        const boundCompositeKeys = new Set<string>();
        const allUsers: { username: string; hasSub: boolean }[] = [];

        for (const key of userKeys) {
            const user = await storage.get<User>(key);
            if (!user) continue;

            // 收集绑定信息
            if (user.subscriptionConfig?.token) {
                boundTokenValues.add(user.subscriptionConfig.token);
                const compositeKey = user.subscriptionConfig.token + '::' + (user.subscriptionConfig.collectionName || '');
                boundCompositeKeys.add(compositeKey);
                // console.log(`[Unbound] 已绑定用户 ${user.username}: token=${user.subscriptionConfig.token}`);
            }

            // 收集前端所需的用户列表 (非管理员)
            if (!user.isAdmin) {
                allUsers.push({
                    username: user.username,
                    hasSub: !!user.subscriptionConfig,
                });
            }
        }

        // 3. 调试日志：打印 Sub-Store 返回的 token 数据
        if (allTokens.length > 0) {
            console.log(`[Unbound] Sub-Store 返回 ${allTokens.length} 个 token，第一个样本:`, JSON.stringify(allTokens[0]));
        }

        // 4. 过滤出未绑定的 token（使用纯 token 值匹配）
        const unboundTokens = allTokens.filter((t: any) => {
            const tokenValue = t.token || '';
            // 只要 token 值被任何用户绑定，就认为已绑定
            const isBound = boundTokenValues.has(tokenValue);
            if (isBound) {
                // console.log(`[Unbound] 过滤掉已绑定 token: ${tokenValue}`);
            }
            return !isBound;
        });

        console.log(`[Unbound] 总计: ${allTokens.length}, 已绑定: ${allTokens.length - unboundTokens.length}, 待分配: ${unboundTokens.length}`);

        return c.json({
            success: true,
            tokens: unboundTokens,
            totalCount: allTokens.length,
            boundCount: allTokens.length - unboundTokens.length,
            allUsers,
        });
    });

    /**
     * GET /api/admin/substore/collections/remote - 从 Sub-Store 远程获取组合订阅列表
     */
    admin.get('/substore/collections/remote', async (c) => {
        const storage = c.get('storage');
        const env = c.get('env');

        // 获取 Sub-Store 配置
        let config = await storage.get<{
            baseUrl: string;
            backendPrefix?: string;
            collections: Array<{ name: string; displayName?: string }>;
        }>(STORAGE_KEYS.SUBSTORE_CONFIG);

        const baseUrl = config?.baseUrl || env.SUBSTORE_SHARE_BASE || '';
        const backendPrefix = config?.backendPrefix || '';

        if (!baseUrl) {
            return c.json({ error: '请先配置 Sub-Store 地址' }, 400);
        }

        if (!backendPrefix) {
            return c.json({ error: '请先配置后端路径前缀' }, 400);
        }

        // 构建 Sub-Store 后端 API 地址
        const apiUrl = `${baseUrl}${backendPrefix}/api/collections`;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: { 'User-Agent': 'SubSync/1.0' },
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                return c.json({ error: `Sub-Store 返回 ${response.status}` }, 502);
            }

            const result = await response.json() as { status: string; data: unknown };
            // Sub-Store 返回格式: { status: 'success', data: [...] }
            const collections = result?.data || result;
            return c.json({ success: true, collections });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return c.json({ error: `查询失败: ${message}` }, 502);
        }
    });

    return admin;
}


/**
 * 根据到期日期生成标签
 */
function getExpireTag(expireDate: string | null | undefined): string {
    if (!expireDate) return '';

    const now = new Date();
    const expire = new Date(expireDate);
    const daysLeft = Math.ceil((expire.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return '已过期';
    if (daysLeft < 7) return '即将过期';
    if (daysLeft < 30) return '注意';
    return '正常';
}
