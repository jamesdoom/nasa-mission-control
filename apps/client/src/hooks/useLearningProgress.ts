import { useCallback, useState } from "react";
const storageKey = "mission-control:learning-progress:v1";
const maxTracks = 12;
export type TrackProgress = {
  completedSteps: string[];
  checkPassed: boolean;
  reflection: string;
  updatedAt: string;
};
type Store = { version: 1; tracks: Record<string, TrackProgress> };
const empty: Store = { version: 1, tracks: {} };
function text(value: unknown, limit: number) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}
function read(): Store {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(storageKey) ?? "null",
    );
    if (!value || typeof value !== "object" || Array.isArray(value))
      return empty;
    const record = value as Record<string, unknown>;
    if (
      record.version !== 1 ||
      !record.tracks ||
      typeof record.tracks !== "object" ||
      Array.isArray(record.tracks)
    )
      return empty;
    const tracks: Record<string, TrackProgress> = {};
    for (const [id, candidate] of Object.entries(record.tracks).slice(
      0,
      maxTracks,
    )) {
      if (
        !candidate ||
        typeof candidate !== "object" ||
        Array.isArray(candidate)
      )
        continue;
      const item = candidate as Record<string, unknown>;
      const completedSteps = Array.isArray(item.completedSteps)
        ? [
            ...new Set(
              item.completedSteps.map((v) => text(v, 40)).filter(Boolean),
            ),
          ].slice(0, 12)
        : [];
      if (
        typeof item.updatedAt !== "string" ||
        Number.isNaN(Date.parse(item.updatedAt))
      )
        continue;
      tracks[text(id, 60)] = {
        completedSteps,
        checkPassed: item.checkPassed === true,
        reflection: text(item.reflection, 1000),
        updatedAt: item.updatedAt,
      };
    }
    return { version: 1, tracks };
  } catch {
    return empty;
  }
}
function persist(store: Store) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(store));
  } catch {
    // Learning progress remains available for the current session.
  }
}
export function useLearningProgress() {
  const [store, setStore] = useState<Store>(read);
  const update = useCallback(
    (trackId: string, change: (current: TrackProgress) => TrackProgress) =>
      setStore((current) => {
        const next = {
          version: 1 as const,
          tracks: {
            ...current.tracks,
            [trackId]: change(
              current.tracks[trackId] ?? {
                completedSteps: [],
                checkPassed: false,
                reflection: "",
                updatedAt: new Date().toISOString(),
              },
            ),
          },
        };
        persist(next);
        return next;
      }),
    [],
  );
  return {
    tracks: store.tracks,
    toggleStep: (trackId: string, stepId: string) =>
      update(trackId, (current) => ({
        ...current,
        completedSteps: current.completedSteps.includes(stepId)
          ? current.completedSteps.filter((id) => id !== stepId)
          : [...current.completedSteps, stepId].slice(0, 12),
        updatedAt: new Date().toISOString(),
      })),
    passCheck: (trackId: string) =>
      update(trackId, (current) => ({
        ...current,
        checkPassed: true,
        updatedAt: new Date().toISOString(),
      })),
    saveReflection: (trackId: string, reflection: string) =>
      update(trackId, (current) => ({
        ...current,
        reflection: text(reflection, 1000),
        updatedAt: new Date().toISOString(),
      })),
    reset: () => {
      localStorage.removeItem(storageKey);
      setStore(empty);
    },
    exportJson: () =>
      JSON.stringify(
        {
          version: 1,
          exportedAt: new Date().toISOString(),
          tracks: store.tracks,
        },
        null,
        2,
      ),
  };
}
