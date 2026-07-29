import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UtcClock } from "./DashboardPage";

afterEach(() => vi.useRealTimers());

describe("UtcClock", () => {
  it("updates once per second and clears its timer when removed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-29T12:00:00Z"));
    const { unmount } = render(<UtcClock />);
    expect(screen.getByText("12:00:00 UTC")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1_000);
    });
    expect(screen.getByText("12:00:01 UTC")).toBeInTheDocument();
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
