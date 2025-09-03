# 部署指南 - Deployment Guide

## 🚀 Vercel 部署

### 快速部署

1. **Fork 或 Clone 项目**

   ```bash
   git clone https://github.com/alanwhy/mz-tools.git
   cd mz-tools
   ```

2. **安装依赖**

   ```bash
   pnpm install
   ```

3. **本地测试**

   ```bash
   pnpm run test
   pnpm run build
   pnpm run preview
   ```

4. **部署到 Vercel**

   - 方式一：通过 Vercel Dashboard

     - 访问 [vercel.com](https://vercel.com)
     - 导入 GitHub 仓库
     - 自动部署

   - 方式二：通过 CLI
     ```bash
     npm install -g vercel
     vercel login
     pnpm run deploy
     ```

### 环境配置

#### GitHub Secrets 配置

在 GitHub 仓库的 Settings > Secrets and variables > Actions 中添加：

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
CODECOV_TOKEN=your_codecov_token (可选)
```

#### 获取 Vercel 配置信息

1. **VERCEL_TOKEN**

   - 访问 [Vercel Dashboard](https://vercel.com/account/tokens)
   - 创建新的 Token

2. **VERCEL_ORG_ID & VERCEL_PROJECT_ID**
   ```bash
   vercel link
   cat .vercel/project.json
   ```

### 自动化部署流程

#### CI/CD 流程

- ✅ **代码检查** - ESLint 静态分析
- ✅ **单元测试** - Vitest 测试套件
- ✅ **覆盖率报告** - 代码覆盖率统计
- ✅ **构建验证** - 生产环境构建
- ✅ **预览部署** - PR 自动预览
- ✅ **生产部署** - master 分支自动部署

#### 分支策略

- `master/main` → 生产环境自动部署
- `develop` → 开发环境自动部署
- `feature/*` → PR 预览部署

### 部署命令

```bash
# 本地开发
pnpm run dev

# 运行测试
pnpm run test
pnpm run test:coverage

# 构建项目
pnpm run build

# 预览构建
pnpm run preview

# 部署到预览环境
pnpm run deploy

# 部署到生产环境
pnpm run deploy:prod
```

### 性能优化

#### 构建优化

- ✅ Tree Shaking - 自动移除未使用代码
- ✅ 代码分割 - 按需加载组件
- ✅ 资源压缩 - Gzip/Brotli 压缩
- ✅ 缓存策略 - 静态资源长期缓存

#### Vercel 优化

- ✅ Edge Functions - 边缘计算
- ✅ CDN 加速 - 全球内容分发
- ✅ 自动 HTTPS - SSL 证书自动配置
- ✅ 域名配置 - 自定义域名支持

### 监控和分析

#### Vercel Analytics

```bash
npm install @vercel/analytics
```

#### 性能监控

- Core Web Vitals 监控
- 实时性能指标
- 用户体验分析

### 故障排除

#### 常见问题

1. **构建失败**

   ```bash
   # 检查依赖
   pnpm install

   # 本地构建测试
   pnpm run build
   ```

2. **测试失败**

   ```bash
   # 运行测试
   pnpm run test

   # 查看详细报告
   pnpm run test:ui
   ```

3. **部署失败**

   ```bash
   # 检查 Vercel 配置
   vercel whoami
   vercel ls

   # 重新链接项目
   vercel link
   ```

#### 日志查看

```bash
# Vercel 部署日志
vercel logs

# GitHub Actions 日志
# 访问 GitHub > Actions 标签页
```

### 安全配置

#### 环境变量

- 敏感信息使用环境变量
- 生产环境独立配置
- 定期轮换 Token

#### 安全头部

- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Content Security Policy

---

## 📞 支持

如果遇到部署问题，请：

1. 检查 [GitHub Actions](https://github.com/alanwhy/mz-tools/actions) 日志
2. 查看 [Vercel Dashboard](https://vercel.com/dashboard) 状态
3. 提交 [Issue](https://github.com/alanwhy/mz-tools/issues) 报告问题
