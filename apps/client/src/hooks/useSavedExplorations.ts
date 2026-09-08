import { useEffect, useState } from "react";
import * as z from "zod/v4-mini";
import { safeExplorationPath } from "../utils/explorationContext";

const key = "mission-control:saved-explorations:v1";
const eventName = "mission-control:explorations-changed";
const schema = z.object({
  path: z.string(),
  title: z.string(),
  savedAt: z.string(),
});
export type SavedExploration = z.infer<typeof schema>;
let sessionItems: SavedExploration[] | undefined;

function read(): SavedExploration[] {
  if (sessionItems) return sessionItems;
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value
      .flatMap((item: unknown) => {
        const result = schema.safeParse(item);
        if (
          !result.success ||
          !safeExplorationPath(result.data.path) ||
          !result.data.title.trim() ||
          Number.isNaN(Date.parse(result.data.savedAt))
        )
          return [];
        return [{ ...result.data, title: result.data.title.slice(0, 120) }];
      })
      .filter(
        (item, index, items) =>
          items.findIndex((candidate) => candidate.path === item.path) ===
          index,
      )
      .slice(0, 20);
  } catch {
    return [];
  }
}

export function useSavedExplorations() {
  const [items, setItems] = useState(read);
  useEffect(() => {
    const sync = () => setItems(read());
    window.addEventListener(eventName, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(eventName, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  function write(next: SavedExploration[]) {
    let persisted = true;
    try {
      localStorage.setItem(key, JSON.stringify(next));
      sessionItems = undefined;
    } catch {
      sessionItems = next;
      persisted = false;
    }
    window.dispatchEvent(new Event(eventName));
    setItems(next);
    return persisted;
  }
  return {
    items,
    save: (path: string, title: string) => {
      if (!safeExplorationPath(path)) return false;
      return write(
        [
          {
            path,
            title: title.slice(0, 120),
            savedAt: new Date().toISOString(),
          },
          ...read().filter((item) => item.path !== path),
        ].slice(0, 20),
      );
    },
    remove: (path: string) =>
      write(read().filter((item) => item.path !== path)),
  };
}
