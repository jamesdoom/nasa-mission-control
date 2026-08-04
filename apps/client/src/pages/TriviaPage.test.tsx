import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { TriviaPage } from "./TriviaPage";

describe("TriviaPage", () => {
  beforeEach(() => localStorage.clear());

  it("scores an answer and explains it with an official source", () => {
    render(
      <MemoryRouter>
        <TriviaPage />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: /Sea of Tranquility/ }));
    expect(screen.getByText("Correct trajectory")).toBeVisible();
    expect(screen.getByText("1/3")).toBeVisible();
    expect(
      screen.getByRole("link", { name: /Verify with NASA Apollo 11/ }),
    ).toHaveAttribute("href", "https://www.nasa.gov/mission/apollo-11/");
  });

  it("reveals the correction after an incorrect answer", () => {
    render(
      <MemoryRouter>
        <TriviaPage />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: /Ocean of Storms/ }));
    expect(screen.getByText("Course correction")).toBeVisible();
    expect(screen.getByText(/Armstrong and Aldrin landed/)).toBeVisible();
  });
});
