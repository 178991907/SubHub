/**
 * 前端页面路由 - SSR 渲染
 */
import { Hono } from 'hono';
import { html, raw } from 'hono/html';
import type { Storage, SyncResult, User, NotificationConfig } from '../storage.js';
import { STORAGE_KEYS } from '../storage.js';
import { verifyToken } from '../auth.js';
import type { AuthEnv } from '../auth.js';
import type { SyncEnv } from '../sync.js';


type Env = AuthEnv & SyncEnv & { storage: Storage };

// 创建页面路由
export function createPageRoutes() {
  const pages = new Hono<{ Variables: { storage: Storage; env: Env } }>();

  /**
   * GET /login - 登录页面
   */
  pages.get('/login', async (c) => {
    const storage = c.get('storage');
    // 获取通知配置
    const notificationConfig = await storage.get<{ login: { enabled: boolean; content: string; type: string } }>(STORAGE_KEYS.NOTIFICATION_CONFIG);
    return c.html(renderLoginPage(notificationConfig?.login));
  });

  /**
   * GET / - 用户主页
   */
  pages.get('/', async (c) => {
    const env = c.get('env');
    const storage = c.get('storage');

    // 检查登录状态
    const token = c.req.header('Cookie')?.match(/token=([^;]+)/)?.[1];
    if (!token) {
      return c.redirect('/login');
    }

    const payload = await verifyToken(token, env.AUTH_SECRET);
    if (!payload) {
      return c.redirect('/login');
    }

    // 获取用户数据
    const user = await storage.get<User>(`${STORAGE_KEYS.USERS_PREFIX}${payload.sub}`);

    // 获取 Sub-Store 配置（从存储或环境变量）
    const substoreConfig = await storage.get<{ baseUrl: string }>('config:substore');
    const baseUrl = substoreConfig?.baseUrl || env.SUBSTORE_SHARE_BASE || '';

    // 优先使用用户绑定的 subscriptionConfig 构建订阅链接
    let collectionName: string;
    let userToken: string;
    if (user?.subscriptionConfig) {
      collectionName = user.subscriptionConfig.collectionName;
      userToken = user.subscriptionConfig.token;
    } else {
      // 未绑定时 fallback 到全局配置
      collectionName = env.SUBSTORE_COLLECTION_NAME;
      userToken = env.SUBSTORE_TOKEN;
    }

    const encodedName = encodeURIComponent(collectionName);
    const subscriptionUrl = `${baseUrl}/share/col/${encodedName}?token=${userToken}`;

    // 获取同步数据（优先使用用户专属同步结果，fallback 到全局）
    const userSyncResult = user?.lastSyncResult || null;
    const globalSyncResult = await storage.get<SyncResult>(STORAGE_KEYS.SYNC_RESULT);
    const syncResult = userSyncResult ? {
      ...globalSyncResult,
      lastSync: userSyncResult.lastSync,
      nodeCount: userSyncResult.nodeCount,
      earliestExpire: userSyncResult.earliestExpire,
      totalRemainGB: userSyncResult.totalRemainGB,
      protocols: userSyncResult.protocols || globalSyncResult?.protocols,
    } as SyncResult : globalSyncResult;




    // 获取通知配置
    const notificationConfig = await storage.get<NotificationConfig>(STORAGE_KEYS.NOTIFICATION_CONFIG);

    return c.html(renderHomePage(payload.sub, payload.isAdmin, user?.membershipLevel, syncResult, subscriptionUrl, env, collectionName, notificationConfig?.home));
  });

  /**
   * GET /admin - 管理员页面
   */
  pages.get('/admin', async (c) => {
    const env = c.get('env');
    const storage = c.get('storage');

    // 检查管理员登录
    const token = c.req.header('Cookie')?.match(/token=([^;]+)/)?.[1];
    if (!token) {
      return c.redirect('/login');
    }

    const payload = await verifyToken(token, env.AUTH_SECRET);
    if (!payload || !payload.isAdmin) {
      return c.redirect('/login');
    }

    // 获取用户列表
    const userKeys = await storage.list(STORAGE_KEYS.USERS_PREFIX);
    const users: User[] = [];
    for (const key of userKeys) {
      const user = await storage.get<User>(key);
      if (user) users.push(user);
    }

    // 获取同步数据
    const syncResult = await storage.get<SyncResult>(STORAGE_KEYS.SYNC_RESULT);

    return c.html(renderAdminPage(env.ADMIN_USERNAME, users, syncResult, env.SYNC_SECRET));
  });

  return pages;
}

// ==================== 页面模板 ====================

function renderLoginPage(notification?: { enabled: boolean; content: string; type: string }) {
  const notificationHtml = (notification?.enabled && notification?.content)
    ? html`<div class="notification-alert ${notification.type}">${raw(notification.content)}</div>`
    : '';

  return html`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>登录 - Sub-Hub 订阅管理平台</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .login-card {
      background: white;
      border-radius: 16px;
      padding: 40px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    h1 {
      text-align: center;
      color: #333;
      margin-bottom: 30px;
      font-size: 24px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      margin-bottom: 8px;
      color: #555;
      font-weight: 500;
    }
    input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e1e5eb;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.2s;
    }
    input:focus {
      outline: none;
      border-color: #667eea;
    }
    button {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
    }
    .error {
      color: #e74c3c;
      text-align: center;
      margin-bottom: 20px;
      display: none;
    }
    .notification-alert {
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
      line-height: 1.5;
    }
    .notification-alert.info { background: #e3f2fd; color: #0d47a1; border: 1px solid #bbdefb; }
    .notification-alert.warning { background: #fff3e0; color: #e65100; border: 1px solid #ffe0b2; }
    .notification-alert.error { background: #ffebee; color: #c62828; border: 1px solid #ffcdd2; }
  </style>
</head>
<body>
  <div class="login-card">
    <h1>🔐 Sub-Hub 订阅管理平台</h1>
    ${notificationHtml}
    <div class="error" id="error"></div>
    <form id="loginForm">
      <div class="form-group">
        <label for="username">用户名</label>
        <input type="text" id="username" name="username" required autocomplete="username">
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input type="password" id="password" name="password" required autocomplete="current-password">
      </div>
      <button type="submit">登录</button>
    </form>
  </div>
  <script>
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const errorEl = document.getElementById('error');
      
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        
        if (data.success) {
          window.location.href = '/';
        } else {
          errorEl.textContent = data.error || '登录失败';
          errorEl.style.display = 'block';
        }
      } catch (err) {
        errorEl.textContent = '网络错误，请重试';
        errorEl.style.display = 'block';
      }
    });
  </script>
</body>
</html>`;
}

function renderHomePage(
  username: string,
  isAdmin: boolean,
  membershipLevel: string | undefined, // 新增参数
  syncResult: SyncResult | null,
  subscriptionUrl: string,
  env: Env,
  collectionName: string,
  notification?: { enabled: boolean; content: string; title?: string }
) {
  const lastSync = syncResult?.lastSync
    ? new Date(syncResult.lastSync).toLocaleString('zh-CN')
    : '从未同步';

  const expireInfo = syncResult?.earliestExpire
    ? `${syncResult.earliestExpire} (${getExpireLabel(syncResult.earliestExpire)})`
    : '无数据';

  return html`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>订阅中心 - Sub-Hub 订阅管理平台</title>
  <script src="https://cdn.staticfile.org/qrcode/1.4.4/qrcode.min.js" onerror="this.onerror=null;this.src='https://cdn.jsdelivr.net/npm/qrcode@1.4.4/build/qrcode.min.js'"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f5f7fa;
      min-height: 100vh;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
    }
    .header h1 { font-size: 20px; }
    .header-title {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      font-size: 20px;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header-actions { display: flex; gap: 10px; }
    .header-actions a, .header-actions button {
      background: rgba(255,255,255,0.2);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      text-decoration: none;
      cursor: pointer;
      font-size: 14px;
    }
    .header-actions a:hover, .header-actions button:hover {
      background: rgba(255,255,255,0.3);
    }
    .container {
      max-width: 800px;
      margin: 30px auto;
      padding: 0 20px;
    }
    .card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    .card-title {
      font-size: 18px;
      color: #333;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #f0f0f0;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
    }
    .stat-item {
      text-align: center;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #667eea;
    }
    .stat-label {
      font-size: 14px;
      color: #666;
      margin-top: 5px;
    }
    .qrcode-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }
    .qrcode-wrapper {
      background: white;
      padding: 15px;
      border-radius: 12px;
      border: 2px solid #e1e5eb;
      min-height: 230px; /* 预留高度防止抖动 */
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .qrcode-wrapper canvas {
      display: block;
    }
    .url-display {
      background: #f8f9fa;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 11px;
      word-break: break-all;
      max-width: 100%;
      text-align: center;
      color: #666;
    }
    .copy-btn {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 14px 40px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: transform 0.2s;
      border: none;
      cursor: pointer;
      font-size: 16px;
    }
    .copy-btn:hover {
      transform: translateY(-2px);
    }
    .copy-btn.copied {
      background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
    }
    .expire-warning { color: #e74c3c; }
    .expire-caution { color: #f39c12; }
    .expire-normal { color: #27ae60; }
    .user-info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    .info-item {
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    .info-label {
      font-size: 12px;
      color: #999;
      margin-bottom: 4px;
    }
    .info-value {
      font-size: 14px;
      color: #333;
      font-weight: 500;
    }
    .form-group {
      margin-bottom: 15px;
    }
    .form-group label {
      display: block;
      margin-bottom: 5px;
      color: #555;
      font-size: 14px;
    }
    .form-group input {
      width: 100%;
      padding: 10px 12px;
      border: 2px solid #e1e5eb;
      border-radius: 6px;
      font-size: 14px;
    }
    .form-group input:focus {
      outline: none;
      border-color: #667eea;
    }
    .btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    }
    .btn:hover {
      transform: translateY(-1px);
    }
    .message {
      padding: 10px;
      border-radius: 6px;
      margin-top: 10px;
      display: none;
    }
    .message.success { background: #d4edda; color: #155724; display: block; }
    .message.error { background: #f8d7da; color: #721c24; display: block; }
    
    .notification-card {
      background: #fff;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
      border-left: 5px solid #667eea;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    .notification-card h3 {
      margin-bottom: 15px;
      font-size: 18px;
      color: #333;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .notification-content {
      font-size: 15px;
      line-height: 1.6;
      color: #555;
    }
    .notification-content img {
      max-width: 100%;
      border-radius: 8px;
      margin-top: 10px;
    }

    .toast {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 24px;
      border-radius: 24px;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s;
      pointer-events: none;
      font-size: 14px;
    }
    .toast.show { opacity: 1; }
  </style>
</head>
<body>
  <div id="toast" class="toast"></div>
  <div class="header">
    <h1>👋 欢迎，${username}</h1>
    <div class="header-title">Sub-Hub 订阅管理平台</div>
    <div class="header-actions">
      ${isAdmin ? html`<a href="/admin">管理后台</a>` : ''}
      <button onclick="logout()">退出登录</button>
    </div>
  </div>
  
  <div class="container">
    ${(notification?.enabled && notification?.content) ? html`
    <div class="notification-card">
      ${notification.title ? html`<h3>📢 ${notification.title}</h3>` : ''}
      <div class="notification-content">${raw(notification.content)}</div>
    </div>
    ` : ''}

    <div class="card">
      <h2 class="card-title">👤 用户信息</h2>
      <div class="user-info-grid">
        <div class="info-item">
          <div class="info-label">用户名</div>
          <div class="info-value">${username}</div>
        </div>
        <div class="info-item">
          <div class="info-label">角色</div>
          <div class="info-value">${membershipLevel || (isAdmin ? '管理员' : '普通用户')}</div>
        </div>
        <div class="info-item">
          <div class="info-label">订阅来源</div>
          <div class="info-value">${collectionName}</div>
        </div>
        <div class="info-item">
          <div class="info-label">节点数量</div>
          <div class="info-value">${syncResult?.nodeCount || 0} 个</div>
        </div>
      </div>
    </div>
    
    <div class="card">
      <h2 class="card-title">📊 订阅统计</h2>
      <div class="stats-grid" style="grid-template-columns: repeat(2, 1fr); margin-bottom: 20px;">
        <div class="stat-item">
          <div class="stat-value">${syncResult?.nodeCount || 0}</div>
          <div class="stat-label">节点数量</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${syncResult?.totalRemainGB ? `${syncResult.totalRemainGB}GB` : '无限流量'}</div>
          <div class="stat-label">剩余流量</div>
        </div>
      </div>
      
      <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr);">
        <div class="stat-item">
          <div class="stat-value">${syncResult?.protocols?.vless || 0}</div>
          <div class="stat-label">VLESS</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${syncResult?.protocols?.trojan || 0}</div>
          <div class="stat-label">Trojan</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${syncResult?.protocols?.shadowsocks || 0}</div>
          <div class="stat-label">Shadowsocks</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${syncResult?.protocols?.vmess || 0}</div>
          <div class="stat-label">VMess</div>
        </div>
      </div>
    </div>
    
    <div class="card">
      <h2 class="card-title">
        ⏰ 同步信息
        <button class="btn btn-sm" id="syncBtn" onclick="syncNow()" style="float: right; font-size: 12px; padding: 4px 10px;">🔄 立即同步</button>
      </h2>
      <p><strong>最后同步:</strong> ${lastSync}</p>
      <p><strong>最早到期:</strong> <span class="${getExpireClass(syncResult?.earliestExpire)}">${expireInfo}</span></p>
    </div>
    
    <div class="card">
      <h2 class="card-title">📱 订阅二维码</h2>
      <div class="qrcode-section">
        <div class="qrcode-wrapper">
          <canvas id="qrcode-canvas"></canvas>
        </div>
        <!-- 安全传递数据：使用 hidden input 避免 JS 语法错误 -->
        <input type="hidden" id="sub-url-data" value="${subscriptionUrl}">
        <div class="url-display">${subscriptionUrl}</div>
        <button class="copy-btn" id="copyBtn" onclick="copySubscriptionUrl()">📋 复制订阅链接</button>
      </div>
    </div>
    
    <div class="card">
      <h2 class="card-title">🔐 修改密码</h2>
      <form id="passwordForm" onsubmit="changePassword(event)">
        <div class="form-group">
          <label for="currentPassword">当前密码</label>
          <input type="password" id="currentPassword" required>
        </div>
        <div class="form-group">
          <label for="newPassword">新密码</label>
          <input type="password" id="newPassword" required minlength="6">
        </div>
        <div class="form-group">
          <label for="confirmPassword">确认新密码</label>
          <input type="password" id="confirmPassword" required minlength="6">
        </div>
        <button type="submit" class="btn">修改密码</button>
        <div id="passwordMessage" class="message"></div>
      </form>
    </div>
  </div>
  
  <script>
    // 从 DOM 读取 URL，避免模板插值导致的 SyntaxError
    const SUBSCRIPTION_URL = document.getElementById('sub-url-data').value;
    
    function showToast(message, duration = 2000) {
      const toast = document.getElementById('toast');
      toast.textContent = message;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, duration);
    }

    // 生成二维码 (防抖 + 确保 DOM 加载)
    function generateQRCode() {
      const canvas = document.getElementById('qrcode-canvas');
      if (!canvas || !window.QRCode) {
        if (typeof window.QRCode === 'undefined') {
            console.warn('QRCode library loading...');
        }
        setTimeout(generateQRCode, 500);
        return;
      }

      try {
        QRCode.toCanvas(canvas, SUBSCRIPTION_URL, { 
          width: 200, 
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff'
          },
          errorCorrectionLevel: 'M'
        }, function (error) {
          if (error) {
             // 忽略
          }
        });
      } catch (e) {
         // 忽略
      }
    }

    if (document.readyState === 'complete') {
      generateQRCode();
    } else {
      window.addEventListener('load', generateQRCode);
    }
    
    async function logout() {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    }

    async function syncNow() {
      const btn = document.getElementById('syncBtn');
      const originalText = btn.textContent;
      btn.textContent = '⏳ 同步中...';
      btn.disabled = true;

      try {
        const res = await fetch('/api/subscription/sync', { method: 'POST' });
        const data = await res.json();

        if (data.success) {
          showToast('同步成功！发现 ' + data.count + ' 个节点');
          setTimeout(() => {
             window.location.reload();
          }, 1500);
        } else {
          alert('同步失败: ' + (data.error || '未知错误'));
          btn.textContent = originalText;
          btn.disabled = false;
        }
      } catch (e) {
        alert('同步请求失败: ' + e.message);
        btn.textContent = originalText;
        btn.disabled = false;
      }
    }
    
    function copySubscriptionUrl() {
      navigator.clipboard.writeText(SUBSCRIPTION_URL).then(() => {
        const btn = document.getElementById('copyBtn');
        btn.textContent = '✅ 已复制';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = '📋 复制订阅链接';
          btn.classList.remove('copied');
        }, 2000);
      });
    }
    
    
    async function changePassword(e) {
      e.preventDefault();
      const msgEl = document.getElementById('passwordMessage');
      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      
      if (newPassword !== confirmPassword) {
        msgEl.textContent = '两次输入的新密码不一致';
        msgEl.className = 'message error';
        return;
      }
      
      try {
        const res = await fetch('/api/me/password', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPassword, newPassword }),
        });
        const data = await res.json();
        
        if (data.success) {
          msgEl.textContent = '密码修改成功';
          msgEl.className = 'message success';
          document.getElementById('passwordForm').reset();
        } else {
          msgEl.textContent = data.error || '密码修改失败';
          msgEl.className = 'message error';
        }
      } catch (err) {
        msgEl.textContent = '网络错误';
        msgEl.className = 'message error';
      }
    }
  </script>
</body>
</html>`;
}

function renderAdminPage(
  adminUsername: string,
  users: User[],
  syncResult: SyncResult | null,
  syncSecret: string
) {
  return html`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>管理后台 - Sub-Hub 订阅管理平台</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f5f7fa;
      min-height: 100vh;
    }
    .header {
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
      color: white;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
    }
    .header h1 { font-size: 20px; }
    .header-title {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      font-size: 20px;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header-actions { display: flex; gap: 10px; }
    .header-actions a, .header-actions button {
      background: rgba(255,255,255,0.2);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      text-decoration: none;
      cursor: pointer;
      font-size: 14px;
    }
    .container {
      max-width: 1000px;
      margin: 30px auto;
      padding: 0 20px;
    }
    .card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    .card-title {
      font-size: 18px;
      color: #333;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    }
    .btn-danger { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); }
    .btn-success { background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); }
    .btn-sm { padding: 6px 12px; font-size: 12px; }
    .users-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    .user-card {
      border: 1px solid #e1e5eb;
      border-radius: 10px;
      padding: 16px;
      position: relative;
    }
    .user-card.admin-card {
      border-color: #e74c3c;
      background: #fff5f5;
    }
    .user-name {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .user-info {
      font-size: 13px;
      color: #666;
      margin-bottom: 4px;
    }
    .subscription-info {
      background: #f8f9fa;
      padding: 10px;
      border-radius: 6px;
      margin: 10px 0;
      font-size: 12px;
    }
    .subscription-info .label { color: #999; margin-right: 4px; }
    .tag {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      margin-left: 8px;
    }
    .tag-admin { background: #e74c3c; color: white; }
    .tag-expired { background: #e74c3c; color: white; }
    .tag-warning { background: #f39c12; color: white; }
    .tag-normal { background: #27ae60; color: white; }
    .tag-no-sub { background: #95a5a6; color: white; }
    .actions { margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap; }
    .actions button {
      flex: 1;
      min-width: 60px;
      padding: 6px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
    .actions button:hover { background: #f5f5f5; }
    .sync-result {
      padding: 10px;
      border-radius: 6px;
      margin-top: 10px;
      display: none;
    }
    .sync-success { background: #d4edda; color: #155724; }
    .sync-error { background: #f8d7da; color: #721c24; }
    /* 模态框样式 */
    .modal {
      display: none;
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 1000;
      align-items: center;
      justify-content: center;
    }
    .modal.active { display: flex; }
    .modal-content {
      background: white;
      border-radius: 12px;
      padding: 24px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }
    .modal-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .form-group {
      margin-bottom: 16px;
    }
    .form-group label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 6px;
      color: #333;
    }
    .form-group input, .form-group textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
    }
    .form-group input:focus, .form-group textarea:focus {
      outline: none;
      border-color: #667eea;
    }
    .form-group small {
      display: block;
      margin-top: 4px;
      color: #999;
      font-size: 12px;
    }
    .form-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 20px;
    }
    .form-actions button {
      padding: 10px 24px;
    }
    /* 自动同步配置 */
    .sync-config {
      display: flex;
      align-items: center;
      gap: 15px;
      flex-wrap: wrap;
    }
    .sync-config label {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
    }
    .sync-config select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
    }
    /* Toast 通知样式 */
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .toast {
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: toastIn 0.3s ease, toastOut 0.3s ease 2.5s forwards;
      max-width: 350px;
    }
    .toast-success { background: linear-gradient(135deg, #27ae60, #2ecc71); }
    .toast-error { background: linear-gradient(135deg, #e74c3c, #c0392b); }
    .toast-info { background: linear-gradient(135deg, #3498db, #2980b9); }
    @keyframes toastIn { from { opacity: 0; transform: translateX(100px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes toastOut { from { opacity: 1; } to { opacity: 0; transform: translateY(-20px); } }
    /* 同步结果样式 */
    .sync-result {
      display: none;
      padding: 10px 16px;
      border-radius: 8px;
      margin-bottom: 12px;
      font-size: 13px;
      font-weight: 500;
    }
    .sync-result.sync-success { background: #d4edda; color: #155724; display: block; }
    .sync-result.sync-error { background: #f8d7da; color: #721c24; display: block; }
  </style>
</head>
<body>
  <div class="toast-container" id="toastContainer"></div>
  <div class="header">
    <h1>🔧 管理后台</h1>
    <div class="header-title">Sub-Hub 订阅管理平台</div>
    <div class="header-actions">
      <a href="/">返回主页</a>
      <button onclick="logout()">退出登录</button>
    </div>
  </div>
  
  <div class="container">
    <!-- 快速操作区 -->
    <div class="card">
      <div class="card-title">
        <span>⚡ 快速操作</span>
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button class="btn" onclick="openModal('notificationModal')">📢 网站通知配置</button>
        <button class="btn" onclick="showAddUserModal()">➕ 添加用户</button>
        <button class="btn btn-success" onclick="syncAllUsers()">🔄 全局同步</button>
        <a href="/api/admin/export" class="btn" style="text-decoration: none;">📥 导出 CSV</a>
        <button class="btn" onclick="showSubstoreConfig()" style="background:linear-gradient(135deg,#f39c12 0%,#e67e22 100%);">🔧 Sub-Store 配置</button>
        <button class="btn" onclick="showMembershipConfig()" style="background:linear-gradient(135deg,#9b59b6 0%,#8e44ad 100%);">👑 会员等级配置</button>
      </div>
      <div id="syncResult" class="sync-result"></div>
    </div>

    
    <!-- 自动同步配置 -->
    <div class="card" id="autoSyncConfigCard">
      <div class="card-title">
        <span>⏰ 自动同步配置</span>
      </div>
      <div class="sync-config">
        <label>
          <input type="checkbox" id="autoSyncEnabled" onchange="updateAutoSync()">
          启用自动同步
        </label>
        <select id="syncInterval" onchange="updateAutoSync()">
          <option value="15">每 15 分钟</option>
          <option value="30" selected>每 30 分钟</option>
          <option value="60">每小时</option>
          <option value="360">每 6 小时</option>
          <option value="1440">每天</option>
        </select>
        <span id="lastSyncTime" style="color:#666;font-size:13px;"></span>
      </div>
    </div>
    
    <!-- 待分配的分享 Token -->
    <div class="card" id="unboundTokensCard">
      <div class="card-title">
        <span>🎫 待分配的分享 Token</span>
        <button class="btn btn-sm" onclick="loadUnboundTokens()" style="font-size:12px;padding:4px 12px;">🔄 刷新</button>
      </div>
      <!-- 工具栏：搜索/筛选/排序/视图切换 -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;align-items:center;">
        <input type="text" id="tokenSearch" placeholder="🔍 搜索 Token / 名称 / 备注..." oninput="filterTokens()" style="flex:1;min-width:180px;padding:8px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px;">
        <select id="tokenFilter" onchange="filterTokens()" style="padding:8px;border:1px solid #ddd;border-radius:6px;font-size:13px;">
          <option value="all">全部</option>
          <option value="expired">已过期</option>
          <option value="7days">7天内到期</option>
          <option value="30days">30天内到期</option>
          <option value="valid">有效</option>
        </select>
        <select id="tokenSort" onchange="filterTokens()" style="padding:8px;border:1px solid #ddd;border-radius:6px;font-size:13px;">
          <option value="created_desc">创建时间 ↓</option>
          <option value="created_asc">创建时间 ↑</option>
          <option value="expire_asc">有效期 ↑</option>
          <option value="expire_desc">有效期 ↓</option>
        </select>
        <div style="display:flex;border:1px solid #ddd;border-radius:6px;overflow:hidden;">
          <button id="viewCard" onclick="switchTokenView('card')" style="padding:6px 10px;border:none;cursor:pointer;background:#667eea;color:white;font-size:12px;">卡片</button>
          <button id="viewList" onclick="switchTokenView('list')" style="padding:6px 10px;border:none;cursor:pointer;background:white;color:#333;font-size:12px;">列表</button>
        </div>
      </div>
      <div id="unboundTokensStatus" style="color:#999;text-align:center;padding:16px;font-size:13px;">
        加载中...
      </div>
      <div id="unboundTokensGrid" class="users-grid" style="display:none;"></div>
    </div>
    
    <div class="card">
      <div class="card-title">
        <span>👥 用户列表（<span id="userCountLabel">${users.length + 1}</span> 位用户）</span>
        <button class="btn btn-success btn-sm" onclick="syncBoundUsers()" style="font-size:12px;padding:4px 14px;">🔄 同步所有已绑定</button>
      </div>
      <div id="syncBoundResult" class="sync-result"></div>
      <!-- 用户搜索/排序/视图切换工具栏 -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;align-items:center;">
        <input type="text" id="userSearch" placeholder="🔍 搜索用户名 / 备注 / Token..." oninput="filterUsers()" style="flex:1;min-width:180px;padding:8px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px;">
        <select id="userSort" onchange="filterUsers()" style="padding:8px;border:1px solid #ddd;border-radius:6px;font-size:13px;">
          <option value="created_desc">创建时间 ↓</option>
          <option value="created_asc">创建时间 ↑</option>
          <option value="login_desc">最后登录 ↓</option>
          <option value="name_asc">用户名 A-Z</option>
        </select>
        <select id="userFilter" onchange="filterUsers()" style="padding:8px;border:1px solid #ddd;border-radius:6px;font-size:13px;">
          <option value="all">全部</option>
          <option value="bound">已绑定</option>
          <option value="unbound">未绑定</option>
        </select>
        <div style="display:flex;border:1px solid #ddd;border-radius:6px;overflow:hidden;">
          <button id="userViewCard" onclick="switchUserView('card')" style="padding:6px 10px;border:none;cursor:pointer;background:#667eea;color:white;font-size:12px;">卡片</button>
          <button id="userViewList" onclick="switchUserView('list')" style="padding:6px 10px;border:none;cursor:pointer;background:white;color:#333;font-size:12px;">列表</button>
        </div>
      </div>
      <div id="usersGrid" class="users-grid">
        <!-- 管理员卡片（固定） -->
        <div class="user-card admin-card">
          <div class="user-name">${adminUsername} <span class="tag tag-admin">管理员</span></div>
          <div class="user-info">系统管理员账户</div>
          <div class="subscription-info">
            <div><span class="label">全局节点:</span> ${syncResult?.nodeCount || 0} 个</div>
            <div><span class="label">最早到期:</span> ${syncResult?.earliestExpire || '未知'}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 通知配置模态框 -->
  <div class="modal" id="notificationModal">
    <div class="modal-content" style="max-width: 600px;">
      <h3 class="modal-title">📢 网站通知配置</h3>
      <form id="notificationForm" onsubmit="saveNotificationConfig(event)">
        <div style="display: flex; border-bottom: 1px solid #ddd; margin-bottom: 20px;">
          <div class="tab-item active" onclick="switchTab(this, 'login-notify')" style="padding: 10px 20px; cursor: pointer; border-bottom: 2px solid #667eea; color: #667eea;">登录页通知</div>
          <div class="tab-item" onclick="switchTab(this, 'home-notify')" style="padding: 10px 20px; cursor: pointer; border-bottom: 2px solid transparent;">首页公告</div>
        </div>

        <div id="login-notify" class="tab-content">
          <div class="form-group">
            <label>
              <input type="checkbox" id="loginEnabled"> 启用登录页通知
            </label>
          </div>
          <div class="form-group">
            <label>通知类型</label>
            <select id="loginType" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;">
              <option value="info">Info (蓝色)</option>
              <option value="warning">Warning (黄色)</option>
              <option value="error">Error (红色)</option>
            </select>
          </div>
          <div class="form-group">
            <label>通知内容 (支持 HTML)</label>
            <textarea id="loginContent" rows="4"></textarea>
          </div>
        </div>

        <div id="home-notify" class="tab-content" style="display: none;">
          <div class="form-group">
            <label>
              <input type="checkbox" id="homeEnabled"> 启用首页公告
            </label>
          </div>
          <div class="form-group">
            <label>公告标题</label>
            <input type="text" id="homeTitle" placeholder="例如：维护通知">
          </div>
          <div class="form-group">
            <label>公告内容 (支持 HTML，可插入图片)</label>
            <textarea id="homeContent" rows="6" placeholder="<p>内容...</p><img src='...'>"></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-danger" onclick="closeModal('notificationModal')">取消</button>
          <button type="submit" class="btn">保存配置</button>
        </div>
      </form>
    </div>
  </div>

  <!-- 添加用户模态框 -->
  <div class="modal" id="addUserModal">
    <div class="modal-content">
      <div class="modal-title">➕ 添加新用户</div>
      <form id="addUserForm" onsubmit="submitAddUser(event)">
        <div class="form-group">
          <label>用户名 *</label>
          <input type="text" name="username" required placeholder="输入用户名">
        </div>
        <div class="form-group">
          <label>密码 *</label>
          <input type="password" name="password" required placeholder="输入密码（至少 6 位）" minlength="6">
        </div>
        <div class="form-group">
          <label>绑定分享 Token</label>
          <select name="shareToken" id="addUserTokenSelect" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;">
            <option value="">-- 不绑定 --</option>
          </select>
          <small>从待分配的分享 Token 中选择，创建用户后将自动绑定</small>
        </div>
        <div class="form-group">
          <label>会员等级</label>
          <select name="membershipLevel" id="addUserMembershipSelect" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;">
            <option value="">默认 (普通用户)</option>
          </select>
        </div>
        <div class="form-group">
          <label>备注</label>
          <textarea name="customNote" rows="2" placeholder="可选备注信息"></textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-danger" onclick="closeModal('addUserModal')">取消</button>
          <button type="submit" class="btn btn-success">创建用户</button>
        </div>
      </form>
    </div>
  </div>
  
  <!-- 编辑用户模态框 -->
  <div class="modal" id="editUserModal">
    <div class="modal-content">
      <div class="modal-title">✏️ 编辑用户</div>
      <form id="editUserForm" onsubmit="submitEditUser(event)">
        <input type="hidden" name="username" id="editUserUsername">
        <div class="form-group">
          <label>用户名</label>
          <input type="text" id="editUserUsernameDisplay" disabled style="background:#f5f5f5;">
        </div>
        <div class="form-group">
          <label>新密码 (留空则不修改)</label>
          <input type="password" name="password" placeholder="输入新密码">
        </div>
        <div class="form-group">
          <label>会员等级</label>
          <select name="membershipLevel" id="editUserMembershipSelect" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;">
            <option value="">默认 (普通用户)</option>
          </select>
        </div>
        <div class="form-group">
          <label>备注</label>
          <textarea name="customNote" id="editUserNote" rows="2" placeholder="可选备注信息"></textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-danger" onclick="closeModal('editUserModal')">取消</button>
          <button type="submit" class="btn btn-success">保存修改</button>
        </div>
      </form>
    </div>
  </div>

  <!-- 会员等级配置模态框 -->
  <div class="modal" id="membershipConfigModal">
    <div class="modal-content">
      <div class="modal-title">👑 会员等级配置</div>
      <div class="form-group">
        <label>现有等级 (可通过拖拽排序)</label>
        <div id="membershipLevelsList" style="max-height:200px;overflow-y:auto;border:1px solid #ddd;border-radius:6px;padding:10px;margin-bottom:10px;">
          <div style="color:#999;text-align:center;">加载中...</div>
        </div>
      </div>
      <div class="form-group">
        <label>添加新等级</label>
        <div style="display:flex;gap:8px;">
          <input type="text" id="newMembershipLevel" placeholder="输入等级名称" style="flex:1;">
          <button type="button" class="btn btn-sm" onclick="addMembershipLevel()">添加</button>
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-danger" onclick="closeModal('membershipConfigModal')">关闭</button>
        <button type="button" class="btn btn-success" onclick="saveMembershipConfig()">保存配置</button>
      </div>
    </div>
  </div>
  
  <!-- 绑定订阅模态框 -->
  <div class="modal" id="bindSubModal">
    <div class="modal-content">
      <div class="modal-title">🔗 绑定分享 Token</div>
      <form id="bindSubForm" onsubmit="submitBindSub(event)">
        <input type="hidden" name="username" id="bindSubUsername">
        <div class="form-group">
          <label>选择分享 Token *</label>
          <select name="shareToken" id="bindTokenSelect" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;">
            <option value="">-- 请选择待分配的 Token --</option>
          </select>
          <small>从待分配的分享 Token 中选择</small>
        </div>
        <div id="bindTokenPreview" style="display:none;background:#f8f9fa;padding:10px;border-radius:6px;margin-bottom:12px;font-size:12px;"></div>
        <div class="form-actions">
          <button type="button" class="btn btn-danger" onclick="closeModal('bindSubModal')">取消</button>
          <button type="submit" class="btn btn-success">保存绑定</button>
        </div>
      </form>
    </div>
  </div>
  
  <!-- Sub-Store 配置模态框 -->
  <div class="modal" id="substoreConfigModal">
    <div class="modal-content" style="max-width:650px;">
      <div class="modal-title">🔧 Sub-Store 配置</div>
      <form id="substoreConfigForm" onsubmit="submitSubstoreConfig(event)">
        <div class="form-group">
          <label>Sub-Store 地址 *</label>
          <input type="url" name="baseUrl" id="substoreBaseUrl" required placeholder="https://sub.example.com">
          <small>你的 Sub-Store 服务地址</small>
        </div>
        <div class="form-group">
          <label>后端路径前缀</label>
          <div style="display:flex;gap:8px;">
            <input type="text" id="substoreBackendPrefix" placeholder="/your-backend-prefix" style="flex:1;">
            <button type="button" class="btn btn-sm" onclick="testSubstoreConnection()" style="white-space:nowrap;">🔗 测试</button>
          </div>
          <small>Sub-Store 后端 API 路径前缀（如 /your-backend-prefix），用于查询分享信息</small>
          <div id="connectionTestResult" style="margin-top:4px;font-size:12px;display:none;"></div>
        </div>
        
        <!-- 分享用户查询 -->
        <div class="form-group">
          <label style="display:flex;justify-content:space-between;align-items:center;">
            <span>📤 分享用户（Token 列表）</span>
            <button type="button" class="btn btn-sm btn-success" onclick="queryShareTokens()" style="font-size:11px;padding:4px 10px;">🔍 查询分享用户</button>
          </label>
          <div id="shareTokensList" style="max-height:250px;overflow-y:auto;border:1px solid #ddd;border-radius:6px;padding:10px;">
            <div style="color:#999;text-align:center;font-size:13px;">点击「查询分享用户」从 Sub-Store 获取</div>
          </div>
        </div>

        <!-- 可用订阅组合 -->
        <div class="form-group">
          <label style="display:flex;justify-content:space-between;align-items:center;">
            <span>可用订阅组合</span>
            <button type="button" class="btn btn-sm" onclick="fetchRemoteCollections()" style="font-size:11px;padding:4px 10px;">📥 从远程获取</button>
          </label>
          <div id="collectionsList" style="max-height:200px;overflow-y:auto;border:1px solid #ddd;border-radius:6px;padding:10px;margin-bottom:10px;">
            <div style="color:#999;text-align:center;">暂无订阅组合</div>
          </div>
        </div>
        <div class="form-group">
          <label>添加新组合</label>
          <div style="display:flex;gap:8px;">
            <input type="text" id="newCollectionName" placeholder="输入组合名称" style="flex:1;">
            <button type="button" class="btn btn-sm" onclick="addCollection()">添加</button>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-danger" onclick="closeModal('substoreConfigModal')">关闭</button>
          <button type="submit" class="btn btn-success">保存配置</button>
        </div>
      </form>
    </div>
  </div>
  
  <!-- 不可见的数据容器 -->
  <script id="server-data-users" type="application/json">
    ${raw(JSON.stringify(users.map(u => ({
    username: u.username,
    isAdmin: u.isAdmin,
    createdAt: u.createdAt,
    lastLogin: u.lastLogin,
    customNote: u.customNote,
    membershipLevel: (u as any).membershipLevel,
    subscriptionConfig: (u as any).subscriptionConfig || null,
    lastSyncResult: (u as any).lastSyncResult || null,
  })) || []).replace(/</g, '\\u003c'))}
  </script>
  
  <script>
      // ===== Toast 通知函数 =====
      function showToast(message, type) {
        type = type || 'success';
        var container = document.getElementById('toastContainer');
        var toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(function() { toast.remove(); }, 3000);
      }

      // ===== 全局数据初始化 =====
      var allUsersData = [];
      var allUnboundTokensData = [];
      var currentTokenView = 'card';
      
      try {
        var usersDataEl = document.getElementById('server-data-users');
        if (usersDataEl) {
          allUsersData = JSON.parse(usersDataEl.textContent);
        }
      } catch (e) {
        console.error('Failed to parse server data', e);
      }
    
    // 页面加载
    document.addEventListener('DOMContentLoaded', function() {
      loadAutoSyncConfig();
      // 恢复视图模式按钮状态
      if (currentUserView === 'list') {
        document.getElementById('userViewCard').style.background = 'white';
        document.getElementById('userViewCard').style.color = '#333';
        document.getElementById('userViewList').style.background = '#667eea';
        document.getElementById('userViewList').style.color = 'white';
      }
      renderUserCards();
      loadUnboundTokens();
    });
    
    // ===== 自动同步配置 =====
    async function loadAutoSyncConfig() {
      try {
        const res = await fetch('/api/admin/sync/config');
        const config = await res.json();
        document.getElementById('autoSyncEnabled').checked = config.enabled;
        document.getElementById('syncInterval').value = config.intervalMinutes || 30;
        if (config.lastScheduledSync) {
          document.getElementById('lastSyncTime').textContent = 
            '上次同步: ' + new Date(config.lastScheduledSync).toLocaleString('zh-CN');
        }
      } catch (err) { console.error('加载同步配置失败', err); }
    }
    
    async function updateAutoSync() {
      var enabled = document.getElementById('autoSyncEnabled').checked;
      var intervalMinutes = parseInt(document.getElementById('syncInterval').value);
      try {
        await fetch('/api/admin/sync/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled: enabled, intervalMinutes: intervalMinutes }),
        });
      } catch (err) { alert('更新配置失败'); }
    }
    
    // ===== 全局同步（合并后） =====
    async function syncAllUsers() {
      var resultEl = document.getElementById('syncResult');
      resultEl.style.display = 'block';
      resultEl.className = 'sync-result';
      resultEl.textContent = '🔄 正在全局同步所有用户...';
      try {
        var res = await fetch('/api/admin/sync/all', { method: 'POST' });
        var data = await res.json();
        if (data.error) {
          resultEl.className = 'sync-result sync-error';
          resultEl.textContent = '❌ ' + data.error;
        } else {
          resultEl.className = 'sync-result sync-success';
          resultEl.textContent = '✅ 同步完成！共 ' + data.total + ' 个用户，已绑定 ' + (data.synced||0) + ' 个，成功 ' + data.success + '，失败 ' + data.failed;
          setTimeout(function(){ location.reload(); }, 2000);
        }
      } catch (err) {
        resultEl.className = 'sync-result sync-error';
        resultEl.textContent = '❌ 网络错误';
      }
    }
    
    async function syncUser(username) {
      var resultEl = document.getElementById('syncResult');
      resultEl.style.display = 'block';
      resultEl.className = 'sync-result';
      resultEl.textContent = '正在同步 ' + username + '...';
      try {
        var res = await fetch('/api/admin/users/' + username + '/sync', { method: 'POST' });
        var data = await res.json();
        if (data.success) {
          resultEl.className = 'sync-result sync-success';
          resultEl.textContent = '✅ 同步成功！节点数: ' + data.nodeCount;
          setTimeout(function(){ location.reload(); }, 1500);
        } else {
          resultEl.className = 'sync-result sync-error';
          resultEl.textContent = '❌ 同步失败: ' + data.error;
        }
      } catch (err) {
        resultEl.className = 'sync-result sync-error';
        resultEl.textContent = '❌ 网络错误';
      }
    }
    
    // ===== 用户列表动态渲染 =====
    var currentUserView = sessionStorage.getItem('userViewMode') || 'card';
    
    function getExpireTagHtml(earliestExpire) {
      if (!earliestExpire) return '<span class="tag tag-warning">待同步</span>';
      var now = new Date();
      var exp = new Date(earliestExpire);
      var diffDays = Math.ceil((exp - now) / (1000*60*60*24));
      if (diffDays < 0) return '<span class="tag" style="background:#e74c3c;color:#fff;">已过期</span>';
      if (diffDays <= 7) return '<span class="tag" style="background:#e67e22;color:#fff;">' + diffDays + '天</span>';
      if (diffDays <= 30) return '<span class="tag" style="background:#f39c12;color:#fff;">' + diffDays + '天</span>';
      return '<span class="tag" style="background:#27ae60;color:#fff;">' + diffDays + '天</span>';
    }
    
    function switchUserView(view) {
      currentUserView = view;
      sessionStorage.setItem('userViewMode', view);
      document.getElementById('userViewCard').style.background = view === 'card' ? '#667eea' : 'white';
      document.getElementById('userViewCard').style.color = view === 'card' ? 'white' : '#333';
      document.getElementById('userViewList').style.background = view === 'list' ? '#667eea' : 'white';
      document.getElementById('userViewList').style.color = view === 'list' ? 'white' : '#333';
      renderUserCards();
    }
    
    function renderUserCards() {
      var search = (document.getElementById('userSearch').value || '').toLowerCase();
      var sort = document.getElementById('userSort').value;
      var filter = document.getElementById('userFilter').value;
      
      var filtered = allUsersData.filter(function(u) {
        if (filter === 'bound' && !u.subscriptionConfig) return false;
        if (filter === 'unbound' && u.subscriptionConfig) return false;
        if (search) {
          var haystack = (u.username + ' ' + (u.customNote||'') + ' ' + (u.subscriptionConfig ? u.subscriptionConfig.token + ' ' + u.subscriptionConfig.collectionName : '')).toLowerCase();
          if (haystack.indexOf(search) === -1) return false;
        }
        return true;
      });
      
      filtered.sort(function(a, b) {
        if (sort === 'created_desc') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sort === 'created_asc') return new Date(a.createdAt) - new Date(b.createdAt);
        if (sort === 'login_desc') return new Date(b.lastLogin||0) - new Date(a.lastLogin||0);
        if (sort === 'name_asc') return a.username.localeCompare(b.username);
        return 0;
      });
      
      document.getElementById('userCountLabel').textContent = filtered.length + 1;
      
      var grid = document.getElementById('usersGrid');
      var adminCard = grid.querySelector('.admin-card');
      grid.innerHTML = '';
      
      if (currentUserView === 'list') {
        // 列表（表格）视图
        grid.style.display = 'block';
        grid.className = '';
        var html = '<table style="width:100%;border-collapse:collapse;font-size:13px;">' +
          '<thead><tr style="background:#f8f9fa;text-align:left;">' +
          '<th style="padding:10px 8px;border-bottom:2px solid #ddd;">用户名</th>' +
          '<th style="padding:10px 8px;border-bottom:2px solid #ddd;">组合</th>' +
          '<th style="padding:10px 8px;border-bottom:2px solid #ddd;">Token</th>' +
          '<th style="padding:10px 8px;border-bottom:2px solid #ddd;">节点</th>' +
          '<th style="padding:10px 8px;border-bottom:2px solid #ddd;">状态</th>' +
          '<th style="padding:10px 8px;border-bottom:2px solid #ddd;">最后同步</th>' +
          '<th style="padding:10px 8px;border-bottom:2px solid #ddd;">操作</th>' +
          '</tr></thead><tbody>';
        
        filtered.forEach(function(u) {
          var subTag = '';
          if (u.subscriptionConfig) {
            subTag = u.lastSyncResult ? getExpireTagHtml(u.lastSyncResult.earliestExpire) : '<span class="tag tag-warning">待同步</span>';
          } else {
            subTag = '<span class="tag tag-no-sub">未绑定</span>';
          }
          html += '<tr style="border-bottom:1px solid #eee;">' +
            '<td style="padding:8px;font-weight:500;">' + u.username + (u.customNote ? ' <span style="color:#999;font-size:11px;">(' + u.customNote + ')</span>' : '') + '</td>' +
            '<td style="padding:8px;">' + (u.subscriptionConfig ? u.subscriptionConfig.collectionName : '-') + '</td>' +
            '<td style="padding:8px;"><code style="font-size:11px;background:#f0f0f0;padding:1px 4px;border-radius:3px;">' + (u.subscriptionConfig ? u.subscriptionConfig.token : '-') + '</code></td>' +
            '<td style="padding:8px;">' + (u.lastSyncResult ? u.lastSyncResult.nodeCount + ' 个' : '-') + '</td>' +
            '<td style="padding:8px;">' + subTag + '</td>' +
            '<td style="padding:8px;font-size:12px;color:#666;">' + (u.lastSyncResult ? new Date(u.lastSyncResult.lastSync).toLocaleString('zh-CN') : '-') + '</td>' +
            '<td style="padding:8px;white-space:nowrap;">' +
              '<button onclick="editUser(\\\'' + u.username + '\\\')" style="border:1px solid #ddd;background:white;border-radius:4px;cursor:pointer;padding:3px 8px;font-size:11px;margin-right:4px;">✏️</button>' +
              '<button onclick="bindSubscription(\\\'' + u.username + '\\\')" style="border:1px solid #ddd;background:white;border-radius:4px;cursor:pointer;padding:3px 8px;font-size:11px;margin-right:4px;">🔗</button>' +
              '<button onclick="syncUser(\\\'' + u.username + '\\\')"' + (!u.subscriptionConfig ? ' disabled' : '') + ' style="border:1px solid #ddd;background:white;border-radius:4px;cursor:pointer;padding:3px 8px;font-size:11px;margin-right:4px;">🔄</button>' +
              '<button onclick="deleteUser(\\\'' + u.username + '\\\')" style="border:1px solid #ddd;background:white;border-radius:4px;cursor:pointer;padding:3px 8px;font-size:11px;">🗑️</button>' +
            '</td>' +
            '</tr>';
        });
        html += '</tbody></table>';
        grid.innerHTML = html;
      } else {
        // 卡片视图
        grid.style.display = 'grid';
        grid.className = 'users-grid';
        if (adminCard) grid.appendChild(adminCard);
        
        filtered.forEach(function(u) {
          var subTag = '';
          if (u.subscriptionConfig) {
            subTag = u.lastSyncResult ? getExpireTagHtml(u.lastSyncResult.earliestExpire) : '<span class="tag tag-warning">待同步</span>';
          } else {
            subTag = '<span class="tag tag-no-sub">未绑定</span>';
          }
          
          var subInfo = '';
          if (u.subscriptionConfig) {
            subInfo = '<div class="subscription-info">' +
              '<div><span class="label">组合:</span> ' + u.subscriptionConfig.collectionName + '</div>' +
              '<div><span class="label">Token:</span> <code style="font-size:11px;background:#f0f0f0;padding:1px 4px;border-radius:3px;">' + u.subscriptionConfig.token + '</code></div>' +
              (u.lastSyncResult ? 
                '<div><span class="label">节点:</span> ' + u.lastSyncResult.nodeCount + ' 个</div>' +
                '<div><span class="label">最后同步:</span> ' + new Date(u.lastSyncResult.lastSync).toLocaleString('zh-CN') + '</div>'
                : '<div style="color:#f39c12;">尚未同步</div>') +
              '</div>';
          } else {
            subInfo = '<div class="subscription-info" style="color:#999;">未绑定订阅链接</div>';
          }
          
          
          var card = document.createElement('div');
          card.className = 'user-card';
          card.id = 'user-' + u.username;
          
          var roleTag = u.membershipLevel ? '<span class="tag" style="background:#9b59b6;color:white;">' + u.membershipLevel + '</span>' : '';
          if (u.isAdmin) roleTag += ' <span class="tag tag-admin">管理员</span>';
          
          card.innerHTML = '<div class="user-name">' + u.username + ' ' + roleTag + ' ' + subTag + '</div>' +
            '<div class="user-info">创建于: ' + new Date(u.createdAt).toLocaleDateString('zh-CN') + '</div>' +
            (u.lastLogin ? '<div class="user-info">最后登录: ' + new Date(u.lastLogin).toLocaleString('zh-CN') + '</div>' : '') +
            (u.customNote ? '<div class="user-info">备注: ' + u.customNote + '</div>' : '') +
            subInfo +
            '<div class="actions">' +
              '<button onclick="editUser(\\\'' + u.username + '\\\')">✏️ 编辑</button>' +
              '<button onclick="bindSubscription(\\\'' + u.username + '\\\')">🔗 绑定</button>' +
              '<button onclick="syncUser(\\\'' + u.username + '\\\')"' + (!u.subscriptionConfig ? ' disabled' : '') + '>🔄 同步</button>' +
              '<button onclick="deleteUser(\\\'' + u.username + '\\\')">🗑️ 删除</button>' +
            '</div>';
          grid.appendChild(card);
        });
      }
    }
    function filterUsers() { renderUserCards(); }
    
    // ===== 一键同步所有已绑定用户 =====
    async function syncBoundUsers() {
      var boundUsers = allUsersData.filter(function(u) { return !!u.subscriptionConfig; });
      if (boundUsers.length === 0) {
        showToast('没有已绑定的用户', 'info');
        return;
      }
      var resultEl = document.getElementById('syncBoundResult');
      resultEl.style.display = 'block';
      resultEl.className = 'sync-result';
      resultEl.style.background = '#e8f4fd';
      resultEl.style.color = '#333';
      
      var total = boundUsers.length;
      var successCount = 0;
      var failCount = 0;
      resultEl.textContent = '🔄 正在同步 0/' + total + ' ...';
      
      for (var i = 0; i < boundUsers.length; i++) {
        var u = boundUsers[i];
        try {
          var res = await fetch('/api/admin/users/' + u.username + '/sync', { method: 'POST' });
          var data = await res.json();
          if (data.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (err) {
          failCount++;
        }
        resultEl.textContent = '🔄 正在同步 ' + (i + 1) + '/' + total + ' (✅' + successCount + ' ❌' + failCount + ')';
      }
      
      if (failCount === 0) {
        resultEl.className = 'sync-result sync-success';
        resultEl.textContent = '✅ 全部同步完成！共 ' + total + ' 个用户，全部成功';
      } else {
        resultEl.className = 'sync-result sync-error';
        resultEl.textContent = '同步完成：共 ' + total + ' 个用户，成功 ' + successCount + '，失败 ' + failCount;
      }
      setTimeout(function() { location.reload(); }, 2000);
    }
    
    // Tab 切换逻辑
    function switchTab(el, targetId) {
        document.querySelectorAll('.tab-item').forEach(t => {
            t.style.borderBottomColor = 'transparent';
            t.style.color = '#333';
            t.classList.remove('active');
        });
        el.style.borderBottomColor = '#667eea';
        el.style.color = '#667eea';
        el.classList.add('active');

        document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
        document.getElementById(targetId).style.display = 'block';
    }

    // 加载通知配置
    async function loadNotificationConfig() {
        try {
            const res = await fetch('/api/admin/config/notification');
            const config = await res.json();
            
            // Login config
            document.getElementById('loginEnabled').checked = config.login?.enabled;
            document.getElementById('loginType').value = config.login?.type || 'info';
            document.getElementById('loginContent').value = config.login?.content || '';

            // Home config
            document.getElementById('homeEnabled').checked = config.home?.enabled;
            document.getElementById('homeTitle').value = config.home?.title || '';
            document.getElementById('homeContent').value = config.home?.content || '';
        } catch (e) {
            showToast('加载通知配置失败', 'error');
        }
    }

    // 保存通知配置
    async function saveNotificationConfig(e) {
        e.preventDefault();
        const config = {
            login: {
                enabled: document.getElementById('loginEnabled').checked,
                type: document.getElementById('loginType').value,
                content: document.getElementById('loginContent').value
            },
            home: {
                enabled: document.getElementById('homeEnabled').checked,
                title: document.getElementById('homeTitle').value,
                content: document.getElementById('homeContent').value
            }
        };

        try {
            const res = await fetch('/api/admin/config/notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            
            if (res.ok) {
                showToast('通知配置已保存', 'success');
                closeModal('notificationModal');
            } else {
                showToast('保存失败', 'error');
            }
        } catch (e) {
            showToast('网络错误', 'error');
        }
    }

    // 打开模态框时如果是通知配置，加载数据
    const originalOpenModal = window.openModal;
    window.openModal = function(id) {
        document.getElementById(id).classList.add('active');
        if (id === 'notificationModal') {
            loadNotificationConfig();
        }
    };
    
    // ===== 模态框工具 =====
    function closeModal(id) { document.getElementById(id).classList.remove('active'); }
    
    // ===== 添加用户（从待分配 Token 选择） =====
    async function showAddUserModal() {
      document.getElementById('addUserModal').classList.add('active');
      document.getElementById('addUserForm').reset();
      await populateTokenSelect('addUserTokenSelect');
      await populateMembershipSelect('addUserMembershipSelect');
    }
    
    async function populateTokenSelect(selectId) {
      var sel = document.getElementById(selectId);
      sel.innerHTML = '<option value="">-- 不绑定 --</option>';
      // 如果已有缓存的 unbound tokens 数据就用，否则去拉
      var tokens = allUnboundTokensData;
      if (!tokens || tokens.length === 0) {
        try {
          var res = await fetch('/api/admin/substore/tokens/unbound');
          var data = await res.json();
          if (data.success) tokens = data.tokens || [];
        } catch(e) {}
      }
      tokens.forEach(function(t) {
        var opt = document.createElement('option');
        var tokenVal = t.token || '';
        var colName = t.name || '';
        opt.value = JSON.stringify({ token: tokenVal, collectionName: colName });
        var label = '🎫 ' + tokenVal;
        if (colName) label += ' (' + colName + ')';
        if (t.exp) {
          var d = Math.ceil((t.exp - Date.now()) / (1000*60*60*24));
          label += d < 0 ? ' [已过期]' : ' [' + d + '天]';
        }
        opt.textContent = label;
        sel.appendChild(opt);
      });
    }
    
    async function submitAddUser(e) {
      e.preventDefault();
      var form = e.target;
      var data = {
        username: form.username.value,
        password: form.password.value,
        customNote: form.customNote.value || undefined,
        membershipLevel: form.membershipLevel.value || undefined,
      };
      // 从下拉选择的 Token 解析
      var tokenVal = form.shareToken.value;
      if (tokenVal) {
        try {
          var parsed = JSON.parse(tokenVal);
          data.subscriptionConfig = { collectionName: parsed.collectionName, token: parsed.token };
        } catch(e) {}
      }
      try {
        var res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        var result = await res.json();
        if (result.success) {
          showToast('✅ 用户 ' + data.username + ' 创建成功！');
          closeModal('addUserModal');
          setTimeout(function() { location.reload(); }, 800);
        } else { showToast('创建失败: ' + result.error, 'error'); }
      } catch (err) { alert('网络错误'); }
    }
    
    // ===== 绑定分享 Token =====
    async function bindSubscription(username) {
      document.getElementById('bindSubUsername').value = username;
      document.getElementById('bindSubForm').reset();
      document.getElementById('bindSubUsername').value = username;
      document.getElementById('bindTokenPreview').style.display = 'none';
      await populateTokenSelect('bindTokenSelect');
      // 修改第一个选项文字
      var sel = document.getElementById('bindTokenSelect');
      if (sel.options.length > 0) sel.options[0].textContent = '-- 请选择待分配的 Token --';
      // 监听选择变化显示预览
      sel.onchange = function() {
        var preview = document.getElementById('bindTokenPreview');
        if (sel.value) {
          try {
            var p = JSON.parse(sel.value);
            preview.innerHTML = '<b>Token:</b> ' + p.token + '<br><b>组合:</b> ' + (p.collectionName || '-');
            preview.style.display = 'block';
          } catch(e) { preview.style.display = 'none'; }
        } else { preview.style.display = 'none'; }
      };
      document.getElementById('bindSubModal').classList.add('active');
    }
    
    async function submitBindSub(e) {
      e.preventDefault();
      var username = document.getElementById('bindSubUsername').value;
      var tokenVal = document.getElementById('bindTokenSelect').value;
      if (!tokenVal) { alert('请选择一个 Token'); return; }
      var parsed;
      try { parsed = JSON.parse(tokenVal); } catch(e) { alert('Token 数据异常'); return; }
      try {
        var res = await fetch('/api/admin/users/' + username + '/subscription', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collectionName: parsed.collectionName, token: parsed.token }),
        });
        var result = await res.json();
        if (result.success) {
          showToast('✅ 绑定成功！');
          closeModal('bindSubModal');
          setTimeout(function() { location.reload(); }, 800);
        } else { showToast('绑定失败: ' + result.error, 'error'); }
      } catch (err) { alert('网络错误'); }
    }
    

    
    async function editUser(username) {
      var user = allUsersData.find(u => u.username === username);
      if (!user) return;
      
      document.getElementById('editUserUsername').value = username;
      document.getElementById('editUserUsernameDisplay').value = username;
      document.getElementById('editUserForm').reset();
      document.getElementById('editUserNote').value = user.customNote || '';
      
      await populateMembershipSelect('editUserMembershipSelect', user.membershipLevel);
      
      document.getElementById('editUserModal').classList.add('active');
    }
    
    async function submitEditUser(e) {
      e.preventDefault();
      var form = e.target;
      var username = form.username.value;
      var data = {
        password: form.password.value || undefined,
        customNote: form.customNote.value || undefined,
        membershipLevel: form.membershipLevel.value || undefined
      };
      
      try {
        var res = await fetch('/api/admin/users/' + username, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        var result = await res.json();
        if (result.success) {
          showToast('✅ 更新成功');
          closeModal('editUserModal');
          setTimeout(function() { location.reload(); }, 800);
        } else {
          alert('更新失败: ' + result.error);
        }
      } catch (err) { alert('网络错误'); }
    }
    
    // 会员等级配置相关
    let membershipLevels = [];
    
    async function loadMembershipConfig() {
      try {
        const res = await fetch('/api/admin/config/membership');
        const data = await res.json();
        membershipLevels = data.levels || [];
      } catch (err) {
        console.error('加载会员配置失败', err);
        membershipLevels = ['普通用户', 'VIP会员', '高级VIP'];
      }
    }
    
    async function showMembershipConfig() {
      await loadMembershipConfig();
      renderMembershipList();
      document.getElementById('membershipConfigModal').classList.add('active');
    }
    
    function renderMembershipList() {
      const container = document.getElementById('membershipLevelsList');
      if (membershipLevels.length === 0) {
        container.innerHTML = '<div style="color:#999;text-align:center;">无</div>';
        return;
      }
      // 赋予删除功能
      container.innerHTML = membershipLevels.map((level, idx) => 
        '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px;border-bottom:1px solid #eee;">' +
          '<span>' + level + '</span>' +
          '<button type="button" onclick="removeMembershipLevel(' + idx + ')" style="border:none;background:#e74c3c;color:white;padding:2px 8px;border-radius:4px;cursor:pointer;">删除</button>' +
        '</div>'
      ).join('');
    }
    
    function addMembershipLevel() {
      const input = document.getElementById('newMembershipLevel');
      const val = input.value.trim();
      if (!val) return;
      if (membershipLevels.includes(val)) {
        alert('等级已存在');
        return;
      }
      membershipLevels.push(val);
      input.value = '';
      renderMembershipList();
    }
    
    function removeMembershipLevel(idx) {
      membershipLevels.splice(idx, 1);
      renderMembershipList();
    }
    
    async function saveMembershipConfig() {
      try {
        const res = await fetch('/api/admin/config/membership', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ levels: membershipLevels }),
        });
        const result = await res.json();
        if (result.success) {
          showToast('✅ 配置已保存');
          closeModal('membershipConfigModal');
        } else {
          alert('保存失败: ' + result.error);
        }
      } catch (err) { alert('网络错误'); }
    }
    
    async function populateMembershipSelect(selectId, currentVal) {
      if (membershipLevels.length === 0) await loadMembershipConfig();
      
      const sel = document.getElementById(selectId);
      sel.innerHTML = '<option value="">默认 (普通用户)</option>';
      membershipLevels.forEach(level => {
        const opt = document.createElement('option');
        opt.value = level;
        opt.textContent = level;
        if (currentVal && currentVal === level) opt.selected = true;
        sel.appendChild(opt);
      });
    }
    
    function deleteUser(username) {
      if (!confirm('确定删除用户 ' + username + '?')) return;
      
      fetch('/api/admin/users/' + username, {
        method: 'DELETE',
      }).then(r => r.json()).then(data => {
        if (data.success) {
          location.reload();
        } else {
          alert('删除失败: ' + data.error);
        }
      });
    }
    
    async function logout() {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    }
    
    // Sub-Store 配置相关函数
    let substoreConfig = { baseUrl: '', backendPrefix: '', collections: [] };
    
    async function loadSubstoreConfig() {
      try {
        const res = await fetch('/api/admin/substore/config');
        substoreConfig = await res.json();
        return substoreConfig;
      } catch (err) {
        console.error('加载 Sub-Store 配置失败', err);
        return { baseUrl: '', backendPrefix: '', collections: [] };
      }
    }
    
    async function showSubstoreConfig() {
      await loadSubstoreConfig();
      document.getElementById('substoreBaseUrl').value = substoreConfig.baseUrl || '';
      document.getElementById('substoreBackendPrefix').value = substoreConfig.backendPrefix || '';
      renderCollectionsList();
      // 重置分享用户列表
      document.getElementById('shareTokensList').innerHTML = 
        '<div style="color:#999;text-align:center;font-size:13px;">点击「查询分享用户」从 Sub-Store 获取</div>';
      // 重置连接测试结果
      document.getElementById('connectionTestResult').style.display = 'none';
      document.getElementById('substoreConfigModal').classList.add('active');
    }
    
    function renderCollectionsList() {
      const container = document.getElementById('collectionsList');
      if (!substoreConfig.collections || substoreConfig.collections.length === 0) {
        container.innerHTML = '<div style="color:#999;text-align:center;">暂无订阅组合</div>';
        return;
      }
      container.innerHTML = substoreConfig.collections.map((col, idx) => 
        '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #eee;">' +
          '<span>' + col.name + '</span>' +
          '<button type="button" onclick="removeCollection(' + idx + ')" style="border:none;background:#e74c3c;color:white;padding:2px 8px;border-radius:4px;cursor:pointer;">删除</button>' +
        '</div>'
      ).join('');
    }
    
    function removeCollection(idx) {
      substoreConfig.collections.splice(idx, 1);
      renderCollectionsList();
    }
    
    function addCollection() {
      const name = document.getElementById('newCollectionName').value.trim();
      if (!name) {
        alert('请输入组合名称');
        return;
      }
      if (substoreConfig.collections.some(c => c.name === name)) {
        alert('该组合已存在');
        return;
      }
      substoreConfig.collections.push({ name });
      document.getElementById('newCollectionName').value = '';
      renderCollectionsList();
    }
    
    async function submitSubstoreConfig(e) {
      e.preventDefault();
      const baseUrl = document.getElementById('substoreBaseUrl').value.trim();
      const backendPrefix = document.getElementById('substoreBackendPrefix').value.trim();
      if (!baseUrl) {
        alert('请输入 Sub-Store 地址');
        return;
      }
      
      try {
        const res = await fetch('/api/admin/substore/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            baseUrl,
            backendPrefix,
            collections: substoreConfig.collections,
          }),
        });
        const result = await res.json();
        if (result.success) {
          alert('配置保存成功！');
          closeModal('substoreConfigModal');
        } else {
          alert('保存失败: ' + result.error);
        }
      } catch (err) {
        alert('网络错误');
      }
    }
    
    // 测试 Sub-Store 连接
    async function testSubstoreConnection() {
      const resultEl = document.getElementById('connectionTestResult');
      resultEl.style.display = 'block';
      resultEl.style.color = '#666';
      resultEl.textContent = '正在测试连接...';
      
      // 先保存配置
      const baseUrl = document.getElementById('substoreBaseUrl').value.trim();
      const backendPrefix = document.getElementById('substoreBackendPrefix').value.trim();
      
      if (!baseUrl || !backendPrefix) {
        resultEl.style.color = '#e74c3c';
        resultEl.textContent = '❌ 请先填写地址和后端路径前缀';
        return;
      }
      
      // 先保存再查询
      try {
        await fetch('/api/admin/substore/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            baseUrl,
            backendPrefix,
            collections: substoreConfig.collections,
          }),
        });
      } catch (err) { /* 忽略保存错误 */ }
      
      try {
        const res = await fetch('/api/admin/substore/tokens');
        const data = await res.json();
        
        if (data.success) {
          const count = Array.isArray(data.tokens) ? data.tokens.length : 0;
          resultEl.style.color = '#27ae60';
          resultEl.textContent = '✅ 连接成功！发现 ' + count + ' 个分享 Token';
        } else {
          resultEl.style.color = '#e74c3c';
          resultEl.textContent = '❌ ' + (data.error || '连接失败');
        }
      } catch (err) {
        resultEl.style.color = '#e74c3c';
        resultEl.textContent = '❌ 网络错误';
      }
    }
    
    // 查询分享用户 Token 列表
    async function queryShareTokens() {
      const container = document.getElementById('shareTokensList');
      container.innerHTML = '<div style="color:#666;text-align:center;font-size:13px;">⏳ 正在查询...</div>';
      
      // 先保存配置
      const baseUrl = document.getElementById('substoreBaseUrl').value.trim();
      const backendPrefix = document.getElementById('substoreBackendPrefix').value.trim();
      
      if (!baseUrl || !backendPrefix) {
        container.innerHTML = '<div style="color:#e74c3c;text-align:center;font-size:13px;">❌ 请先填写地址和后端路径前缀</div>';
        return;
      }
      
      try {
        await fetch('/api/admin/substore/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            baseUrl,
            backendPrefix,
            collections: substoreConfig.collections,
          }),
        });
      } catch (err) { /* 忽略 */ }
      
      try {
        const res = await fetch('/api/admin/substore/tokens');
        const data = await res.json();
        
        if (!data.success) {
          container.innerHTML = '<div style="color:#e74c3c;text-align:center;font-size:13px;">❌ ' + (data.error || '查询失败') + '</div>';
          return;
        }
        
        const tokens = data.tokens;
        if (!Array.isArray(tokens) || tokens.length === 0) {
          container.innerHTML = '<div style="color:#999;text-align:center;font-size:13px;">暂无分享 Token</div>';
          return;
        }
        
        // 渲染 token 列表
        container.innerHTML = '<div style="font-size:12px;color:#999;margin-bottom:8px;">共 ' + tokens.length + ' 个分享 Token</div>' +
          tokens.map(function(t) {
            var createdAt = t.createdAt ? new Date(t.createdAt).toLocaleString('zh-CN') : '未知';
            var expireInfo = '';
            if (t.exp) {
              var now = Date.now();
              if (t.exp < now) {
                expireInfo = '<span style="color:#e74c3c;">已过期</span>';
              } else {
                var daysLeft = Math.ceil((t.exp - now) / (1000*60*60*24));
                expireInfo = '<span style="color:#27ae60;">' + daysLeft + '天后过期</span>';
              }
            } else {
              expireInfo = '<span style="color:#27ae60;">永不过期</span>';
            }
            var typeLabel = t.type === 'col' ? '组合' : (t.type === 'sub' ? '订阅' : (t.type === 'file' ? '文件' : t.type));
            return '<div style="padding:8px;border:1px solid #eee;border-radius:6px;margin-bottom:6px;background:#fafafa;">' +
              '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">' +
                '<strong style="font-size:13px;color:#333;">🔑 ' + (t.token || 'N/A') + '</strong>' +
                '<span style="font-size:11px;background:#667eea;color:white;padding:1px 6px;border-radius:3px;">' + typeLabel + '</span>' +
              '</div>' +
              '<div style="font-size:12px;color:#666;">' +
                '<span>📦 ' + (t.name || 'N/A') + '</span>' +
                '<span style="margin-left:12px;">📅 ' + createdAt + '</span>' +
                '<span style="margin-left:12px;">' + expireInfo + '</span>' +
              '</div>' +
            '</div>';
          }).join('');
      } catch (err) {
        container.innerHTML = '<div style="color:#e74c3c;text-align:center;font-size:13px;">❌ 网络错误</div>';
      }
    }
    
    // 从远程获取组合订阅
    async function fetchRemoteCollections() {
      // 先保存配置
      const baseUrl = document.getElementById('substoreBaseUrl').value.trim();
      const backendPrefix = document.getElementById('substoreBackendPrefix').value.trim();
      
      if (!baseUrl || !backendPrefix) {
        alert('请先填写地址和后端路径前缀');
        return;
      }
      
      try {
        await fetch('/api/admin/substore/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            baseUrl,
            backendPrefix,
            collections: substoreConfig.collections,
          }),
        });
      } catch (err) { /* 忽略 */ }
      
      try {
        const res = await fetch('/api/admin/substore/collections/remote');
        const data = await res.json();
        
        if (!data.success) {
          alert('获取失败: ' + (data.error || '未知错误'));
          return;
        }
        
        const remoteCols = data.collections;
        if (!Array.isArray(remoteCols) || remoteCols.length === 0) {
          alert('远程无可用组合');
          return;
        }
        
        // 合并远程组合到本地配置
        let addedCount = 0;
        for (const rc of remoteCols) {
          const name = rc.name || rc;
          if (typeof name === 'string' && name.length > 0 && !substoreConfig.collections.some(c => c.name === name)) {
            substoreConfig.collections.push({ name });
            addedCount++;
          }
        }
        
        renderCollectionsList();
        alert('获取完成！新增 ' + addedCount + ' 个组合（共 ' + remoteCols.length + ' 个远程组合）');
      } catch (err) {
        alert('网络错误');
      }
    }
    
    // ===== 未绑定分享 Token 功能 =====
    
    async function loadUnboundTokens() {
      var statusEl = document.getElementById('unboundTokensStatus');
      var gridEl = document.getElementById('unboundTokensGrid');
      statusEl.style.display = 'block';
      statusEl.textContent = '🔄 正在获取分享 Token...';
      statusEl.style.color = '#999';
      gridEl.style.display = 'none';
      
      try {
        var res = await fetch('/api/admin/substore/tokens/unbound');
        var data = await res.json();
        if (!res.ok || !data.success) {
          if (data.needConfig) {
            statusEl.innerHTML = '⚙️ 请先在 <a href="javascript:showSubstoreConfig()" style="color:#3498db;">Sub-Store 配置</a> 中设置地址和后端路径前缀';
          } else {
            statusEl.textContent = '❌ ' + (data.error || '获取失败');
            statusEl.style.color = '#e74c3c';
          }
          return;
        }
        allUnboundTokensData = data.tokens || [];
        var totalCount = data.totalCount || 0;
        var boundCount = data.boundCount || 0;
        // 使用所有用户列表（包含绑定状态标注）
        window._allUsers = data.allUsers || [];
        
        if (allUnboundTokensData.length === 0) {
          statusEl.textContent = '✅ 所有 ' + totalCount + ' 个分享 Token 均已绑定用户';
          statusEl.style.color = '#27ae60';
          return;
        }
        statusEl.innerHTML = '共 <b>' + totalCount + '</b> 个 Token，<span style="color:#27ae60">' + boundCount + '</span> 个已绑定，<span style="color:#e67e22">' + allUnboundTokensData.length + '</span> 个待分配';
        statusEl.style.color = '#555';
        filterTokens();
      } catch (err) {
        statusEl.textContent = '❌ 网络错误，请检查连接';
        statusEl.style.color = '#e74c3c';
      }
    }
    
    function filterTokens() {
      var search = (document.getElementById('tokenSearch').value || '').toLowerCase();
      var filter = document.getElementById('tokenFilter').value;
      var sort = document.getElementById('tokenSort').value;
      var now = Date.now();
      
      var filtered = allUnboundTokensData.filter(function(t) {
        // 筛选
        if (filter === 'expired' && !(t.exp && t.exp < now)) return false;
        if (filter === '7days' && !(t.exp && t.exp > now && t.exp - now < 7*86400000)) return false;
        if (filter === '30days' && !(t.exp && t.exp > now && t.exp - now < 30*86400000)) return false;
        if (filter === 'valid' && (t.exp && t.exp < now)) return false;
        // 搜索
        if (search) {
          var hay = ((t.token||'') + ' ' + (t.name||'') + ' ' + (t.displayName||'') + ' ' + (t.remark||'')).toLowerCase();
          if (hay.indexOf(search) === -1) return false;
        }
        return true;
      });
      
      // 排序
      filtered.sort(function(a, b) {
        if (sort === 'created_desc') return (b.createdAt||0) - (a.createdAt||0);
        if (sort === 'created_asc') return (a.createdAt||0) - (b.createdAt||0);
        if (sort === 'expire_asc') return (a.exp||Infinity) - (b.exp||Infinity);
        if (sort === 'expire_desc') return (b.exp||0) - (a.exp||0);
        return 0;
      });
      
      renderTokens(filtered);
    }
    
    function switchTokenView(view) {
      currentTokenView = view;
      document.getElementById('viewCard').style.background = view === 'card' ? '#667eea' : 'white';
      document.getElementById('viewCard').style.color = view === 'card' ? 'white' : '#333';
      document.getElementById('viewList').style.background = view === 'list' ? '#667eea' : 'white';
      document.getElementById('viewList').style.color = view === 'list' ? 'white' : '#333';
      filterTokens();
    }
    
    function renderTokens(tokens) {
      var gridEl = document.getElementById('unboundTokensGrid');
      gridEl.innerHTML = '';
      if (tokens.length === 0) {
        gridEl.style.display = 'block';
        gridEl.innerHTML = '<div style="text-align:center;color:#999;padding:20px;">无匹配结果</div>';
        return;
      }
      
      var allUsers = window._allUsers || [];
      var userOptions = '<option value="">-- 选择用户 --</option>';
      allUsers.forEach(function(u) {
        var label = u.username + (u.hasSub ? ' (已绑定)' : '');
        userOptions += '<option value="' + u.username + '">' + label + '</option>';
      });
      
      if (currentTokenView === 'list') {
        // 列表（表格）视图
        gridEl.style.display = 'block';
        gridEl.className = '';
        var html = '<table style="width:100%;border-collapse:collapse;font-size:13px;">' +
          '<thead><tr style="background:#f8f9fa;text-align:left;">' +
          '<th style="padding:8px;border-bottom:2px solid #ddd;">Token</th>' +
          '<th style="padding:8px;border-bottom:2px solid #ddd;">组合</th>' +
          '<th style="padding:8px;border-bottom:2px solid #ddd;">创建时间</th>' +
          '<th style="padding:8px;border-bottom:2px solid #ddd;">到期</th>' +
          '<th style="padding:8px;border-bottom:2px solid #ddd;">操作</th>' +
          '</tr></thead><tbody>';
        tokens.forEach(function(t, idx) {
          var isExpired = t.exp ? t.exp < Date.now() : false;
          var expText = t.exp ? new Date(t.exp).toLocaleDateString('zh-CN') : '永久';
          html += '<tr style="border-bottom:1px solid #eee;" id="unbound-token-' + idx + '" data-token="' + (t.token||'') + '" data-collection="' + (t.name||'') + '">' +
            '<td style="padding:8px;font-family:monospace;">' + (t.token||'N/A') + '</td>' +
            '<td style="padding:8px;">' + (t.name||'-') + '</td>' +
            '<td style="padding:8px;">' + (t.createdAt ? new Date(t.createdAt).toLocaleDateString('zh-CN') : '-') + '</td>' +
            '<td style="padding:8px;color:' + (isExpired ? '#e74c3c' : '#27ae60') + ';">' + expText + '</td>' +
            '<td style="padding:8px;"><select id="bindUser_' + idx + '" style="padding:4px;border:1px solid #ddd;border-radius:4px;font-size:12px;margin-right:4px;">' + userOptions + '</select>' +
            '<button class="btn btn-sm btn-success" onclick="quickBindToken(' + idx + ')" style="font-size:11px;padding:3px 8px;">绑定</button></td>' +
            '</tr>';
        });
        html += '</tbody></table>';
        gridEl.innerHTML = html;
      } else {
        // 卡片视图
        gridEl.style.display = 'grid';
        gridEl.className = 'users-grid';
        tokens.forEach(function(t, idx) {
          var tokenValue = t.token || '未知';
          var collection = t.name || '-';
          var createdAt = t.createdAt ? new Date(t.createdAt).toLocaleDateString('zh-CN') : '-';
          var isExpired = t.exp ? (t.exp < Date.now()) : false;
          var expireText = t.exp ? new Date(t.exp).toLocaleDateString('zh-CN') : '永久';
          
          var card = document.createElement('div');
          card.className = 'user-card';
          card.style.borderLeft = isExpired ? '4px solid #e74c3c' : '4px solid #3498db';
          card.id = 'unbound-token-' + idx;
          card.setAttribute('data-token', tokenValue);
          card.setAttribute('data-collection', collection);
          card.innerHTML =
            '<div class="user-name"><span style="font-family:monospace;font-size:14px;">🎫 ' + tokenValue + '</span>' +
              (isExpired ? ' <span class="tag" style="background:#e74c3c;color:#fff;font-size:10px;">已过期</span>' : '') +
            '</div>' +
            '<div class="subscription-info" style="margin-top:6px;">' +
              '<div><span class="label">组合:</span> ' + collection + '</div>' +
              '<div><span class="label">创建:</span> ' + createdAt + '</div>' +
              '<div><span class="label">到期:</span> <span style="color:' + (isExpired ? '#e74c3c' : '#27ae60') + ';">' + expireText + '</span></div>' +
            '</div>' +
            '<div style="margin-top:10px;display:flex;gap:6px;align-items:center;">' +
              '<select id="bindUser_' + idx + '" style="flex:1;padding:6px 8px;border:1px solid #ddd;border-radius:4px;font-size:12px;">' + userOptions + '</select>' +
              '<button class="btn btn-sm btn-success" onclick="quickBindToken(' + idx + ')" style="font-size:11px;padding:4px 10px;white-space:nowrap;">🔗 绑定</button>' +
            '</div>';
          gridEl.appendChild(card);
        });
      }
    }
    
    async function quickBindToken(idx) {
      var card = document.getElementById('unbound-token-' + idx);
      var tokenValue = card.getAttribute('data-token');
      var collectionName = card.getAttribute('data-collection');
      var selectEl = document.getElementById('bindUser_' + idx);
      var username = selectEl.value;
      if (!username) { alert('请先选择要绑定的用户'); return; }
      if (!confirm('确定将 Token「' + tokenValue + '」绑定到用户「' + username + '」？')) return;
      
      var finalCollection = collectionName;
      if (!finalCollection || finalCollection === '-') {
        // 不使用错误的默认值，提示管理员手动输入
        finalCollection = prompt('该 Token 未关联组合名称，请手动输入组合订阅名称：');
        if (!finalCollection || !finalCollection.trim()) {
          alert('组合名称不能为空，请重新操作');
          return;
        }
        finalCollection = finalCollection.trim();
      }
      try {
        var res = await fetch('/api/admin/users/' + username + '/subscription', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collectionName: finalCollection, token: tokenValue }),
        });
        var result = await res.json();
        if (result.success) {
          showToast('✅ 绑定成功！');
          setTimeout(function() { location.reload(); }, 800);
        } else { showToast('绑定失败: ' + (result.error || '未知错误'), 'error'); }
      } catch (err) { showToast('❤ 网络错误', 'error'); }
    }
  </script>

</body>
</html>`;
}


// 辅助函数
function getExpireLabel(expireDate: string | null | undefined): string {
  if (!expireDate) return '';
  const now = new Date();
  const expire = new Date(expireDate);
  const daysLeft = Math.ceil((expire.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return '已过期';
  if (daysLeft < 7) return `${daysLeft}天后过期`;
  if (daysLeft < 30) return `${daysLeft}天后过期`;
  return `${daysLeft}天后过期`;
}

function getExpireClass(expireDate: string | null | undefined): string {
  if (!expireDate) return '';
  const now = new Date();
  const expire = new Date(expireDate);
  const daysLeft = Math.ceil((expire.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 7) return 'expire-warning';
  if (daysLeft < 30) return 'expire-caution';
  return 'expire-normal';
}

function getExpireTag(expireDate: string | null | undefined) {
  if (!expireDate) return '';
  const now = new Date();
  const expire = new Date(expireDate);
  const daysLeft = Math.ceil((expire.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return html`<span class="tag tag-expired">已过期</span>`;
  if (daysLeft < 7) return html`<span class="tag tag-expired">${daysLeft}天</span>`;
  if (daysLeft < 30) return html`<span class="tag tag-warning">${daysLeft}天</span>`;
  return html`<span class="tag tag-normal">正常</span>`;
}
