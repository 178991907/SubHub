/**
 * Cloudflare KV 存储实现
 */
import type { Storage } from '../storage';

// Cloudflare KV 类型
interface KVNamespace {
    get(key: string, options?: { type?: 'text' | 'json' }): Promise<string | null>;
    put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
    delete(key: string): Promise<void>;
    list(options?: { prefix?: string }): Promise<{ keys: { name: string }[] }>;
}

export class KVStorage implements Storage {
    constructor(private kv: KVNamespace) { }

    async get<T>(key: string): Promise<T | null> {
        const value = await this.kv.get(key, { type: 'json' });
        return value as T | null;
    }

    async set<T>(key: string, value: T, options?: { ttl?: number }): Promise<void> {
        await this.kv.put(key, JSON.stringify(value), {
            expirationTtl: options?.ttl,
        });
    }

    async delete(key: string): Promise<void> {
        await this.kv.delete(key);
    }

    async list(prefix: string): Promise<string[]> {
        const result = await this.kv.list({ prefix });
        return result.keys.map((k) => k.name);
    }
}
