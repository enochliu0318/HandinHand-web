# HandinHand-web

大手拉小手（Hand in Hand）— 大孩子教小孩子，老师简历浏览与课程管理系统。

## 功能

- **公开页面**：家长浏览已发布老师的简历和简介
- **管理后台**：管理人员管理老师、学生，录入授课记录
- **老师面板**：查看个人授课统计和记录，编辑资料
- **家长中心**：查看孩子的上课记录

## 技术栈

- Next.js 16 + TypeScript
- Prisma + PostgreSQL（云：Neon；自托管：Docker / NAS）
- NextAuth.js（多角色认证）
- Tailwind CSS（iOS 风格 UI）

## 部署方式

| 方式 | 文档 |
|------|------|
| 云原生（Vercel + Neon + R2） | [DEPLOY.md](./DEPLOY.md) |
| 自托管（飞牛 NAS / Docker） | [NAS-DEPLOY.md](./NAS-DEPLOY.md) |

## 快速开始

```bash
cd HandinHand-web
cp .env.example .env
# 编辑 .env，填入 DATABASE_URL（本地 PostgreSQL 或 Neon 开发库）

npm install
npm run db:deploy
npm run db:seed
npm run dev
```

生产部署见 [DEPLOY.md](./DEPLOY.md)（云原生）或 [NAS-DEPLOY.md](./NAS-DEPLOY.md)（飞牛 NAS / Docker）。安全说明见 [SECURITY.md](./SECURITY.md)。

打开 http://localhost:3000

## 测试账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@handinhand.com | admin123 |
| 老师 | zhangsan@example.com | teacher123 |
| 家长 | parent@example.com | parent123 |

## 页面路由

| 路由 | 说明 | 权限 |
|------|------|------|
| `/` | 首页 | 公开 |
| `/teachers` | 老师列表 | 公开 |
| `/teachers/[id]` | 老师详情 | 公开 |
| `/login` | 登录 | 公开 |
| `/admin` | 管理后台 | 管理员 |
| `/dashboard` | 老师面板 | 老师 |
| `/parent` | 家长中心 | 家长 |

## 项目结构

```
src/
├── app/           # 页面和 API 路由
├── components/    # UI 组件（iOS 风格）
├── lib/           # 工具库（auth, prisma, upload）
└── generated/     # Prisma 生成的客户端
```
