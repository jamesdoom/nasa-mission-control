import { randomUUID } from "node:crypto";

export const monitoringTimeoutMs = 12_000;

function httpFailureCategory(status) {
  if (status === 429) return "rate_limit";
  if (status >= 500) return "http_5xx";
  return "http_4xx";
}

function applicationErrorCode(body) {
  const code = body?.error?.code;
  return typeof code === "string" && /^[A-Z][A-Z0-9_]{1,63}$/.test(code)
    ? code
    : null;
}

function requestReference(value) {
  return typeof value === "string" &&
    /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(value)
    ? value
    : null;
}

export async function probeRoute(
  name,
  url,
  { fetchImpl = fetch, timeoutMs = monitoringTimeoutMs } = {},
) {
  const startedAt = performance.now();
  const checkedAt = new Date().toISOString();
  const probeRequestId = randomUUID();
  const signal = AbortSignal.timeout(timeoutMs);
  let response;
  try {
    response = await fetchImpl(url, {
      headers: {
        accept: "application/json",
        "x-request-id": probeRequestId,
        "user-agent": "nasa-mission-control-reliability-trend/1.0",
      },
      signal,
    });
  } catch (error) {
    const errorCategory =
      error instanceof Error && error.name === "TimeoutError"
        ? "timeout"
        : "network";
    return {
      name,
      checkedAt,
      probeRequestId,
      passed: false,
      status: 0,
      durationMs: Math.round(performance.now() - startedAt),
      originCache: null,
      edgeCache: null,
      dataStatus: null,
      errorCategory,
      applicationErrorCode: null,
      requestId: null,
    };
  }
  const common = {
    name,
    checkedAt,
    probeRequestId,
    status: response.status,
    durationMs: Math.round(performance.now() - startedAt),
    originCache: response.headers.get("x-cache"),
    edgeCache: response.headers.get("x-vercel-cache"),
    dataStatus: response.headers.get("x-data-status"),
    requestId: requestReference(response.headers.get("x-request-id")),
  };
  let body;
  try {
    body = await response.json();
  } catch {
    return {
      ...common,
      durationMs: Math.round(performance.now() - startedAt),
      passed: false,
      errorCategory: signal.aborted ? "timeout" : "invalid_json",
      applicationErrorCode: null,
    };
  }
  const validObject =
    body !== null && typeof body === "object" && !Array.isArray(body);
  const passed = response.ok && validObject;
  return {
    ...common,
    durationMs: Math.round(performance.now() - startedAt),
    passed,
    errorCategory: passed
      ? null
      : response.ok
        ? "invalid_contract"
        : httpFailureCategory(response.status),
    applicationErrorCode: applicationErrorCode(body),
  };
}
