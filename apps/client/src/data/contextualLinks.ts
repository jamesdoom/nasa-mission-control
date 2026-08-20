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
  {
    code: "GUIDED PATH",
    title: "Trace a deep-universe discovery",
    description:
      "Move from daily astronomy to mission history and primary NASA media.",
    to: "/discover#deep-universe",
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
      {
        code: "GUIDED PATH",
        title: "Follow a signal to Earth",
        description:
          "Connect solar activity, DONKI records, and Earth’s sunlit disk.",
        to: "/discover#sun-to-earth",
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
      {
        code: "GUIDED PATH",
        title: "Enter a Martian field lab",
        description:
          "Connect rover engineering, surface imagery, and mission science.",
        to: "/discover#mars-field-lab",
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
      {
        code: "GUIDED PATH",
        title: "Investigate Jupiter’s atmosphere",
        description:
          "Follow Juno observations into NASA’s primary media archive.",
        to: "/discover#jupiter-beneath-clouds",
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
      {
        code: "GUIDED PATH",
        title: "Trace Saturn’s ocean worlds",
        description:
          "Connect Cassini’s chronology with imagery of Titan and Enceladus.",
        to: "/discover#saturn-ocean-worlds",
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
      {
        code: "GUIDED PATH",
        title: "Follow Artemis back to the Moon",
        description:
          "Connect the Artemis I flight test with NASA’s modern lunar program.",
        to: "/discover#artemis-return-moon",
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
      {
        code: "GUIDED PATH",
        title: "Measure the universe with Hubble",
        description: "Connect iconic imagery with the observatory behind it.",
        to: "/discover#hubble-cosmic-scale",
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
    code: "GUIDED PATH",
    title: "Decode a near-Earth approach",
    description:
      "Separate miss distance, estimated size, and NASA’s orbital classification.",
    to: "/discover#planetary-defense",
  },
  {
    code: "NASA MEDIA",
    title: "See asteroid Bennu up close",
    description: "Search OSIRIS-REx surface imagery in NASA’s media archive.",
    to: "/media?q=OSIRIS-REx+Bennu&mediaType=image&page=1",
  },
];

export const earthExplorationLinks: ExplorationLink[] = [
  {
    code: "GUIDED PATH",
    title: "Follow a signal from the Sun",
    description:
      "Connect the EPIC viewpoint with solar activity observed upstream.",
    to: "/discover#sun-to-earth",
  },
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
  {
    code: "GUIDED PATH",
    title: "Follow solar activity to Earth",
    description:
      "Relate flares, CMEs, geomagnetic activity, and Earth observations.",
    to: "/discover#sun-to-earth",
  },
];

export function contextualLinksForText(text: string): ExplorationLink[] {
  const normalized = text.toLocaleLowerCase();
  for (const subject of subjectLinks)
    if (subject.terms.some((term) => normalized.includes(term)))
      return subject.links;
  return deepUniverseLinks;
}
