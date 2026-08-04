export function removeVercelRouteParameter(requestUrl: string): string {
  const url = new URL(requestUrl, "http://localhost");
  url.searchParams.delete("path");
  return `${url.pathname}${url.search}`;
}

export function removeVercelRouteQuery(
  query: Record<string, unknown> | undefined,
): void {
  if (query) delete query.path;
}
