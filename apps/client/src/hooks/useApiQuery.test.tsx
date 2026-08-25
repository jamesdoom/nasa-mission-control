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
