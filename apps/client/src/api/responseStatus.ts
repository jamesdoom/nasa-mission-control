const staleResponses = new WeakSet();

export async function readResponseJson<T>(response: Response): Promise<T> {
  const value = (await response.json()) as T;
  if (typeof value === "object" && value !== null) {
    const headers = Reflect.get(response, "headers") as Headers | undefined;
    if (headers?.get("x-data-status") === "stale-fallback")
      staleResponses.add(value);
  }
  return value;
}

export function isStaleResponse(value: unknown): boolean {
  return (
    typeof value === "object" && value !== null && staleResponses.has(value)
  );
}
