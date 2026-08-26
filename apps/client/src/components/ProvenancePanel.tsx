export type ProvenanceKind = "live" | "curated" | "calculated" | "stale";

const kindLabels: Record<ProvenanceKind, string> = {
  live: "NASA API",
  curated: "CURATED",
  calculated: "CALCULATED",
  stale: "STALE DATA",
};

export function ProvenancePanel({
  kind,
  title,
  summary,
  details,
}: {
  kind: ProvenanceKind;
  title: string;
  summary: string;
  details: readonly string[];
}) {
  return (
    <details className={`provenance-panel provenance-panel--${kind}`}>
      <summary>
        <span className="provenance-panel__kind">{kindLabels[kind]}</span>
        <span>
          <strong>{title}</strong>
          <small>{summary}</small>
        </span>
        <span className="provenance-panel__action" aria-hidden="true">
          Evidence details
        </span>
      </summary>
      <div className="provenance-panel__body">
        <ul>
          {details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      </div>
    </details>
  );
}
