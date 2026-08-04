import { useCallback, useEffect, useState } from "react";
import type { MediaItem } from "@mission-control/shared";

const storageKey = "mission-control:media-favorites:v1";
const maxFavorites = 100;

function nullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isMediaItem(value: unknown): value is MediaItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.nasaId === "string" &&
    typeof item.title === "string" &&
    typeof item.description === "string" &&
    (item.mediaType === "image" ||
      item.mediaType === "video" ||
      item.mediaType === "audio") &&
    typeof item.dateCreated === "string" &&
    nullableString(item.center) &&
    nullableString(item.photographer) &&
    Array.isArray(item.keywords) &&
    item.keywords.every((keyword) => typeof keyword === "string") &&
    nullableString(item.previewUrl)
  );
}

function readFavorites(): MediaItem[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    return Array.isArray(value)
      ? value.filter(isMediaItem).slice(0, maxFavorites)
      : [];
  } catch {
    return [];
  }
}

export function useMediaFavorites() {
  const [favorites, setFavorites] = useState<MediaItem[]>(readFavorites);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(favorites));
    } catch {
      // Storage may be unavailable; saved items still work for this session.
    }
  }, [favorites]);
  const toggle = useCallback((item: MediaItem) => {
    setFavorites((current) =>
      current.some(({ nasaId }) => nasaId === item.nasaId)
        ? current.filter(({ nasaId }) => nasaId !== item.nasaId)
        : [item, ...current].slice(0, maxFavorites),
    );
  }, []);
  return {
    favorites,
    toggle,
    isFavorite: (nasaId: string) =>
      favorites.some((item) => item.nasaId === nasaId),
  };
}
