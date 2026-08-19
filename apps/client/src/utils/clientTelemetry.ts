type RuntimeErrorKind = "error" | "unhandledrejection";

function messageFrom(reason: unknown): string {
  if (reason instanceof Error) return reason.message;
  if (typeof reason === "string") return reason;
  return "Unknown client runtime error";
}

function report(kind: RuntimeErrorKind, message: string): void {
  const body = JSON.stringify({
    kind,
    message: message.slice(0, 300),
    path: window.location.pathname.slice(0, 200),
  });
  if (
    navigator.sendBeacon(
      "/api/client-errors",
      new Blob([body], { type: "application/json" }),
    )
  ) {
    return;
  }
  void fetch("/api/client-errors", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

export function registerClientTelemetry(): () => void {
  const onError = (event: ErrorEvent) =>
    report("error", event.message || "Client runtime error");
  const onRejection = (event: PromiseRejectionEvent) =>
    report("unhandledrejection", messageFrom(event.reason));
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);
  return () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
  };
}
