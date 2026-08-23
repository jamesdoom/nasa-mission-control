import { spawn } from "node:child_process";
import path from "node:path";

const playwrightCli = path.resolve("node_modules/@playwright/test/cli.js");
const child = spawn(process.execPath, [playwrightCli, "test"], {
  stdio: "inherit",
  env: { ...process.env, UPDATE_SCREENSHOTS: "true" },
});

child.on("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
