import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useApiQuery } from "./useApiQuery";

describe("useApiQuery", () => {
  it("deduplicates cached data and supports an explicit refresh", async () => {
    const queryFn = vi.fn().mockResolvedValue({ status: "ok" });
    const options = {
      queryKey: ["test", "status"],
      queryFn,
      staleTime: 60_000,
    } as const;
    const first = renderHook(() => useApiQuery(options));
    await waitFor(() => expect(first.result.current.isSuccess).toBe(true));
    expect(queryFn).toHaveBeenCalledTimes(1);
    first.unmount();

    const second = renderHook(() => useApiQuery(options));
    expect(second.result.current.data).toEqual({ status: "ok" });
    expect(queryFn).toHaveBeenCalledTimes(1);
    await act(() => second.result.current.refetch());
    expect(queryFn).toHaveBeenCalledTimes(2);
  });
});

it("keeps a shared request alive until its last consumer leaves", async () => {
  let signal: AbortSignal | undefined;
  const queryFn = vi.fn((requestSignal: AbortSignal) => {
    signal = requestSignal;
    return new Promise<string>((_resolve, reject) => {
      requestSignal.addEventListener("abort", () =>
        reject(new DOMException("Aborted", "AbortError")),
      );
    });
  });
  const options = { queryKey: ["shared-cancellation"], queryFn };
  const first = renderHook(() => useApiQuery(options));
  const second = renderHook(() => useApiQuery(options));
  expect(queryFn).toHaveBeenCalledOnce();
  first.unmount();
  await act(async () => {
    await Promise.resolve();
  });
  expect(signal?.aborted).toBe(false);
  second.unmount();
  await act(async () => {
    await Promise.resolve();
  });
  expect(signal?.aborted).toBe(true);
  expect(queryFn).toHaveBeenCalledOnce();
});

it("revalidates expired cache entries", async () => {
  const queryFn = vi.fn().mockResolvedValue("cached");
  const now = vi.spyOn(Date, "now").mockReturnValue(100_000);
  const options = { queryKey: ["expiry"], queryFn, staleTime: 300_000 };
  try {
    const first = renderHook(() => useApiQuery(options));
    await waitFor(() => expect(first.result.current.isSuccess).toBe(true));
    first.unmount();
    now.mockReturnValue(400_001);
    const second = renderHook(() => useApiQuery(options));
    await waitFor(() => expect(queryFn).toHaveBeenCalledTimes(2));
    second.unmount();
  } finally {
    now.mockRestore();
  }
});

it("waits before retrying a failed request", async () => {
  vi.useFakeTimers();
  const queryFn = vi
    .fn()
    .mockRejectedValueOnce(new Error("temporary"))
    .mockResolvedValue("ok");
  const hook = renderHook(() =>
    useApiQuery({ queryKey: ["backoff"], queryFn }),
  );
  try {
    await act(async () => {
      await Promise.resolve();
    });
    expect(queryFn).toHaveBeenCalledOnce();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(999);
    });
    expect(queryFn).toHaveBeenCalledOnce();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(queryFn).toHaveBeenCalledTimes(2);
    expect(hook.result.current.data).toBe("ok");
  } finally {
    hook.unmount();
    vi.useRealTimers();
  }
});
