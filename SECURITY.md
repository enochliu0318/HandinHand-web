# 生产安全说明

## 管理员密码

生产环境 **禁止** 使用种子脚本中的默认密码（`admin123` 等）。

运行 seed 前必须设置强密码：

```bash
export SEED_ADMIN_PASSWORD="$(openssl rand -base64 24)"
export SEED_DEMO_DATA=false
npm run db:seed
```

`SEED_DEMO_DATA` 默认为 `false`（生产 `NODE_ENV=production` 时仅创建管理员，不创建演示老师/家长）。

## 环境变量

| 变量 | 要求 |
|------|------|
| `AUTH_SECRET` | 随机长字符串，勿提交到 Git |
| `DATABASE_URL` | 仅服务端使用，勿暴露给前端 |
| `R2_*` | 对象存储密钥，仅服务端使用 |

参考 [`.env.example`](./.env.example) 与 [DEPLOY.md](./DEPLOY.md)。

## 上线前检查

- [ ] `AUTH_SECRET` 已设置且与开发环境不同
- [ ] `SEED_ADMIN_PASSWORD` 为强密码，seed 后已妥善保存
- [ ] `SEED_DEMO_DATA` 未启用（无演示账号）
- [ ] R2 Bucket 权限正确（公开读、写入仅服务端）
- [ ] `/admin`、`/dashboard`、`/parent` 路由受 middleware 保护
- [ ] 默认测试账号未存在于生产库（或已改密）

## 凭证轮换

若 `AUTH_SECRET` 或数据库密码泄露，立即在 Vercel/Neon 控制台轮换，并重新部署。
