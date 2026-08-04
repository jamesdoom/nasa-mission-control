export function removeVercelRouteParameter(requestUrl: string): string {
  const url = new URL(requestUrl, "http://localhost");
  url.searchParams.delete("path");
  return `${url.pathname}${url.search}`;
}

export function removeVercelParsedQuery(request: {
  query?: Record<string, unknown>;
}): void {
  Reflect.deleteProperty(request, "query");
}
