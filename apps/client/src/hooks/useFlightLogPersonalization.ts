import { useCallback, useState } from "react";

const storageKey = "mission-control:flight-log-personalization:v1";
const maxAnnotations = 100;
const maxSavedViews = 12;
const maxBookmarks = 12;

export type RecordAnnotation = {
  note: string;
  tags: string[];
  collection: string;
  updatedAt: string;
};

export type SavedFlightLogView = {
  id: string;
  name: string;
  query: string;
  createdAt: string;
};

export type ComparisonBookmark = {
  id: string;
  name: string;
  path: string;
  createdAt: string;
};

type PersonalizationStore = {
  version: 1;
  annotations: Record<string, RecordAnnotation>;
  savedViews: SavedFlightLogView[];
  comparisonBookmarks: ComparisonBookmark[];
};

const emptyStore: PersonalizationStore = {
  version: 1,
  annotations: {},
  savedViews: [],
  comparisonBookmarks: [],
};

function boundedText(value: unknown, limit: number): string {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

function isDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function readStore(): PersonalizationStore {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(storageKey) ?? "null",
    );
    if (!value || typeof value !== "object" || Array.isArray(value))
      return emptyStore;
    const record = value as Record<string, unknown>;
    if (record.version !== 1) return emptyStore;
    const annotations: Record<string, RecordAnnotation> = {};
    if (
      record.annotations &&
      typeof record.annotations === "object" &&
      !Array.isArray(record.annotations)
    ) {
      for (const [key, candidate] of Object.entries(record.annotations).slice(
        0,
        maxAnnotations,
      )) {
        if (
          !candidate ||
          typeof candidate !== "object" ||
          Array.isArray(candidate)
        )
          continue;
        const item = candidate as Record<string, unknown>;
        const note = boundedText(item.note, 500);
        const collection = boundedText(item.collection, 40);
        const tags = Array.isArray(item.tags)
          ? [
              ...new Set(
                item.tags.map((tag) => boundedText(tag, 24)).filter(Boolean),
              ),
            ].slice(0, 5)
          : [];
        if (
          !isDate(item.updatedAt) ||
          (!note && !collection && tags.length === 0)
        )
          continue;
        annotations[key.slice(0, 120)] = {
          note,
          collection,
          tags,
          updatedAt: item.updatedAt,
        };
      }
    }
    const savedViews = Array.isArray(record.savedViews)
      ? record.savedViews
          .flatMap((candidate): SavedFlightLogView[] => {
            if (!candidate || typeof candidate !== "object") return [];
            const item = candidate as Record<string, unknown>;
            const name = boundedText(item.name, 40);
            const query = boundedText(item.query, 300);
            return typeof item.id === "string" && name && isDate(item.createdAt)
              ? [
                  {
                    id: item.id.slice(0, 80),
                    name,
                    query,
                    createdAt: item.createdAt,
                  },
                ]
              : [];
          })
          .slice(0, maxSavedViews)
      : [];
    const comparisonBookmarks = Array.isArray(record.comparisonBookmarks)
      ? record.comparisonBookmarks
          .flatMap((candidate): ComparisonBookmark[] => {
            if (!candidate || typeof candidate !== "object") return [];
            const item = candidate as Record<string, unknown>;
            const name = boundedText(item.name, 60);
            const path = boundedText(item.path, 300);
            return typeof item.id === "string" &&
              name &&
              path.startsWith("/missions/compare?") &&
              isDate(item.createdAt)
              ? [
                  {
                    id: item.id.slice(0, 80),
                    name,
                    path,
                    createdAt: item.createdAt,
                  },
                ]
              : [];
          })
          .slice(0, maxBookmarks)
      : [];
    return { version: 1, annotations, savedViews, comparisonBookmarks };
  } catch {
    return emptyStore;
  }
}

function persist(store: PersonalizationStore): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(store));
  } catch {
    // Personalization remains available for the current session.
  }
}

function id(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function annotationKey(kind: string, recordId: string): string {
  return `${kind}:${recordId}`.slice(0, 120);
}

export function useFlightLogPersonalization() {
  const [store, setStore] = useState<PersonalizationStore>(readStore);

  const saveAnnotation = useCallback(
    (
      key: string,
      values: Pick<RecordAnnotation, "note" | "tags" | "collection">,
    ) => {
      setStore((current) => {
        const note = boundedText(values.note, 500);
        const collection = boundedText(values.collection, 40);
        const tags = [
          ...new Set(
            values.tags.map((tag) => boundedText(tag, 24)).filter(Boolean),
          ),
        ].slice(0, 5);
        const annotations =
          !note && !collection && tags.length === 0
            ? Object.fromEntries(
                Object.entries(current.annotations).filter(
                  ([itemKey]) => itemKey !== key,
                ),
              )
            : {
                ...current.annotations,
                [key]: {
                  note,
                  collection,
                  tags,
                  updatedAt: new Date().toISOString(),
                },
              };
        const next = { ...current, annotations };
        persist(next);
        return next;
      });
    },
    [],
  );

  const saveView = useCallback((name: string, query: string) => {
    const cleanName = boundedText(name, 40);
    if (!cleanName) return;
    setStore((current) => {
      const next = {
        ...current,
        savedViews: [
          {
            id: id("view"),
            name: cleanName,
            query: boundedText(query, 300),
            createdAt: new Date().toISOString(),
          },
          ...current.savedViews,
        ].slice(0, maxSavedViews),
      };
      persist(next);
      return next;
    });
  }, []);

  const saveComparison = useCallback((name: string, path: string) => {
    const cleanName = boundedText(name, 60);
    if (!cleanName || !path.startsWith("/missions/compare?")) return;
    setStore((current) => {
      const withoutPath = current.comparisonBookmarks.filter(
        (item) => item.path !== path,
      );
      const next = {
        ...current,
        comparisonBookmarks: [
          {
            id: id("comparison"),
            name: cleanName,
            path: path.slice(0, 300),
            createdAt: new Date().toISOString(),
          },
          ...withoutPath,
        ].slice(0, maxBookmarks),
      };
      persist(next);
      return next;
    });
  }, []);

  const removeView = useCallback((viewId: string) => {
    setStore((current) => {
      const next = {
        ...current,
        savedViews: current.savedViews.filter((view) => view.id !== viewId),
      };
      persist(next);
      return next;
    });
  }, []);
  const removeComparison = useCallback((bookmarkId: string) => {
    setStore((current) => {
      const next = {
        ...current,
        comparisonBookmarks: current.comparisonBookmarks.filter(
          (item) => item.id !== bookmarkId,
        ),
      };
      persist(next);
      return next;
    });
  }, []);

  return {
    ...store,
    saveAnnotation,
    saveView,
    removeView,
    saveComparison,
    removeComparison,
  };
}
