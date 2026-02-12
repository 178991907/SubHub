/**
 * 调度器模块 - 处理自动同步任务
 */
import type { Storage, User, AutoSyncConfig } from './storage.js';
import { STORAGE_KEYS } from './storage.js';
import type { SyncEnv } from './sync.js';

// 同步单个用户的订阅
export async function syncUserSubscription(
    storage: Storage,
    user: User,
    baseUrl: string
): Promise<{ success: boolean; nodeCount?: number; error?: string }> {
    if (!user.subscriptionConfig) {
        return { success: false, error: '用户未绑定订阅' };
    }

    const { collectionName, token } = user.subscriptionConfig;
    const encodedName = encodeURIComponent(collectionName);
    const url = `${baseUrl}/share/col/${encodedName}?token=${token}`;

    console.log(`[Scheduler] 同步用户 ${user.username}，URL: ${url}`);

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        let response: Response;
        try {
            response = await fetch(url, {
                method: 'GET',
                headers: { 'User-Agent': 'SubSync/1.0' },
                signal: controller.signal,
            });
        } finally {
            clearTimeout(timeoutId);
        }

        if (!response.ok) {
            return { success: false, error: `HTTP ${response.status}` };
        }

        let text = await response.text();

        // 检测 Base64 编码
        const isBase64 = /^[A-Za-z0-9+/=\s]+$/.test(text.trim()) &&
            !text.includes('://') &&
            text.trim().length > 100;

        if (isBase64) {
            try {
                text = atob(text.trim().replace(/\s/g, ''));
            } catch {
                // 解码失败则使用原始内容
            }
        }

        // 解析节点
        const lines = text.split(/\r?\n/).filter(line => line.trim());
        const validLines = lines.filter(line =>
            line.startsWith('vless://') ||
            line.startsWith('vmess://') ||
            line.startsWith('trojan://') ||
            line.startsWith('ss://') ||
            line.startsWith('ssr://')
        );

        // 解析到期日期（从节点名中提取）
        let earliestExpire: string | null = null;
        let totalRemainGB: number | null = null;

        for (const line of validLines) {
            // 尝试从节点名中提取到期日期
            const match = line.match(/剩余\s*(\d+)\s*天/);
            if (match) {
                const daysLeft = parseInt(match[1], 10);
                const expireDate = new Date();
                expireDate.setDate(expireDate.getDate() + daysLeft);
                const expireDateStr = expireDate.toISOString().split('T')[0];
                if (!earliestExpire || expireDateStr < earliestExpire) {
                    earliestExpire = expireDateStr;
                }
            }
        }

        // 更新用户的同步结果
        user.lastSyncResult = {
            lastSync: new Date().toISOString(),
            nodeCount: validLines.length,
            earliestExpire,
            totalRemainGB,
        };

        // 保存用户数据
        await storage.set(`${STORAGE_KEYS.USERS_PREFIX}${user.username}`, user);

        console.log(`[Scheduler] 用户 ${user.username} 同步完成，节点数: ${validLines.length}`);

        return { success: true, nodeCount: validLines.length };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[Scheduler] 用户 ${user.username} 同步失败: ${message}`);
        return { success: false, error: message };
    }
}

// 同步所有用户的订阅（优先从存储配置读取 baseUrl）
export async function syncAllUsers(
    storage: Storage,
    env: SyncEnv
): Promise<{ total: number; success: number; failed: number; synced: number }> {
    console.log('[Scheduler] 开始同步所有用户...');

    // 优先从存储配置读取 Sub-Store 地址
    const substoreConfig = await storage.get<{ baseUrl: string; backendPrefix?: string }>(STORAGE_KEYS.SUBSTORE_CONFIG);
    const baseUrl = substoreConfig?.baseUrl || env.SUBSTORE_SHARE_BASE || '';

    if (!baseUrl) {
        console.error('[Scheduler] 未配置 Sub-Store 地址，无法同步');
        return { total: 0, success: 0, failed: 0, synced: 0 };
    }

    const userKeys = await storage.list(STORAGE_KEYS.USERS_PREFIX);
    let successCount = 0;
    let failedCount = 0;
    let syncedCount = 0;

    for (const key of userKeys) {
        const user = await storage.get<User>(key);
        if (user && user.subscriptionConfig) {
            syncedCount++;
            const result = await syncUserSubscription(storage, user, baseUrl);
            if (result.success) {
                successCount++;
            } else {
                failedCount++;
            }
        }
    }

    // 更新自动同步配置的最后执行时间
    const config = await storage.get<AutoSyncConfig>(STORAGE_KEYS.AUTO_SYNC_CONFIG);
    if (config) {
        config.lastScheduledSync = new Date().toISOString();
        await storage.set(STORAGE_KEYS.AUTO_SYNC_CONFIG, config);
    }

    console.log(`[Scheduler] 同步完成，成功: ${successCount}，失败: ${failedCount}`);

    return {
        total: userKeys.length,
        success: successCount,
        failed: failedCount,
        synced: syncedCount,
    };
}

// 获取自动同步配置
export async function getAutoSyncConfig(storage: Storage): Promise<AutoSyncConfig> {
    const config = await storage.get<AutoSyncConfig>(STORAGE_KEYS.AUTO_SYNC_CONFIG);
    return config || {
        enabled: false,
        intervalMinutes: 60,
    };
}

// 设置自动同步配置
export async function setAutoSyncConfig(
    storage: Storage,
    config: Partial<AutoSyncConfig>
): Promise<AutoSyncConfig> {
    const current = await getAutoSyncConfig(storage);
    const updated: AutoSyncConfig = {
        ...current,
        ...config,
    };
    await storage.set(STORAGE_KEYS.AUTO_SYNC_CONFIG, updated);
    return updated;
}
