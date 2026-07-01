# 飞牛 NAS 自托管部署指南

在飞牛 NAS（Docker）上运行 HandinHand-web，绑定自有域名。数据库与上传文件均保存在 NAS 本地，**无需 Vercel / Neon / R2**。

## 架构

```
浏览器 → 你的域名 → 公网暴露层 → 飞牛 NAS (Docker)
                              ├── app (Next.js :3000)
                              ├── db  (PostgreSQL)
                              └── uploads 卷 (简历/头像)
```

---

## 0. 判断网络类型（绑定域名前必做）

对比 **路由器 WAN 口 IP** 与浏览器打开 [https://ip.sb](https://ip.sb) 看到的 IP：

| 结果 | 类型 | 域名绑定方案 |
|------|------|-------------|
| 两者一致 | 有公网 IP | [方案 A：端口转发 + 反代](#方案-a公网-ip--端口转发--https) |
| 不一致 / 100.x 等内网段 | 无公网 IP（CGNAT） | [方案 B：Cloudflare Tunnel](#方案-bcloudflare-tunnel推荐无公网-ip) |
| 仅内网使用 | 不对外 | 直接访问 `http://NAS内网IP:3000`，跳过域名 |

**国内家庭宽带多数无公网 IP**，不确定时优先按 **方案 B** 准备。

---

## 1. 在飞牛 NAS 上部署

### 1.1 准备项目

在 NAS 上（SSH 或飞牛终端）：

```bash
git clone git@github.com:enochliu0318/HandinHand-web.git
cd HandinHand-web
cp .env.example .env
```

### 1.2 编辑 `.env`

```env
# Docker Compose 数据库密码（与 compose 中 POSTGRES 对应）
POSTGRES_PASSWORD=请改为强密码

# 应用端口（默认 3000，仅 NAS 内网/反代访问）
APP_PORT=3000

# NextAuth
AUTH_SECRET=用 openssl rand -base64 32 生成
AUTH_TRUST_HOST=true

# 首次初始化管理员（仅第一次部署时配合 RUN_SEED 使用）
SEED_ADMIN_PASSWORD=你的管理员强密码
SEED_DEMO_DATA=false

# 不填 R2_* — 上传保存到 Docker uploads 卷
```

`DATABASE_URL` 由 `docker-compose.yml` 自动注入，无需手动填写。

### 1.3 首次启动

```bash
# 首次：创建表结构并初始化管理员
RUN_SEED=true docker compose up -d --build

# 查看日志
docker compose logs -f app
```

### 1.4 内网验证

浏览器访问 `http://<NAS内网IP>:3000`：

- [ ] 首页正常
- [ ] 使用 `admin@handinhand.com` + 你设置的 `SEED_ADMIN_PASSWORD` 登录
- [ ] 进入 `/admin`，测试老师简历/头像上传
- [ ] 账号申请 → 审核流程

验证通过后，后续更新**不要**再设 `RUN_SEED=true`（避免重复 seed）：

```bash
docker compose up -d --build
```

### 1.5 常用命令

```bash
docker compose ps
docker compose logs -f app
docker compose restart app
docker compose down          # 停止（数据卷保留）
docker compose down -v       # 停止并删除数据卷（慎用）
```

---

## 2. 绑定域名 + HTTPS

应用容器监听 **3000**，不要直接把 3000 暴露到公网。应通过反代或 Tunnel 提供 **443 HTTPS**。

### 方案 A：公网 IP + 端口转发 + HTTPS

**适用**：路由器 WAN IP 与 ip.sb 一致。

1. **路由器**：将外网 `80`、`443` 转发到 NAS 内网 IP
2. **DNS**：`handinhand.你的域名` 添加 **A 记录** → 你的公网 IP
3. **NAS 反向代理**（飞牛自带或 Docker Caddy/Nginx）：
   - 域名 → 反代到 `http://127.0.0.1:3000`
   - 申请 Let's Encrypt 证书（飞牛证书管理或 Caddy 自动证书）
4. 访问 `https://handinhand.你的域名` 做全流程测试

**Caddy 示例**（可选，与 app 同机 Docker）：

```caddyfile
handinhand.你的域名 {
    reverse_proxy app:3000
}
```

### 方案 B：Cloudflare Tunnel（推荐，无公网 IP）

**适用**：无公网 IP，或不想在路由器开端口。

1. 域名 DNS 托管到 [Cloudflare](https://cloudflare.com)
2. Cloudflare 控制台 → Zero Trust → Networks → Tunnels → 创建 Tunnel
3. 项目已内置 `cloudflared` 服务（`docker-compose.yml` 的 `tunnel` profile），在 `.env` 填入 Token 后启动即可

4. 在 Tunnel 配置 Public Hostname：
   - 子域名：`handinhand.你的域名`
   - Service URL：`http://app:3000`（同 compose 网络）或 `http://127.0.0.1:3000`
5. 启动 Tunnel 容器：

```bash
docker compose --profile tunnel up -d
```

6. Cloudflare 自动提供 HTTPS，无需本地证书

`.env` 中增加（若使用 Tunnel 容器）：

```env
CLOUDFLARE_TUNNEL_TOKEN=从 Cloudflare 控制台复制
```

---

## 3. 数据备份

定期备份两个 Docker 卷：

| 卷名 | 内容 |
|------|------|
| `handinhand-web_postgres_data` | 用户、课程、申请等数据库 |
| `handinhand-web_uploads` | 老师简历与头像 |

```bash
# 查看卷名
docker volume ls | grep handinhand

# 备份示例（在项目目录执行）
docker run --rm \
  -v handinhand-web_postgres_data:/data \
  -v $(pwd)/backup:/backup \
  alpine tar czf /backup/postgres-$(date +%Y%m%d).tar.gz -C /data .

docker run --rm \
  -v handinhand-web_uploads:/data \
  -v $(pwd)/backup:/backup \
  alpine tar czf /backup/uploads-$(date +%Y%m%d).tar.gz -C /data .
```

建议每周备份，并下载一份到 NAS 以外的设备。

---

## 4. 上线检查清单

- [ ] `AUTH_SECRET` 为随机强字符串
- [ ] `SEED_ADMIN_PASSWORD` 已设置且非默认测试密码
- [ ] `SEED_DEMO_DATA=false`，生产无演示账号
- [ ] 未配置 R2，上传文件写入 uploads 卷
- [ ] HTTPS 可访问，登录后各角色跳转正常
- [ ] 外网实测上传、账号审核流程
- [ ] postgres_data 与 uploads 卷已纳入备份计划

更多安全说明见 [SECURITY.md](./SECURITY.md)。

---

## 5. 故障排查

### 构建失败：`docker.fnnas.com ... 401 Unauthorized`

**原因**：飞牛 NAS 的 Docker 会把 `docker.io` 请求转发到官方镜像加速 `docker.fnnas.com`。当前返回 **401**，表示该加速源未授权（未登录、服务变更或临时不可用），**与项目 Dockerfile 无关**。

错误特征：

```
failed to resolve source metadata for docker.io/library/node:20-alpine
unexpected status from HEAD request to https://docker.fnnas.com/... 401 Unauthorized
```

**按顺序尝试：**

**方法 1 — 飞牛 NAS 里修复镜像源（推荐）**

1. 打开飞牛 **Docker / 容器** → **设置** → **镜像加速 / Registry**
2. 若已登录飞牛账号，尝试重新登录或刷新 Docker Hub 加速权限
3. 若 `docker.fnnas.com` 持续 401，**删除或停用**该加速，改用其他可用镜像（见方法 2）
4. 修改后重启 Docker 服务，再执行：

```bash
docker pull node:20-alpine
```

能 pull 成功后再 `docker compose up -d --build`。

**方法 2 — 使用其他镜像地址构建**

在 `.env` 中指定可访问的 Node 镜像（DaoCloud 等），然后重新构建：

```env
NODE_IMAGE=docker.m.daocloud.io/library/node:22-alpine
```

```bash
RUN_SEED=true docker compose up -d --build
```

**方法 3 — 在能访问 Docker Hub 的电脑构建后导入 NAS**

在 PC 上构建并导出，拷到 NAS 后 `docker load`，再 `docker compose up`（仅启动 db + app，不 rebuild）。

---

| 现象 | 可能原因 |
|------|----------|
| `401 Unauthorized` + `docker.fnnas.com` | 飞牛镜像加速未授权，见上文 |
| app 容器反复重启 | 数据库未就绪或 `POSTGRES_PASSWORD` 不一致 |
| 无法登录 | `AUTH_SECRET` 未设置；seed 未执行 |
| 上传失败 | uploads 卷权限；检查 `docker compose logs app` |
| 外网无法访问 | 无公网 IP 却用了端口转发；改 Tunnel 方案 |
| 域名 HTTPS 报错 | 证书未签发；Tunnel 未配置 Public Hostname |

---

## 与其他部署方式对比

| | 飞牛 NAS | Vercel + Neon + R2 |
|--|--|--|
| 费用 | 0（已有 NAS） | 0（免费额度） |
| 运维 | 自行备份与更新 | 平台托管 |
| 上传/数据库 | NAS 本地卷 | 云端对象存储 + 托管库 |
| 外网稳定性 | 依赖家庭宽带 | 更稳定 |

云原生部署见 [DEPLOY.md](./DEPLOY.md)。
