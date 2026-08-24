const maxBackupBytes = 1_000_000;

const storageKeys = [
  "mission-control:apod-favorites:v2",
  "mission-control:asteroid-favorites:v1",
  "mission-control:media-favorites:v1",
  "mission-control:mission-favorites:v1",
  "mission-control:journey-favorites:v1",
  "mission-control:recently-viewed:v1",
  "mission-control:trivia-best-streak:v1",
  "mission-control:flight-log-personalization:v1",
] as const;

type StorageKey = (typeof storageKeys)[number];

type FlightLogBackup = {
  version: 1;
  exportedAt: string;
  records: Partial<Record<StorageKey, unknown>>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseBackup(text: string): FlightLogBackup {
  if (new Blob([text]).size > maxBackupBytes)
    throw new Error("That backup is larger than the 1 MB safety limit.");
  let value: unknown;
  try {
    value = JSON.parse(text) as unknown;
  } catch {
    throw new Error("Choose a valid Mission Control JSON backup.");
  }
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    typeof value.exportedAt !== "string" ||
    Number.isNaN(Date.parse(value.exportedAt)) ||
    !isRecord(value.records)
  )
    throw new Error("This file is not a supported Mission Control backup.");
  return value as FlightLogBackup;
}

export type FlightLogBackupPreview = {
  exportedAt: string;
  supportedRecords: number;
  existingRecords: number;
};

export function previewFlightLogBackup(
  text: string,
  storage: Storage,
): FlightLogBackupPreview {
  const backup = parseBackup(text);
  const keys = storageKeys.filter((key) => key in backup.records);
  return {
    exportedAt: backup.exportedAt,
    supportedRecords: keys.length,
    existingRecords: keys.filter((key) => storage.getItem(key) !== null).length,
  };
}

function mergeValue(incoming: unknown, current: unknown): unknown {
  if (Array.isArray(incoming) && Array.isArray(current)) {
    const incomingItems: unknown[] = incoming;
    const currentItems: unknown[] = current;
    const seen = new Set<string>();
    return [...currentItems, ...incomingItems].filter((item) => {
      const key = JSON.stringify(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  if (isRecord(incoming) && isRecord(current)) {
    const merged: Record<string, unknown> = { ...incoming };
    for (const [key, value] of Object.entries(current))
      merged[key] = key in incoming ? mergeValue(incoming[key], value) : value;
    return merged;
  }
  return current;
}

export function createFlightLogBackup(storage: Storage): string {
  const records: FlightLogBackup["records"] = {};
  for (const key of storageKeys) {
    const raw = storage.getItem(key);
    if (raw === null) continue;
    try {
      records[key] = JSON.parse(raw) as unknown;
    } catch {
      // Invalid records are already ignored by their owning hook.
    }
  }
  return JSON.stringify(
    { version: 1, exportedAt: new Date().toISOString(), records },
    null,
    2,
  );
}

export function restoreFlightLogBackup(
  text: string,
  storage: Storage,
  strategy: "merge" | "replace" = "replace",
): number {
  const value = parseBackup(text);

  let restored = 0;
  for (const key of storageKeys) {
    if (!(key in value.records)) continue;
    let record = value.records[key];
    if (strategy === "merge") {
      const raw = storage.getItem(key);
      if (raw !== null) {
        try {
          record = mergeValue(record, JSON.parse(raw) as unknown);
        } catch {
          // A malformed local value yields to the validated backup container.
        }
      }
    }
    const serialized = JSON.stringify(record);
    if (serialized.length > maxBackupBytes)
      throw new Error("A backup record exceeds the safety limit.");
    storage.setItem(key, serialized);
    restored += 1;
  }
  return restored;
}
