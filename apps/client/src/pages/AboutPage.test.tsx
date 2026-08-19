import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { AboutPage } from "./AboutPage";

describe("AboutPage", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("presents project evidence and a refreshable API status", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "ok",
          service: "mission-control-api",
          checkedAt: "2026-08-19T14:00:00.000Z",
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <AboutPage />
      </QueryClientProvider>,
    );
    expect(
      await screen.findByRole("heading", {
        name: "Mission Control API online",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "From unstable public data to a dependable learning experience",
      }),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Run status check" }),
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const results = await axe(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
