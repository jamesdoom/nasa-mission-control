import { useCallback, useState } from "react";

const storageKey = "mission-control:recently-viewed:v1";
const maxItems = 20;

export type RecentItem = {
  kind: "apod" | "asteroid" | "media" | "mission";
  id: string;
  title: string;
  path: string;
  viewedAt: string;
};

function isRecentItem(value: unknown): value is RecentItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    ["apod", "asteroid", "media", "mission"].includes(String(item.kind)) &&
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.path === "string" &&
    item.path.startsWith("/") &&
    typeof item.viewedAt === "string" &&
    !Number.isNaN(Date.parse(item.viewedAt))
  );
}

function readItems(): RecentItem[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    return Array.isArray(value)
      ? value.filter(isRecentItem).slice(0, maxItems)
      : [];
  } catch {
    return [];
  }
}

function writeItems(items: RecentItem[]): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(items));
  } catch {
    // Browsing remains usable when storage is unavailable.
  }
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentItem[]>(readItems);
  const record = useCallback((item: Omit<RecentItem, "viewedAt">) => {
    setItems((current) => {
      const next = [
        { ...item, viewedAt: new Date().toISOString() },
        ...current.filter(
          (candidate) =>
            candidate.kind !== item.kind || candidate.id !== item.id,
        ),
      ].slice(0, maxItems);
      writeItems(next);
      return next;
    });
  }, []);
  const clear = useCallback(() => {
    setItems([]);
    writeItems([]);
  }, []);
  return { items, record, clear };
}
