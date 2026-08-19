import { useMemo } from "react";
import type { Asteroid } from "@mission-control/shared";

export type AsteroidComparisonMetric = "distance" | "diameter" | "velocity";

const metricOptions: {
  value: AsteroidComparisonMetric;
  label: string;
  description: string;
}[] = [
  {
    value: "distance",
    label: "Miss distance",
    description:
      "Shorter bars are closer approaches. LD means the average Earth–Moon distance.",
  },
  {
    value: "diameter",
    label: "Diameter estimate",
    description:
      "Bars use the upper end of NASA’s estimated diameter range, not a measured width.",
  },
  {
    value: "velocity",
    label: "Relative velocity",
    description:
      "Speed is relative to Earth at closest approach and does not indicate impact risk.",
  },
];

function valueFor(item: Asteroid, metric: AsteroidComparisonMetric): number {
  if (metric === "diameter") return item.diameterMeters.max;
  if (metric === "velocity") return item.approach.velocityKph;
  return item.approach.missDistanceLunar;
}

function displayValue(
  item: Asteroid,
  metric: AsteroidComparisonMetric,
): string {
  if (metric === "diameter")
    return `≤ ${item.diameterMeters.max.toLocaleString("en-US", { maximumFractionDigits: 0 })} m`;
  if (metric === "velocity")
    return `${item.approach.velocityKph.toLocaleString("en-US", { maximumFractionDigits: 0 })} km/h`;
  return `${item.approach.missDistanceLunar.toLocaleString("en-US", { maximumFractionDigits: 1 })} LD`;
}

export function AsteroidComparison({
  asteroids,
  metric,
  onMetricChange,
}: {
  asteroids: Asteroid[];
  metric: AsteroidComparisonMetric;
  onMetricChange: (metric: AsteroidComparisonMetric) => void;
}) {
  const ranked = useMemo(() => {
    const items = [...asteroids].sort((first, second) => {
      const difference = valueFor(second, metric) - valueFor(first, metric);
      return metric === "distance" ? -difference : difference;
    });
    return items.slice(0, 6);
  }, [asteroids, metric]);
  const maximum = Math.max(...ranked.map((item) => valueFor(item, metric)), 1);
  const selected = metricOptions.find((item) => item.value === metric);

  return (
    <section className="comparison-lab" aria-labelledby="comparison-title">
      <div className="comparison-lab__heading">
        <div>
          <p className="eyebrow">Comparison lab // Selected encounters</p>
          <h2 id="comparison-title">Put the numbers in perspective</h2>
        </div>
        <fieldset>
          <legend>Comparison metric</legend>
          {metricOptions.map((option) => (
            <label key={option.value}>
              <input
                type="radio"
                name="comparison-metric"
                checked={metric === option.value}
                onChange={() => onMetricChange(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </fieldset>
      </div>
      <p className="comparison-lab__explanation">{selected?.description}</p>
      <ol className="comparison-chart">
        {ranked.map((item) => {
          const value = valueFor(item, metric);
          const width = Math.max(4, (value / maximum) * 100);
          return (
            <li key={`${item.id}-${item.approach.dateTimeUtc}`}>
              <div>
                <strong>{item.name}</strong>
                <span>{displayValue(item, metric)}</span>
              </div>
              <div
                className="comparison-chart__track"
                role="img"
                aria-label={`${item.name}: ${displayValue(item, metric)}`}
              >
                <span style={{ width: `${String(width)}%` }} />
              </div>
            </li>
          );
        })}
      </ol>
      <p className="comparison-lab__note">
        Bar lengths compare only this result set. Exact values remain visible;
        orbital classification—not any single measurement—determines NASA’s
        potentially hazardous label.
      </p>
    </section>
  );
}
