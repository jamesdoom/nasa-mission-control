export type ScienceTerm = {
  term: string;
  definition: string;
};

export const scienceTerms = {
  habitability: {
    term: "Habitability",
    definition:
      "The capacity of an environment to support life; it is not evidence that life existed.",
  },
  heliopause: {
    term: "Heliopause",
    definition:
      "The boundary where the solar wind is held back by the surrounding interstellar medium.",
  },
  corona: {
    term: "Corona",
    definition: "The Sun’s hot, extended outer atmosphere.",
  },
  spectroscopy: {
    term: "Spectroscopy",
    definition:
      "The study of how matter emits, absorbs, or scatters different wavelengths of light.",
  },
  redshift: {
    term: "Redshift",
    definition:
      "A shift toward longer wavelengths, often used to study objects whose light has been stretched as the universe expands.",
  },
  magnetosphere: {
    term: "Magnetosphere",
    definition:
      "The region around a world where its magnetic field strongly influences charged particles.",
  },
} satisfies Record<string, ScienceTerm>;

type MissionEnrichment = {
  instruments: { name: string; purpose: string }[];
  results: string[];
  statusNote: string;
  terms: ScienceTerm[];
};

export const missionEnrichment: Record<string, MissionEnrichment> = {
  "apollo-11": {
    instruments: [
      {
        name: "Passive Seismic Experiment",
        purpose: "Measured lunar vibrations.",
      },
      {
        name: "Laser Ranging Retroreflector",
        purpose: "Enabled precise Earth–Moon distance measurements.",
      },
      {
        name: "Solar Wind Composition Experiment",
        purpose: "Collected particles from the solar wind.",
      },
    ],
    results: [
      "Returned lunar samples for continuing laboratory study.",
      "Demonstrated crewed landing, surface work, lunar ascent, and safe Earth return.",
    ],
    statusNote:
      "Flight complete; samples, experiment records, and mission data remain research resources.",
    terms: [],
  },
  "voyager-1": {
    instruments: [
      {
        name: "Magnetometer",
        purpose: "Measures magnetic-field strength and direction.",
      },
      {
        name: "Plasma Wave Subsystem",
        purpose: "Detects waves in surrounding ionized gas.",
      },
      {
        name: "Cosmic Ray Subsystem",
        purpose: "Characterized energetic particles before its 2025 shutdown.",
      },
    ],
    results: [
      "Revealed active and complex worlds at Jupiter and Saturn.",
      "Measured the transition from the Sun’s domain into interstellar space.",
    ],
    statusNote:
      "Extended interstellar mission; NASA reported two operating science instruments after an April 2026 power-saving shutdown.",
    terms: [scienceTerms.heliopause],
  },
  curiosity: {
    instruments: [
      {
        name: "SAM",
        purpose: "Analyzes gases and compounds in Martian samples.",
      },
      {
        name: "CheMin",
        purpose: "Identifies minerals in powdered rock and soil.",
      },
      { name: "ChemCam", purpose: "Studies rock chemistry from a distance." },
    ],
    results: [
      "Established that ancient Gale Crater contained a habitable lake environment.",
      "Built a long record of changing rocks, climate indicators, radiation, and atmosphere.",
    ],
    statusNote:
      "Active; NASA mission updates document continuing exploration of Mount Sharp in August 2026.",
    terms: [scienceTerms.habitability],
  },
  webb: {
    instruments: [
      { name: "NIRCam", purpose: "Images and measures near-infrared light." },
      {
        name: "NIRSpec",
        purpose: "Separates near-infrared light into spectra for many targets.",
      },
      {
        name: "MIRI",
        purpose: "Images and takes spectra at mid-infrared wavelengths.",
      },
    ],
    results: [
      "Studies early galaxies, star and planet formation, and exoplanet atmospheres.",
      "Extends observatory comparisons into wavelengths and sensitivities that complement Hubble.",
    ],
    statusNote: "Active science mission at the Sun–Earth L2 region.",
    terms: [scienceTerms.spectroscopy, scienceTerms.redshift],
  },
  perseverance: {
    instruments: [
      {
        name: "Mastcam-Z",
        purpose: "Creates zoomable color and stereo images.",
      },
      {
        name: "PIXL",
        purpose: "Maps fine-scale elemental chemistry in rocks.",
      },
      {
        name: "SHERLOC",
        purpose: "Searches for minerals and organic compounds at fine scales.",
      },
    ],
    results: [
      "Explores Jezero Crater’s water and geologic history while collecting sealed samples.",
      "Demonstrated oxygen production and supported the first powered flights on another world.",
    ],
    statusNote:
      "Active; NASA lists Perseverance as continuing science and sample collection in Jezero Crater.",
    terms: [scienceTerms.habitability],
  },
  "parker-solar-probe": {
    instruments: [
      {
        name: "FIELDS",
        purpose:
          "Measures electric and magnetic fields, waves, and turbulence.",
      },
      {
        name: "SWEAP",
        purpose: "Counts solar-wind particles and measures their properties.",
      },
      {
        name: "WISPR",
        purpose: "Images structures in the corona and inner heliosphere.",
      },
    ],
    results: [
      "Made the first direct spacecraft measurements from inside the solar corona.",
      "Links fields, particles, and images to the origins of the solar wind.",
    ],
    statusNote: "Active; NASA lists the primary mission as in progress.",
    terms: [scienceTerms.corona],
  },
  hubble: {
    instruments: [
      {
        name: "Wide Field Camera 3",
        purpose: "Images targets from ultraviolet through near-infrared light.",
      },
      {
        name: "Cosmic Origins Spectrograph",
        purpose: "Measures faint ultraviolet spectra.",
      },
      {
        name: "Space Telescope Imaging Spectrograph",
        purpose: "Combines imaging with detailed spectra.",
      },
    ],
    results: [
      "Helped establish a precise expansion rate and trace galaxy evolution.",
      "Built a multi-decade archive used for new observations and later reanalysis.",
    ],
    statusNote:
      "Active mission; NASA continues publishing observations and instrument information.",
    terms: [scienceTerms.spectroscopy],
  },
  juno: {
    instruments: [
      {
        name: "Microwave Radiometer",
        purpose: "Probes beneath Jupiter’s visible clouds.",
      },
      { name: "MAG", purpose: "Maps Jupiter’s magnetic field." },
      {
        name: "JIRAM",
        purpose: "Observes heat and composition in infrared light.",
      },
    ],
    results: [
      "Showed that atmospheric bands extend far below the cloud tops.",
      "Mapped polar cyclones, Jupiter’s unusual magnetic field, and close views of Galilean moons.",
    ],
    statusNote:
      "NASA’s page labels Juno active but also cites a September 2025 schedule; this archive does not infer an unannounced end state.",
    terms: [scienceTerms.magnetosphere],
  },
  cassini: {
    instruments: [
      {
        name: "Imaging Science Subsystem",
        purpose: "Recorded Saturn, its rings, and moons.",
      },
      { name: "RADAR", purpose: "Mapped Titan through its haze." },
      {
        name: "Ion and Neutral Mass Spectrometer",
        purpose: "Sampled gases and particles near Saturn and its moons.",
      },
    ],
    results: [
      "Revealed liquid hydrocarbon seas on Titan and a subsurface ocean at Enceladus.",
      "Returned 635 GB of science data across 294 Saturn orbits.",
    ],
    statusNote:
      "Spacecraft mission complete since 2017; archived observations continue supporting new research.",
    terms: [scienceTerms.magnetosphere],
  },
  "artemis-i": {
    instruments: [
      {
        name: "Orion navigation cameras",
        purpose: "Documented Earth and Moon geometry during the flight.",
      },
      {
        name: "Radiation sensors",
        purpose: "Measured the deep-space radiation environment inside Orion.",
      },
      {
        name: "CubeSat payloads",
        purpose: "Tested independent lunar and deep-space investigations.",
      },
    ],
    results: [
      "Validated the integrated Space Launch System, Orion, and ground systems on a lunar-distance mission.",
      "Returned heat-shield and flight data used to prepare later crewed Artemis missions.",
    ],
    statusNote:
      "Uncrewed flight complete; post-flight findings inform later Artemis missions.",
    terms: [],
  },
};

export function getMissionEnrichment(slug: string) {
  return missionEnrichment[slug];
}

export const storyEnrichment: Record<
  string,
  { captions: string[]; conclusion: string; terms: ScienceTerm[] }
> = {
  "mars-habitability": {
    captions: [
      "Curiosity tests the chemistry and mineral record of Gale Crater.",
      "Perseverance adds a different site and a sample-caching strategy.",
      "Mission images locate measurements but do not replace them.",
      "Communication delay explains why rover plans require autonomy.",
    ],
    conclusion:
      "Together, these records support a bounded conclusion: parts of ancient Mars had potentially habitable conditions. Whether life existed remains a separate, open question.",
    terms: [scienceTerms.habitability],
  },
  "sun-earth-connection": {
    captions: [
      "Parker measures the solar-wind source region directly.",
      "DONKI organizes event records without turning chronology into causation.",
      "EPIC supplies a latest-available Earth viewpoint, not continuous video.",
      "Each wavelength and instrument reveals a different part of an event.",
    ],
    conclusion:
      "A defensible Sun–Earth explanation links several labeled records while preserving their limits: direct observations, modeled analyses, and operational forecasts are related but not interchangeable.",
    terms: [scienceTerms.corona, scienceTerms.magnetosphere],
  },
  "cosmic-observatories": {
    captions: [
      "A curated daily image begins with interpretation and attribution.",
      "Hubble contributes decades of ultraviolet, visible, and near-infrared evidence.",
      "Webb extends the comparison deeper into infrared wavelengths.",
      "Scale calculations connect observatory design to the targets being studied.",
    ],
    conclusion:
      "No single observatory offers a complete view. Astronomers compare wavelengths, resolution, sensitivity, and archives to build explanations that one instrument alone could not support.",
    terms: [scienceTerms.spectroscopy, scienceTerms.redshift],
  },
};

export const learningEnrichment: Record<
  string,
  {
    secondReflection: string;
    completion: string;
    terms: ScienceTerm[];
    verifiedAt: string;
  }
> = {
  "mars-evidence": {
    secondReflection:
      "Which mission instrument or observation supplies the strongest support for your answer, and what can it not establish?",
    completion:
      "You compared two Mars missions, separated habitability from life detection, and practiced matching a claim to the evidence that supports it.",
    terms: [scienceTerms.habitability, scienceTerms.spectroscopy],
    verifiedAt: "2026-08-26",
  },
  "sun-earth": {
    secondReflection:
      "Choose one event field and state whether it is observed, modeled, calculated, or curated before interpreting it.",
    completion:
      "You traced a Sun–Earth evidence chain and practiced keeping direct measurements, model outputs, and forecasts in their correct roles.",
    terms: [scienceTerms.corona, scienceTerms.magnetosphere],
    verifiedAt: "2026-08-26",
  },
  "cosmic-observatories": {
    secondReflection:
      "Cite one Hubble or Webb example and explain why its wavelength range matters to the conclusion.",
    completion:
      "You compared complementary observatories and connected wavelength, instrument design, and source-backed interpretation.",
    terms: [scienceTerms.spectroscopy, scienceTerms.redshift],
    verifiedAt: "2026-08-26",
  },
};
