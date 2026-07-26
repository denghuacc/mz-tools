# 部署指南

项目使用 GitHub Actions 完成质量检查，并在主分支 CI 成功后部署到 Vercel。

正式网址：[https://mz-tools.alandeng.cc](https://mz-tools.alandeng.cc)。Vercel 自动生成的网址仅用于部署排查和预览。

## 本地发布前检查

环境要求以 `package.json` 为准：Node.js 22.13 以上、pnpm 11。`pnpm/action-setup` 会直接读取 `packageManager`，工作流不再维护第二份 pnpm 版本。

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm test -- --run
pnpm test:coverage -- --run
pnpm build
```

以上命令必须全部成功。覆盖率门槛为语句、分支、函数和行各 95%。

## 自动化流程

### CI

`.github/workflows/ci.yml` 在以下情况运行：

- 推送到 `master`、`main` 或 `develop`。
- 创建或更新面向 `master`、`main` 的 Pull Request。

CI 按顺序执行依赖安装、Vite+ Oxlint 检查、覆盖率测试、生产构建，并保存 `dist/` 构建产物。当前没有单独的 PR 预览部署工作流。

### 生产部署

`.github/workflows/deploy.yml` 监听主分支 CI 结果。只有 CI 成功时才会构建并部署到 Vercel；失败或取消的 CI 不会触发生产发布。

仓库需要配置以下 GitHub Actions Secrets：

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `CODECOV_TOKEN`（可选，上传失败不会阻断 CI）

详细的 Vercel 项目关联方式见 [VERCEL_SETUP.md](./VERCEL_SETUP.md)。

## 手动部署

需要预览环境或紧急手动验证时，可以使用现有脚本：

```bash
pnpm deploy       # 预览部署
pnpm deploy:prod  # 生产部署
```

手动生产部署会绕过 GitHub 的“CI 成功后再部署”编排，仅应在本地完整检查通过后使用。

## 故障排查

- pnpm 版本冲突：确认工作流没有重新声明 `version`，并检查 `package.json#packageManager`。
- 覆盖率失败：运行 `pnpm test:coverage -- --run`，根据报告补充用户行为测试，不降低门槛。
- Vercel 鉴权失败：核对三个 Vercel Secrets 与项目归属，不要在日志或文档中输出 Secret 内容。
- 生产验证：检查 [GitHub Actions](https://github.com/denghuacc/mz-tools/actions) 和 [线上站点](https://mz-tools.alandeng.cc)。
