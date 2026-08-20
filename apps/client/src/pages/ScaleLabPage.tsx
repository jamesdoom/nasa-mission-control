import { Link, useSearchParams } from "react-router-dom";
import { ScaleProfilePicker } from "../components/ScaleProfilePicker";
import { getMission } from "../data/missions";
import { getScaleProfile } from "../data/scaleProfiles";
import {
  logarithmicScale,
  metricValue,
  scaleMetricFrom,
  scaleSelectionFrom,
  signalTimeSeconds,
  toggleScaleSelection,
  type ScaleMetric,
} from "../utils/scaleLab";

const kilometers = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const metricCopy: Record<
  ScaleMetric,
  { label: string; title: string; description: string }
> = {
  distance: {
    label: "Reference distance",
    title: "How far does the reference span reach?",
    description:
      "Each bar uses its profile’s labeled origin. Compare orders of magnitude, not simultaneous positions.",
  },
  diameter: {
    label: "Object diameter",
    title: "How wide is the destination or spacecraft?",
    description:
      "Diameters are approximate physical sizes. Voyager has no destination diameter in this historical profile.",
  },
  signal: {
    label: "One-way light time",
    title: "How long would a signal need?",
    description:
      "Calculated from the displayed reference distance at 299,792.458 km/s; operational routing can add delay.",
  },
};

function formatDuration(seconds: number): string {
  if (seconds < 1) return `${seconds.toFixed(3)} seconds`;
  if (seconds < 60) return `${seconds.toFixed(1)} seconds`;
  if (seconds < 3_600) return `${(seconds / 60).toFixed(1)} minutes`;
  return `${(seconds / 3_600).toFixed(1)} hours`;
}

function formatMetric(value: number, metric: ScaleMetric): string {
  if (metric === "signal") return formatDuration(value);
  if (value < 1) return `${kilometers.format(value * 1_000)} meters`;
  return `${kilometers.format(value)} km`;
}

export function ScaleLabPage() {
  const [params, setParams] = useSearchParams();
  const metric = scaleMetricFrom(params.get("metric"));
  const selectedIds = scaleSelectionFrom(params.get("profiles"));
  const selectedProfiles = selectedIds
    .map(getScaleProfile)
    .filter((profile) => profile !== undefined);
  const plotted = selectedProfiles
    .map((profile) => ({ profile, value: metricValue(profile, metric) }))
    .filter(
      (
        item,
      ): item is {
        profile: (typeof selectedProfiles)[number];
        value: number;
      } => item.value !== null,
    );
  const maximum = Math.max(...plotted.map(({ value }) => value), 1);

  function updateMetric(nextMetric: ScaleMetric) {
    const next = new URLSearchParams(params);
    if (nextMetric === "distance") next.delete("metric");
    else next.set("metric", nextMetric);
    setParams(next);
  }

  function toggleProfile(id: string) {
    const next = new URLSearchParams(params);
    const selection = toggleScaleSelection(selectedIds, id);
    next.set("profiles", selection.join(","));
    setParams(next);
  }

  return (
    <>
      <section className="section scale-lab-intro">
        <p className="kicker">
          <span />
          Celestial scale laboratory // Instrument 09
        </p>
        <div>
          <h1>Measure the mission horizon</h1>
          <p>
            Compare source-checked reference spans, physical sizes, and signal
            time without flattening a moving solar system into false precision.
          </p>
        </div>
        <aside>
          <strong>LOG SCALE</strong>
          <span>Orientation model // Not live ephemeris data</span>
        </aside>
      </section>
      <section
        className="section scale-console"
        aria-labelledby="scale-controls-title"
      >
        <div className="section-heading">
          <div>
            <p className="kicker">
              <span />
              Analysis controls
            </p>
            <h2 id="scale-controls-title">Build a scale set</h2>
          </div>
          <p>Selections and measurement mode remain in the URL.</p>
        </div>
        <div className="scale-metrics" aria-label="Scale measurement">
          {(Object.keys(metricCopy) as ScaleMetric[]).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={metric === option}
              onClick={() => updateMetric(option)}
            >
              {metricCopy[option].label}
            </button>
          ))}
        </div>
        <ScaleProfilePicker selected={selectedIds} onToggle={toggleProfile} />
      </section>
      <section
        className="section scale-plot"
        aria-labelledby="scale-plot-title"
      >
        <div className="section-heading">
          <div>
            <p className="kicker">
              <span />
              Logarithmic comparison
            </p>
            <h2 id="scale-plot-title">{metricCopy[metric].title}</h2>
          </div>
          <p>{metricCopy[metric].description}</p>
        </div>
        {plotted.length === 0 ? (
          <div className="state-panel">
            <div>
              <strong>No diameter for this profile</strong>
              <p>Select another reference profile or measurement mode.</p>
            </div>
          </div>
        ) : (
          <ol className="scale-bars">
            {plotted.map(({ profile, value }) => (
              <li key={profile.id}>
                <div>
                  <strong>{profile.name}</strong>
                  <span>{formatMetric(value, metric)}</span>
                </div>
                <span className="scale-bars__track" aria-hidden="true">
                  <span
                    style={{
                      width: `${String(logarithmicScale(value, maximum))}%`,
                    }}
                  />
                </span>
                <small>
                  {profile.evidence} // {profile.referenceFrame}
                </small>
              </li>
            ))}
          </ol>
        )}
        <p className="scale-plot__note">
          Bar lengths are logarithmic. Equal visual increments represent
          multiplication, not equal kilometers or seconds.
        </p>
      </section>
      <section
        className="section scale-evidence"
        aria-labelledby="scale-evidence-title"
      >
        <div className="section-heading">
          <div>
            <p className="kicker">
              <span />
              Evidence ledger
            </p>
            <h2 id="scale-evidence-title">Read the reference frame</h2>
          </div>
        </div>
        <div className="scale-evidence__grid">
          {selectedProfiles.map((profile) => (
            <article key={profile.id}>
              <p className="eyebrow">{profile.distanceLabel}</p>
              <h3>{profile.name}</h3>
              <dl>
                <div>
                  <dt>Distance</dt>
                  <dd>{kilometers.format(profile.distanceKm)} km</dd>
                </div>
                <div>
                  <dt>Signal time</dt>
                  <dd>
                    {formatDuration(signalTimeSeconds(profile.distanceKm))}
                  </dd>
                </div>
              </dl>
              <p>{profile.context}</p>
              <div className="scale-evidence__links">
                {profile.missionSlugs.map((slug) => {
                  const mission = getMission(slug);
                  return mission ? (
                    <Link key={slug} to={`/missions/${slug}`}>
                      {mission.name} →
                    </Link>
                  ) : null;
                })}
                <a href={profile.source.url} target="_blank" rel="noreferrer">
                  {profile.source.label} ↗
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
