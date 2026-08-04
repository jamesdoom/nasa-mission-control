import { useCallback, useEffect, useState } from "react";
import { getMission, missions, type Mission } from "../data/missions";

const storageKey = "mission-control:mission-favorites:v1";
const maxFavorites = missions.length;

function readFavorites(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value
      .filter(
        (slug): slug is string =>
          typeof slug === "string" && Boolean(getMission(slug)),
      )
      .slice(0, maxFavorites);
  } catch {
    return [];
  }
}

export function useMissionFavorites() {
  const [slugs, setSlugs] = useState<string[]>(readFavorites);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(slugs));
    } catch {
      // Storage may be unavailable; saved items still work for this session.
    }
  }, [slugs]);
  const toggle = useCallback((mission: Mission) => {
    setSlugs((current) =>
      current.includes(mission.slug)
        ? current.filter((slug) => slug !== mission.slug)
        : [mission.slug, ...current].slice(0, maxFavorites),
    );
  }, []);
  return {
    favorites: slugs
      .map(getMission)
      .filter((mission): mission is Mission => Boolean(mission)),
    toggle,
    isFavorite: (slug: string) => slugs.includes(slug),
  };
}
