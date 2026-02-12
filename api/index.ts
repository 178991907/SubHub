/**
 * Vercel Edge Runtime 入口
 */
import { app } from '../src/app.js';
import { handle } from 'hono/vercel';

// Vercel Edge 运行时声明
export const config = {
    runtime: 'edge',
};

// 导出 HTTP 处理器
export default handle(app);
