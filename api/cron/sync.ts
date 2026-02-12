/**
 * Vercel Cron Job - 自动同步
 * 路径: /api/cron/sync
 * 
 * 此端点由 Vercel Cron Jobs 定时调用，执行所有用户的订阅同步
 */

// 注意：Vercel Cron 需要使用 Node.js runtime，不能使用 Edge runtime
export const config = {
    runtime: 'nodejs',
};

export default async function handler(req: any, res: any) {
    // 验证请求来源（Vercel Cron 会设置 Authorization header）
    const authHeader = req.headers['authorization'];
    const cronSecret = process.env.CRON_SECRET;

    // 如果配置了 CRON_SECRET，则验证
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ error: '未授权的请求' });
    }

    console.log('[Cron] Vercel 定时任务触发:', new Date().toISOString());

    try {
        // 动态导入同步模块
        // 注意：Vercel Serverless Function 中需要使用绝对路径或相对于项目根目录的路径
        const baseUrl = process.env.SUBSTORE_SHARE_BASE || '';

        // 由于 Vercel Serverless 和 Edge 环境不同，这里直接实现简化的同步逻辑
        // 实际生产中可以调用内部 API 或共享的同步函数

        // 方案一：调用自身的 API 端点
        const syncUrl = `${process.env.VERCEL_URL || 'http://localhost:3000'}/api/admin/sync/all`;
        const adminToken = process.env.ADMIN_TOKEN; // 需要配置管理员 token

        if (adminToken) {
            const response = await fetch(syncUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();
            console.log('[Cron] 同步结果:', result);

            return res.status(200).json({
                success: true,
                message: '定时同步完成',
                result,
            });
        }

        // 如果没有配置 ADMIN_TOKEN，返回提示
        return res.status(200).json({
            success: false,
            message: '未配置 ADMIN_TOKEN 环境变量，无法执行自动同步',
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('[Cron] 同步错误:', message);

        return res.status(500).json({
            success: false,
            error: message,
        });
    }
}
