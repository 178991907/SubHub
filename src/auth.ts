/**
 * 认证模块 - JWT 生成与验证
 */
import * as jose from 'jose';
import type { Context, MiddlewareHandler } from 'hono';
import type { Storage, User } from './storage.js';
import { STORAGE_KEYS } from './storage.js';

// 环境变量类型
export interface AuthEnv {
    AUTH_SECRET: string;       // JWT 签名密钥（32+ 字符）
    ADMIN_USERNAME: string;    // 管理员用户名
    ADMIN_PASSWORD: string;    // 管理员密码
}

// JWT Payload
export interface JWTPayload {
    sub: string;       // 用户名
    isAdmin: boolean;  // 是否管理员
    iat: number;       // 签发时间
    exp: number;       // 过期时间
}

// 扩展 Hono Context
declare module 'hono' {
    interface ContextVariableMap {
        user: JWTPayload;
    }
}

/**
 * 生成 JWT Token
 */
export async function generateToken(
    username: string,
    isAdmin: boolean,
    secret: string
): Promise<string> {
    const secretKey = new TextEncoder().encode(secret);
    const now = Math.floor(Date.now() / 1000);

    const token = await new jose.SignJWT({
        sub: username,
        isAdmin,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt(now)
        .setExpirationTime(now + 7 * 24 * 60 * 60) // 7 天有效期
        .sign(secretKey);

    return token;
}

/**
 * 验证 JWT Token
 */
export async function verifyToken(
    token: string,
    secret: string
): Promise<JWTPayload | null> {
    try {
        const secretKey = new TextEncoder().encode(secret);
        const { payload } = await jose.jwtVerify(token, secretKey);
        return {
            sub: payload.sub as string,
            isAdmin: payload.isAdmin as boolean,
            iat: payload.iat as number,
            exp: payload.exp as number,
        };
    } catch {
        return null;
    }
}

/**
 * 简单密码哈希（用于存储用户密码）
 * 注意：生产环境应使用 bcrypt 或 argon2
 */
export async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 验证密码
 */
export async function verifyPassword(
    password: string,
    hash: string
): Promise<boolean> {
    const inputHash = await hashPassword(password);
    return inputHash === hash;
}

/**
 * 用户登录
 */
export async function login(
    username: string,
    password: string,
    storage: Storage,
    env: AuthEnv
): Promise<{ success: boolean; token?: string; error?: string }> {
    // 检查是否为管理员
    if (username === env.ADMIN_USERNAME) {
        if (password === env.ADMIN_PASSWORD) {
            const token = await generateToken(username, true, env.AUTH_SECRET);
            return { success: true, token };
        }
        return { success: false, error: '密码错误' };
    }

    // 检查普通用户
    const user = await storage.get<User>(`${STORAGE_KEYS.USERS_PREFIX}${username}`);
    if (!user) {
        return { success: false, error: '用户不存在' };
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
        return { success: false, error: '密码错误' };
    }

    // 更新最后登录时间
    user.lastLogin = new Date().toISOString();
    await storage.set(`${STORAGE_KEYS.USERS_PREFIX}${username}`, user);

    const token = await generateToken(username, user.isAdmin, env.AUTH_SECRET);
    return { success: true, token };
}

/**
 * 认证中间件
 */
export function authMiddleware(env: AuthEnv): MiddlewareHandler {
    return async (c: Context, next) => {
        const authHeader = c.req.header('Authorization');

        // 尝试从 Cookie 获取
        let token = authHeader?.startsWith('Bearer ')
            ? authHeader.substring(7)
            : c.req.header('Cookie')?.match(/token=([^;]+)/)?.[1];

        if (!token) {
            return c.json({ error: '未登录' }, 401);
        }

        const payload = await verifyToken(token, env.AUTH_SECRET);
        if (!payload) {
            return c.json({ error: 'Token 无效或已过期' }, 401);
        }

        c.set('user', payload);
        await next();
    };
}

/**
 * 管理员认证中间件
 */
export function adminMiddleware(): MiddlewareHandler {
    return async (c: Context, next) => {
        const user = c.get('user');
        if (!user?.isAdmin) {
            return c.json({ error: '需要管理员权限' }, 403);
        }
        await next();
    };
}
