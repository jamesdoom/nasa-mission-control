import { AsyncLocalStorage } from "node:async_hooks";

// Leave two seconds for error mapping/fallback and transport before the monitor's 12s deadline.
export const applicationUpstreamBudgetMs = 10_000;
export const requestContext = new AsyncLocalStorage<{
  requestId: string;
  signal: AbortSignal;
}>();
