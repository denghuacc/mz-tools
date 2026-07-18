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

const localRules = {
  "subject-no-cjk": ({ subject }) => [
    !subject || !cjkCharacterPattern.test(subject),
    "subject must be written in English; keep Chinese UI text in the body",
  ],
  "body-required": ({ body }) => [
    Boolean(body?.trim()),
    "body must describe the code changes in meaningful detail",
  ],
};

module.exports = {
  extends: ["@commitlint/config-conventional"],
  plugins: [{ rules: localRules }],
  rules: {
    "body-max-line-length": [0],
    "body-min-length": [2, "always", 20],
    "body-required": [2, "always"],
    "footer-max-line-length": [0],
    "header-max-length": [0],
    "subject-case": [0],
    "subject-full-stop": [0],
    "subject-no-cjk": [2, "always"],
    "type-enum": [2, "always", allowedTypes],
  },
};
