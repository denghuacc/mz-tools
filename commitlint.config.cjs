const allowedTypes = [
  "build",
  "chore",
  "ci",
  "docs",
  "feat",
  "fix",
  "perf",
  "refactor",
  "revert",
  "style",
  "test",
];

const cjkCharacterPattern = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/u;
const vagueSubjectPattern =
  /^(update|fix|change|cleanup|misc|work|wip|adjust|improve)( (code|files?|stuff|issues?|bugs?|things?))?$/iu;

const hasListSection = ({ body, footer }, heading) => {
  const lines = [body, footer]
    .filter(Boolean)
    .join("\n")
    .split(/\r?\n/u);
  const sectionIndex = lines.indexOf(heading);
  const firstItem = sectionIndex >= 0 ? lines[sectionIndex + 1] : undefined;

  return Boolean(firstItem && /^- \S/u.test(firstItem));
};

const localRules = {
  "subject-no-cjk": ({ subject }) => [
    !subject || !cjkCharacterPattern.test(subject),
    "subject must be written in English; keep Chinese UI text in the body",
  ],
  "subject-not-vague": ({ subject }) => [
    !subject || !vagueSubjectPattern.test(subject.trim()),
    "subject must describe a specific behavior or outcome",
  ],
  "changes-section-required": (parsed) => [
    hasListSection(parsed, "Changes:"),
    'body must contain a "Changes:" section followed by at least one "- " list item',
  ],
  "verification-section-required": (parsed) => [
    hasListSection(parsed, "Verification:"),
    'body must contain a "Verification:" section followed by at least one "- " list item',
  ],
};

module.exports = {
  extends: ["@commitlint/config-conventional"],
  plugins: [{ rules: localRules }],
  rules: {
    "body-max-line-length": [2, "always", 100],
    "body-min-length": [2, "always", 20],
    "changes-section-required": [2, "always"],
    "footer-max-line-length": [2, "always", 100],
    "header-max-length": [2, "always", 72],
    "scope-case": [2, "always", "lower-case"],
    "subject-min-length": [2, "always", 10],
    "subject-no-cjk": [2, "always"],
    "subject-not-vague": [2, "always"],
    "type-enum": [2, "always", allowedTypes],
    "verification-section-required": [2, "always"],
  },
};
