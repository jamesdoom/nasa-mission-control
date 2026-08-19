import type { HealthStatus } from "@mission-control/shared";

function isHealthStatus(value: unknown): value is HealthStatus {
  if (!value || typeof value !== "object") return false;
  const status = value as Record<string, unknown>;
  return (
    status.status === "ok" &&
    status.service === "mission-control-api" &&
    typeof status.checkedAt === "string" &&
    !Number.isNaN(Date.parse(status.checkedAt))
  );
}

export async function getHealthStatus(): Promise<HealthStatus> {
  const response = await fetch("/api/health", {
    headers: { accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error("Mission Control API is not responding.");
  const body: unknown = await response.json();
  if (!isHealthStatus(body))
    throw new Error("Mission Control API returned an invalid status report.");
  return body;
}
