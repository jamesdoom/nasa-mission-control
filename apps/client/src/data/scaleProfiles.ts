export type ScaleProfile = {
  id: string;
  name: string;
  shortName: string;
  distanceKm: number;
  diameterKm: number | null;
  distanceLabel: string;
  referenceFrame: string;
  evidence: "approximate" | "average" | "historical";
  context: string;
  missionSlugs: string[];
  source: { label: string; url: string };
};

export const scaleProfiles: ScaleProfile[] = [
  {
    id: "hubble",
    name: "Hubble orbit",
    shortName: "Hubble",
    distanceKm: 483,
    diameterKm: null,
    distanceLabel: "Altitude above Earth",
    referenceFrame: "Earth surface → Hubble",
    evidence: "approximate",
    context:
      "A low-Earth-orbit baseline. Hubble’s altitude slowly changes because of atmospheric drag, so no spacecraft-size value is plotted here.",
    missionSlugs: ["hubble"],
    source: {
      label: "NASA Hubble by the Numbers",
      url: "https://science.nasa.gov/mission/hubble/overview/hubble-by-the-numbers/",
    },
  },
  {
    id: "moon",
    name: "Earth to Moon",
    shortName: "Moon",
    distanceKm: 384_400,
    diameterKm: 3_474.8,
    distanceLabel: "Mean Earth–Moon distance",
    referenceFrame: "Earth → Moon",
    evidence: "average",
    context:
      "The Moon follows an elliptical orbit, so this mean distance is an orientation value rather than a live separation.",
    missionSlugs: ["apollo-11", "artemis-i"],
    source: {
      label: "NASA Moon Facts",
      url: "https://science.nasa.gov/moon/facts/",
    },
  },
  {
    id: "sun",
    name: "Earth to Sun",
    shortName: "Sun",
    distanceKm: 150_000_000,
    diameterKm: 1_400_000,
    distanceLabel: "Approximate Earth–Sun distance",
    referenceFrame: "Earth → Sun",
    evidence: "approximate",
    context:
      "This rounded astronomical-unit baseline connects heliophysics observations to the scale of the inner solar system.",
    missionSlugs: ["parker-solar-probe"],
    source: {
      label: "NASA Sun Facts",
      url: "https://science.nasa.gov/sun/facts/",
    },
  },
  {
    id: "mars",
    name: "Sun to Mars",
    shortName: "Mars",
    distanceKm: 228_000_000,
    diameterKm: 6_780,
    distanceLabel: "Average orbital distance from the Sun",
    referenceFrame: "Sun → Mars",
    evidence: "average",
    context:
      "This is Mars’s average solar-orbit distance—not its changing distance from Earth or a rover’s flight path.",
    missionSlugs: ["curiosity", "perseverance"],
    source: {
      label: "NASA Mars Facts",
      url: "https://science.nasa.gov/mars/facts/",
    },
  },
  {
    id: "jupiter",
    name: "Sun to Jupiter",
    shortName: "Jupiter",
    distanceKm: 778_000_000,
    diameterKm: 142_984,
    distanceLabel: "Representative orbital distance from the Sun",
    referenceFrame: "Sun → Jupiter",
    evidence: "approximate",
    context:
      "A rounded orbital reference for Juno’s destination. It is not Juno’s accumulated trajectory distance.",
    missionSlugs: ["juno"],
    source: {
      label: "NASA Voyager fact sheet — outer planets",
      url: "https://science.nasa.gov/mission/voyager/fact-sheet/",
    },
  },
  {
    id: "saturn",
    name: "Earth to Saturn",
    shortName: "Saturn",
    distanceKm: 1_430_000_000,
    diameterKm: 120_000,
    distanceLabel: "Average Earth–Saturn distance",
    referenceFrame: "Earth → Saturn",
    evidence: "average",
    context:
      "Cassini’s radio light time varied throughout its orbital tour; this average distance is only a reference span.",
    missionSlugs: ["cassini"],
    source: {
      label: "NASA Cassini Quick Facts",
      url: "https://science.nasa.gov/mission/cassini/quick-facts/",
    },
  },
  {
    id: "voyager-2012",
    name: "Voyager 1 in 2012",
    shortName: "Voyager",
    distanceKm: 18_210_000_000,
    diameterKm: null,
    distanceLabel: "Distance from Earth on Sept. 4, 2012",
    referenceFrame: "Earth → Voyager 1",
    evidence: "historical",
    context:
      "A dated historical snapshot used to show interstellar-mission scale. Voyager 1 is substantially farther away today.",
    missionSlugs: ["voyager-1"],
    source: {
      label: "NASA Earth Observatory — A Voyager Far From Home",
      url: "https://science.nasa.gov/earth/earth-observatory/a-voyager-far-from-home-79091/",
    },
  },
];

export function getScaleProfile(id: string): ScaleProfile | undefined {
  return scaleProfiles.find((profile) => profile.id === id);
}
