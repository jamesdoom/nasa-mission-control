import type { SpaceWeatherEvent } from "@mission-control/shared";

const categoryNames = {
  flare: "Solar flare",
  cme: "Coronal mass ejection",
  storm: "Geomagnetic storm",
} as const;

function formatTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  });
}

export function SpaceWeatherCard({ event }: { event: SpaceWeatherEvent }) {
  return (
    <article className={`weather-card weather-card--${event.category}`}>
      <header>
        <span className="weather-card__category">
          {categoryNames[event.category]}
        </span>
        <time dateTime={event.startTimeUtc}>
          {formatTime(event.startTimeUtc)} UTC
        </time>
      </header>
      <h2>{event.title}</h2>
      <p className="weather-card__summary">{event.summary}</p>
      {event.measurements.length > 0 && (
        <dl className="weather-measurements">
          {event.measurements.map((measurement) => (
            <div key={measurement.label}>
              <dt>{measurement.label}</dt>
              <dd>
                {measurement.value}
                <small>{measurement.explanation}</small>
              </dd>
            </div>
          ))}
        </dl>
      )}
      <dl className="weather-meta">
        <div>
          <dt>Source region</dt>
          <dd>{event.location ?? "Not identified"}</dd>
        </div>
        <div>
          <dt>Active region</dt>
          <dd>{event.activeRegion ?? "Not supplied"}</dd>
        </div>
        <div>
          <dt>Instrument</dt>
          <dd>{event.instruments[0] ?? "Not supplied"}</dd>
        </div>
      </dl>
      <footer>
        <span>
          {event.linkedEventIds.length} linked event
          {event.linkedEventIds.length === 1 ? "" : "s"}
        </span>
        <a
          className="text-link"
          href={event.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          Open DONKI record ↗
        </a>
      </footer>
    </article>
  );
}
