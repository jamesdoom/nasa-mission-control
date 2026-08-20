import { ProvenancePanel } from "./ProvenancePanel";

export function DataStatus({
  source,
  updatedAt,
  refreshing,
}: {
  source: string;
  updatedAt: number;
  refreshing: boolean;
}) {
  if (updatedAt === 0) return null;
  const retrievedAt = new Date(updatedAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <div className="data-status">
      <p role="status">
        <span aria-hidden="true" />
        <span>
          {source} · Retrieved {retrievedAt}
          {refreshing ? " · Refreshing" : ""}
        </span>
      </p>
      <ProvenancePanel
        kind="live"
        title={`Retrieved through ${source}`}
        summary="Open data origin and freshness guidance"
        details={[
          `Mission Control retrieved this response at ${retrievedAt}; this is not necessarily the observation time.`,
          "Dates and timestamps inside each record describe the observation or event when NASA supplies them.",
          "The Express server validates and normalizes the NASA response, then caches it briefly to reduce repeat requests.",
        ]}
      />
    </div>
  );
}
