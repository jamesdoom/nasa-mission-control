import type {
  Apod,
  Asteroid,
  EarthImage,
  SpaceWeatherEvent,
} from "@mission-control/shared";
import {
  apodArchiveSummary,
  asteroidDailyTrend,
  earthTimeline,
} from "../utils/scientificAnalysis";

function EvidenceBadge({
  kind,
}: {
  kind: "observed" | "modeled" | "calculated" | "curated";
}) {
  return (
    <span className={`evidence-class evidence-class--${kind}`}>{kind}</span>
  );
}

export function ApodHistoryAnalysis({ items }: { items: readonly Apod[] }) {
  const rows = apodArchiveSummary(items);
  if (!rows.length) return null;
  const imageCount = rows.filter((row) => row.mediaType === "image").length;
  return (
    <section className="analysis-panel" aria-labelledby="apod-history-title">
      <div className="section-heading">
        <div>
          <p className="kicker">
            <span />
            Archive trend <EvidenceBadge kind="calculated" />
          </p>
          <h2 id="apod-history-title">Seven-day APOD media history</h2>
        </div>
        <p>
          {imageCount} images · {rows.length - imageCount} videos
        </p>
      </div>
      <div
        className="analysis-bars"
        role="img"
        aria-label={`${String(imageCount)} image records and ${String(rows.length - imageCount)} video records across ${String(rows.length)} available days`}
      >
        {rows.map((row) => (
          <span
            key={row.date}
            style={{ height: row.mediaType === "image" ? "100%" : "55%" }}
            title={`${row.date}: ${row.mediaType}`}
          />
        ))}
      </div>
      <div className="table-scroll">
        <table>
          <caption>APOD archive records used in the media-type summary</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Title</th>
              <th scope="col">NASA media type</th>
              <th scope="col">Attribution</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.date}>
                <td>
                  <a href={`/apod?date=${row.date}`}>{row.date}</a>
                </td>
                <td>{row.title}</td>
                <td>
                  <EvidenceBadge kind="curated" /> {row.mediaType}
                </td>
                <td>{row.attribution}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function AsteroidTrendAnalysis({
  asteroids,
}: {
  asteroids: readonly Asteroid[];
}) {
  const rows = asteroidDailyTrend(asteroids);
  if (!rows.length) return null;
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <section className="analysis-panel" aria-labelledby="asteroid-trend-title">
      <div className="section-heading">
        <div>
          <p className="kicker">
            <span />
            Encounter trend <EvidenceBadge kind="calculated" />
          </p>
          <h2 id="asteroid-trend-title">Approaches by UTC date</h2>
        </div>
      </div>
      <div
        className="analysis-bars"
        role="img"
        aria-label={`Daily encounter counts from ${rows[0]?.date ?? "unknown"} to ${rows.at(-1)?.date ?? "unknown"}`}
      >
        {rows.map((row) => (
          <span
            key={row.date}
            style={{
              height: `${String(Math.max(12, (row.count / max) * 100))}%`,
            }}
            title={`${row.date}: ${String(row.count)} approaches`}
          />
        ))}
      </div>
      <div className="table-scroll">
        <table>
          <caption>
            Calculated daily totals from normalized NASA/JPL approaches
          </caption>
          <thead>
            <tr>
              <th>Date</th>
              <th>Approaches</th>
              <th>Potentially hazardous classification</th>
              <th>Closest catalog approach</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.date}>
                <th scope="row">{row.date}</th>
                <td>{row.count}</td>
                <td>{row.hazardous}</td>
                <td>
                  {row.closestKm === null
                    ? "—"
                    : `${Math.round(row.closestKm).toLocaleString()} km`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function DonkiComparison({
  events,
}: {
  events: readonly SpaceWeatherEvent[];
}) {
  if (events.length < 2) return null;
  const maxMeasurements = Math.max(
    ...events.map((event) => event.measurements.length),
    1,
  );
  return (
    <section
      className="analysis-panel"
      aria-labelledby="donki-comparison-title"
    >
      <div className="section-heading">
        <div>
          <p className="kicker">
            <span />
            Multi-event comparison
          </p>
          <h2 id="donki-comparison-title">Aligned DONKI records</h2>
        </div>
        <p>{events.length} selected events</p>
      </div>
      <div
        className="analysis-bars"
        role="img"
        aria-label="Relative count of published measurements per selected DONKI event"
      >
        {events.map((event) => (
          <span
            key={event.id}
            style={{
              height: `${String(Math.max(12, (event.measurements.length / maxMeasurements) * 100))}%`,
            }}
            title={`${event.title}: ${String(event.measurements.length)} measurements`}
          />
        ))}
      </div>
      <div className="table-scroll">
        <table>
          <caption>
            Observed and modeled fields published for selected DONKI events
          </caption>
          <thead>
            <tr>
              <th>Event</th>
              <th>Type</th>
              <th>Start UTC</th>
              <th>Location</th>
              <th>Published measurements</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <th scope="row">
                  <a href={event.sourceUrl} target="_blank" rel="noreferrer">
                    {event.title}
                  </a>
                </th>
                <td>
                  <EvidenceBadge kind="observed" />{" "}
                  {event.category.toUpperCase()}
                </td>
                <td>{event.startTimeUtc}</td>
                <td>{event.location ?? "Not supplied"}</td>
                <td>
                  {event.measurements
                    .map((m) => `${m.label}: ${m.value}`)
                    .join("; ") || "None supplied"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function EarthTimelineAnalysis({
  images,
}: {
  images: readonly EarthImage[];
}) {
  const rows = earthTimeline(images);
  if (!rows.length) return null;
  return (
    <section className="analysis-panel" aria-labelledby="earth-timeline-title">
      <div className="section-heading">
        <div>
          <p className="kicker">
            <span />
            Observation timeline <EvidenceBadge kind="observed" />
          </p>
          <h2 id="earth-timeline-title">EPIC frame chronology</h2>
        </div>
        <p>{rows.length} source frames</p>
      </div>
      <div
        className="analysis-timeline"
        role="img"
        aria-label={`${String(rows.length)} EPIC observations in chronological order`}
      >
        {rows.map((row) => (
          <span key={row.id} title={row.capturedAtUtc} />
        ))}
      </div>
      <div className="table-scroll">
        <table>
          <caption>EPIC timestamps and image-center coordinates</caption>
          <thead>
            <tr>
              <th>Sequence</th>
              <th>Captured UTC</th>
              <th>Center latitude</th>
              <th>Center longitude</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <th scope="row">{row.sequence}</th>
                <td>{row.capturedAtUtc}</td>
                <td>{row.latitude.toFixed(3)}°</td>
                <td>{row.longitude.toFixed(3)}°</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
