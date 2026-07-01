# 生产部署指南（Vercel + Neon + Cloudflare R2）

本指南对应云原生部署方案：免费额度内可绑定自有域名，适合长期运营。

## 架构

```
浏览器 → Vercel（Next.js）→ Neon PostgreSQL
                        → Cloudflare R2（简历/头像）
自有域名 DNS → Vercel（自动 HTTPS）
```

## 1. 准备服务账号

### Neon PostgreSQL

1. 在 [neon.tech](https://neon.tech) 注册并创建项目
2. 复制连接字符串（含 `?sslmode=require`），作为 `DATABASE_URL`
3. **Vercel 部署请使用 Pooled connection**（主机名含 `-pooler`），避免 Serverless 连接数耗尽

### Cloudflare R2

1. Cloudflare 控制台 → R2 → 创建 Bucket
2. 开启公开访问（或绑定自定义子域名，如 `files.yourdomain.com`）
3. R2 → 管理 API 令牌 → 创建 S3 兼容密钥
4. 记录：
   - `R2_ACCOUNT_ID`（Cloudflare 账户 ID）
   - `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME`
   - `R2_PUBLIC_URL`（公开访问 URL，无尾部斜杠）

### 认证密钥

```bash
openssl rand -base64 32
```

将输出设为 `AUTH_SECRET`。

## 2. 部署到 Vercel

1. 打开 [vercel.com](https://vercel.com)，用 GitHub 导入仓库 `enochliu0318/HandinHand-web`
2. Framework Preset 选 **Next.js**（自动检测）
3. 在 **Environment Variables** 添加：

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | Neon 连接字符串 |
| `AUTH_SECRET` | 随机长字符串 |
| `AUTH_TRUST_HOST` | `true` |
| `R2_ACCOUNT_ID` | Cloudflare 账户 ID |
| `R2_ACCESS_KEY_ID` | R2 API 密钥 |
| `R2_SECRET_ACCESS_KEY` | R2 API 密钥 |
| `R2_BUCKET_NAME` | Bucket 名称 |
| `R2_PUBLIC_URL` | 文件公开访问前缀 |

4. 点击 **Deploy** 完成首次构建

构建命令使用 `npm run build`（已含 `prisma generate`）；`postinstall` 也会在安装依赖时生成 Prisma Client。

## 3. 初始化生产数据库

首次部署成功后，在本地（或 CI）对**生产库**执行迁移与种子：

```bash
# 将 DATABASE_URL 设为 Neon 生产连接串
export DATABASE_URL="postgresql://..."
export AUTH_SECRET="your-secret"

# 应用迁移
npm run db:deploy

# 创建管理员（生产必须设置强密码）
export SEED_ADMIN_PASSWORD="your-secure-admin-password"
export SEED_DEMO_DATA=false
npm run db:seed
```

或在 Neon SQL Editor 中确认表已创建后，仅运行 seed。

**默认管理员邮箱**：`admin@handinhand.com`（密码由 `SEED_ADMIN_PASSWORD` 决定）

## 4. 绑定自有域名

1. Vercel 项目 → **Settings** → **Domains** → 添加域名（如 `handinhand.example.com` 或根域名）
2. 按 Vercel 提示在域名注册商添加 DNS 记录：
   - 子域名：通常 `CNAME` → `cname.vercel-dns.com`
   - 根域名：按提示添加 `A` 记录或 ALIAS
3. 等待 SSL 证书签发（通常几分钟）
4. 访问 `https://你的域名`，确认首页与登录正常

若 DNS 托管在 Cloudflare，代理（橙色云）一般可与 Vercel 共存；遇 SSL 问题时可暂时关闭代理仅做 DNS。

## 5. 上线检查清单

- [ ] 生产环境变量已配置（`DATABASE_URL`、`AUTH_SECRET`、`AUTH_TRUST_HOST`、R2 五项）
- [ ] `npm run db:deploy` 已在生产库执行
- [ ] 管理员已创建，`SEED_ADMIN_PASSWORD` 为强密码且未泄露
- [ ] `SEED_DEMO_DATA` 未设为 `true`（避免创建测试账号）
- [ ] 简历/头像上传在生产环境实测通过（URL 为 R2 公开地址）
- [ ] 登录后各角色跳转正常（`/admin`、`/dashboard`、`/parent`）
- [ ] 账号申请 → 管理员审核流程走通
- [ ] 域名 HTTPS 可访问

## 6. 本地开发

```bash
cp .env.example .env
# 编辑 .env：填入本地或 Neon 开发分支的 DATABASE_URL

npm install
npm run db:deploy   # 或 db:migrate 创建新迁移
npm run db:seed     # 开发环境可用默认密码
npm run dev
```

未配置 R2 时，上传会写入 `public/uploads/`（仅适合本地；勿用于 Vercel 生产）。

## 7. 常用命令

| 命令 | 说明 |
|------|------|
| `npm run db:deploy` | 生产/CI 应用迁移 |
| `npm run db:seed` | 初始化管理员与（可选）演示数据 |
| `npm run build` | 构建生产包 |

## 故障排查

| 现象 | 可能原因 |
|------|----------|
| 登录后立刻退出 | 未设置 `AUTH_SECRET` 或 `AUTH_TRUST_HOST` |
| 上传失败 | R2 环境变量缺失或 Bucket 未公开 |
| 数据库连接失败 | `DATABASE_URL` 错误或 Neon 项目暂停 |
| 构建失败 | 检查 Vercel 构建日志中 Prisma generate 是否成功 |
