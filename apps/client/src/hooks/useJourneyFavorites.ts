import { useCallback, useEffect, useState } from "react";
import { discoveryJourneys, type DiscoveryJourney } from "../data/journeys";

const storageKey = "mission-control:journey-favorites:v1";

function getJourney(id: string): DiscoveryJourney | undefined {
  return discoveryJourneys.find((journey) => journey.id === id);
}

function readFavorites(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value
      .filter(
        (id): id is string => typeof id === "string" && Boolean(getJourney(id)),
      )
      .slice(0, discoveryJourneys.length);
  } catch {
    return [];
  }
}

export function useJourneyFavorites() {
  const [ids, setIds] = useState<string[]>(readFavorites);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(ids));
    } catch {
      // Storage may be unavailable; saved paths still work for this session.
    }
  }, [ids]);
  const toggle = useCallback((journey: DiscoveryJourney) => {
    setIds((current) =>
      current.includes(journey.id)
        ? current.filter((id) => id !== journey.id)
        : [journey.id, ...current].slice(0, discoveryJourneys.length),
    );
  }, []);
  return {
    favorites: ids
      .map(getJourney)
      .filter((journey): journey is DiscoveryJourney => Boolean(journey)),
    toggle,
    isFavorite: (id: string) => ids.includes(id),
  };
}
