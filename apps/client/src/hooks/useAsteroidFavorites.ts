import { useCallback, useEffect, useState } from "react";
import type { Asteroid } from "@mission-control/shared";

const storageKey = "mission-control:asteroid-favorites:v1";
const maxFavorites = 100;

function isAsteroid(value: unknown): value is Asteroid {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  const diameter = item.diameterMeters as Record<string, unknown> | undefined;
  const approach = item.approach as Record<string, unknown> | undefined;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.jplUrl === "string" &&
    typeof item.potentiallyHazardous === "boolean" &&
    typeof item.sentryObject === "boolean" &&
    Boolean(diameter) &&
    typeof diameter?.min === "number" &&
    Number.isFinite(diameter.min) &&
    typeof diameter.max === "number" &&
    Number.isFinite(diameter.max) &&
    Boolean(approach) &&
    typeof approach?.date === "string" &&
    typeof approach.dateTimeUtc === "string" &&
    typeof approach.velocityKph === "number" &&
    Number.isFinite(approach.velocityKph) &&
    typeof approach.missDistanceKm === "number" &&
    Number.isFinite(approach.missDistanceKm) &&
    typeof approach.missDistanceLunar === "number" &&
    Number.isFinite(approach.missDistanceLunar)
  );
}

function readFavorites(): Asteroid[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    return Array.isArray(value)
      ? value.filter(isAsteroid).slice(0, maxFavorites)
      : [];
  } catch {
    return [];
  }
}

export function useAsteroidFavorites() {
  const [favorites, setFavorites] = useState<Asteroid[]>(readFavorites);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(favorites));
    } catch {
      // Storage may be unavailable; saved items still work for this session.
    }
  }, [favorites]);
  const toggle = useCallback((item: Asteroid) => {
    setFavorites((current) =>
      current.some(({ id }) => id === item.id)
        ? current.filter(({ id }) => id !== item.id)
        : [item, ...current].slice(0, maxFavorites),
    );
  }, []);
  return {
    favorites,
    toggle,
    isFavorite: (id: string) => favorites.some((item) => item.id === id),
  };
}
