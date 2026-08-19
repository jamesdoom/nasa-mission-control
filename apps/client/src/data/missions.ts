export type MissionStatus = "active" | "completed" | "extended";
export type MissionVehicle =
  "crewed" | "spacecraft" | "probe" | "rover" | "observatory";
export type MissionDestination =
  "Moon" | "Mars" | "Sun" | "Outer Solar System" | "Universe";

export type Mission = {
  slug: string;
  name: string;
  program: string;
  missionNumber: string;
  status: MissionStatus;
  statusLabel: string;
  vehicle: MissionVehicle;
  destination: MissionDestination;
  launchDate: string;
  endDate: string | null;
  dek: string;
  overview: string;
  objective: string;
  achievements: string[];
  image: {
    src: string;
    alt: string;
    credit: string;
    nasaId: string;
    sourceUrl: string;
  };
  facts: { label: string; value: string }[];
  timeline: { date: string; title: string; description: string }[];
  relatedMedia?: {
    title: string;
    description: string;
    kind: "image" | "story" | "timeline";
    url: string;
  }[];
  sources: { label: string; url: string }[];
  verifiedAt: string;
};

export const missions: Mission[] = [
  {
    slug: "apollo-11",
    name: "Apollo 11",
    program: "Apollo program",
    missionNumber: "ARCHIVE // 001",
    status: "completed",
    statusLabel: "Mission complete",
    vehicle: "crewed",
    destination: "Moon",
    launchDate: "1969-07-16",
    endDate: "1969-07-24",
    dek: "The first crewed mission to land humans on another world and return them safely to Earth.",
    overview:
      "Apollo 11 carried Neil Armstrong, Buzz Aldrin, and Michael Collins to the Moon. Armstrong and Aldrin landed Eagle in the Sea of Tranquility while Collins remained in lunar orbit aboard Columbia.",
    objective: "Perform a crewed lunar landing and return safely to Earth.",
    achievements: [
      "First human landing on the Moon",
      "Collected 21.5 kilograms of lunar material",
      "Deployed scientific experiments on the lunar surface",
    ],
    image: {
      src: "/assets/missions/apollo-11.jpg",
      alt: "Buzz Aldrin walking near the Apollo 11 lunar module on the Moon",
      credit: "NASA / Neil Armstrong",
      nasaId: "as11-40-5903",
      sourceUrl: "https://images.nasa.gov/details/as11-40-5903",
    },
    facts: [
      { label: "Crew", value: "Armstrong, Aldrin, Collins" },
      { label: "Launch vehicle", value: "Saturn V" },
      { label: "Landing site", value: "Sea of Tranquility" },
      { label: "Duration", value: "8 days, 3 hours, 18 minutes" },
    ],
    timeline: [
      {
        date: "1969-07-16",
        title: "Launch",
        description:
          "Saturn V AS-506 lifted off from Kennedy Space Center Launch Pad 39A.",
      },
      {
        date: "1969-07-20",
        title: "The Eagle landed",
        description:
          "Armstrong and Aldrin touched down in the Sea of Tranquility.",
      },
      {
        date: "1969-07-21",
        title: "First steps",
        description:
          "Armstrong and Aldrin explored the surface and deployed experiments.",
      },
      {
        date: "1969-07-24",
        title: "Return to Earth",
        description: "Columbia splashed down safely in the Pacific Ocean.",
      },
    ],
    sources: [
      {
        label: "NASA Apollo 11 mission",
        url: "https://www.nasa.gov/mission/apollo-11/",
      },
      {
        label: "NASA mission overview",
        url: "https://www.nasa.gov/history/apollo-11-mission-overview/",
      },
    ],
    verifiedAt: "2026-08-03",
  },
  {
    slug: "voyager-1",
    name: "Voyager 1",
    program: "Voyager program",
    missionNumber: "ARCHIVE // 002",
    status: "extended",
    statusLabel: "Extended mission",
    vehicle: "probe",
    destination: "Outer Solar System",
    launchDate: "1977-09-05",
    endDate: null,
    dek: "The most distant human-made object, still returning measurements from interstellar space.",
    overview:
      "Voyager 1 transformed our view of Jupiter and Saturn before continuing beyond the heliopause. It became the first spacecraft to enter interstellar space and remains connected through NASA’s Deep Space Network.",
    objective:
      "Explore Jupiter and Saturn, then characterize the outer heliosphere and interstellar environment.",
    achievements: [
      "First spacecraft to enter interstellar space",
      "Discovered a thin ring and two moons at Jupiter",
      "Found five moons and the G-ring at Saturn",
    ],
    image: {
      src: "/assets/missions/voyager-1.jpg",
      alt: "Engineers preparing the Voyager Golden Record before launch",
      credit: "NASA / JPL-Caltech",
      nasaId: "PIA21741",
      sourceUrl: "https://images.nasa.gov/details/PIA21741",
    },
    facts: [
      { label: "Mission type", value: "Flyby / interstellar" },
      { label: "Launch vehicle", value: "Titan IIIE-Centaur" },
      { label: "Operator", value: "NASA / JPL" },
      { label: "Power", value: "Radioisotope generators" },
    ],
    timeline: [
      {
        date: "1977-09-05",
        title: "Launch",
        description:
          "Voyager 1 launched from Cape Canaveral on a fast route to Jupiter and Saturn.",
      },
      {
        date: "1979-03-05",
        title: "Jupiter encounter",
        description: "The spacecraft made its closest approach to Jupiter.",
      },
      {
        date: "1980-11-12",
        title: "Saturn encounter",
        description: "Voyager 1 completed its close reconnaissance of Saturn.",
      },
      {
        date: "2012-08-25",
        title: "Interstellar space",
        description:
          "Measurements showed Voyager 1 had crossed the heliopause.",
      },
    ],
    sources: [
      {
        label: "NASA Voyager 1 mission",
        url: "https://science.nasa.gov/mission/voyager/voyager-1/",
      },
      {
        label: "NASA Voyager overview",
        url: "https://science.nasa.gov/mission/voyager/mission-overview/",
      },
    ],
    verifiedAt: "2026-08-03",
  },
  {
    slug: "curiosity",
    name: "Curiosity",
    program: "Mars Science Laboratory",
    missionNumber: "ARCHIVE // 003",
    status: "active",
    statusLabel: "Active mission",
    vehicle: "rover",
    destination: "Mars",
    launchDate: "2011-11-26",
    endDate: null,
    dek: "A mobile laboratory reading the ancient rock record of Mars inside Gale Crater.",
    overview:
      "Curiosity investigates whether Mars once had environments capable of supporting microbial life. Its instruments found chemical and mineral evidence of past habitable conditions and continue to examine Mount Sharp’s layered rocks.",
    objective:
      "Determine whether Mars ever offered environmental conditions favorable for microbial life.",
    achievements: [
      "Found evidence of an ancient habitable lake environment",
      "Detected organic molecules in Martian rocks",
      "Measured radiation conditions for future explorers",
    ],
    image: {
      src: "/assets/missions/curiosity.jpg",
      alt: "NASA Curiosity rover self-portrait at the Okoruso drill site on Mars",
      credit: "NASA / JPL-Caltech / MSSS",
      nasaId: "PIA20603",
      sourceUrl: "https://images.nasa.gov/details/PIA20603",
    },
    facts: [
      { label: "Landing site", value: "Gale Crater" },
      { label: "Launch vehicle", value: "Atlas V 541" },
      { label: "Science payload", value: "10 instruments" },
      { label: "Power", value: "Radioisotope generator" },
    ],
    timeline: [
      {
        date: "2011-11-26",
        title: "Launch",
        description: "Mars Science Laboratory launched from Cape Canaveral.",
      },
      {
        date: "2012-08-06",
        title: "Gale Crater landing",
        description:
          "The sky crane delivered Curiosity safely to the Martian surface.",
      },
      {
        date: "2013-03-12",
        title: "Habitable environment",
        description:
          "NASA reported that ancient Mars could have supported living microbes.",
      },
      {
        date: "2014-09-11",
        title: "Mount Sharp",
        description:
          "Curiosity reached the layered mountain at the center of Gale Crater.",
      },
    ],
    sources: [
      {
        label: "NASA Curiosity mission",
        url: "https://science.nasa.gov/mission/msl-curiosity/",
      },
      {
        label: "NASA Curiosity science",
        url: "https://science.nasa.gov/mission/msl-curiosity/science/",
      },
    ],
    verifiedAt: "2026-08-03",
  },
  {
    slug: "webb",
    name: "James Webb Space Telescope",
    program: "Great Observatories",
    missionNumber: "ARCHIVE // 004",
    status: "active",
    statusLabel: "Active mission",
    vehicle: "observatory",
    destination: "Universe",
    launchDate: "2021-12-25",
    endDate: null,
    dek: "A cold infrared observatory investigating cosmic history from a halo orbit around Sun–Earth L2.",
    overview:
      "Webb studies every phase of cosmic history—from the first luminous galaxies to forming stars, planets, and nearby worlds. NASA leads the observatory with ESA and CSA as international partners.",
    objective:
      "Observe the infrared universe to study cosmic origins, galaxy evolution, star and planet formation, and planetary systems.",
    achievements: [
      "Deployed its segmented mirror and five-layer sunshield in space",
      "Began routine science operations in 2022",
      "Delivered unprecedented infrared spectra and imagery",
    ],
    image: {
      src: "/assets/missions/webb.jpg",
      alt: "James Webb Space Telescope standing fully assembled during testing",
      credit: "NASA / Chris Gunn",
      nasaId: "GSFC_20171208_Archive_e000356",
      sourceUrl:
        "https://images.nasa.gov/details/GSFC_20171208_Archive_e000356",
    },
    facts: [
      { label: "Partners", value: "NASA / ESA / CSA" },
      { label: "Launch vehicle", value: "Ariane 5" },
      { label: "Primary mirror", value: "6.5 meters" },
      { label: "Operating region", value: "Sun–Earth L2" },
    ],
    timeline: [
      {
        date: "2021-12-25",
        title: "Launch",
        description: "Webb launched aboard an Ariane 5 from French Guiana.",
      },
      {
        date: "2022-01-08",
        title: "Deployment complete",
        description:
          "The primary mirror wings locked into place after the observatory unfolded.",
      },
      {
        date: "2022-01-24",
        title: "Arrival at L2",
        description:
          "A course-correction burn inserted Webb into its planned halo orbit.",
      },
      {
        date: "2022-07-12",
        title: "First science images",
        description:
          "NASA released Webb’s first full-color images and spectroscopic data.",
      },
    ],
    sources: [
      {
        label: "NASA Webb mission",
        url: "https://science.nasa.gov/mission/webb/",
      },
      {
        label: "NASA Webb timeline",
        url: "https://science.nasa.gov/mission/webb/webb-mission-timeline/",
      },
    ],
    verifiedAt: "2026-08-03",
  },
  {
    slug: "perseverance",
    name: "Perseverance",
    program: "Mars 2020",
    missionNumber: "ARCHIVE // 005",
    status: "active",
    statusLabel: "Active mission",
    vehicle: "rover",
    destination: "Mars",
    launchDate: "2020-07-30",
    endDate: null,
    dek: "A sample-caching rover reading Jezero Crater’s ancient environments for signs of past microbial life.",
    overview:
      "Perseverance explores Jezero Crater, where an ancient river delta and lake once existed. The rover studies Mars’ geology and past climate, searches for signs of ancient microbial life, and seals selected rock and regolith cores in sample tubes.",
    objective:
      "Seek signs of ancient life, characterize Mars’ geology and climate, and collect samples for possible future return to Earth.",
    achievements: [
      "Completed the first powered, controlled flight demonstration on another planet with Ingenuity",
      "Collected and sealed the first rock cores on another planet",
      "Deposited a backup set of sample tubes on the Martian surface",
    ],
    image: {
      src: "/assets/missions/perseverance.jpg",
      alt: "NASA’s Perseverance rover beside the Cheyava Falls rock on Mars",
      credit: "NASA / JPL-Caltech / MSSS",
      nasaId: "PIA26344",
      sourceUrl:
        "https://science.nasa.gov/resource/perseverances-selfie-with-cheyava-falls/",
    },
    facts: [
      { label: "Landing site", value: "Jezero Crater" },
      { label: "Launch vehicle", value: "Atlas V 541" },
      { label: "Science payload", value: "7 instruments" },
      { label: "Power", value: "Radioisotope generator" },
    ],
    timeline: [
      {
        date: "2020-07-30",
        title: "Launch",
        description:
          "Mars 2020 launched from Cape Canaveral aboard an Atlas V 541.",
      },
      {
        date: "2021-02-18",
        title: "Jezero Crater landing",
        description:
          "Perseverance completed an autonomous entry, descent, and sky-crane landing.",
      },
      {
        date: "2021-04-19",
        title: "Ingenuity’s first flight",
        description:
          "The rover documented the first powered, controlled flight on another world.",
      },
      {
        date: "2021-09-06",
        title: "First rock core sealed",
        description:
          "NASA confirmed Perseverance had collected and stored its first Martian rock sample.",
      },
    ],
    sources: [
      {
        label: "NASA Perseverance mission",
        url: "https://science.nasa.gov/mission/mars-2020-perseverance/",
      },
      {
        label: "NASA Perseverance fact sheet",
        url: "https://science.nasa.gov/resource/mars-2020-perseverance-fact-sheet/",
      },
    ],
    verifiedAt: "2026-08-19",
  },
  {
    slug: "parker-solar-probe",
    name: "Parker Solar Probe",
    program: "Living With a Star",
    missionNumber: "ARCHIVE // 006",
    status: "active",
    statusLabel: "Active mission",
    vehicle: "probe",
    destination: "Sun",
    launchDate: "2018-08-12",
    endDate: null,
    dek: "Humanity’s first mission into the solar corona, built to sample a star’s atmosphere directly.",
    overview:
      "Parker Solar Probe uses repeated Venus gravity assists to pass through the Sun’s outer atmosphere. Protected by a carbon-composite heat shield, its instruments measure fields, particles, and the solar wind closer to their source than any previous spacecraft.",
    objective:
      "Trace the energy that heats the corona, investigate the source of the solar wind, and study the acceleration of energetic particles.",
    achievements: [
      "First spacecraft to fly through the solar corona",
      "Closest human-made object to the Sun",
      "Fastest human-made object",
    ],
    image: {
      src: "/assets/missions/parker-solar-probe.jpg",
      alt: "Delta IV Heavy engines launching NASA’s Parker Solar Probe at night",
      credit: "NASA / Bill Ingalls",
      nasaId: "PARKER-LAUNCH-2018-08-12",
      sourceUrl: "https://science.nasa.gov/resource/parker-solar-probe-launch/",
    },
    facts: [
      { label: "Target", value: "Solar corona" },
      { label: "Launch vehicle", value: "Delta IV Heavy" },
      { label: "Instrument suites", value: "4" },
      {
        label: "Mission management",
        value: "NASA Goddard / Johns Hopkins APL",
      },
    ],
    timeline: [
      {
        date: "2018-08-12",
        title: "Launch",
        description:
          "Parker Solar Probe launched from Cape Canaveral aboard a Delta IV Heavy.",
      },
      {
        date: "2018-11-05",
        title: "First solar encounter",
        description:
          "The spacecraft completed its first close pass through the Sun’s outer atmosphere.",
      },
      {
        date: "2021-04-28",
        title: "Inside the corona",
        description:
          "Parker crossed the Alfvén critical surface and directly sampled the solar atmosphere.",
      },
      {
        date: "2024-12-24",
        title: "Record close approach",
        description:
          "The probe passed about 3.8 million miles above the solar surface at roughly 430,000 mph.",
      },
    ],
    sources: [
      {
        label: "NASA Parker Solar Probe mission",
        url: "https://science.nasa.gov/mission/parker-solar-probe/",
      },
      {
        label: "NASA record close approach",
        url: "https://science.nasa.gov/science-research/heliophysics/nasas-parker-solar-probe-makes-history-with-closest-pass-to-sun/",
      },
    ],
    verifiedAt: "2026-08-19",
  },
  {
    slug: "hubble",
    name: "Hubble Space Telescope",
    program: "Great Observatories",
    missionNumber: "ARCHIVE // 007",
    status: "active",
    statusLabel: "Active mission",
    vehicle: "observatory",
    destination: "Universe",
    launchDate: "1990-04-24",
    endDate: null,
    dek: "A serviceable observatory in low Earth orbit that transformed humanity’s view of the universe.",
    overview:
      "Hubble observes ultraviolet, visible, and near-infrared light above Earth’s atmosphere. Five astronaut servicing missions repaired and upgraded the telescope, enabling a scientific record that spans the solar system, stellar birth and death, galaxies, and the expansion of the universe.",
    objective:
      "Use high-resolution observations above Earth’s atmosphere to investigate the origin, structure, and evolution of the universe.",
    achievements: [
      "Helped establish the universe’s expansion rate and age",
      "Provided evidence that supermassive black holes are common in galaxy centers",
      "Built a multi-decade record of planets, stars, nebulae, and distant galaxies",
    ],
    image: {
      src: "/assets/missions/hubble.jpg",
      alt: "Hubble Space Telescope above Earth with the Moon in the distance",
      credit: "NASA",
      nasaId: "sts061-57-021",
      sourceUrl: "https://images.nasa.gov/details/sts061-57-021",
    },
    facts: [
      { label: "Orbit", value: "Low Earth orbit" },
      { label: "Launch vehicle", value: "Space Shuttle Discovery" },
      { label: "Primary mirror", value: "2.4 meters" },
      { label: "Servicing missions", value: "5" },
    ],
    timeline: [
      {
        date: "1990-04-24",
        title: "Launch",
        description: "Discovery launched Hubble aboard mission STS-31.",
      },
      {
        date: "1990-04-25",
        title: "Deployment",
        description: "The crew released Hubble into low Earth orbit.",
      },
      {
        date: "1993-12-13",
        title: "Optics restored",
        description:
          "The first servicing mission installed corrective optics and a new camera.",
      },
      {
        date: "1995-12-18",
        title: "Hubble Deep Field",
        description:
          "A long exposure began revealing thousands of galaxies in a seemingly empty patch of sky.",
      },
      {
        date: "2009-05-24",
        title: "Final servicing mission",
        description:
          "Astronauts completed the fifth servicing mission with new instruments and repairs.",
      },
    ],
    relatedMedia: [
      {
        title: "Hubble’s iconic images",
        description: "Explore NASA’s curated gallery of landmark observations.",
        kind: "image",
        url: "https://science.nasa.gov/mission/hubble/multimedia/hubble-images/",
      },
      {
        title: "Complete Hubble timeline",
        description:
          "Trace the observatory’s development, servicing, and discoveries.",
        kind: "timeline",
        url: "https://science.nasa.gov/mission/hubble/overview/hubble-timeline/",
      },
    ],
    sources: [
      {
        label: "NASA Hubble mission",
        url: "https://science.nasa.gov/mission/hubble/",
      },
      {
        label: "NASA Hubble timeline",
        url: "https://science.nasa.gov/mission/hubble/overview/hubble-timeline/",
      },
    ],
    verifiedAt: "2026-08-19",
  },
  {
    slug: "juno",
    name: "Juno",
    program: "New Frontiers",
    missionNumber: "ARCHIVE // 008",
    status: "extended",
    statusLabel: "Extended mission",
    vehicle: "probe",
    destination: "Outer Solar System",
    launchDate: "2011-08-05",
    endDate: null,
    dek: "A solar-powered orbiter probing beneath Jupiter’s clouds and surveying its largest moons.",
    overview:
      "Juno measures Jupiter’s gravity, magnetic field, atmosphere, auroras, rings, and deep structure from a highly elliptical polar orbit. Its extended mission added close encounters with Ganymede, Europa, and Io to the investigation of the Jovian system.",
    objective:
      "Investigate Jupiter’s origin and evolution by mapping its interior, atmosphere, magnetic field, and polar environment.",
    achievements: [
      "Mapped vast cyclone systems around Jupiter’s poles",
      "Measured atmospheric jet streams extending thousands of kilometers deep",
      "Expanded its investigation through close flybys of three Galilean moons",
    ],
    image: {
      src: "/assets/missions/juno.jpg",
      alt: "Jupiter with its moons Io and Europa seen by NASA’s Juno spacecraft",
      credit: "NASA / JPL-Caltech / SwRI / MSSS",
      nasaId: "PIA25014",
      sourceUrl: "https://images.nasa.gov/details/PIA25014",
    },
    facts: [
      { label: "Target", value: "Jupiter system" },
      { label: "Launch vehicle", value: "Atlas V 551" },
      { label: "Orbit", value: "Elliptical polar orbit" },
      { label: "Power", value: "Three solar arrays" },
    ],
    timeline: [
      {
        date: "2011-08-05",
        title: "Launch",
        description: "Juno launched from Cape Canaveral aboard an Atlas V.",
      },
      {
        date: "2013-10-09",
        title: "Earth gravity assist",
        description:
          "An Earth flyby supplied the velocity needed to reach Jupiter.",
      },
      {
        date: "2016-07-04",
        title: "Jupiter orbit insertion",
        description: "A 35-minute engine burn placed Juno into polar orbit.",
      },
      {
        date: "2021-06-07",
        title: "Ganymede encounter",
        description:
          "Juno made the closest spacecraft flyby of Ganymede in more than two decades.",
      },
      {
        date: "2023-12-30",
        title: "Io close flyby",
        description:
          "The extended mission began a pair of close passes over volcanic Io.",
      },
    ],
    relatedMedia: [
      {
        title: "JunoCam image gallery",
        description:
          "Explore processed Jupiter imagery from the mission’s public camera.",
        kind: "image",
        url: "https://science.nasa.gov/mission/juno/multimedia/",
      },
      {
        title: "Juno discoveries",
        description:
          "Review NASA’s account of the mission’s major scientific results.",
        kind: "story",
        url: "https://science.nasa.gov/mission/juno/",
      },
    ],
    sources: [
      {
        label: "NASA Juno mission",
        url: "https://science.nasa.gov/mission/juno/",
      },
      {
        label: "NASA Juno fact sheet",
        url: "https://science.nasa.gov/resource/fact-sheet-juno/",
      },
    ],
    verifiedAt: "2026-08-19",
  },
  {
    slug: "cassini",
    name: "Cassini-Huygens",
    program: "Flagship mission",
    missionNumber: "ARCHIVE // 009",
    status: "completed",
    statusLabel: "Mission complete",
    vehicle: "probe",
    destination: "Outer Solar System",
    launchDate: "1997-10-15",
    endDate: "2017-09-15",
    dek: "A two-decade exploration of Saturn that revealed ocean worlds and landed a probe on Titan.",
    overview:
      "The NASA, ESA, and ASI Cassini-Huygens mission orbited Saturn for 13 years. Cassini surveyed the planet, rings, and moons while ESA’s Huygens probe descended through Titan’s atmosphere, producing an enduring record of one of the solar system’s most complex planetary systems.",
    objective:
      "Study Saturn’s atmosphere, rings, magnetosphere, and diverse moons, including Titan’s atmosphere and surface.",
    achievements: [
      "Revealed a global ocean and hydrothermal activity within Enceladus",
      "Delivered Huygens for the first landing in the outer solar system",
      "Documented liquid methane seas and weather on Titan",
    ],
    image: {
      src: "/assets/missions/cassini.jpg",
      alt: "Saturn and its rings assembled from Cassini spacecraft images",
      credit: "NASA / JPL / Space Science Institute",
      nasaId: "PIA06193",
      sourceUrl: "https://images.nasa.gov/details/PIA06193",
    },
    facts: [
      { label: "Partners", value: "NASA / ESA / ASI" },
      { label: "Launch vehicle", value: "Titan IVB-Centaur" },
      { label: "Saturn orbits", value: "294" },
      { label: "Mission duration", value: "19 years, 11 months" },
    ],
    timeline: [
      {
        date: "1997-10-15",
        title: "Launch",
        description: "Cassini-Huygens began its seven-year journey to Saturn.",
      },
      {
        date: "2004-07-01",
        title: "Saturn orbit insertion",
        description: "Cassini became the first spacecraft to orbit Saturn.",
      },
      {
        date: "2005-01-14",
        title: "Huygens lands on Titan",
        description:
          "ESA’s probe transmitted data through its atmospheric descent and from the surface.",
      },
      {
        date: "2005-07-14",
        title: "Active Enceladus",
        description:
          "A close flyby revealed a geologically active south polar region and icy plume material.",
      },
      {
        date: "2017-09-15",
        title: "Grand Finale",
        description:
          "Cassini entered Saturn’s atmosphere, protecting potentially habitable moons from contamination.",
      },
    ],
    relatedMedia: [
      {
        title: "Cassini image galleries",
        description:
          "Browse NASA’s visual record of Saturn, its rings, and moons.",
        kind: "image",
        url: "https://science.nasa.gov/mission/cassini/multimedia/images/",
      },
      {
        title: "Cassini mission timeline",
        description: "Re-fly the journey from launch through the Grand Finale.",
        kind: "timeline",
        url: "https://science.nasa.gov/mission/cassini/the-journey/timeline/",
      },
    ],
    sources: [
      {
        label: "NASA Cassini mission",
        url: "https://science.nasa.gov/mission/cassini/",
      },
      {
        label: "NASA Cassini mission overview",
        url: "https://science.nasa.gov/mission/cassini/about-the-mission/",
      },
      {
        label: "NASA Cassini quick facts",
        url: "https://science.nasa.gov/mission/cassini/quick-facts/",
      },
    ],
    verifiedAt: "2026-08-19",
  },
  {
    slug: "artemis-i",
    name: "Artemis I",
    program: "Artemis",
    missionNumber: "ARCHIVE // 010",
    status: "completed",
    statusLabel: "Flight test complete",
    vehicle: "spacecraft",
    destination: "Moon",
    launchDate: "2022-11-16",
    endDate: "2022-12-11",
    dek: "The first integrated flight test of SLS, Orion, and the ground systems built for lunar exploration.",
    overview:
      "Artemis I sent an uncrewed Orion spacecraft around the Moon to test NASA’s deep-space exploration systems together. The mission exercised launch, navigation, communications, distant retrograde orbit operations, high-speed lunar-return re-entry, and Pacific recovery.",
    objective:
      "Demonstrate Orion’s systems in deep space, test its heat shield at lunar-return speed, and recover the spacecraft safely.",
    achievements: [
      "Completed the first integrated SLS and Orion flight",
      "Traveled about 1.4 million miles during a 25-day lunar mission",
      "Returned at roughly Mach 32 and splashed down safely in the Pacific",
    ],
    image: {
      src: "/assets/missions/artemis-i.jpg",
      alt: "Orion spacecraft with the Moon during the Artemis I mission",
      credit: "NASA",
      nasaId: "art001e000669",
      sourceUrl: "https://images.nasa.gov/details/art001e000669",
    },
    facts: [
      { label: "Mission type", value: "Uncrewed lunar flight test" },
      { label: "Launch vehicle", value: "Space Launch System" },
      { label: "Duration", value: "25 days, 10 hours, 53 minutes" },
      { label: "Distance traveled", value: "About 1.4 million miles" },
    ],
    timeline: [
      {
        date: "2022-11-16",
        title: "Launch",
        description:
          "SLS launched Orion from Kennedy Space Center’s Launch Complex 39B.",
      },
      {
        date: "2022-11-21",
        title: "Outbound lunar flyby",
        description: "Orion passed about 81 miles above the lunar surface.",
      },
      {
        date: "2022-11-25",
        title: "Distant retrograde orbit",
        description:
          "Orion entered a stable orbit thousands of miles beyond the Moon.",
      },
      {
        date: "2022-12-05",
        title: "Return powered flyby",
        description:
          "A close lunar pass placed Orion on its homeward trajectory.",
      },
      {
        date: "2022-12-11",
        title: "Pacific splashdown",
        description:
          "Orion completed re-entry and was recovered west of Baja California.",
      },
    ],
    relatedMedia: [
      {
        title: "Best images from Artemis I",
        description: "See NASA’s selected views from Orion’s lunar journey.",
        kind: "image",
        url: "https://www.nasa.gov/missions/artemis/orion/view-the-best-images-from-nasas-artemis-i-mission/",
      },
      {
        title: "Artemis I day-by-day timeline",
        description: "Follow the complete 25-day flight test chronology.",
        kind: "timeline",
        url: "https://www.nasa.gov/reference/artemis-i-mission-timeline/",
      },
    ],
    sources: [
      {
        label: "NASA Artemis I mission",
        url: "https://www.nasa.gov/mission/artemis-i/",
      },
      {
        label: "NASA Artemis I timeline",
        url: "https://www.nasa.gov/reference/artemis-i-mission-timeline/",
      },
    ],
    verifiedAt: "2026-08-19",
  },
];

export const missionDestinations = [
  "Moon",
  "Mars",
  "Sun",
  "Outer Solar System",
  "Universe",
] as const satisfies readonly MissionDestination[];

export function getMissionReviewDueDate(mission: Mission): string {
  const reviewIntervalDays =
    mission.status === "completed"
      ? 365
      : mission.status === "extended"
        ? 60
        : 90;
  const due = new Date(`${mission.verifiedAt}T00:00:00Z`);
  due.setUTCDate(due.getUTCDate() + reviewIntervalDays);
  return due.toISOString().slice(0, 10);
}

export function getMission(slug: string | undefined): Mission | undefined {
  return missions.find((mission) => mission.slug === slug);
}
