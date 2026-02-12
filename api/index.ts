/**
 * Vercel Edge Runtime 入口
 */
import { app } from '../src/app.js';
import { handle } from 'hono/vercel';

// Vercel 运行时配置 (使用 Node.js Serverless Function 以获得最佳兼容性)
export const config = {
    runtime: 'nodejs',
};

// 导出 HTTP 处理器
export default handle(app);
