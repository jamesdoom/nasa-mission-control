export type AsteroidApproach = {
  date: string;
  dateTimeUtc: string;
  velocityKph: number;
  missDistanceKm: number;
  missDistanceLunar: number;
};

export type Asteroid = {
  id: string;
  name: string;
  jplUrl: string;
  potentiallyHazardous: boolean;
  sentryObject: boolean;
  diameterMeters: { min: number; max: number };
  approach: AsteroidApproach;
};

export type AsteroidFeed = {
  startDate: string;
  endDate: string;
  totalCount: number;
  potentiallyHazardousCount: number;
  closestApproachKm: number | null;
  asteroids: Asteroid[];
};
