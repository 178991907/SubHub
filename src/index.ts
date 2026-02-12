/**
 * Cloudflare Workers 入口
 */
import { app, Env } from './app.js';
import { KVStorage } from './storage/kv.js';
import { memoryStorage } from './storage/memory.js';
import { syncAllUsers, getAutoSyncConfig } from './scheduler.js';

// Scheduled 事件处理（Cloudflare Workers Cron 触发）
async function handleScheduled(
    event: any,
    env: Env,
    ctx: any
): Promise<void> {
    console.log('[Cron] 定时任务触发:', new Date().toISOString());



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

// 导出用于 Cloudflare Workers
export default {
    fetch: app.fetch,
    scheduled: handleScheduled,
};
