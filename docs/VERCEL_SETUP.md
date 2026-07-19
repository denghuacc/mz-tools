# Vercel 部署配置指南

## 🚀 快速配置

### 1. 获取 Vercel 配置信息

运行以下命令获取必要的配置信息：

```bash
pnpm run vercel:config
```

这个命令会：

- 安装 Vercel CLI（如果需要）
- 引导你登录 Vercel
- 链接项目到 Vercel
- 显示所需的配置信息

### 2. 配置 GitHub Secrets

访问你的 GitHub 仓库：`Settings` > `Secrets and variables` > `Actions`

添加以下 Secrets：

| Secret 名称         | 描述             | 获取方式                                           |
| ------------------- | ---------------- | -------------------------------------------------- |
| `VERCEL_TOKEN`      | Vercel API Token | [Vercel Tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID`     | 组织/用户 ID     | 运行 `pnpm run vercel:config` 获取                 |
| `VERCEL_PROJECT_ID` | 项目 ID          | 运行 `pnpm run vercel:config` 获取                 |

### 3. 验证配置

配置完成后，推送代码到 `master` 或 `main` 分支：

```bash
git push origin master
```

## 📋 详细步骤

### 获取 VERCEL_TOKEN

1. 访问 [Vercel Dashboard](https://vercel.com/account/tokens)
2. 点击 "Create Token"
3. 输入 Token 名称（如：`github-actions`）
4. 选择适当的权限范围
5. 复制生成的 Token

### 获取 ORG_ID 和 PROJECT_ID

#### 方法一：使用脚本（推荐）

```bash
pnpm run vercel:config
```

#### 方法二：手动获取

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 链接项目
vercel link

# 查看配置
cat .vercel/project.json
```

输出示例：

```json
{
  "orgId": "team_xxxxxxxxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxxxxxxxx"
}
```

### 配置 GitHub Secrets

1. 访问 GitHub 仓库页面
2. 点击 `Settings` 标签
3. 在左侧菜单选择 `Secrets and variables` > `Actions`
4. 点击 `New repository secret`
5. 添加以下三个 Secrets：

```
Name: VERCEL_TOKEN
Value: [你的 Vercel Token]

Name: VERCEL_ORG_ID
Value: [从 .vercel/project.json 获取的 orgId]

Name: VERCEL_PROJECT_ID
Value: [从 .vercel/project.json 获取的 projectId]
```

## 🔄 CI/CD 工作流

### 当前配置

- **CI 流程** (`.github/workflows/ci.yml`)

  - 代码检查 (ESLint)
  - 单元测试 (Vitest)
  - 测试覆盖率
  - 生产构建
  - 构建产物上传

- **部署流程** (`.github/workflows/deploy.yml`)
  - 仅在 CI 成功后触发
  - 仅在有 Vercel 配置时运行
  - 自动部署到生产环境

### 触发条件

- **CI**: `master`、`main`、`develop` 分支的 push，以及面向 `master`、`main` 的 PR
- **部署**: 仅 `master`/`main` 分支且 CI 成功

## 🛠️ 故障排除

### 常见问题

#### 1. "Input required and not supplied: vercel-token"

**原因**: 缺少 `VERCEL_TOKEN` Secret

**解决**: 按照上述步骤添加 GitHub Secrets

#### 2. "Project not found"

**原因**: `VERCEL_PROJECT_ID` 不正确

**解决**: 重新运行 `vercel link` 并更新 Secret

#### 3. "Insufficient permissions"

**原因**: Vercel Token 权限不足

**解决**: 重新创建 Token 并确保有部署权限

### 检查配置

```bash
# 检查本地 Vercel 配置
cat .vercel/project.json

# 测试 Vercel CLI
vercel whoami
vercel ls

# 手动部署测试
vercel --prod
```

## 📞 获取帮助

如果遇到问题：

1. 检查 [GitHub Actions](https://github.com/denghuacc/mz-tools/actions) 日志
2. 查看 [Vercel Dashboard](https://vercel.com/dashboard) 状态
3. 参考 [Vercel 文档](https://vercel.com/docs)
4. 提交 [Issue](https://github.com/denghuacc/mz-tools/issues)

---

## 🎯 配置完成后

配置完成后，你的项目将拥有：

- ✅ 自动化测试和构建
- ✅ 代码质量检查
- ✅ 自动部署到 Vercel
- ✅ 生产环境 HTTPS
- ✅ 全球 CDN 加速

每次推送到主分支都会自动触发部署！🚀
