export type SpaceWeatherCategory = "flare" | "cme" | "storm";

export type SpaceWeatherMeasurement = {
  label: string;
  value: string;
  explanation: string;
};

export type SpaceWeatherEvent = {
  id: string;
  category: SpaceWeatherCategory;
  title: string;
  startTimeUtc: string;
  endTimeUtc: string | null;
  location: string | null;
  activeRegion: number | null;
  instruments: string[];
  summary: string;
  measurements: SpaceWeatherMeasurement[];
  linkedEventIds: string[];
  sourceUrl: string;
};

export type SpaceWeatherFeed = {
  startDate: string;
  endDate: string;
  category: SpaceWeatherCategory | "all";
  counts: Record<SpaceWeatherCategory, number>;
  events: SpaceWeatherEvent[];
};
