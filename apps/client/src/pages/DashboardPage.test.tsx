import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DashboardPage, UtcClock } from "./DashboardPage";

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("DashboardPage status accessibility", () => {
  it("shows offline guidance instead of a loading promise when no record is loaded", async () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise<Response>(() => undefined)),
    );
    const { container } = render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );
    expect(screen.getByText(/No daily image is loaded/)).toBeVisible();
    expect(
      screen.queryByText("Loading the daily image"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Offline", { exact: true })).toBeVisible();
    expect(
      (
        await axe(container, {
          rules: { "color-contrast": { enabled: false } },
        })
      ).violations,
    ).toEqual([]);
  });

  it("announces stale APOD and failed asteroids without claiming NASA health", async () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) =>
        Promise.resolve(
          url === "/api/apod"
            ? new Response(
                JSON.stringify({
                  date: "2024-01-01",
                  title: "Older image",
                  explanation: "Recorded image",
                  mediaType: "image",
                  mediaUrl: "/test.jpg",
                  hdUrl: null,
                  thumbnailUrl: null,
                  copyright: null,
                }),
                { headers: { "x-data-status": "stale-fallback" } },
              )
            : new Response(
                JSON.stringify({
                  error: { message: "Scan unavailable", retryable: false },
                }),
                { status: 503 },
              ),
        ),
      ),
    );
    const { container } = render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );
    await screen.findByRole("heading", { name: "Older image" });
    expect(
      screen.getByText("Partially available", { exact: true }),
    ).toBeVisible();
    expect(screen.getByText("Asteroid Watch: Unavailable")).toBeVisible();
    expect(screen.queryByText("NASA // ACTIVE")).not.toBeInTheDocument();
    expect(
      (
        await axe(container, {
          rules: { "color-contrast": { enabled: false } },
        })
      ).violations,
    ).toEqual([]);
  });
});

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
