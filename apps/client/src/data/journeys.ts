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
  {
    id: "hubble-cosmic-scale",
    code: "PATH // 06",
    title: "Measure the universe through Hubble",
    summary:
      "Move from a serviceable observatory in Earth orbit to the images that reshaped cosmic distance and time.",
    outcome:
      "You will connect Hubble’s engineering history to interpreted daily astronomy and its primary visual archive.",
    steps: [
      {
        label: "Orient",
        title: "Enter Hubble’s mission record",
        description:
          "Trace deployment, optical repair, servicing missions, and a multi-decade science campaign.",
        to: "/missions/hubble",
      },
      {
        label: "Observe",
        title: "Read today’s cosmic briefing",
        description:
          "Use APOD’s explanation and attribution to interpret a current astronomy selection.",
        to: "/apod",
      },
      {
        label: "Compare",
        title: "Search Hubble’s deep-field archive",
        description:
          "Examine NASA media records for the exposures that revealed galaxies across cosmic history.",
        to: "/media?q=Hubble+Deep+Field&mediaType=image&page=1",
      },
    ],
    source: {
      label: "NASA Hubble",
      url: "https://science.nasa.gov/mission/hubble/",
    },
  },
  {
    id: "jupiter-beneath-clouds",
    code: "PATH // 07",
    title: "Read Jupiter beneath the clouds",
    summary:
      "Follow Juno from polar orbit into the gravity, atmosphere, aurora, and moon observations behind its discoveries.",
    outcome:
      "You will distinguish the spacecraft’s mission design from the image evidence used to investigate the Jovian system.",
    steps: [
      {
        label: "Brief",
        title: "Review Juno’s extended mission",
        description:
          "Connect Jupiter orbit insertion to polar science passes and close encounters with Galilean moons.",
        to: "/missions/juno",
      },
      {
        label: "Inspect",
        title: "Search Juno’s Jupiter imagery",
        description:
          "Compare cloud systems, polar cyclones, auroras, and moon flybys in NASA’s archive.",
        to: "/media?q=Juno+Jupiter&mediaType=image&page=1",
      },
      {
        label: "Synthesize",
        title: "Run a planetary science debrief",
        description:
          "Use source-backed explanations to reinforce the difference between images, measurements, and inference.",
        to: "/trivia?difficulty=commander",
      },
    ],
    source: {
      label: "NASA Juno",
      url: "https://science.nasa.gov/mission/juno/",
    },
  },
  {
    id: "saturn-ocean-worlds",
    code: "PATH // 08",
    title: "Trace Cassini’s ocean-world evidence",
    summary:
      "Reconstruct how one Saturn orbiter connected rings, atmospheres, Titan’s surface, and Enceladus’ hidden ocean.",
    outcome:
      "You will see how a long-duration mission combined flybys, a landed probe, and repeated measurements into a scientific legacy.",
    steps: [
      {
        label: "Reconstruct",
        title: "Open the Cassini-Huygens record",
        description:
          "Follow the journey from launch and Saturn arrival through Huygens and the Grand Finale.",
        to: "/missions/cassini",
      },
      {
        label: "Examine",
        title: "Search Enceladus and Titan media",
        description:
          "Inspect NASA records of icy plumes, methane landscapes, rings, and moon encounters.",
        to: "/media?q=Cassini+Enceladus+Titan&mediaType=image&page=1",
      },
      {
        label: "Continue",
        title: "Open today’s astronomy briefing",
        description:
          "Place Saturn-system evidence beside a current interpreted view of the universe.",
        to: "/apod",
      },
    ],
    source: {
      label: "NASA Cassini",
      url: "https://science.nasa.gov/mission/cassini/",
    },
  },
  {
    id: "artemis-return-moon",
    code: "PATH // 09",
    title: "Rehearse a return to the Moon",
    summary:
      "Use Artemis I to connect launch systems, lunar navigation, heat-shield testing, and Earth viewed from deep space.",
    outcome:
      "You will understand Artemis I as an integrated uncrewed flight test and separate its completed objectives from later Artemis missions.",
    steps: [
      {
        label: "Reconstruct",
        title: "Follow the Artemis I flight test",
        description:
          "Trace SLS launch, Orion’s lunar flybys, distant retrograde orbit, re-entry, and recovery.",
        to: "/missions/artemis-i",
      },
      {
        label: "Look back",
        title: "View Earth from deep space",
        description:
          "Use EPIC’s current full-disk sequence to compare another distant perspective on our planet.",
        to: "/earth",
      },
      {
        label: "Inspect",
        title: "Search the Artemis I image record",
        description:
          "Explore Orion, the Moon, launch operations, and recovery through NASA media metadata.",
        to: "/media?q=Artemis+I+Orion&mediaType=image&page=1",
      },
    ],
    source: {
      label: "NASA Artemis I",
      url: "https://www.nasa.gov/mission/artemis-i/",
    },
  },
];
