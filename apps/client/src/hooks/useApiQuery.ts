import { useEffect, useReducer, useRef } from "react";

type QueryOptions<T> = {
  queryKey: readonly unknown[];
  queryFn: () => Promise<T>;
  enabled?: boolean;
  placeholderData?: boolean;
  retry?: number;
  staleTime?: number;
};

type Entry = {
  data: unknown;
  error: unknown;
  updatedAt: number;
  pending: boolean;
  promise: Promise<void> | null;
  listeners: Set<() => void>;
  accessedAt: number;
};

type QueryResult<T> =
  | {
      data: undefined;
      error: null;
      isPending: true;
      isError: false;
      isSuccess: false;
      isFetching: boolean;
      dataUpdatedAt: number;
      refetch: () => Promise<void>;
    }
  | {
      data: undefined;
      error: unknown;
      isPending: false;
      isError: true;
      isSuccess: false;
      isFetching: false;
      dataUpdatedAt: number;
      refetch: () => Promise<void>;
    }
  | {
      data: T;
      error: null;
      isPending: false;
      isError: false;
      isSuccess: true;
      isFetching: boolean;
      dataUpdatedAt: number;
      refetch: () => Promise<void>;
    };

const cache = new Map<string, Entry>();
const maximumEntries = 100;

function keyFor(parts: readonly unknown[]): string {
  return JSON.stringify(parts);
}

function entryFor(key: string): Entry {
  const current = cache.get(key);
  if (current) {
    current.accessedAt = Date.now();
    return current;
  }
  if (cache.size >= maximumEntries) {
    const ordered = [...cache].sort(
      ([, first], [, second]) => first.accessedAt - second.accessedAt,
    );
    for (const [oldestKey] of ordered) {
      cache.delete(oldestKey);
      break;
    }
  }
  const created: Entry = {
    data: undefined,
    error: null,
    updatedAt: 0,
    pending: false,
    promise: null,
    listeners: new Set(),
    accessedAt: Date.now(),
  };
  cache.set(key, created);
  return created;
}

function retryable(error: unknown): boolean {
  return !(
    error !== null &&
    typeof error === "object" &&
    "retryable" in error &&
    error.retryable === false
  );
}

function notify(entry: Entry): void {
  for (const listener of entry.listeners) listener();
}

async function execute<T>(
  entry: Entry,
  queryFn: () => Promise<T>,
  retries: number,
): Promise<void> {
  if (entry.promise) return entry.promise;
  entry.pending = true;
  entry.error = null;
  const request = (async () => {
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        entry.data = await queryFn();
        entry.updatedAt = Date.now();
        entry.error = null;
        return;
      } catch (error) {
        if (attempt >= retries || !retryable(error)) {
          entry.error = error;
          return;
        }
      }
    }
  })().finally(() => {
    entry.pending = false;
    entry.promise = null;
    notify(entry);
  });
  entry.promise = request;
  notify(entry);
  return request;
}

export function useApiQuery<T>({
  queryKey,
  queryFn,
  enabled = true,
  placeholderData = false,
  retry = 1,
  staleTime = 0,
}: QueryOptions<T>): QueryResult<T> {
  const key = keyFor(queryKey);
  const entry = entryFor(key);
  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;
  const requestedKey = useRef<string | null>(null);
  const storedData = entry.data as T | undefined;
  const previousData = useRef<T | undefined>(storedData);
  const [, render] = useReducer((value: number) => value + 1, 0);

  if (storedData !== undefined) previousData.current = storedData;
  useEffect(() => {
    const listener = () => render();
    entry.listeners.add(listener);
    return () => {
      entry.listeners.delete(listener);
    };
  }, [entry]);
  useEffect(() => {
    if (!enabled || requestedKey.current === key) return;
    requestedKey.current = key;
    const fresh = Date.now() - entry.updatedAt < staleTime;
    if (!fresh) void execute(entry, () => queryFnRef.current(), retry);
  }, [enabled, entry, key, retry, staleTime]);

  const data =
    storedData ?? (placeholderData ? previousData.current : undefined);
  const common = {
    dataUpdatedAt: entry.updatedAt,
    refetch: () => execute(entry, () => queryFnRef.current(), retry),
  };
  if (entry.error !== null)
    return {
      ...common,
      data: undefined,
      error: entry.error,
      isPending: false,
      isError: true,
      isSuccess: false,
      isFetching: false,
    };
  if (data !== undefined)
    return {
      ...common,
      data,
      error: null,
      isPending: false,
      isError: false,
      isSuccess: true,
      isFetching: entry.pending,
    };
  return {
    ...common,
    data: undefined,
    error: null,
    isPending: true,
    isError: false,
    isSuccess: false,
    isFetching: entry.pending,
  };
}

export function resetApiQueryCache(): void {
  cache.clear();
}
