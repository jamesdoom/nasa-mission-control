import { getMission, type Mission } from "../data/missions";

export const maxComparedMissions = 3;

export type ComparisonTimelineEvent = Mission["timeline"][number] & {
  missionName: string;
  missionSlug: string;
};

export function missionSelectionFrom(value: string | null): string[] {
  if (!value) return [];
  const selected: string[] = [];
  for (const slug of value.split(",")) {
    if (
      selected.length === maxComparedMissions ||
      selected.includes(slug) ||
      !getMission(slug)
    )
      continue;
    selected.push(slug);
  }
  return selected;
}

export function toggleMissionSelection(
  selected: string[],
  slug: string,
): string[] {
  if (selected.includes(slug))
    return selected.filter((candidate) => candidate !== slug);
  if (selected.length >= maxComparedMissions || !getMission(slug))
    return selected;
  return [...selected, slug];
}

export function comparisonTimeline(
  selectedMissions: Mission[],
): ComparisonTimelineEvent[] {
  return selectedMissions
    .flatMap((mission) =>
      mission.timeline.map((event) => ({
        ...event,
        missionName: mission.name,
        missionSlug: mission.slug,
      })),
    )
    .sort((left, right) => left.date.localeCompare(right.date));
}
