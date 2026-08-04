export type TriviaDifficulty = "cadet" | "specialist" | "commander";

export type TriviaQuestion = {
  id: string;
  difficulty: TriviaDifficulty;
  prompt: string;
  choices: string[];
  answer: number;
  explanation: string;
  source: { label: string; url: string };
};

export const triviaQuestions: TriviaQuestion[] = [
  {
    id: "apollo-destination",
    difficulty: "cadet",
    prompt: "Where did Apollo 11’s lunar module Eagle land?",
    choices: [
      "Ocean of Storms",
      "Sea of Tranquility",
      "Fra Mauro",
      "Taurus–Littrow",
    ],
    answer: 1,
    explanation:
      "Armstrong and Aldrin landed in the Sea of Tranquility while Michael Collins remained in lunar orbit.",
    source: {
      label: "NASA Apollo 11",
      url: "https://www.nasa.gov/mission/apollo-11/",
    },
  },
  {
    id: "curiosity-target",
    difficulty: "cadet",
    prompt: "Which planet is NASA’s Curiosity rover exploring?",
    choices: ["Venus", "Mars", "Mercury", "Jupiter"],
    answer: 1,
    explanation:
      "Curiosity landed in Gale Crater on Mars to investigate whether the planet once supported habitable environments.",
    source: {
      label: "NASA Curiosity mission",
      url: "https://science.nasa.gov/mission/msl-curiosity/",
    },
  },
  {
    id: "webb-light",
    difficulty: "cadet",
    prompt: "Which region of light is central to Webb’s observations?",
    choices: ["Infrared", "Radio", "Gamma ray", "Ultraviolet only"],
    answer: 0,
    explanation:
      "Webb’s cold observatory and instruments are designed to study the infrared universe.",
    source: {
      label: "NASA Webb mission",
      url: "https://science.nasa.gov/mission/webb/",
    },
  },
  {
    id: "voyager-interstellar",
    difficulty: "specialist",
    prompt:
      "Which spacecraft became the first human-made object to enter interstellar space?",
    choices: ["Pioneer 10", "Voyager 1", "New Horizons", "Voyager 2"],
    answer: 1,
    explanation:
      "Measurements showed Voyager 1 crossed the heliopause in August 2012, entering interstellar space.",
    source: {
      label: "NASA Voyager 1",
      url: "https://science.nasa.gov/mission/voyager/voyager-1/",
    },
  },
  {
    id: "webb-l2",
    difficulty: "specialist",
    prompt: "Webb operates around which Sun–Earth Lagrange point?",
    choices: ["L1", "L2", "L4", "L5"],
    answer: 1,
    explanation:
      "Webb follows a halo orbit around Sun–Earth L2, roughly 1.5 million kilometers from Earth.",
    source: {
      label: "NASA Webb mission",
      url: "https://science.nasa.gov/mission/webb/",
    },
  },
  {
    id: "curiosity-landing",
    difficulty: "specialist",
    prompt: "What system lowered Curiosity to the Martian surface?",
    choices: ["Airbags", "Sky crane", "Landing legs", "Impact shell"],
    answer: 1,
    explanation:
      "The rocket-powered descent stage used a sky crane maneuver to lower Curiosity onto its wheels.",
    source: {
      label: "NASA Curiosity mission",
      url: "https://science.nasa.gov/mission/msl-curiosity/",
    },
  },
  {
    id: "apollo-duration",
    difficulty: "commander",
    prompt: "How long did Apollo 11 remain in flight before splashdown?",
    choices: ["About 4 days", "About 6 days", "About 8 days", "About 12 days"],
    answer: 2,
    explanation:
      "Apollo 11 splashed down after 195 hours, 18 minutes, and 35 seconds—just over eight days.",
    source: {
      label: "NASA Apollo 11 overview",
      url: "https://www.nasa.gov/history/apollo-11-mission-overview/",
    },
  },
  {
    id: "voyager-saturn",
    difficulty: "commander",
    prompt: "What did Voyager 1 discover at Saturn?",
    choices: [
      "Five moons and the G-ring",
      "Liquid oceans on Titan",
      "Saturn’s first known ring",
      "A solid planetary surface",
    ],
    answer: 0,
    explanation:
      "NASA credits Voyager 1 with finding five new Saturnian moons and a new ring called the G-ring.",
    source: {
      label: "NASA Voyager 1",
      url: "https://science.nasa.gov/mission/voyager/voyager-1/",
    },
  },
  {
    id: "webb-first-images",
    difficulty: "commander",
    prompt: "When did Webb’s first full-color science images debut?",
    choices: ["January 2022", "July 2022", "December 2022", "July 2023"],
    answer: 1,
    explanation:
      "The first full-color image was unveiled July 11, 2022, followed by the full collection on July 12.",
    source: {
      label: "NASA Webb timeline",
      url: "https://science.nasa.gov/mission/webb/webb-mission-timeline/",
    },
  },
];
