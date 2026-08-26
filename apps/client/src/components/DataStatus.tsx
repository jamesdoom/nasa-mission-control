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
  const retrievedAt = new Date(updatedAt)
    .toISOString()
    .slice(0, 16)
    .replace("T", " ");
  const stale = isStaleResponse(data);
  return (
    <div className="data-status">
      <p role="status">
        <span aria-hidden="true" />
        <span>
          {source} · Retrieved {retrievedAt} UTC
          {refreshing ? " · Refreshing" : ""}
          {stale ? " · Stale fallback" : ""}
        </span>
      </p>
      <ProvenancePanel
        kind={stale ? "stale" : "live"}
        title={
          stale ? `${source} stale fallback` : `Retrieved through ${source}`
        }
        summary={
          stale
            ? "Current fetch failed · older validated response"
            : "Validated NASA response"
        }
        details={[
          `Retrieved ${retrievedAt} UTC; record times describe observations or publication when supplied.`,
          stale
            ? "A retryable NASA failure caused this fallback. It is not current conditions."
            : "The server validated and normalized this response.",
        ]}
      />
    </div>
  );
}
