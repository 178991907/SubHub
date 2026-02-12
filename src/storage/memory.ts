/**
 * 内存存储实现 - 用于开发和测试
 */
import type { Storage } from '../storage.js';

interface MemoryEntry {
    value: unknown;
    expireAt?: number;
}

export class MemoryStorage implements Storage {
    private store = new Map<string, MemoryEntry>();

    async get<T>(key: string): Promise<T | null> {
        const entry = this.store.get(key);
        if (!entry) return null;

        // 检查过期
        if (entry.expireAt && Date.now() > entry.expireAt) {
            this.store.delete(key);
            return null;
        }

        return entry.value as T;
    }

    async set<T>(key: string, value: T, options?: { ttl?: number }): Promise<void> {
        const entry: MemoryEntry = { value };
        if (options?.ttl) {
            entry.expireAt = Date.now() + options.ttl * 1000;
        }
        this.store.set(key, entry);
    }

    async delete(key: string): Promise<void> {
        this.store.delete(key);
    }

    async list(prefix: string): Promise<string[]> {
        const keys: string[] = [];
        for (const key of this.store.keys()) {
            if (key.startsWith(prefix)) {
                keys.push(key);
            }
        }
        return keys;
    }

    // 用于测试：清空所有数据
    clear(): void {
        this.store.clear();
    }
}

// 全局单例（用于开发环境）
export const memoryStorage = new MemoryStorage();
