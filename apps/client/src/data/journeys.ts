export type DiscoveryJourney = {
  id: string;
  code: string;
  title: string;
  summary: string;
  outcome: string;
  steps: {
    label: string;
    title: string;
    description: string;
    to: string;
  }[];
  source: { label: string; url: string };
};

export const discoveryJourneys: DiscoveryJourney[] = [
  {
    id: "sun-to-earth",
    code: "PATH // 01",
    title: "Follow a signal from the Sun to Earth",
    summary:
      "Separate a solar eruption, its modeled motion, and its possible effects near Earth.",
    outcome:
      "You will learn why a flare, a CME, and a geomagnetic storm are related records—not interchangeable danger scores.",
    steps: [
      {
        label: "Observe",
        title: "Read the DONKI chronology",
        description:
          "Compare flare, CME, and storm timestamps on their own scales.",
        to: "/space-weather",
      },
      {
        label: "Change viewpoint",
        title: "Look back at the sunlit Earth",
        description: "Use EPIC imagery to see the planet from Sun–Earth L1.",
        to: "/earth",
      },
      {
        label: "Investigate",
        title: "Search NASA’s solar archive",
        description:
          "Find mission imagery and explanatory media about solar activity.",
        to: "/media?q=solar+activity&mediaType=image&page=1",
      },
    ],
    source: {
      label: "NASA Heliophysics",
      url: "https://science.nasa.gov/heliophysics/",
    },
  },
  {
    id: "planetary-defense",
    code: "PATH // 02",
    title: "Decode a near-Earth approach",
    summary:
      "Move from encounter measurements to the missions and observations that help scientists understand small bodies.",
    outcome:
      "You will distinguish close approach, estimated size, and NASA’s potentially hazardous classification.",
    steps: [
      {
        label: "Scan",
        title: "Compare upcoming encounters",
        description:
          "Use exact miss distance, diameter estimates, and Earth-relative speed.",
        to: "/asteroids?metric=distance",
      },
      {
        label: "Inspect",
        title: "See asteroid Bennu up close",
        description:
          "Search NASA’s archive for OSIRIS-REx observations and surface detail.",
        to: "/media?q=OSIRIS-REx+Bennu&mediaType=image&page=1",
      },
      {
        label: "Connect",
        title: "Trace exploration beyond Earth",
        description:
          "Place robotic reconnaissance in the wider history of deep-space missions.",
        to: "/missions?spacecraftType=probe",
      },
    ],
    source: {
      label: "NASA Planetary Defense",
      url: "https://science.nasa.gov/planetary-defense/",
    },
  },
  {
    id: "moon-then-now",
    code: "PATH // 03",
    title: "Reconstruct Apollo 11 through evidence",
    summary:
      "Combine a curated flight chronology with original NASA photography and modern daily astronomy.",
    outcome:
      "You will move between a sourced historical narrative, primary media records, and today’s observing culture.",
    steps: [
      {
        label: "Reconstruct",
        title: "Open the Apollo 11 flight record",
        description: "Follow defining moments from launch through splashdown.",
        to: "/missions/apollo-11",
      },
      {
        label: "Examine",
        title: "Search the original image archive",
        description: "Explore lunar-surface photographs and mission metadata.",
        to: "/media?q=Apollo+11+lunar+surface&mediaType=image&page=1",
      },
      {
        label: "Continue",
        title: "Browse today’s cosmic briefing",
        description:
          "Connect historic exploration with a current view of the universe.",
        to: "/apod",
      },
    ],
    source: {
      label: "NASA Apollo 11",
      url: "https://www.nasa.gov/mission/apollo-11/",
    },
  },
  {
    id: "mars-field-lab",
    code: "PATH // 04",
    title: "Enter Curiosity’s Martian field laboratory",
    summary:
      "Pair the rover’s mission record with the visual archive it continues to build on Mars.",
    outcome:
      "You will connect engineering milestones to the images and science questions behind a long-lived surface mission.",
    steps: [
      {
        label: "Brief",
        title: "Review Curiosity’s mission",
        description:
          "Understand the rover, its landing, and its extended scientific campaign.",
        to: "/missions/curiosity",
      },
      {
        label: "Survey",
        title: "Search Mars surface imagery",
        description:
          "Find Curiosity landscapes, hardware, and science targets in NASA’s archive.",
        to: "/media?q=Curiosity+Mars&mediaType=image&page=1",
      },
      {
        label: "Test knowledge",
        title: "Run a mission debrief",
        description:
          "Use source-backed explanations to reinforce what you discovered.",
        to: "/trivia?difficulty=specialist",
      },
    ],
    source: {
      label: "NASA Curiosity",
      url: "https://science.nasa.gov/mission/msl-curiosity/",
    },
  },
  {
    id: "deep-universe",
    code: "PATH // 05",
    title: "From a daily image to Webb’s observatory",
    summary:
      "Use one striking astronomy image as an entry point into the spacecraft and archive behind modern discovery.",
    outcome:
      "You will connect an interpreted daily observation to a source-checked observatory record and primary NASA media.",
    steps: [
      {
        label: "Observe",
        title: "Open today’s astronomy briefing",
        description:
          "Start with the image or video selected by NASA astronomers today.",
        to: "/apod",
      },
      {
        label: "Contextualize",
        title: "Enter Webb’s mission archive",
        description:
          "Trace the observatory from development through science operations.",
        to: "/missions/webb",
      },
      {
        label: "Expand",
        title: "Search Webb’s NASA media",
        description:
          "Explore imagery, engineering records, and public science releases.",
        to: "/media?q=James+Webb+Space+Telescope&mediaType=image&page=1",
      },
    ],
    source: {
      label: "NASA Webb",
      url: "https://science.nasa.gov/mission/webb/",
    },
  },
];
