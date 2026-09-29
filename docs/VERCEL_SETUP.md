# Vercel 部署配置指南

项目通过 Vercel 的 Git 集成部署，GitHub Actions 只运行质量检查。推送到 Vercel 项目设置的生产分支后，Vercel 自动构建并发布；其它分支或 Pull Request 的预览部署由 Vercel 项目的 Git 设置决定。部署不等待 GitHub CI 成功。

## 关联 Git 仓库

1. 在 [Vercel Dashboard](https://vercel.com/dashboard) 创建或打开项目，确认关联的 Git 仓库为 `denghuacc/mz-tools`。
2. 在项目的 **Settings → Git** 中确认生产分支与实际使用的主分支一致，并按需开启预览部署。
3. 项目使用根目录的 `vercel.json`：Vite 框架、`pnpm run build` 构建命令、`dist` 输出目录及单页应用路由回退。Node.js 版本需满足 `package.json` 的要求，安装时使用项目指定的 pnpm。
4. 到 Vercel 的 **Deployments** 查看该项目的构建日志和发布状态；GitHub Actions 的 CI 结果在 [Actions](https://github.com/denghuacc/mz-tools/actions) 查看。

Git 集成不需要在 GitHub Actions 中配置 `VERCEL_TOKEN`、`VERCEL_ORG_ID` 或 `VERCEL_PROJECT_ID`。仓库里的 `pnpm deploy` / `pnpm deploy:prod` 是可选的本地手动部署脚本；使用前可运行 `pnpm vercel:config` 登录 Vercel CLI 并关联到目标项目。

## 排查

- **CI 成功但站点没有更新**：检查 Vercel 项目的 Git 仓库、生产分支以及该提交对应的部署记录。CI 成功不会主动触发 Vercel 发布。
- **Vercel 构建失败**：在 Vercel Deployments 打开该次部署的构建日志，并核对项目根目录、Node.js 版本和 `vercel.json`。本地可用 `pnpm install --frozen-lockfile` 与 `pnpm build` 复现构建。
- **站点或域名异常**：在 Vercel 项目中检查部署状态、域名归属和 DNS 设置。

正式网址：[https://mz-tools.alandeng.cc](https://mz-tools.alandeng.cc)。
