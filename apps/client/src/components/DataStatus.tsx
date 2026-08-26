import { ProvenancePanel } from "./ProvenancePanel";
import { isStaleResponse } from "../api/responseStatus";

export function DataStatus({
  source,
  updatedAt,
  refreshing,
  data,
}: {
  source: string;
  updatedAt: number;
  refreshing: boolean;
  data?: unknown;
}) {
  if (updatedAt === 0) return null;
  const retrievedAt = new Date(updatedAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const stale = isStaleResponse(data);
  return (
    <div className="data-status">
      <p role="status">
        <span aria-hidden="true" />
        <span>
          {source} · Retrieved {retrievedAt}
          {refreshing ? " · Refreshing" : ""}
          {stale ? " · Stale fallback" : ""}
        </span>
      </p>
      <ProvenancePanel
        kind={stale ? "curated" : "live"}
        title={
          stale ? `${source} stale fallback` : `Retrieved through ${source}`
        }
        summary={
          stale
            ? "NASA was unavailable; showing an older validated response"
            : "Open data origin and freshness guidance"
        }
        details={[
          `Mission Control retrieved this response at ${retrievedAt}; this is not necessarily the observation time.`,
          "Dates and timestamps inside each record describe the observation or event when NASA supplies them.",
          stale
            ? "The server used an older validated response because current NASA data was unavailable."
            : "The Express server validates and normalizes the NASA response; a short-lived cache can reduce repeat requests.",
        ]}
      />
    </div>
  );
}
