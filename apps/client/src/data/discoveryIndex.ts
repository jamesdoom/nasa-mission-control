import { discoveryJourneys } from "./journeys";
import { missions } from "./missions";

export type DiscoveryResultKind = "instrument" | "mission" | "path" | "saved";

export type DiscoveryResult = {
  id: string;
  title: string;
  description: string;
  kind: DiscoveryResultKind;
  to: string;
  keywords: string;
};

const instrumentSeeds = [
  [
    "dashboard",
    "Mission Control Dashboard",
    "Daily briefing and telemetry",
    "/",
  ],
  [
    "apod",
    "Astronomy Picture of the Day",
    "Browse NASA’s daily image or video",
    "/apod",
  ],
  [
    "asteroids",
    "Asteroid Watch",
    "Inspect near-Earth object approaches",
    "/asteroids",
  ],
  [
    "media",
    "NASA Media Library",
    "Search NASA images, video, and audio",
    "/media",
  ],
  [
    "space-weather",
    "Space Weather Center",
    "Review DONKI observations",
    "/space-weather",
  ],
  ["earth", "Earth Observatory", "Explore EPIC and GIBS imagery", "/earth"],
  [
    "missions",
    "Mission Archive",
    "Browse source-checked mission history",
    "/missions",
  ],
  [
    "mission-map",
    "Solar-system Mission Map",
    "Trace archive missions across five destination regions",
    "/missions/map",
  ],
  [
    "scale-lab",
    "Celestial Scale Laboratory",
    "Compare distances, sizes, and signal time",
    "/scale-lab",
  ],
  ["trivia", "Space Trivia", "Test source-checked space knowledge", "/trivia"],
  [
    "discover",
    "Guided Discovery",
    "Follow connected investigation paths",
    "/discover",
  ],
  [
    "favorites",
    "Personal Flight Log",
    "Open saved discoveries and recent history",
    "/favorites",
  ],
  [
    "about",
    "About this project",
    "Review architecture, evidence, and attribution",
    "/about",
  ],
] as const;

export const localDiscoveryIndex: DiscoveryResult[] = [
  ...instrumentSeeds.map(([id, title, description, to]) => ({
    id: `instrument-${id}`,
    title,
    description,
    to,
    kind: "instrument" as const,
    keywords: `${title} ${description}`.toLocaleLowerCase(),
  })),
  ...missions.map((mission) => ({
    id: `mission-${mission.slug}`,
    title: mission.name,
    description: `${mission.destination} · ${mission.statusLabel}`,
    kind: "mission" as const,
    to: `/missions/${mission.slug}`,
    keywords:
      `${mission.name} ${mission.program} ${mission.destination} ${mission.vehicle} ${mission.dek}`.toLocaleLowerCase(),
  })),
  ...discoveryJourneys.map((journey) => ({
    id: `path-${journey.id}`,
    title: journey.title,
    description: journey.summary,
    kind: "path" as const,
    to: `/discover#${journey.id}`,
    keywords:
      `${journey.title} ${journey.summary} ${journey.outcome}`.toLocaleLowerCase(),
  })),
];

export function matchesDiscoveryQuery(
  query: string,
  values: readonly (string | null | undefined)[],
): boolean {
  const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const searchable = values.filter(Boolean).join(" ").toLocaleLowerCase();
  return terms.every((term) => searchable.includes(term));
}

export function searchDiscoveryIndex(
  query: string,
  kind?: DiscoveryResultKind,
): DiscoveryResult[] {
  return localDiscoveryIndex.filter(
    (result) =>
      (!kind || result.kind === kind) &&
      matchesDiscoveryQuery(query, [
        result.title,
        result.description,
        result.keywords,
        result.kind,
      ]),
  );
}
