/**
 * 存储抽象接口 - 统一 KV / 内存存储 API
 */

// 存储接口定义
export interface Storage {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, options?: { ttl?: number }): Promise<void>;
    delete(key: string): Promise<void>;
    list(prefix: string): Promise<string[]>;
}

// 存储的数据类型定义
export interface SyncResult {
    lastSync: string;           // ISO 日期时间
    nodeCount: number;          // 节点总数
    earliestExpire: string | null;  // 最早到期日期 YYYY-MM-DD
    totalRemainGB: number | null;   // 剩余流量（GB）
    rawLines: string[];         // 原始订阅行
    protocols: {                // 协议统计
        vless: number;
        trojan: number;
        shadowsocks: number;
        vmess: number;
        other: number;
    };
}

export interface User {
    username: string;
    passwordHash: string;       // bcrypt 或简单 hash
    isAdmin: boolean;
    createdAt: string;
    lastLogin?: string;
    customNote?: string;        // 管理员备注
    // 用户订阅绑定配置
    subscriptionConfig?: {
        collectionName: string;    // 组合订阅名称，如 "my-collection"
        token: string;             // 用户的 Sub-Store token，如 "miya"
    };
    // 用户专属同步结果缓存
    lastSyncResult?: {
        lastSync: string;          // 最后同步时间
        nodeCount: number;         // 节点数
        earliestExpire: string | null;  // 最早到期
        totalRemainGB: number | null;   // 剩余流量
        protocols?: {                   // 协议统计 (可选，兼容旧数据)
            vless: number;
            trojan: number;
            shadowsocks: number;
            vmess: number;
            other: number;
        };
    };
    membershipLevel?: string;   // 会员等级 (自定义名称)
}

export interface SyncLog {
    timestamp: string;
    success: boolean;
    nodeCount?: number;
    error?: string;
}

// 会员等级配置
export interface MembershipConfig {
    levels: string[]; // ["标准会员", "高级会员", "VIP"]
}

// 自动同步配置
export interface AutoSyncConfig {
    enabled: boolean;              // 是否启用自动同步
    intervalMinutes: number;       // 同步间隔（分钟）
    lastScheduledSync?: string;    // 上次计划同步时间
}

// Sub-Store 配置
export interface SubStoreConfig {
    baseUrl: string;               // Sub-Store 地址，如 "https://your-substore-domain.com"
    backendPrefix?: string;        // 后端路径前缀，如 "/your-backend-prefix"（用于访问 Sub-Store 管理 API）
    collections: SubscriptionCollection[];  // 可用订阅组合列表
}

// 订阅组合信息
export interface SubscriptionCollection {
    name: string;                  // 组合名称，如 "my-collection"
    displayName?: string;          // 显示名称（可选）
    description?: string;          // 描述（可选）
}

// 存储键常量
export const STORAGE_KEYS = {
    SYNC_RESULT: 'sync:result',
    SYNC_LOGS: 'sync:logs',
    USERS_PREFIX: 'user:',
    USERS_LIST: 'users:list',
    AUTO_SYNC_CONFIG: 'config:auto_sync',     // 自动同步配置
    SUBSTORE_CONFIG: 'config:substore',       // Sub-Store 配置
    MEMBERSHIP_CONFIG: 'config:membership',   // 会员等级配置
} as const;
