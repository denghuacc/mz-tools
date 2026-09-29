# 部署指南

项目使用 GitHub Actions 完成质量检查，Vercel 通过 Git 集成构建并部署站点。

正式网址：[https://mz-tools.alandeng.cc](https://mz-tools.alandeng.cc)。Vercel 自动生成的网址仅用于部署排查和预览。

## 本地发布前检查

环境要求以 `package.json` 为准：Node.js 22.18 以上、pnpm 11。`pnpm/action-setup` 会直接读取 `packageManager`，工作流不再维护第二份 pnpm 版本。

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

Vercel 项目的 Git 集成负责部署。推送到项目设置的生产分支后，Vercel 自动构建和发布；是否为其它分支或 Pull Request 创建预览部署取决于 Vercel 的 Git 设置。GitHub CI 和 Vercel 构建分别运行，CI 结果不会阻止 Vercel 发布。

Vercel 使用根目录的 `vercel.json` 指定构建命令与输出目录。关联仓库及生产分支的检查方式见 [VERCEL_SETUP.md](./VERCEL_SETUP.md)。Git 集成不需要 GitHub Actions 的 Vercel Secrets；`CODECOV_TOKEN` 仍是 CI 中可选的上传凭据。

## 手动部署

需要预览环境或紧急手动验证时，可以使用现有脚本：

```bash
pnpm deploy       # 预览部署
pnpm deploy:prod  # 生产部署
```

手动生产部署由本地直接发起，不经过 GitHub CI；运行前请确认本地检查通过，并核对关联的 Vercel 项目。

## 故障排查

- pnpm 版本冲突：确认 `package.json#packageManager` 与本地或 Vercel 构建环境一致。
- 覆盖率失败：运行 `pnpm test:coverage -- --run`，根据报告补充用户行为测试，不降低门槛。
- Vercel 部署失败：在 Vercel Dashboard 中查看对应提交的构建日志，核对 Git 仓库、生产分支和项目配置。
- 生产验证：检查 [GitHub Actions](https://github.com/denghuacc/mz-tools/actions) 和 [线上站点](https://mz-tools.alandeng.cc)。
