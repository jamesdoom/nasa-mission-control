import { isStaleResponse } from "../api/responseStatus";

type BriefingQuery = {
  data: unknown;
  isError: boolean;
  isFetching: boolean;
};

export function feedStatus(query: BriefingQuery, online: boolean): string {
  if (!online) {
    if (query.data === undefined) return "Offline · no data";
    return isStaleResponse(query.data)
      ? "Offline · stale fallback"
      : "Offline · previously loaded";
  }
  if (query.isError) return "Unavailable";
  if (query.data === undefined) return "Loading";
  if (isStaleResponse(query.data))
    return query.isFetching ? "Stale fallback · refreshing" : "Stale fallback";
  return query.isFetching ? "Refreshing" : "Available";
}

export function briefingStatus(
  queries: readonly BriefingQuery[],
  online: boolean,
): string {
  if (!online) return "Offline";
  const available = queries.filter((query) => query.data !== undefined);
  if (queries.some((query) => query.isError)) {
    if (available.length) return "Partially available";
    return queries.every((query) => query.isError)
      ? "Unavailable"
      : "Loading · one source unavailable";
  }
  if (available.some((query) => isStaleResponse(query.data)))
    return "Stale data";
  if (available.length < queries.length) return "Loading";
  if (queries.some((query) => query.isFetching)) return "Refreshing";
  return "Available";
}
