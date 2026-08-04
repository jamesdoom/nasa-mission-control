import type { IncomingMessage, ServerResponse } from "node:http";
import { createApp } from "../apps/server/src/app.js";
import { parseEnv } from "../apps/server/src/config/env.js";
import { removeVercelRouteParameter } from "../apps/server/src/lib/vercel-url.js";

const app = createApp(parseEnv(process.env));

export default function handler(
  request: IncomingMessage,
  response: ServerResponse,
): void {
  request.url = removeVercelRouteParameter(request.url ?? "/");
  app(request, response);
}
