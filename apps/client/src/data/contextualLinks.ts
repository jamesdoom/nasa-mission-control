export type ExplorationLink = {
  code: string;
  title: string;
  description: string;
  to: string;
};

const deepUniverseLinks: ExplorationLink[] = [
  {
    code: "MISSION",
    title: "Enter Webb’s observatory",
    description:
      "Connect this view with the telescope expanding our cosmic record.",
    to: "/missions/webb",
  },
];

const subjectLinks: { terms: string[]; links: ExplorationLink[] }[] = [
  {
    terms: ["sun", "solar", "flare", "corona"],
    links: [
      {
        code: "MISSION",
        title: "Fly with Parker Solar Probe",
        description:
          "See how NASA’s closest solar mission samples the Sun’s outer atmosphere.",
        to: "/missions/parker-solar-probe",
      },
    ],
  },
  {
    terms: ["mars", "martian", "rover"],
    links: [
      {
        code: "MISSION",
        title: "Join Perseverance on Mars",
        description:
          "Place the observation in a source-checked surface mission record.",
        to: "/missions/perseverance",
      },
    ],
  },
  {
    terms: ["jupiter", "jovian"],
    links: [
      {
        code: "MISSION",
        title: "Open Juno’s mission record",
        description:
          "Trace the spacecraft investigating Jupiter beneath its cloud tops.",
        to: "/missions/juno",
      },
    ],
  },
  {
    terms: ["saturn", "titan", "enceladus"],
    links: [
      {
        code: "MISSION",
        title: "Revisit Cassini at Saturn",
        description:
          "Explore the mission that transformed our view of the Saturn system.",
        to: "/missions/cassini",
      },
    ],
  },
  {
    terms: ["moon", "lunar", "apollo", "artemis"],
    links: [
      {
        code: "MISSION",
        title: "Reconstruct Apollo 11",
        description:
          "Follow the first lunar landing through a source-checked timeline.",
        to: "/missions/apollo-11",
      },
    ],
  },
  {
    terms: ["hubble"],
    links: [
      {
        code: "MISSION",
        title: "Enter Hubble’s mission archive",
        description:
          "Trace decades of servicing, observation, and scientific discovery.",
        to: "/missions/hubble",
      },
    ],
  },
  {
    terms: ["webb", "jwst"],
    links: deepUniverseLinks,
  },
];

export const asteroidExplorationLinks: ExplorationLink[] = [
  {
    code: "NASA MEDIA",
    title: "See asteroid Bennu up close",
    description: "Search OSIRIS-REx surface imagery in NASA’s media archive.",
    to: "/media?q=OSIRIS-REx+Bennu&mediaType=image&page=1",
  },
];

export const earthExplorationLinks: ExplorationLink[] = [
  {
    code: "NASA MEDIA",
    title: "Explore DSCOVR imagery",
    description: "Search NASA’s archive for views of Earth from Sun–Earth L1.",
    to: "/media?q=DSCOVR+EPIC+Earth&mediaType=image&page=1",
  },
];

export const weatherExplorationLinks: ExplorationLink[] = [
  {
    code: "MISSION",
    title: "Fly with Parker Solar Probe",
    description:
      "Meet the spacecraft directly sampling the Sun’s outer atmosphere.",
    to: "/missions/parker-solar-probe",
  },
];

export function contextualLinksForText(text: string): ExplorationLink[] {
  const normalized = text.toLocaleLowerCase();
  for (const subject of subjectLinks)
    if (subject.terms.some((term) => normalized.includes(term)))
      return subject.links;
  return deepUniverseLinks;
}
