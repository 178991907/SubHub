/**
 * Vercel Edge Runtime 入口
 */
import app from '../src/index';
import { handle } from 'hono/vercel';

// Vercel Edge 配置
export const config = {
    runtime: 'edge',
};

// 导出 HTTP 方法处理函数
export default handle(app);
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
