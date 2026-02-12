/**
 * 节点名解析工具 - 从节点名称中提取到期日期和剩余流量
 */

export interface ParsedNodeInfo {
    name: string;              // 原始节点名（# 后面的部分）
    expireDate?: string;       // 到期日期 YYYY-MM-DD
    remainTrafficGB?: number;  // 剩余流量（GB 单位）
}

// 到期日期正则：匹配 "到期:2026-12-31" 或 "到期：2026-12-31" 或 "到期 2026-12-31"
const expireRegex = /到期[:： ]*(\d{4}-\d{2}-\d{2})/i;

// 剩余流量正则：匹配 "剩余:50GB" 或 "剩余：50.5 TB" 等
const trafficRegex = /剩余[:： ]*([\d.]+)\s*(GB|TB|G|T)/i;

// 备用格式：exp:1234567890（Unix 时间戳）
const expUnixRegex = /exp:(\d{10,13})/i;

/**
 * 解析节点名称，提取到期日期和剩余流量
 */
export function parseNodeName(name: string): ParsedNodeInfo {
    const result: ParsedNodeInfo = { name };

    // 尝试匹配中文到期日期格式
    const expireMatch = name.match(expireRegex);
    if (expireMatch) {
        result.expireDate = expireMatch[1];
    } else {
        // 尝试匹配 Unix 时间戳格式
        const unixMatch = name.match(expUnixRegex);
        if (unixMatch) {
            const timestamp = parseInt(unixMatch[1], 10);
            // 处理毫秒/秒时间戳
            const ms = timestamp > 9999999999 ? timestamp : timestamp * 1000;
            const date = new Date(ms);
            result.expireDate = date.toISOString().split('T')[0];
        }
    }

    // 匹配剩余流量
    const trafficMatch = name.match(trafficRegex);
    if (trafficMatch) {
        let value = parseFloat(trafficMatch[1]);
        const unit = trafficMatch[2].toUpperCase();
        // 统一转换为 GB
        if (unit === 'TB' || unit === 'T') {
            value *= 1024;
        }
        result.remainTrafficGB = value;
    }

    return result;
}

/**
 * 从 URL scheme 中提取节点名称（# 后面的部分）
 */
export function extractNodeNameFromUrl(url: string): string {
    const hashIndex = url.indexOf('#');
    if (hashIndex === -1) return '';

    // URL 解码节点名
    try {
        return decodeURIComponent(url.substring(hashIndex + 1));
    } catch {
        // 解码失败则返回原始字符串
        return url.substring(hashIndex + 1);
    }
}

/**
 * 判断行是否为有效的代理 URL
 */
export function isValidProxyUrl(line: string): boolean {
    const trimmed = line.trim().toLowerCase();
    return trimmed.startsWith('vless://') ||
        trimmed.startsWith('trojan://') ||
        trimmed.startsWith('vmess://') ||
        trimmed.startsWith('ss://') ||
        trimmed.startsWith('ssr://') ||
        trimmed.startsWith('hysteria2://') ||
        trimmed.startsWith('hysteria://') ||
        trimmed.startsWith('tuic://') ||
        trimmed.startsWith('wireguard://');
}

/**
 * 获取代理协议类型
 */
export function getProtocolType(line: string): 'vless' | 'trojan' | 'other' {
    const trimmed = line.trim().toLowerCase();
    if (trimmed.startsWith('vless://')) return 'vless';
    if (trimmed.startsWith('trojan://')) return 'trojan';
    return 'other';
}
