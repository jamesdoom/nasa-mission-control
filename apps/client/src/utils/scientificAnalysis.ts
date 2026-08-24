import type {
  Apod,
  Asteroid,
  EarthImage,
  SpaceWeatherEvent,
} from "@mission-control/shared";

export type EvidenceClass = "observed" | "modeled" | "calculated" | "curated";

export function apodArchiveSummary(items: readonly Apod[]) {
  return items.map((item) => ({
    date: item.date,
    title: item.title,
    mediaType: item.mediaType,
    attribution: item.copyright ?? "NASA / public domain source not specified",
  }));
}

export function asteroidDailyTrend(items: readonly Asteroid[]) {
  const days = new Map<
    string,
    { count: number; hazardous: number; closestKm: number }
  >();
  for (const item of items) {
    const current = days.get(item.approach.date) ?? {
      count: 0,
      hazardous: 0,
      closestKm: Number.POSITIVE_INFINITY,
    };
    current.count += 1;
    current.hazardous += item.potentiallyHazardous ? 1 : 0;
    current.closestKm = Math.min(
      current.closestKm,
      item.approach.missDistanceKm,
    );
    days.set(item.approach.date, current);
  }
  return [...days]
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([date, value]) => ({
      ...value,
      date,
      closestKm: Number.isFinite(value.closestKm) ? value.closestKm : null,
    }));
}

export function comparableDonkiEvents(
  events: readonly SpaceWeatherEvent[],
  ids: readonly string[],
) {
  const selected = new Set(ids.slice(0, 3));
  return events.filter((event) => selected.has(event.id));
}

export function earthTimeline(images: readonly EarthImage[]) {
  return images.map((image, index) => ({
    sequence: index + 1,
    capturedAtUtc: image.capturedAtUtc,
    latitude: image.centroid.latitude,
    longitude: image.centroid.longitude,
    id: image.id,
  }));
}
