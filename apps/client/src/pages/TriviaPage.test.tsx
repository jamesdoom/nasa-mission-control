import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TriviaPage } from "./TriviaPage";
import triviaContent from "../../public/content/trivia.json";
import { resetTriviaCache } from "../data/trivia";

describe("TriviaPage", () => {
  beforeEach(() => {
    localStorage.clear();
    resetTriviaCache();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(triviaContent), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
  });

  it("scores an answer and explains it with an official source", async () => {
    render(
      <MemoryRouter>
        <TriviaPage />
      </MemoryRouter>,
    );
    fireEvent.click(
      await screen.findByRole("button", { name: /Sea of Tranquility/ }),
    );
    expect(screen.getByText("Correct trajectory")).toBeVisible();
    expect(screen.getByText("1/32")).toBeVisible();
    expect(localStorage.getItem("mission-control:trivia-history:v1")).toContain(
      "apollo-destination",
    );
    expect(screen.getByText("Source reviewed 2026-08-25")).toBeVisible();
    expect(
      screen.getByRole("link", { name: /Verify with NASA Apollo 11/ }),
    ).toHaveAttribute("href", "https://www.nasa.gov/mission/apollo-11/");
  });

  it("filters questions by a URL-backed knowledge channel", async () => {
    render(
      <MemoryRouter>
        <TriviaPage />
      </MemoryRouter>,
    );

    await screen.findByRole("button", { name: /Sea of Tranquility/ });
    fireEvent.click(screen.getByRole("radio", { name: "Observatories" }));

    expect(screen.getByText(/Which region of light/)).toBeVisible();
    expect(screen.getByText("0/8")).toBeVisible();
  });

  it("reveals the correction after an incorrect answer", async () => {
    render(
      <MemoryRouter>
        <TriviaPage />
      </MemoryRouter>,
    );
    fireEvent.click(
      await screen.findByRole("button", { name: /Ocean of Storms/ }),
    );
    expect(screen.getByText("Course correction")).toBeVisible();
    expect(screen.getByText(/Armstrong and Aldrin landed/)).toBeVisible();
  });
});
