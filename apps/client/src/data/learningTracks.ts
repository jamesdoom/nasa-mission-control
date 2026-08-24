export type LearningTrack = {
  id: string;
  code: string;
  title: string;
  objective: string;
  audience: string;
  duration: string;
  steps: {
    id: string;
    kind: "story" | "mission" | "instrument" | "trivia";
    title: string;
    instruction: string;
    to: string;
  }[];
  check: {
    prompt: string;
    choices: string[];
    answer: number;
    explanation: string;
    source: { label: string; url: string };
  };
  reflection: string;
  sources: { label: string; url: string }[];
};

export const learningTracks: LearningTrack[] = [
  {
    id: "mars-evidence",
    code: "TRACK // 01",
    title: "How scientists read ancient Mars",
    objective:
      "Distinguish evidence for past habitability from evidence that life existed.",
    audience: "Grades 7–12 · Introductory planetary science",
    duration: "45–60 minutes",
    steps: [
      {
        id: "story",
        kind: "story",
        title: "Read the wetter Mars story",
        instruction: "Identify the limits placed on each habitability claim.",
        to: "/stories/mars-habitability",
      },
      {
        id: "mission",
        kind: "mission",
        title: "Inspect Curiosity",
        instruction:
          "Connect rover instruments and objectives to the evidence question.",
        to: "/missions/curiosity",
      },
      {
        id: "instrument",
        kind: "instrument",
        title: "Search current Mars media",
        instruction:
          "Compare a recent NASA record with the curated mission history.",
        to: "/media?q=Mars+rover&mediaType=image&page=1",
      },
      {
        id: "trivia",
        kind: "trivia",
        title: "Check planetary knowledge",
        instruction: "Complete a planets-channel knowledge check.",
        to: "/trivia?category=planets&difficulty=cadet",
      },
    ],
    check: {
      prompt: "What does evidence of an ancient lake most directly support?",
      choices: [
        "Life definitely existed",
        "The environment may once have been habitable",
        "Mars is currently habitable",
        "The lake formed on Earth",
      ],
      answer: 1,
      explanation:
        "Habitability describes environmental conditions and does not by itself demonstrate that life existed.",
      source: {
        label: "NASA Curiosity",
        url: "https://science.nasa.gov/mission/msl-curiosity/",
      },
    },
    reflection:
      "Which observation would strengthen a habitability claim, and which separate observation would be needed to argue for past life?",
    sources: [
      {
        label: "NASA Curiosity",
        url: "https://science.nasa.gov/mission/msl-curiosity/",
      },
      {
        label: "NASA Perseverance",
        url: "https://science.nasa.gov/mission/mars-2020-perseverance/",
      },
    ],
  },
  {
    id: "sun-earth",
    code: "TRACK // 02",
    title: "From solar event to Earth response",
    objective:
      "Separate observed flares and storms from modeled CME motion and operational forecasts.",
    audience: "Grades 8–12 · Earth and space science",
    duration: "40–55 minutes",
    steps: [
      {
        id: "story",
        kind: "story",
        title: "Follow the Sun–Earth connection",
        instruction: "Note where observed and modeled evidence appear.",
        to: "/stories/sun-earth-connection",
      },
      {
        id: "mission",
        kind: "mission",
        title: "Meet Parker Solar Probe",
        instruction:
          "Relate the mission objective to heliophysics measurements.",
        to: "/missions/parker-solar-probe",
      },
      {
        id: "instrument",
        kind: "instrument",
        title: "Compare DONKI events",
        instruction: "Select two events and compare only like fields.",
        to: "/space-weather",
      },
      {
        id: "trivia",
        kind: "trivia",
        title: "Check deep-space concepts",
        instruction: "Complete a source-backed knowledge check.",
        to: "/trivia?category=deep-space&difficulty=specialist",
      },
    ],
    check: {
      prompt: "Which statement best describes a DONKI CME speed?",
      choices: [
        "A guaranteed Earth impact time",
        "A modeled analysis value for an eruption",
        "A live camera measurement at Earth",
        "An operational NOAA warning",
      ],
      answer: 1,
      explanation:
        "DONKI CME speed is an analysis value; speed alone does not establish Earth direction or impact.",
      source: {
        label: "NASA CCMC DONKI",
        url: "https://ccmc.gsfc.nasa.gov/tools/DONKI/",
      },
    },
    reflection:
      "How would you explain the difference between a research event record and an operational forecast?",
    sources: [
      {
        label: "NASA Heliophysics",
        url: "https://science.nasa.gov/heliophysics/",
      },
      {
        label: "NASA CCMC DONKI",
        url: "https://ccmc.gsfc.nasa.gov/tools/DONKI/",
      },
    ],
  },
  {
    id: "cosmic-observatories",
    code: "TRACK // 03",
    title: "Reading the universe across wavelengths",
    objective:
      "Compare why Hubble and Webb observe different wavelength ranges and scientific targets.",
    audience: "Grades 6–12 · Astronomy",
    duration: "45–60 minutes",
    steps: [
      {
        id: "story",
        kind: "story",
        title: "Read the observatory story",
        instruction: "Record how wavelength changes what can be observed.",
        to: "/stories/cosmic-observatories",
      },
      {
        id: "mission",
        kind: "mission",
        title: "Inspect Webb",
        instruction: "Connect observatory design with infrared science.",
        to: "/missions/webb",
      },
      {
        id: "instrument",
        kind: "instrument",
        title: "Browse APOD history",
        instruction:
          "Compare image subjects and source attribution across a week.",
        to: "/apod",
      },
      {
        id: "trivia",
        kind: "trivia",
        title: "Check observatory knowledge",
        instruction: "Complete the observatories channel.",
        to: "/trivia?category=observatories&difficulty=cadet",
      },
    ],
    check: {
      prompt: "Why is Webb designed primarily for infrared observations?",
      choices: [
        "Infrared always has higher energy",
        "Infrared reveals cool and redshifted targets that visible light may not",
        "Earth blocks all visible light",
        "Hubble already observes every infrared wavelength",
      ],
      answer: 1,
      explanation:
        "Infrared sensitivity helps Webb study cool material and highly redshifted light from the distant universe.",
      source: {
        label: "NASA Webb",
        url: "https://science.nasa.gov/mission/webb/",
      },
    },
    reflection:
      "Choose one astronomical target and explain what a second wavelength could reveal that visible light alone might miss.",
    sources: [
      { label: "NASA Webb", url: "https://science.nasa.gov/mission/webb/" },
      { label: "NASA Hubble", url: "https://science.nasa.gov/mission/hubble/" },
    ],
  },
];

export function learningTrackById(id: string | undefined) {
  const track =
    learningTracks.find((item) => item.id === id) ?? learningTracks[0];
  if (!track) throw new Error("At least one learning track is required.");
  return track;
}
