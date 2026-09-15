import { useEffect, useReducer, useRef } from "react";

type QueryOptions<T> = {
  queryKey: readonly unknown[];
  queryFn: (signal: AbortSignal) => Promise<T>;
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
  controller: AbortController | null;
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
    controller: null,
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
  queryFn: (signal: AbortSignal) => Promise<T>,
  retries: number,
): Promise<void> {
  if (entry.promise) {
    if (entry.controller?.signal.aborted)
      return entry.promise.then(() => {
        if (entry.listeners.size) return execute(entry, queryFn, retries);
      });
    return entry.promise;
  }
  const controller = new AbortController();
  entry.controller = controller;
  const isAborted = () => controller.signal.aborted;
  entry.pending = true;
  entry.error = null;
  const request = (async () => {
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      if (isAborted()) return;
      try {
        const data = await queryFn(controller.signal);
        if (isAborted()) return;
        entry.data = data;
        entry.updatedAt = Date.now();
        entry.error = null;
        return;
      } catch (error) {
        if (isAborted()) return;
        if (attempt >= retries || !retryable(error)) {
          entry.error = error;
          return;
        }
        await new Promise((resolve) =>
          setTimeout(resolve, Math.min(1000 * 2 ** attempt, 8000)),
        );
      }
    }
  })().finally(() => {
    entry.pending = false;
    entry.promise = null;
    entry.controller = null;
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
      queueMicrotask(() => {
        if (entry.listeners.size === 0) entry.controller?.abort();
      });
    };
  }, [entry]);
  useEffect(() => {
    if (!enabled || requestedKey.current === key) return;
    requestedKey.current = key;
    const fresh =
      entry.data !== undefined &&
      entry.error === null &&
      Date.now() - entry.updatedAt < staleTime;
    if (!fresh)
      void execute(entry, (signal) => queryFnRef.current(signal), retry);
  }, [enabled, entry, key, retry, staleTime]);

  const data =
    storedData ?? (placeholderData ? previousData.current : undefined);
  const common = {
    dataUpdatedAt: entry.updatedAt,
    refetch: () =>
      execute(entry, (signal) => queryFnRef.current(signal), retry),
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
