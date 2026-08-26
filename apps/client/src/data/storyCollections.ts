export type StoryEvidenceKind = "live" | "latest" | "curated" | "calculated";

export type StoryCollection = {
  id: string;
  code: string;
  title: string;
  question: string;
  summary: string;
  whyItMatters: string;
  duration: string;
  chapters: {
    kind: StoryEvidenceKind;
    label: string;
    title: string;
    description: string;
    takeaway: string;
    to: string;
  }[];
  milestones: { date: string; title: string; description: string }[];
  sources: { label: string; url: string }[];
  verifiedAt: string;
};

export const storyCollections: StoryCollection[] = [
  {
    id: "mars-habitability",
    code: "STORY // 01",
    title: "Reading the record of a wetter Mars",
    question: "How can rocks tell us whether ancient Mars could support life?",
    summary:
      "Follow water-shaped terrain, rover laboratories, and carefully limited scientific claims from Gale Crater to Jezero Crater.",
    whyItMatters:
      "Habitability is not evidence that life existed. It asks whether an environment had ingredients such as persistent water, useful chemistry, and energy that could have supported organisms.",
    duration: "12–18 minutes",
    chapters: [
      {
        kind: "curated",
        label: "Establish the question",
        title: "Curiosity reads an ancient lake record",
        description:
          "Begin in Gale Crater, where Curiosity studies layered rocks and the chemical evidence of past environments.",
        takeaway:
          "A rover can test past habitability without being a direct life-detection mission.",
        to: "/missions/curiosity",
      },
      {
        kind: "curated",
        label: "Compare the strategy",
        title: "Perseverance searches a former river delta",
        description:
          "Move to Jezero Crater, where Perseverance examines ancient environments and caches selected rock samples.",
        takeaway:
          "Different landing sites preserve different chapters of the planet’s water and climate history.",
        to: "/missions/perseverance",
      },
      {
        kind: "latest",
        label: "Inspect the evidence",
        title: "Search NASA’s Mars image record",
        description:
          "Compare landscapes, sedimentary structures, drilled targets, and rover hardware in the normalized media archive.",
        takeaway:
          "Images provide context; scientific conclusions also depend on instrument measurements and laboratory analysis.",
        to: "/media?q=Curiosity+Perseverance+Mars&mediaType=image&page=1",
      },
      {
        kind: "calculated",
        label: "Change scale",
        title: "Measure the communication gap",
        description:
          "Compare lunar and Mars reference distances and calculate one-way light time in the Celestial Scale Laboratory.",
        takeaway:
          "Mars operations require autonomy because commands and results cannot travel instantaneously.",
        to: "/scale-lab?profiles=moon,mars&metric=distance",
      },
    ],
    milestones: [
      {
        date: "2012",
        title: "Curiosity lands in Gale Crater",
        description:
          "The mobile laboratory begins assessing whether ancient Mars had environments capable of supporting microbial life.",
      },
      {
        date: "2013",
        title: "A past habitable environment",
        description:
          "Curiosity’s early rock analysis identifies chemical and mineral evidence of an ancient environment favorable for microbial life.",
      },
      {
        date: "2021",
        title: "Perseverance reaches Jezero Crater",
        description:
          "A new rover begins investigating a former lake and river delta while preparing selected samples for possible future study.",
      },
      {
        date: "Today",
        title: "The record remains incomplete",
        description:
          "Active rover investigations continue refining how water, climate, and potentially habitable conditions changed over time.",
      },
    ],
    sources: [
      {
        label: "NASA Mars exploration science goals",
        url: "https://science.nasa.gov/planetary-science/programs/mars-exploration/science-goals/",
      },
      {
        label: "NASA Curiosity science",
        url: "https://science.nasa.gov/mission/msl-curiosity/science/",
      },
      {
        label: "NASA Perseverance mission",
        url: "https://science.nasa.gov/mission/mars-2020-perseverance/",
      },
    ],
    verifiedAt: "2026-08-26",
  },
  {
    id: "sun-earth-connection",
    code: "STORY // 02",
    title: "From the Sun’s atmosphere to Earth",
    question: "How does energy from our star become space weather near Earth?",
    summary:
      "Separate measurements close to the Sun, observed eruptions, modeled motion, and effects measured in geospace.",
    whyItMatters:
      "A solar flare, a coronal mass ejection, and a geomagnetic storm describe different physical events. Their records may be connected, but none is a single danger score.",
    duration: "10–15 minutes",
    chapters: [
      {
        kind: "curated",
        label: "Start at the source",
        title: "Parker Solar Probe samples the corona",
        description:
          "See how a heat-shielded spacecraft measures fields, particles, and solar wind closer to their source than earlier missions.",
        takeaway:
          "Understanding the solar wind begins with direct measurements of the region where it is accelerated.",
        to: "/missions/parker-solar-probe",
      },
      {
        kind: "live",
        label: "Follow current records",
        title: "Read the DONKI event chronology",
        description:
          "Compare the timestamps and measurements NASA publishes for flares, CMEs, and geomagnetic storm observations.",
        takeaway:
          "Chronology can suggest context, but the interface does not claim causation when NASA does not provide it.",
        to: "/space-weather",
      },
      {
        kind: "latest",
        label: "Change viewpoint",
        title: "Look back at the sunlit Earth",
        description:
          "Use the newest available DSCOVR EPIC sequence from the Sun–Earth L1 region to orient the planet in the wider system.",
        takeaway:
          "Latest available imagery is published observation data, not a continuous live camera feed.",
        to: "/earth",
      },
      {
        kind: "latest",
        label: "Inspect the archive",
        title: "Compare how solar activity is imaged",
        description:
          "Search NASA media for coronagraph views, solar-disk imagery, spacecraft, and explanatory visualizations.",
        takeaway:
          "Different instruments reveal different wavelengths, regions, and physical processes.",
        to: "/media?q=solar+wind+coronal+mass+ejection&mediaType=image&page=1",
      },
    ],
    milestones: [
      {
        date: "1958",
        title: "Solar wind is predicted",
        description:
          "Eugene Parker develops the theory of a continuous outflow of particles from the Sun.",
      },
      {
        date: "2018",
        title: "Parker Solar Probe launches",
        description:
          "The mission begins a series of Venus-assisted orbits that progressively approach the Sun.",
      },
      {
        date: "2021",
        title: "A spacecraft touches the Sun",
        description:
          "NASA announces that Parker Solar Probe crossed into the corona and sampled particles and magnetic fields there.",
      },
      {
        date: "Today",
        title: "Sun–Earth observations continue",
        description:
          "Research missions and event catalogs continue measuring the connected system from the corona to geospace.",
      },
    ],
    sources: [
      {
        label: "NASA Parker Solar Probe",
        url: "https://science.nasa.gov/mission/parker-solar-probe/",
      },
      {
        label: "NASA Solar Terrestrial Probes",
        url: "https://science.nasa.gov/heliophysics/programs/solar-terrestrial-probes/",
      },
      {
        label: "NASA DONKI",
        url: "https://ccmc.gsfc.nasa.gov/tools/DONKI/",
      },
    ],
    verifiedAt: "2026-08-26",
  },
  {
    id: "cosmic-observatories",
    code: "STORY // 03",
    title: "Building a deeper view of cosmic history",
    question: "Why do astronomers need observatories with different designs?",
    summary:
      "Move from interpreted daily images to Hubble and Webb, then compare the scales and wavelengths behind their complementary views.",
    whyItMatters:
      "No telescope sees the whole universe. Orbit, mirror design, instruments, wavelength coverage, and observing strategy determine which questions an observatory can answer.",
    duration: "12–16 minutes",
    chapters: [
      {
        kind: "latest",
        label: "Begin with interpretation",
        title: "Read today’s astronomy selection",
        description:
          "Use APOD’s explanation and attribution to identify the object, observing method, and context behind a selected image or video.",
        takeaway:
          "A compelling image is an entry point; its caption, wavelength, source, and processing explain what it can show.",
        to: "/apod",
      },
      {
        kind: "curated",
        label: "Follow visible and ultraviolet light",
        title: "Trace Hubble’s serviceable observatory",
        description:
          "Review how low-Earth orbit, repair, upgrades, and decades of observations transformed astronomy.",
        takeaway:
          "Hubble’s longevity combines its design with repeated human servicing and instrument replacement.",
        to: "/missions/hubble",
      },
      {
        kind: "curated",
        label: "Move into infrared",
        title: "Follow Webb to Sun–Earth L2",
        description:
          "See why a cold, segmented infrared observatory operates far beyond low-Earth orbit behind a large sunshield.",
        takeaway:
          "Infrared sensitivity lets Webb investigate dust-obscured regions and highly redshifted light from early cosmic history.",
        to: "/missions/webb",
      },
      {
        kind: "curated",
        label: "Compare designs",
        title: "Align two observatory flight profiles",
        description:
          "Place Hubble and Webb side by side to compare objectives, destinations, milestones, and operational constraints.",
        takeaway:
          "Distance and wavelength coverage shape observatory design; neither is a direct measure of scientific importance.",
        to: "/missions/compare?missions=hubble,webb",
      },
    ],
    milestones: [
      {
        date: "1990",
        title: "Hubble launches",
        description:
          "The observatory enters low-Earth orbit and begins a multi-decade program of space-based astronomy.",
      },
      {
        date: "1993",
        title: "Hubble’s optics are corrected",
        description:
          "The first servicing mission installs corrective optics and restores the observatory’s intended image quality.",
      },
      {
        date: "2021",
        title: "Webb launches",
        description:
          "The folded observatory begins its journey toward a halo orbit around Sun–Earth L2.",
      },
      {
        date: "2022",
        title: "Webb’s first full-color science images",
        description:
          "NASA releases the first collection demonstrating the observatory’s infrared science capabilities.",
      },
    ],
    sources: [
      {
        label: "NASA Hubble Space Telescope",
        url: "https://science.nasa.gov/mission/hubble/",
      },
      {
        label: "NASA James Webb Space Telescope",
        url: "https://science.nasa.gov/mission/webb/",
      },
      {
        label: "NASA Webb early universe science",
        url: "https://science.nasa.gov/mission/webb/early-universe/",
      },
    ],
    verifiedAt: "2026-08-26",
  },
];

export function storyCollectionById(id: string | undefined) {
  return storyCollections.find((story) => story.id === id);
}
