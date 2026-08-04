import type { IncomingMessage, ServerResponse } from "node:http";
import { createApp } from "../apps/server/src/app.js";
import { parseEnv } from "../apps/server/src/config/env.js";
import {
  removeVercelRouteParameter,
  removeVercelRouteQuery,
} from "../apps/server/src/lib/vercel-url.js";

const app = createApp(parseEnv(process.env));
type VercelIncomingMessage = IncomingMessage & {
  query?: Record<string, unknown>;
};

export default function handler(
  request: VercelIncomingMessage,
  response: ServerResponse,
): void {
  request.url = removeVercelRouteParameter(request.url ?? "/");
  removeVercelRouteQuery(request.query);
  app(request, response);
}
