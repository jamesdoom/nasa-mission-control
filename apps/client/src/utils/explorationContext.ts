const roots = new Set([
  "apod",
  "asteroids",
  "media",
  "missions",
  "space-weather",
  "earth",
  "discover",
  "stories",
  "learn",
  "trivia",
  "investigate",
  "search",
  "scale-lab",
]);

export function safeExplorationPath(value: string | null): value is string {
  if (
    !value ||
    value.length > 3000 ||
    !value.startsWith("/") ||
    /[\\\s]/.test(value)
  )
    return false;
  const url = new URL(value, "https://mission-control.local");
  return (
    url.origin === "https://mission-control.local" &&
    roots.has(url.pathname.split("/")[1] ?? "")
  );
}

export function withoutReturn(path: string): string {
  const url = new URL(path, "https://mission-control.local");
  url.searchParams.delete("returnTo");
  return url.pathname + url.search + url.hash;
}

export function explorationLink(to: string, from: string): string {
  if (!safeExplorationPath(to) || !safeExplorationPath(from)) return to;
  const url = new URL(to, "https://mission-control.local");
  url.searchParams.set("returnTo", from);
  const result = url.pathname + url.search + url.hash;
  if (result.length <= 3000) return result;
  url.searchParams.set("returnTo", withoutReturn(from));
  const fallback = url.pathname + url.search + url.hash;
  return fallback.length <= 3000 ? fallback : to;
}

export function keepExplorationContext(
  current: URLSearchParams,
  next: Record<string, string>,
): URLSearchParams {
  const result = new URLSearchParams(next);
  const from = current.get("returnTo");
  if (safeExplorationPath(from)) result.set("returnTo", from);
  return result;
}
