import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { MemoryRouter } from "react-router-dom";
import { AboutPage } from "./AboutPage";

describe("AboutPage", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("presents project evidence and a refreshable API status", async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            status: "ok",
            service: "mission-control-api",
            checkedAt: "2026-08-19T14:00:00.000Z",
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { container } = render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );
    expect(
      await screen.findByRole("heading", {
        name: "Mission Control API online",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "A deliberate boundary at every trust change",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Follow the evidence through Mission Control",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open Mission Archive →" }),
    ).toHaveAttribute("href", "/missions");
    expect(
      screen.getByRole("heading", {
        name: "From unstable public data to a dependable learning experience",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Share product feedback ↗" }),
    ).toHaveAttribute("href", expect.stringContaining("template=feedback.yml"));
    expect(
      screen.getByRole("link", {
        name: "Report an accessibility barrier ↗",
      }),
    ).toHaveAttribute(
      "href",
      expect.stringContaining("template=accessibility.yml"),
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
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
