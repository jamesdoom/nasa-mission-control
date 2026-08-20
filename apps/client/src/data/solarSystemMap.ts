import { missions, type MissionDestination } from "./missions";

export type MapDestination = {
  id: MissionDestination;
  shortLabel: string;
  context: string;
  x: number;
  y: number;
  orbit: number;
  color: "cyan" | "amber" | "blue" | "violet" | "white";
};

export const mapDestinations: MapDestination[] = [
  {
    id: "Sun",
    shortLabel: "Sun",
    context: "Heliophysics and the solar atmosphere",
    x: 12,
    y: 54,
    orbit: 0,
    color: "amber",
  },
  {
    id: "Moon",
    shortLabel: "Moon",
    context: "Crewed exploration beyond Earth",
    x: 30,
    y: 35,
    orbit: 1,
    color: "white",
  },
  {
    id: "Mars",
    shortLabel: "Mars",
    context: "Robotic surface science",
    x: 46,
    y: 67,
    orbit: 2,
    color: "amber",
  },
  {
    id: "Outer Solar System",
    shortLabel: "Outer system",
    context: "Giant planets and interstellar space",
    x: 69,
    y: 31,
    orbit: 3,
    color: "blue",
  },
  {
    id: "Universe",
    shortLabel: "Observatories",
    context: "Earth orbit and Sun–Earth L2 observatories",
    x: 87,
    y: 63,
    orbit: 4,
    color: "violet",
  },
];

export type MissionMapGroup = MapDestination & {
  missions: typeof missions;
  milestoneCount: number;
  operatingCount: number;
};

export const missionMapGroups: MissionMapGroup[] = mapDestinations.map(
  (destination) => {
    const groupedMissions = missions.filter(
      (mission) => mission.destination === destination.id,
    );
    return {
      ...destination,
      missions: groupedMissions,
      milestoneCount: groupedMissions.reduce(
        (total, mission) => total + mission.timeline.length,
        0,
      ),
      operatingCount: groupedMissions.filter(
        (mission) => mission.status !== "completed",
      ).length,
    };
  },
);

export function getMissionMapGroup(
  destination: string | null,
): MissionMapGroup | undefined {
  return missionMapGroups.find((group) => group.id === destination);
}
