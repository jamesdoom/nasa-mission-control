import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import path from "node:path";
import type { Env } from "./config/env.js";
import { NasaClient } from "./lib/nasa-client.js";
import {
  errorHandler,
  notFound,
  requestId,
  requestLogger,
} from "./middleware/errors.js";
import { createApodRouter } from "./routes/apod.js";
import { createAsteroidRouter } from "./routes/asteroids.js";
import { createMediaRouter } from "./routes/media.js";
import { createSpaceWeatherRouter } from "./routes/space-weather.js";

export function createApp(
  env: Env,
  nasa = new NasaClient({
    apiKey: env.NASA_API_KEY,
    timeoutMs: env.NASA_REQUEST_TIMEOUT_MS,
  }),
  staticDirectory?: string,
): Express {
  const app = express();
  app.disable("x-powered-by");
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );
  app.use(cors({ origin: env.CLIENT_ORIGIN }));
  app.use(express.json({ limit: "16kb" }));
  app.use(requestId);
  if (env.NODE_ENV !== "test") app.use(requestLogger);
  app.get("/api/health", (_request, response) =>
    response.json({ status: "ok" }),
  );
  app.use(
    "/api/apod",
    createApodRouter(nasa, env.NASA_CACHE_TTL_MS, env.NASA_CACHE_MAX_ENTRIES),
  );
  app.use(
    "/api/asteroids",
    createAsteroidRouter(
      nasa,
      env.NASA_CACHE_TTL_MS,
      env.NASA_CACHE_MAX_ENTRIES,
    ),
  );
  app.use(
    "/api/media",
    createMediaRouter(nasa, env.NASA_CACHE_TTL_MS, env.NASA_CACHE_MAX_ENTRIES),
  );
  app.use(
    "/api/space-weather",
    createSpaceWeatherRouter(
      nasa,
      env.NASA_CACHE_TTL_MS,
      env.NASA_CACHE_MAX_ENTRIES,
    ),
  );
  if (staticDirectory) {
    app.use(express.static(staticDirectory));
    app.get("/*splat", (request, response, next) => {
      if (request.path.startsWith("/api/")) {
        next();
        return;
      }
      response.sendFile(path.join(staticDirectory, "index.html"));
    });
  }
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
