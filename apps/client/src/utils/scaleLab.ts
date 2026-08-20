import { getScaleProfile, type ScaleProfile } from "../data/scaleProfiles";

export type ScaleMetric = "distance" | "diameter" | "signal";

export const maxScaleProfiles = 4;
export const speedOfLightKmPerSecond = 299_792.458;
export const defaultScaleProfileIds = ["moon", "mars", "saturn"];

export function scaleMetricFrom(value: string | null): ScaleMetric {
  return value === "diameter" || value === "signal" ? value : "distance";
}

export function scaleSelectionFrom(value: string | null): string[] {
  const candidates = value ? value.split(",") : defaultScaleProfileIds;
  const selected: string[] = [];
  for (const id of candidates) {
    if (
      selected.length === maxScaleProfiles ||
      selected.includes(id) ||
      !getScaleProfile(id)
    )
      continue;
    selected.push(id);
  }
  return selected.length > 0 ? selected : defaultScaleProfileIds;
}

export function toggleScaleSelection(selected: string[], id: string): string[] {
  if (selected.includes(id))
    return selected.filter((candidate) => candidate !== id);
  if (selected.length >= maxScaleProfiles || !getScaleProfile(id))
    return selected;
  return [...selected, id];
}

export function signalTimeSeconds(distanceKm: number): number {
  return distanceKm / speedOfLightKmPerSecond;
}

export function metricValue(
  profile: ScaleProfile,
  metric: ScaleMetric,
): number | null {
  if (metric === "diameter") return profile.diameterKm;
  if (metric === "signal") return signalTimeSeconds(profile.distanceKm);
  return profile.distanceKm;
}

export function logarithmicScale(value: number, maximum: number): number {
  if (value <= 0 || maximum <= 0) return 0;
  if (maximum === 1) return 100;
  const minimumVisible = 12;
  return (
    minimumVisible +
    (Math.log10(value + 1) / Math.log10(maximum + 1)) * (100 - minimumVisible)
  );
}
