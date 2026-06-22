# 部署指南 (Rocky Linux)

## 1. 安装 Bun

```bash
curl -fsSL https://bun.sh/install | bash
# 链接到系统 PATH（非登录 shell 也能用）
sudo ln -sf ~/.bun/bin/bun /usr/local/bin/bun
```

验证：
```bash
bun --version
```

## 2. 部署项目

```bash
# 上传项目到服务器（或 git clone）
cd /opt
git clone <your-repo> maimai-update
cd maimai-update

# 安装依赖
bun install

# 构建前端 + SSR bundle
bun run build
bun run build:ssr

# 确保数据目录存在
mkdir -p data
```

## 3. PM2 进程管理

```bash
# 安装 PM2
bun install -g pm2
# 或 npm i -g pm2

# 首次启动
cd /opt/maimai-update
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup   # 设置开机自启（按提示执行输出的命令）
```

日常管理：
```bash
pm2 status          # 查看状态
pm2 logs maimai-update  # 查看日志
pm2 restart maimai-update  # 重启
```

## 4. 防火墙

```bash
# 如果直接暴露端口
firewall-cmd --add-port=3001/tcp --permanent
firewall-cmd --reload
```

## 5. Nginx 反向代理（推荐）

```bash
dnf install -y nginx
```

创建 `/etc/nginx/conf.d/maimai.conf`：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
systemctl enable --now nginx
```

## 6. 部署 / 更新

首次部署按 1-5 步手动操作。日常更新用部署脚本：

```bash
# 本地执行（Mac），自动构建 + rsync + 重启服务
./deploy.sh
```

手动更新流程：

```bash
cd /opt/maimai-update
git pull
bun install --production
# 在本地构建好 dist/ dist-ssr/ 再 rsync 上去（script 已包含）
systemctl restart maimai-update
```

## 端口

| 端口 | 用途 |
|------|------|
| 3001 | Bun SSR 服务器（API + 页面渲染 + 静态文件） |
| 80/443 | Nginx（可选，公网入口） |

## 目录结构

```
/opt/maimai-update/
├── data/           # SQLite 数据库（持久化）
├── dist/           # 客户端构建产物
├── dist-ssr/       # SSR bundle
├── server/         # 服务端源码
└── src/            # 前端源码
```
