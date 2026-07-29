import { useCallback, useEffect, useState } from "react";
import type { Apod } from "@mission-control/shared";

const STORAGE_KEY = "mission-control:apod-favorites:v2";
const LEGACY_STORAGE_KEY = "mission-control:apod-favorites:v1";
const MAX_FAVORITES = 100;

type StoredFavorites = { version: 2; items: Apod[] };

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isApod(value: unknown): value is Apod {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(item.date) &&
    typeof item.title === "string" &&
    typeof item.explanation === "string" &&
    (item.mediaType === "image" || item.mediaType === "video") &&
    typeof item.mediaUrl === "string" &&
    isNullableString(item.hdUrl) &&
    isNullableString(item.thumbnailUrl) &&
    isNullableString(item.copyright)
  );
}

function validItems(value: unknown): Apod[] {
  return Array.isArray(value)
    ? value.filter(isApod).slice(0, MAX_FAVORITES)
    : [];
}

function readFavorites(): Apod[] {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) {
      const stored: unknown = JSON.parse(current);
      if (
        stored &&
        typeof stored === "object" &&
        (stored as Record<string, unknown>).version === 2
      ) {
        return validItems((stored as Record<string, unknown>).items);
      }
      return [];
    }
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    return legacy ? validItems(JSON.parse(legacy) as unknown) : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Apod[]>(readFavorites);
  useEffect(() => {
    try {
      const stored: StoredFavorites = { version: 2, items: favorites };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // Storage may be unavailable or full; the in-memory session remains usable.
    }
  }, [favorites]);
  const toggle = useCallback((item: Apod) => {
    setFavorites((current) =>
      current.some(({ date }) => date === item.date)
        ? current.filter(({ date }) => date !== item.date)
        : [item, ...current].slice(0, MAX_FAVORITES),
    );
  }, []);
  return {
    favorites,
    toggle,
    isFavorite: (date: string) => favorites.some((item) => item.date === date),
  };
}
