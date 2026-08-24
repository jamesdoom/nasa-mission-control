import { discoveryJourneys } from "./journeys";
import { missions } from "./missions";
import { storyCollections } from "./storyCollections";

export type DiscoveryResultKind =
  "instrument" | "mission" | "path" | "story" | "saved";
export type DiscoveryEvidence = "live" | "latest" | "curated" | "calculated";

export type DiscoveryResult = {
  id: string;
  title: string;
  description: string;
  kind: DiscoveryResultKind;
  to: string;
  keywords: string;
  metadata: {
    destination: string;
    era: string;
    evidence: DiscoveryEvidence;
    topics: string[];
    instrument: string;
  };
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
    "learn",
    "Learning Center",
    "Complete source-backed educational tracks",
    "/learn",
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

const instrumentMetadata: Record<string, DiscoveryResult["metadata"]> = {
  dashboard: {
    destination: "Multiple",
    era: "Current",
    evidence: "live",
    topics: ["briefing", "imagery"],
    instrument: "Dashboard",
  },
  apod: {
    destination: "Universe",
    era: "Current",
    evidence: "latest",
    topics: ["astronomy", "imagery"],
    instrument: "APOD",
  },
  asteroids: {
    destination: "Near Earth",
    era: "Current",
    evidence: "live",
    topics: ["asteroids", "planetary defense"],
    instrument: "NeoWs",
  },
  media: {
    destination: "Multiple",
    era: "Archive",
    evidence: "latest",
    topics: ["media", "imagery"],
    instrument: "NASA Image Library",
  },
  "space-weather": {
    destination: "Sun",
    era: "Current",
    evidence: "live",
    topics: ["heliophysics", "space weather"],
    instrument: "DONKI",
  },
  earth: {
    destination: "Earth",
    era: "Current",
    evidence: "latest",
    topics: ["earth science", "imagery"],
    instrument: "EPIC and GIBS",
  },
  missions: {
    destination: "Multiple",
    era: "Archive",
    evidence: "curated",
    topics: ["missions", "history"],
    instrument: "Mission Archive",
  },
  "mission-map": {
    destination: "Multiple",
    era: "Archive",
    evidence: "curated",
    topics: ["missions", "destinations"],
    instrument: "Mission Map",
  },
  "scale-lab": {
    destination: "Multiple",
    era: "Reference",
    evidence: "calculated",
    topics: ["distance", "scale"],
    instrument: "Scale Lab",
  },
  trivia: {
    destination: "Multiple",
    era: "Archive",
    evidence: "curated",
    topics: ["learning", "missions"],
    instrument: "Trivia",
  },
  discover: {
    destination: "Multiple",
    era: "Archive",
    evidence: "curated",
    topics: ["learning", "investigation"],
    instrument: "Guided Discovery",
  },
  learn: {
    destination: "Multiple",
    era: "Current",
    evidence: "curated",
    topics: ["learning", "education"],
    instrument: "Learning Center",
  },
  favorites: {
    destination: "Personal",
    era: "Local",
    evidence: "curated",
    topics: ["saved", "personal"],
    instrument: "Flight Log",
  },
  about: {
    destination: "Project",
    era: "Current",
    evidence: "curated",
    topics: ["architecture", "evidence"],
    instrument: "About",
  },
};

function missionEra(launchDate: string): string {
  const year = Number(launchDate.slice(0, 4));
  return Number.isFinite(year)
    ? `${String(Math.floor(year / 10) * 10)}s`
    : "Archive";
}

function topicsFrom(text: string): string[] {
  const value = text.toLocaleLowerCase();
  return [
    value.includes("mars") ? "Mars" : undefined,
    value.includes("moon") || value.includes("lunar") ? "Moon" : undefined,
    value.includes("sun") || value.includes("solar")
      ? "Heliophysics"
      : undefined,
    value.includes("earth") ? "Earth" : undefined,
    value.includes("telescope") || value.includes("observatory")
      ? "Astronomy"
      : undefined,
  ].filter((topic): topic is string => topic !== undefined);
}

export const localDiscoveryIndex: DiscoveryResult[] = [
  ...instrumentSeeds.map(([id, title, description, to]) => ({
    id: `instrument-${id}`,
    title,
    description,
    to,
    kind: "instrument" as const,
    keywords: `${title} ${description}`.toLocaleLowerCase(),
    metadata: instrumentMetadata[id] ?? {
      destination: "Multiple",
      era: "Current",
      evidence: "curated" as const,
      topics: ["discovery"],
      instrument: title,
    },
  })),
  ...missions.map((mission) => ({
    id: `mission-${mission.slug}`,
    title: mission.name,
    description: `${mission.destination} · ${mission.statusLabel}`,
    kind: "mission" as const,
    to: `/missions/${mission.slug}`,
    keywords:
      `${mission.name} ${mission.program} ${mission.destination} ${mission.vehicle} ${mission.dek}`.toLocaleLowerCase(),
    metadata: {
      destination: mission.destination,
      era: missionEra(mission.launchDate),
      evidence: "curated" as const,
      topics: [
        mission.destination,
        mission.program,
        ...topicsFrom(`${mission.name} ${mission.dek}`),
      ],
      instrument: "Mission Archive",
    },
  })),
  ...discoveryJourneys.map((journey) => ({
    id: `path-${journey.id}`,
    title: journey.title,
    description: journey.summary,
    kind: "path" as const,
    to: `/discover#${journey.id}`,
    keywords:
      `${journey.title} ${journey.summary} ${journey.outcome}`.toLocaleLowerCase(),
    metadata: {
      destination:
        topicsFrom(`${journey.title} ${journey.summary}`)[0] ?? "Multiple",
      era: "Archive",
      evidence: "curated" as const,
      topics: [
        "Investigation",
        ...topicsFrom(`${journey.title} ${journey.summary}`),
      ],
      instrument: "Guided Discovery",
    },
  })),
  ...storyCollections.map((story) => ({
    id: `story-${story.id}`,
    title: story.title,
    description: story.summary,
    kind: "story" as const,
    to: `/stories/${story.id}`,
    keywords:
      `${story.title} ${story.question} ${story.summary} ${story.whyItMatters}`.toLocaleLowerCase(),
    metadata: {
      destination:
        topicsFrom(`${story.title} ${story.summary}`)[0] ?? "Multiple",
      era: "Archive",
      evidence: "curated" as const,
      topics: [
        "Science story",
        ...topicsFrom(`${story.title} ${story.summary}`),
      ],
      instrument: "Science Stories",
    },
  })),
];

export type DiscoveryFacets = Partial<
  Pick<DiscoveryResult["metadata"], "destination" | "era" | "evidence">
> & { topic?: string };

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
  facets: DiscoveryFacets = {},
): DiscoveryResult[] {
  return localDiscoveryIndex.filter(
    (result) =>
      (!kind || result.kind === kind) &&
      (!facets.destination ||
        result.metadata.destination === facets.destination) &&
      (!facets.era || result.metadata.era === facets.era) &&
      (!facets.evidence || result.metadata.evidence === facets.evidence) &&
      (!facets.topic || result.metadata.topics.includes(facets.topic)) &&
      matchesDiscoveryQuery(query, [
        result.title,
        result.description,
        result.keywords,
        result.kind,
      ]),
  );
}

export function relatedDiscoveryResults(
  selected: readonly DiscoveryResult[],
  limit = 4,
): { result: DiscoveryResult; reasons: string[] }[] {
  const selectedIds = new Set(selected.map((item) => item.id));
  return localDiscoveryIndex
    .filter((candidate) => !selectedIds.has(candidate.id))
    .map((candidate) => {
      const reasons = new Set<string>();
      for (const item of selected) {
        if (candidate.metadata.destination === item.metadata.destination)
          reasons.add(`Destination: ${candidate.metadata.destination}`);
        if (candidate.metadata.evidence === item.metadata.evidence)
          reasons.add(`Evidence: ${candidate.metadata.evidence}`);
        for (const topic of candidate.metadata.topics)
          if (item.metadata.topics.includes(topic))
            reasons.add(`Topic: ${topic}`);
      }
      return { result: candidate, reasons: [...reasons] };
    })
    .filter((item) => item.reasons.length > 0)
    .sort(
      (first, second) =>
        second.reasons.length - first.reasons.length ||
        first.result.title.localeCompare(second.result.title),
    )
    .slice(0, limit);
}
