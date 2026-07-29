import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { parseEnv } from "./config/env.js";
import { logger } from "./lib/logger.js";

const env = parseEnv(process.env);
const staticDirectory =
  env.NODE_ENV === "production"
    ? fileURLToPath(new URL("../../client/dist", import.meta.url))
    : undefined;
const server = createApp(env, undefined, staticDirectory).listen(
  env.PORT,
  () => {
    logger.info("server.started", {
      port: env.PORT,
      environment: env.NODE_ENV,
      demoKey: env.NASA_API_KEY === "DEMO_KEY",
    });
  },
);

function shutdown(signal: string): void {
  logger.info("server.shutdown_started", { signal });
  const shutdownTimer = setTimeout(() => {
    logger.error("server.shutdown_timeout");
    process.exit(1);
  }, 10_000);
  shutdownTimer.unref();
  server.close((error) => {
    clearTimeout(shutdownTimer);
    if (error) {
      logger.error("server.shutdown_failed", { errorName: error.name });
      process.exitCode = 1;
      return;
    }
    logger.info("server.shutdown_complete");
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
