# AGENTS.md

本文件适用于整个仓库，是 Codex 和其他编码代理开始任务时应优先阅读的项目级说明。

## 项目概览

- 项目是《梦幻新诛仙》工具箱，当前为浏览器端 React 单页应用。
- 技术栈：React 19、TypeScript 6、Vite 8、Tailwind CSS 4、Vitest、Testing Library。
- 包管理器固定为 `pnpm@11.11.0`，Node.js 要求 `>=22.13.0`。
- 用户界面、测试描述和项目文档默认使用中文；代码标识符沿用现有英文风格。
- 优先做小而明确的修改，复用现有组件、类型、工具函数和测试模式。

## 开始任务前

1. 先阅读 `package.json` 和与任务相关的源码、测试及文档，不要根据目录名猜实现。
2. 检查工作区已有改动；未明确属于当前任务的文件和修改不得覆盖、删除或重新格式化。
3. 数值规则相关任务先读 `RULES.md`，资料内容相关任务先读 `docs/DATA_SOURCES.md`。
4. 计算器表单或本地状态相关任务必须先读 `docs/LOCAL_STORAGE.md`。
5. 需求略有歧义时，优先依据现有实现做可逆的小改动；只有会明显改变产品行为时才询问。

## 常用命令

```bash
pnpm install
pnpm dev
pnpm lint
pnpm test --run
pnpm test --run path/to/file.test.tsx
pnpm test:coverage -- --run
pnpm build
```

- 使用仓库已有的 pnpm，不要混用 npm、yarn 或 bun。
- 先运行最小相关测试，再根据修改范围运行 lint、全量测试和 build。
- 不要声称检查通过，除非当前任务中实际运行并看到成功结果。

## 目录职责

- `src/components/`：计算器和可复用界面组件。
- `src/components/equipment/`：装备编辑器的分区组件。
- `src/hooks/`：包含状态或行为的 React hooks。
- `src/utils/`：计算规则、数据转换、本地存储和无界面业务逻辑。
- `src/pages/`：顶层功能页面。
- `src/data/`：人工整理的静态产品资料。
- `src/**/__tests__/`、`src/__tests__/`：单元、组件和应用级测试。
- `docs/`：维护约定、数据来源和历史测试记录。

## 实现约束

- TypeScript 保持 strict，不使用不必要的 `any`、`@ts-ignore` 或宽泛类型断言。
- 不新增依赖，除非现有能力无法安全完成需求；新增前说明原因和替代方案。
- 不为单次使用的简单逻辑创建抽象层，不重构与任务无关的工作代码。
- 计算逻辑优先放在 `src/utils/` 并写单元测试，组件负责输入和展示。
- 错误不能静默吞掉；仅当浏览器能力不可用但产品仍可降级运行时，才允许安全回退。
- 保持当前中文文案、无障碍标签和响应式设计风格。
- 注释说明业务规则、兼容性或原因，不重复代码表面行为。

## 组件优化约定

- 优化前先定位实际问题：可读性、重复代码、状态耦合、渲染性能或测试困难；不要只因文件较长就整体重写。
- 优先做行为不变的局部拆分。一次只处理一个清晰区域，不在功能需求中顺带重构整个组件树。
- 当一块界面拥有独立职责、独立交互、可单独测试，或在多个位置复用时，再提取为子组件；简单标签和一次性包装层不要组件化。
- 计算和数据转换移到 `src/utils/`，可复用的有状态行为移到 `src/hooks/`，页面布局和展示逻辑保留在组件中。
- 状态放在最低且足够共享的共同父级，避免无意义地提升为全局状态，也不要在多个组件中保存同一份可变数据。
- 能从 props 或现有 state 计算出的值保持为派生值，不额外放入 state；避免使用 effect 同步两份状态。
- 表单组件优先采用明确的受控输入和类型化 props，保持数据流从父到子、事件从子到父。
- 避免层层透传大量无关 props；如果只是局部组件群共享，先考虑重新划分组件边界，不要立即引入新的状态库或 Context。
- `useMemo`、`useCallback` 和 `memo` 只用于已确认的昂贵计算、稳定引用要求或实际渲染热点；不要为了形式上的“优化”普遍添加。
- 性能问题先复现或测量，再优化。优先减少重复计算、无效状态更新和大列表重渲染，列表必须使用稳定且业务唯一的 key。
- 拆分后保持现有中文文案、DOM 语义、ARIA 标签、键盘操作和响应式布局，不为组件复用牺牲可访问性。
- 组件重构必须保留现有测试；新增独立交互组件时补组件测试，公共计算逻辑拆出后补工具函数单元测试。
- 完成优化后至少运行相关测试、`pnpm lint` 和 `pnpm build`；涉及共享状态、持久化或核心计算时运行全量测试。

## 游戏规则与资料

- 不得把未核验的游戏数值描述为已验证事实。
- 调整转换比例、等级属性或装备规则时，同步更新 `RULES.md`、对应配置和测试。
- 数据查询与攻略内容优先引用官网或官方公告，维护要求见 `docs/DATA_SOURCES.md`。
- 没有可靠来源时明确标记“待复核”，不要用推测补全数值。

## 本地持久化硬规则

- 属性多、重新录入成本高的计算器表单必须保存到 `localStorage`，刷新后自动恢复。
- 新增长期表单字段时，必须同步更新状态类型、默认值、读取校验、保存对象和 effect 依赖。
- 新增装备字段时，同时更新 `EquipmentItem` 和 `normalizeEquipmentItem`。
- 存储 key 必须带版本号；不兼容变更需要升级版本并决定迁移或安全回退。
- 只保存原始输入和用户配置，不保存可重新计算的结果、错误、弹窗或临时页签状态。
- 不在本地存储令牌、密钥或其他敏感信息。
- 持久化行为至少覆盖“修改输入、卸载或刷新、重新恢复”的测试；损坏缓存不得阻断计算器。
- 完整检查清单和当前 key 见 `docs/LOCAL_STORAGE.md`。

## 测试要求

- 行为变化必须增加或更新最接近该行为的测试，不通过删除测试或降低断言来修复失败。
- 组件交互优先使用 Testing Library 和用户可见角色、名称，不依赖脆弱的 CSS 选择器。
- `src/test/setup.ts` 会在每个测试前清空 `localStorage`；持久化测试需要在同一用例中完成写入和恢复。
- 数值计算同时覆盖正常路径、边界值和非法输入。
- 修改完成后通常至少运行：相关测试、`pnpm lint`、`pnpm build`；影响公共状态或计算规则时运行全量 `pnpm test --run`。

## Git Commit Message Management

### Purpose

- Use a consistent commit message format so the repository history remains easy to scan, search, review, and release.
- Describe the intent and user-visible effect of a change instead of merely listing edited files.
- Keep each commit focused on one logical change. Do not combine unrelated features, fixes, refactors, formatting, or generated files in the same commit.
- These rules apply whenever a commit message is proposed, generated, reviewed, amended, or created for this repository.
- This section does not grant permission to create commits. Agents must still create, amend, squash, or revert commits only when the user explicitly requests it.

### Language

- Write the commit type, optional scope, subject, body, and footer descriptions in English.
- Use clear, concise, professional language that can be understood without reading the diff first.
- Preserve exact identifiers when necessary, including component names, function names, storage keys, commands, issue IDs, and game terminology that has no reliable English equivalent.
- Do not mix Chinese and English prose in the same message unless an exact product term or quoted UI text must remain in Chinese.
- Avoid vague wording such as `update code`, `fix issue`, `change logic`, `misc changes`, `cleanup`, or `improve stuff`.

### Required Format

Use the following structure, based on Conventional Commits:

```text
<type>(<optional-scope>): <subject>

Changes:
- <what changed and why>
- <another material change, if applicable>

Verification:
- <command and result, or "Not run (reason: ...)">

<optional-footer>
```

- The first line is mandatory.
- The scope is optional and should be used only when it adds useful context.
- A `Changes:` body section with at least one `- ` list item is mandatory for every regular commit.
- A `Verification:` section with at least one `- ` list item is mandatory and must report only commands that were actually run.
- Separate the subject from the body with one blank line.
- Separate the body from footer entries with one blank line.
- Do not add extra blank lines at the beginning or end of the message.
- Use short list items for material changes, verification results, compatibility notes, and remaining limitations.
- Do not use Markdown headings, code fences, or pasted release notes inside a normal commit message.

### Automated Enforcement

- `commitlint.config.cjs` is the executable source of truth for machine-checkable commit message rules.
- The Husky `commit-msg` hook runs commitlint for every local commit after `pnpm install` or `pnpm prepare`.
- The `prepare` script also configures `.gitmessage` as the local commit template to prompt authors for the required sections.
- GitHub Actions validates every commit introduced by a pull request and every new commit pushed directly to a protected workflow branch.
- The automated checks enforce the allowed types, lowercase scope, English subject, 72-character header limit, minimum subject detail, body presence, and the required `Changes:` and `Verification:` lists.
- Automated language validation rejects CJK characters in the subject. Exact Chinese UI text and game terminology may still be quoted in the body when necessary.
- Some semantic rules cannot be verified reliably by tooling. Authors and reviewers must still confirm that the type is accurate, the subject matches the diff, the body explains why, issue references are real, and verification claims are truthful.
- Do not bypass the hook with `--no-verify`. If an emergency exception is explicitly approved by the user, document the reason and ensure the message still passes the CI check before merge.
- Run `pnpm commitlint --edit <path-to-message-file>` to validate a prepared message manually.

### Allowed Types

- `feat`: Add a new user-facing capability or materially extend an existing one.
- `fix`: Correct a defect, regression, incorrect calculation, broken interaction, or invalid behavior.
- `docs`: Change documentation only, including `README.md`, `RULES.md`, data-source notes, or maintenance guides.
- `test`: Add, update, or reorganize tests without changing production behavior.
- `refactor`: Restructure production code without intentionally changing external behavior.
- `perf`: Improve measured or clearly identified performance characteristics without changing expected behavior.
- `style`: Apply formatting, whitespace, or other non-functional source changes. Do not use this type for visual UI changes.
- `build`: Change build tooling, dependencies, package metadata, bundling, or compilation configuration.
- `ci`: Change continuous integration, automation, checks, or deployment workflow configuration.
- `chore`: Perform repository maintenance that does not fit another type and does not change product behavior.
- `revert`: Revert a previous commit. Include the reverted commit hash and reason in the body.

Choose the type according to the primary intent:

- Use `fix`, not `refactor`, when users receive corrected behavior.
- Use `feat`, not `chore`, when users gain a new capability.
- Use `docs`, not `chore`, for documentation-only changes.
- Use `test`, not `fix`, when only tests change.
- Use `build` for dependency and build-system changes; use `ci` for pipeline and workflow changes.
- Use `style` only for non-functional formatting. Use `feat` or `fix` for CSS or layout changes that affect the interface.

### Scope Rules

- Use a short, lowercase noun that identifies the affected feature or technical area.
- Prefer stable domain names already present in the project, such as `equipment`, `character`, `storage`, `rules`, `tests`, `build`, or `deps`.
- Use hyphens for a multi-word scope, for example `local-storage`.
- Do not use file names, ticket numbers, personal names, branch names, or overly broad scopes such as `app`, `code`, `misc`, or `changes` unless they are truly the clearest domain boundary.
- Omit the scope when a change spans several areas or when a scope would add no meaningful information.
- Use at most one scope. If multiple scopes appear necessary, consider whether the commit contains more than one logical change.

Examples:

```text
feat(equipment): add gem bonus configuration
fix(character): prevent invalid attribute totals
docs(rules): document equipment conversion ratios
test(storage): cover corrupted cache recovery
build(deps): update Vitest to 4.1.10
```

### Subject Rules

- Write the subject in imperative mood, as a command that completes the sentence: “This commit will ...”.
- Start with a lowercase letter unless the first word is a proper noun, acronym, or exact identifier.
- Keep the entire first line at 72 characters or fewer whenever practical.
- Be specific about the behavior or outcome. Prefer `restore equipment form values after reload` over `fix local storage`.
- Do not end the subject with a period or other terminal punctuation.
- Do not include issue IDs in the subject unless repository tooling explicitly requires them.
- Do not repeat the type or scope in the subject.
- Do not use emoji, decorative prefixes, or labels such as `[fix]`, `[WIP]`, or `HOTFIX`.
- Do not describe implementation trivia when the intent is more useful. Prefer `prevent duplicate equipment entries` over `change array filter condition`.

### Body Rules

Every regular commit must include a body so `git log` provides durable context without requiring maintainers to reconstruct intent from the diff.

- Start with an exact `Changes:` heading and list each material change using `- `.
- Explain why the change was needed and what behavior changed in the list items.
- Describe important before-and-after behavior, business rules, compatibility decisions, or implementation constraints.
- Mention significant alternatives or trade-offs only when they help explain the chosen solution.
- Document migration, rollout, fallback, or recovery steps when applicable.
- Call out tests that were intentionally omitted or limitations that remain.
- Add a `Verification:` section with list items for actual commands and results.
- Write `- Not run (reason: ...)` when verification was not run; never omit the section.
- Use complete English sentences and wrap long lines at approximately 100 characters when practical.
- Keep the body concise enough to remain readable; do not paste raw diffs, full test output, stack traces, generated content, or conversation history.
- Do not claim that tests, lint, type checking, or builds passed unless they were actually run for that change.
- Do not include secrets, access tokens, cookies, private URLs, personal data, or environment-variable values.

Example:

```text
fix(storage): recover from malformed equipment cache

Changes:
- Validate persisted equipment items before restoring the calculator state.
- Fall back to the default form when cached JSON is malformed.

Verification:
- pnpm test --run src/utils/__tests__/storage.test.ts (passed)
```

### Footer Rules

- Use footers for issue references, breaking changes, co-authorship required by the user, or structured metadata required by repository tooling.
- Write one footer entry per line using Git trailer syntax where applicable.
- Reference issues with forms such as `Refs: #123`, `Closes: #123`, or `Fixes: #123` only when the relationship is accurate.
- Use `Closes` or `Fixes` only when merging the commit should resolve the referenced issue. Use `Refs` for related work that does not close it.
- Do not invent issue numbers, reviewer names, co-authors, sign-off lines, or external links.
- Do not add AI-generated attribution, assistant names, or automated co-author trailers unless the user explicitly requests them.
- Follow any legally required `Signed-off-by` policy if the repository adopts one; otherwise do not add it automatically.

Examples:

```text
Refs: #123
Fixes: #456
Co-authored-by: Example User <user@example.com>
```

### Breaking Changes

- Mark a breaking change by adding `!` immediately before the colon, for example `feat(storage)!: replace equipment cache schema`.
- Add a `BREAKING CHANGE:` footer that explains what is incompatible, who is affected, and what migration is required.
- Upgrade versioned `localStorage` keys when persisted data becomes incompatible, and describe the migration or safe fallback in the body.
- Do not label a change as breaking merely because internal implementation details changed.
- Do not hide a breaking behavior change under `refactor`, `chore`, or a vague subject.

Example:

```text
feat(storage)!: replace equipment cache schema

Changes:
- Store normalized equipment entries under a versioned key.
- Stop reading the legacy unversioned payload.

Verification:
- pnpm test --run src/utils/__tests__/storage.test.ts (passed)

BREAKING CHANGE: Existing unversioned equipment drafts are not migrated and
will reset to the default form after deployment.
```

### Commit Content and Atomicity

- Stage and commit only files that belong to the stated logical change.
- Review the staged diff before writing the final message so the message matches the actual commit content.
- If the staged files contain unrelated changes, split them before committing or ask the user how to proceed.
- Include directly related production code, tests, documentation, and rule updates in the same commit when they jointly implement one behavior change.
- Keep mechanical formatting separate from functional changes when the formatting would obscure the meaningful diff.
- Do not include generated directories such as `dist/`, `coverage/`, or `node_modules/`.
- Do not commit secrets, local environment files, editor state, temporary audit output, debug artifacts, or unrelated workspace changes.
- Do not use a misleading narrow subject for a broad commit, or a vague broad subject for a small targeted change.
- A commit must leave the repository in a coherent state whenever practical, including required tests, types, documentation, and migrations.

### Special Cases

- Dependency updates: use `build(deps)` and name the dependency or dependency group plus the reason or intended outcome.
- Documentation accompanying behavior: use the behavior's primary type and include the documentation in the same commit when both describe one logical change.
- Test-only regression coverage: use `test(<scope>)`; use `fix(<scope>)` when the production fix and its regression test are committed together.
- Refactoring before a feature: keep the refactor separate only when it is independently safe, behavior-preserving, and useful to review on its own.
- Reverts: use `revert: <original subject>` and explain the original commit hash, reason for reverting, and any retained changes in the body.
- Merge commits: preserve the repository or hosting platform's required merge format; do not manually create a merge commit unless the user requests it.
- Squash commits: write a new message that accurately summarizes the final squashed diff instead of reusing one incomplete intermediate message.
- Amendments: do not amend an existing commit, alter published history, or force-push unless the user explicitly requests it and the target commit is confirmed.

### Valid Examples

```text
feat(character): add equipment attribute bonuses

Changes:
- Apply normalized equipment bonuses to the character summary.
- Expose source values in the editor while keeping derived totals out of storage.

Verification:
- pnpm test --run src/utils/__tests__/characterAttributes.test.ts (passed)

Refs: #128
```

```text
fix(equipment): reject negative gem levels

Changes:
- Clamp restored legacy values to the supported level range.
- Prevent malformed cached data from producing invalid equipment totals.

Verification:
- pnpm test --run src/utils/__tests__/equipmentAttributes.test.ts (passed)
```

```text
docs: add Git commit message guidelines

Changes:
- Document the required Conventional Commit structure and English subject rules.
- Add examples, edge cases, automated checks, and a pre-commit checklist.

Verification:
- pnpm exec commitlint --edit /tmp/commit-message.txt (passed)
```

```text
refactor(equipment): extract attribute section rendering

Changes:
- Move equipment attribute section rendering into focused child components.
- Preserve the existing state ownership, DOM semantics, and user interactions.

Verification:
- pnpm test --run src/components/__tests__/EquipmentCalculator.test.tsx (passed)
```

```text
revert: feat(character): add equipment attribute bonuses

Changes:
- Revert commit 0123456789abcdef because legacy records are not normalized.
- Preserve the unrelated equipment editor validation added afterward.

Verification:
- pnpm test --run src/utils/__tests__/characterAttributes.test.ts (passed)
```

### Invalid Examples

- `updated files`: missing type and does not describe intent.
- `fix: fix bug`: repetitive and too vague.
- `feat: 新增装备功能`: description is not written in English.
- `chore: add character calculator`: uses the wrong type for a user-facing feature.
- `refactor: correct damage result`: hides a behavior fix under the wrong type.
- `feat(equipment,character): update`: uses multiple scopes and a vague subject.
- `fix(equipment): Fixed the broken calculation.`: not imperative, starts unnecessarily with uppercase, and ends with punctuation.
- `WIP feat: add calculator`: uses a non-standard prefix and describes incomplete work.
- `docs: add commit guidelines`: omits the required `Changes:` body section.
- A body containing only `Changes:`: omits the required `- ` list item.
- A body without `Verification:`: omits mandatory verification status from the log.
- `feat: add calculator and update CI and format all files`: combines unrelated changes.
- `fix: bypass failing tests`: describes an unacceptable workaround rather than a valid fix.

### Pre-Commit Message Checklist

Before creating or proposing a commit message, verify all of the following:

1. The user explicitly requested the commit operation if a commit will be created or modified.
2. The staged diff contains one logical change and no unrelated user work.
3. The selected type matches the primary intent and observed behavior.
4. The optional scope is stable, lowercase, and useful.
5. The subject is English, imperative, specific, concise, and has no trailing punctuation.
6. The body contains a `Changes:` section with specific list items explaining the reason and behavior.
7. The body contains a `Verification:` section listing actual results or a clear reason checks were not run.
8. Breaking changes, migrations, compatibility risks, and remaining limitations are stated explicitly.
9. Issue references and metadata are accurate and were not invented.
10. Verification claims match commands that were actually run.
11. The message and staged content contain no secrets, sensitive data, generated artifacts, or AI attribution.
12. The final message accurately describes every material part of the staged diff.
13. Existing hooks and checks are allowed to run; do not bypass them with `--no-verify` unless the user explicitly requests it and the risk is explained.

## 禁止事项

- 不自动创建 commit、push、PR 或部署。
- 不打印或提交环境变量、令牌、Cookie、私钥和证书。
- 不删除用户代码，不修改无关文件，不对整个项目做无关格式化。
- 不手动编辑生成目录，如 `dist/`、`coverage/` 或 `node_modules/`。
- 不使用破坏性 Git 命令覆盖当前工作区。

## 完成交付

最终说明保持简短，并包含：

1. 改了什么。
2. 为什么这样改。
3. 实际运行了哪些验证。
4. 尚存风险或需要注意的行为。
