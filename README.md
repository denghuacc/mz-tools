# 梦幻新诛仙工具箱

一个专为《梦幻新诛仙》游戏玩家打造的实用工具箱，提供一些游戏辅助功能。

正式网址：[https://mz-tools.alandeng.cc](https://mz-tools.alandeng.cc)

## 功能

- [x] 69 / 89 / 110 级角色面板计算器：按等级分配五维潜力点并计算当前已知的派生属性。
- [x] 角色装备计算器：录入八件装备，区分六件基础装备与全等级赛年神装，并汇总到角色面板。
- [x] 灵兽面板计算器（测试版）：录入五维、资质、成长、亲和与加成来源，计算当前已知的灵兽面板属性。
- [x] 武器属性转换器：计算不同门派武器转换后的属性值。
- [x] 戒指属性转换器：计算不同职业戒指主属性转换后的数值。
- [x] 角色面板、八件装备、灵兽面板等高输入量表单，以及角色与灵兽的三个本地存档位保存在当前浏览器中。
- [x] 游戏资料查询：查询现有 13 个门派、装备机制、灵兽与坐骑定位及官网出处。
- [x] 官方攻略索引：按主题浏览官网攻略与版本资料。
- [x] 本地收藏与设置：收藏常用资料，并管理当前浏览器中的本地数据。

当前规则与数据核验状态见 [docs/RULES.md](./docs/RULES.md)。
资料来源和维护范围见 [docs/DATA_SOURCES.md](./docs/DATA_SOURCES.md)。
本地数据的保存范围和开发检查清单见 [docs/LOCAL_STORAGE.md](./docs/LOCAL_STORAGE.md)。

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 运行测试
pnpm test -- --run

# 运行 CI 使用的覆盖率门禁
pnpm test:coverage -- --run

# Vite+ 静态检查与生产构建
pnpm check
pnpm lint
pnpm build
```

项目使用 beta 阶段的 Vite+ 统一 Vite、Vitest、Oxlint、Oxfmt 与 Git staged 检查配置。
工具配置集中在 `vite.config.ts`；TypeScript 项目边界和提交信息规则仍使用各自配置文件。

## 贡献与维护

如果你想提交改进：

- 保持较小改动且附带测试用例；重大变更请先发 Issue 讨论。
- 使用 Codex 或其他编码代理开发前，先阅读 [AGENTS.md](./AGENTS.md)。
- 项目状态徽章的清单与维护方式见 [README_BADGES.md](./README_BADGES.md)。
- 该仓库以个人兴趣为主，不保证长期兼容性或对外支持。

## 许可证

MIT
