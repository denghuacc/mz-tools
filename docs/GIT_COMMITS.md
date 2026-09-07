# Git Commit Message Management

## Purpose

- Use a consistent commit message format so the repository history remains easy to scan, search, review, and release.
- Describe the intent and user-visible effect of a change instead of merely listing edited files.
- Keep each commit focused on one logical change. Do not combine unrelated features, fixes, refactors, formatting, or generated files in the same commit.
- These rules apply whenever a commit message is proposed, generated, reviewed, amended, or created for this repository.
- This section does not grant permission to create commits. Agents must still create, amend, squash, or revert commits only when the user explicitly requests it.

## Language

- Write the commit type, optional scope, subject, body, and footer descriptions in English.
- Use clear, concise, professional language that can be understood without reading the diff first.
- Preserve exact identifiers when necessary, including component names, function names, storage keys, commands, issue IDs, and game terminology that has no reliable English equivalent.
- Do not mix Chinese and English prose in the same message unless an exact product term or quoted UI text must remain in Chinese.
- Avoid vague wording such as `update code`, `fix issue`, `change logic`, `misc changes`, `cleanup`, or `improve stuff`.

## Required Format

Use the following structure, based on Conventional Commits:

```text
<type>(<optional-scope>): <subject>

<body describing what changed and why>

<optional-footer>
```

- The first line is mandatory.
- The scope is optional and should be used only when it adds useful context.
- A meaningful body that describes the code changes is mandatory for every regular commit.
- The body may use direct `- ` list items, short paragraphs, or another clear format appropriate to the change.
- Headings such as `Changes:` are optional, but usually unnecessary when direct list items are sufficient.
- Do not include routine test, lint, or build results in the commit message. Verification remains mandatory in the development workflow and final task handoff.
- Separate the subject from the body with one blank line.
- Separate the body from footer entries with one blank line.
- Prefer short list items for commits with multiple material changes, compatibility notes, or remaining limitations.
- Do not use Markdown headings, code fences, or pasted release notes inside a normal commit message.

## Automated Enforcement

- `commitlint.config.cjs` is the executable source of truth for machine-checkable commit message rules.
- The Vite+ `commit-msg` hook runs commitlint for every local commit after `pnpm install` or `pnpm prepare`.
- The `prepare` script also configures `.gitmessage` as the local commit template to prompt authors for the required body.
- GitHub Actions validates every commit introduced by a pull request and every new commit pushed directly to a protected workflow branch.
- The automated checks enforce a Conventional Commit type, a non-empty English subject, and a meaningful body of at least 20 characters.
- Header length, subject capitalization, terminal punctuation, body layout, and section headings are not hard failures.
- Automated language validation rejects CJK characters in the subject. Exact Chinese UI text and game terminology may still be quoted in the body when necessary.
- Some semantic rules cannot be verified reliably by tooling. Authors and reviewers must still confirm that the type is accurate, the subject matches the diff, the body explains why, and issue references are real.
- Do not bypass the hook with `--no-verify`. If an emergency exception is explicitly approved by the user, document the reason and ensure the message still passes the CI check before merge.
- Run `pnpm commitlint --edit <path-to-message-file>` to validate a prepared message manually.

## Allowed Types

- `feat`: Add a new user-facing capability or materially extend an existing one.
- `fix`: Correct a defect, regression, incorrect calculation, broken interaction, or invalid behavior.
- `docs`: Change documentation only, including `README.md`, `docs/RULES.md`, data-source notes, or maintenance guides.
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

## Scope Guidelines

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

## Subject Guidelines

- Write the subject in imperative mood, as a command that completes the sentence: “This commit will ...”.
- Start with a lowercase letter unless the first word is a proper noun, acronym, or exact identifier.
- Keep the first line concise enough to scan comfortably in `git log`.
- Be specific about the behavior or outcome. Prefer `restore equipment form values after reload` over `fix local storage`.
- Do not end the subject with a period or other terminal punctuation.
- Do not include issue IDs in the subject unless repository tooling explicitly requires them.
- Do not repeat the type or scope in the subject.
- Do not use emoji, decorative prefixes, or labels such as `[fix]`, `[WIP]`, or `HOTFIX`.
- Do not describe implementation trivia when the intent is more useful. Prefer `prevent duplicate equipment entries` over `change array filter condition`.

## Body Rules

Every regular commit must include a body so `git log` provides durable context without requiring maintainers to reconstruct intent from the diff.

- Describe the actual code, configuration, test, or documentation changes in meaningful detail.
- Use direct `- ` list items when several changes should be scanned separately; a concise paragraph is also valid.
- A `Changes:` heading is allowed but not required.
- Do not use the body only for a `Verification:` section or routine check results; report verification in the task handoff and let hooks and CI enforce required checks.
- Explain why the change was needed and what behavior changed.
- Describe important before-and-after behavior, business rules, compatibility decisions, or implementation constraints.
- Mention significant alternatives or trade-offs only when they help explain the chosen solution.
- Document migration, rollout, fallback, or recovery steps when applicable.
- Call out tests that were intentionally omitted or limitations that remain.
- Use complete English sentences and wrap long lines at approximately 100 characters when practical.
- Keep the body concise enough to remain readable; do not paste raw diffs, full test output, stack traces, generated content, or conversation history.
- Do not include secrets, access tokens, cookies, private URLs, personal data, or environment-variable values.

Example:

```text
fix(storage): recover from malformed equipment cache

- Validate persisted equipment items before restoring the calculator state.
- Fall back to the default form when cached JSON is malformed.
```

## Footer Rules

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

## Breaking Changes

- Mark a breaking change by adding `!` immediately before the colon, for example `feat(storage)!: replace equipment cache schema`.
- Add a `BREAKING CHANGE:` footer that explains what is incompatible, who is affected, and what migration is required.
- Upgrade versioned `localStorage` keys when persisted data becomes incompatible, and describe the migration or safe fallback in the body.
- Do not label a change as breaking merely because internal implementation details changed.
- Do not hide a breaking behavior change under `refactor`, `chore`, or a vague subject.

Example:

```text
feat(storage)!: replace equipment cache schema

- Store normalized equipment entries under a versioned key.
- Stop reading the legacy unversioned payload.

BREAKING CHANGE: Existing unversioned equipment drafts are not migrated and
will reset to the default form after deployment.
```

## Commit Content and Atomicity

- Stage and commit only files that belong to the stated logical change.
- Review the staged diff before writing the final message so the message matches the actual commit content.
- If the staged files contain unrelated changes, split them before committing or ask the user how to proceed.
- Include directly related production code, tests, documentation, and rule updates in the same commit when they jointly implement one behavior change.
- Keep mechanical formatting separate from functional changes when the formatting would obscure the meaningful diff.
- Do not include generated directories such as `dist/`, `coverage/`, or `node_modules/`.
- Do not commit secrets, local environment files, editor state, temporary audit output, debug artifacts, or unrelated workspace changes.
- Do not use a misleading narrow subject for a broad commit, or a vague broad subject for a small targeted change.
- A commit must leave the repository in a coherent state whenever practical, including required tests, types, documentation, and migrations.

## Special Cases

- Dependency updates: use `build(deps)` and name the dependency or dependency group plus the reason or intended outcome.
- Documentation accompanying behavior: use the behavior's primary type and include the documentation in the same commit when both describe one logical change.
- Test-only regression coverage: use `test(<scope>)`; use `fix(<scope>)` when the production fix and its regression test are committed together.
- Refactoring before a feature: keep the refactor separate only when it is independently safe, behavior-preserving, and useful to review on its own.
- Reverts: use `revert: <original subject>` and explain the original commit hash, reason for reverting, and any retained changes in the body.
- Merge commits: preserve the repository or hosting platform's required merge format; do not manually create a merge commit unless the user requests it.
- Squash commits: write a new message that accurately summarizes the final squashed diff instead of reusing one incomplete intermediate message.
- Amendments: do not amend an existing commit, alter published history, or force-push unless the user explicitly requests it and the target commit is confirmed.

## Valid Examples

```text
feat(character): add equipment attribute bonuses

- Apply normalized equipment bonuses to the character summary.
- Expose source values in the editor while keeping derived totals out of storage.

Refs: #128
```

```text
fix(equipment): reject negative gem levels

- Clamp restored legacy values to the supported level range.
- Prevent malformed cached data from producing invalid equipment totals.
```

```text
docs: add Git commit message guidelines

- Document the required Conventional Commit structure and English subject rules.
- Add examples, edge cases, automated checks, and a pre-commit checklist.
```

```text
refactor(equipment): extract attribute section rendering

- Move equipment attribute section rendering into focused child components.
- Preserve the existing state ownership, DOM semantics, and user interactions.
```

```text
revert: feat(character): add equipment attribute bonuses

- Revert commit 0123456789abcdef because legacy records are not normalized.
- Preserve the unrelated equipment editor validation added afterward.
```

## Invalid Examples

- `updated files`: missing type and does not describe intent.
- `fix: fix bug`: repetitive and too vague.
- `feat: 新增装备功能`: description is not written in English.
- `chore: add character calculator`: uses the wrong type for a user-facing feature.
- `refactor: correct damage result`: hides a behavior fix under the wrong type.
- `feat(equipment,character): update`: uses multiple scopes and a vague subject.
- `fix(equipment): Fixed the broken calculation.`: not imperative, starts unnecessarily with uppercase, and ends with punctuation.
- `WIP feat: add calculator`: uses a non-standard prefix and describes incomplete work.
- `docs: add commit guidelines`: omits the required body.
- A body containing only `Verification: pnpm test (passed)`: reports checks but does not describe the code changes.
- A body containing only `update files`: is too vague to preserve useful maintenance context.
- `feat: add calculator and update CI and format all files`: combines unrelated changes.
- `fix: bypass failing tests`: describes an unacceptable workaround rather than a valid fix.

## Pre-Commit Message Checklist

Before creating or proposing a commit message, verify all of the following:

1. The user explicitly requested the commit operation if a commit will be created or modified.
2. The staged diff contains one logical change and no unrelated user work.
3. The selected type matches the primary intent and observed behavior.
4. The optional scope is stable, lowercase, and useful.
5. The subject is English, imperative, specific, concise, and has no trailing punctuation.
6. The body meaningfully describes the code changes and their reason or behavior.
7. The body is not merely verification output, metadata, a file list, or a vague restatement of the subject.
8. Breaking changes, migrations, compatibility risks, and remaining limitations are stated explicitly.
9. Issue references and metadata are accurate and were not invented.
10. The message and staged content contain no secrets, sensitive data, generated artifacts, or AI attribution.
11. The final message accurately describes every material part of the staged diff.
12. Existing hooks and checks are allowed to run; do not bypass them with `--no-verify` unless the user explicitly requests it and the risk is explained.
