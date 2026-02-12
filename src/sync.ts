/**
 * 核心同步逻辑 - 从 Sub-Store 拉取并解析订阅
 */
import type { Storage, SyncResult, SyncLog } from './storage.js';
import { STORAGE_KEYS } from './storage.js';
import {
    parseNodeName,
    extractNodeNameFromUrl,
    isValidProxyUrl,
    getProtocolType,
} from './utils/parse-node.js';

// 环境变量类型
export interface SyncEnv {
    SUBSTORE_SHARE_BASE: string;        // Sub-Store 分享地址
    SUBSTORE_COLLECTION_NAME: string;   // 组合订阅名称
    SUBSTORE_COLLECTIONS?: string;      // 多个订阅组合，逗号分隔（可选）
    SUBSTORE_TOKEN: string;             // 订阅分享令牌
    SUBSTORE_DOWNLOAD_TIMEOUT?: string; // 超时时间（毫秒）
    SYNC_SECRET: string;                // 保护 /api/sync 端点
}


// 同步结果
export interface SyncResponse {
    success: boolean;
    nodeCount?: number;
    earliestExpire?: string | null;
    totalRemainGB?: number | null;
    error?: string;
    invalidLines?: number;
}

/**
 * 执行订阅同步
 */
export async function syncSubscription(
    storage: Storage,
    env: SyncEnv
): Promise<SyncResponse> {
    const startTime = Date.now();

    try {
        // 1. 构造下载 URL（新格式：/share/col/{name}?token=xxx）
        const encodedName = encodeURIComponent(env.SUBSTORE_COLLECTION_NAME);
        const url = `${env.SUBSTORE_SHARE_BASE}/share/col/${encodedName}?token=${env.SUBSTORE_TOKEN}`;

        console.log(`[Sync] 开始同步，URL: ${url}`);

        // 2. 发起请求（带超时）
        const timeout = parseInt(env.SUBSTORE_DOWNLOAD_TIMEOUT || '15000', 10);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        let response: Response;
        try {
            response = await fetch(url, {
                method: 'GET',
                headers: {
                    'User-Agent': 'SubSync/1.0',
                },
                signal: controller.signal,
            });
        } finally {
            clearTimeout(timeoutId);
        }

        // 3. 检查响应状态
        if (!response.ok) {
            const error = `Sub-Store 返回 ${response.status}，可能实例维护`;
            console.error(`[Sync] ${error}`);
            await logSync(storage, { success: false, error });
            return { success: false, error };
        }

        // 4. 读取响应内容
        let text = await response.text();

        // 5. 检测是否为 Base64 编码（订阅内容可能是 Base64 或纯文本）
        // Base64 特征：单行长字符串，只包含 Base64 字符
        const isBase64 = /^[A-Za-z0-9+/=\s]+$/.test(text.trim()) &&
            !text.includes('://') &&
            text.trim().length > 100;

        if (isBase64) {
            try {
                // Base64 解码
                const decoded = atob(text.trim().replace(/\s/g, ''));
                text = decoded;
                console.log('[Sync] 检测到 Base64 编码，已解码');
            } catch {
                console.log('[Sync] Base64 解码失败，使用原始内容');
            }
        }

        // 6. 按行解析
        const lines = text.split(/\r?\n/).filter((line) => line.trim());

        // Debug: 打印前 5 行内容以排查协议识别问题
        if (lines.length > 0) {
            console.log('[Sync Preview] First 5 lines:', lines.slice(0, 5).map(l => l.substring(0, 50) + '...'));
        }

        const validLines: string[] = [];
        let invalidCount = 0;

        const protocols = { vless: 0, trojan: 0, other: 0 };
        const expireDates: string[] = [];
        let totalTrafficGB = 0;
        let hasTrafficInfo = false;

        for (const line of lines) {
            if (!isValidProxyUrl(line)) {
                invalidCount++;
                continue;
            }

            validLines.push(line.trim());

            // 统计协议
            const protocol = getProtocolType(line);
            protocols[protocol]++;

            // 解析节点名
            const nodeName = extractNodeNameFromUrl(line);
            if (nodeName) {
                const parsed = parseNodeName(nodeName);
                if (parsed.expireDate) {
                    expireDates.push(parsed.expireDate);
                }
                if (parsed.remainTrafficGB !== undefined) {
                    totalTrafficGB += parsed.remainTrafficGB;
                    hasTrafficInfo = true;
                }
            }
        }

        // 6. 计算统计数据
        const earliestExpire = expireDates.length > 0
            ? expireDates.sort()[0]  // 最早日期
            : null;

        const result: SyncResult = {
            lastSync: new Date().toISOString(),
            nodeCount: validLines.length,
            earliestExpire,
            totalRemainGB: hasTrafficInfo ? Math.round(totalTrafficGB * 100) / 100 : null,
            rawLines: validLines,
            protocols,
        };

        // 7. 存储结果
        await storage.set(STORAGE_KEYS.SYNC_RESULT, result);

        // 8. 记录日志
        await logSync(storage, {
            success: true,
            nodeCount: validLines.length,
        });

        const duration = Date.now() - startTime;
        console.log(`[Sync] 完成，节点数: ${validLines.length}，耗时: ${duration}ms`);

        return {
            success: true,
            nodeCount: validLines.length,
            earliestExpire,
            totalRemainGB: result.totalRemainGB,
            invalidLines: invalidCount > 0 ? invalidCount : undefined,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[Sync] 错误: ${message}`);
        await logSync(storage, { success: false, error: message });
        return { success: false, error: message };
    }
}

/**
 * 获取最新同步结果
 */
export async function getSyncResult(storage: Storage): Promise<SyncResult | null> {
    return storage.get<SyncResult>(STORAGE_KEYS.SYNC_RESULT);
}

/**
 * 获取同步状态（公开信息，不含原始数据）
 */
export async function getSyncStatus(storage: Storage): Promise<{
    lastSync: string | null;
    nodeCount: number;
    success: boolean;
    latestError?: string;
}> {
    const result = await storage.get<SyncResult>(STORAGE_KEYS.SYNC_RESULT);
    const logs = await storage.get<SyncLog[]>(STORAGE_KEYS.SYNC_LOGS) || [];
    const latestLog = logs[0];

    return {
        lastSync: result?.lastSync || null,
        nodeCount: result?.nodeCount || 0,
        success: latestLog?.success ?? true,
        latestError: latestLog?.error,
    };
}

/**
 * 记录同步日志（保留最近 10 条）
 */
async function logSync(
    storage: Storage,
    log: Omit<SyncLog, 'timestamp'>
): Promise<void> {
    const logs = await storage.get<SyncLog[]>(STORAGE_KEYS.SYNC_LOGS) || [];

    logs.unshift({
        timestamp: new Date().toISOString(),
        ...log,
    });

    // 只保留最近 10 条
    if (logs.length > 10) {
        logs.splice(10);
    }

    await storage.set(STORAGE_KEYS.SYNC_LOGS, logs);
}
