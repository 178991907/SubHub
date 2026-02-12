/**
 * Neon PostgreSQL 存储实现 - 用于 Vercel 部署
 * 使用单表 kv_store 模拟 KV 接口，保持与 Storage 接口完全兼容
 */
import { neon } from '@neondatabase/serverless';
import type { Storage } from '../storage';

export class NeonStorage implements Storage {
    private sql: ReturnType<typeof neon>;
    private initialized = false;

    constructor(databaseUrl: string) {
        this.sql = neon(databaseUrl);
    }

    /**
     * 首次使用时自动建表
     */
    private async ensureTable(): Promise<void> {
        if (this.initialized) return;
        await this.sql`
            CREATE TABLE IF NOT EXISTS kv_store (
                key TEXT PRIMARY KEY,
                value JSONB NOT NULL,
                expire_at TIMESTAMPTZ
            )
        `;
        this.initialized = true;
    }

    async get<T>(key: string): Promise<T | null> {
        await this.ensureTable();
        const rows = await this.sql`
            SELECT value FROM kv_store
            WHERE key = ${key}
            AND (expire_at IS NULL OR expire_at > NOW())
        ` as any[];
        if (rows.length === 0) return null;
        return rows[0].value as T;
    }

    async set<T>(key: string, value: T, options?: { ttl?: number }): Promise<void> {
        await this.ensureTable();
        const expireAt = options?.ttl
            ? new Date(Date.now() + options.ttl * 1000).toISOString()
            : null;
        await this.sql`
            INSERT INTO kv_store (key, value, expire_at)
            VALUES (${key}, ${JSON.stringify(value)}::jsonb, ${expireAt}::timestamptz)
            ON CONFLICT (key) DO UPDATE
            SET value = ${JSON.stringify(value)}::jsonb, expire_at = ${expireAt}::timestamptz
        `;
    }

    async delete(key: string): Promise<void> {
        await this.ensureTable();
        await this.sql`DELETE FROM kv_store WHERE key = ${key}`;
    }

    async list(prefix: string): Promise<string[]> {
        await this.ensureTable();
        const rows = await this.sql`
            SELECT key FROM kv_store
            WHERE key LIKE ${prefix + '%'}
            AND (expire_at IS NULL OR expire_at > NOW())
            ORDER BY key
        ` as any[];
        return rows.map((r: any) => r.key);
    }
}
