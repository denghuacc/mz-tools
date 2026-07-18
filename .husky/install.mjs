import { spawnSync } from "node:child_process";

if (process.env.NODE_ENV === "production" || process.env.CI === "true") {
  process.exit(0);
}

const repositoryCheck = spawnSync(
  "git",
  ["rev-parse", "--is-inside-work-tree"],
  { stdio: "ignore" },
);

if (repositoryCheck.status !== 0) {
  process.exit(0);
}

const { default: husky } = await import("husky");
const installMessage = husky();

if (installMessage) {
  console.warn(installMessage);
}

const templateConfig = spawnSync(
  "git",
  ["config", "commit.template", ".gitmessage"],
  { stdio: "inherit" },
);

if (templateConfig.status !== 0) {
  process.exitCode = templateConfig.status ?? 1;
}
