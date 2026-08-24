import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { LearningCenterPage } from "./LearningCenterPage";

describe("LearningCenterPage", () => {
  afterEach(() => localStorage.clear());
  it("tracks a source-backed session entirely in this browser", async () => {
    render(
      <MemoryRouter initialEntries={["/learn?track=mars-evidence"]}>
        <LearningCenterPage />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: "How scientists read ancient Mars" }),
    ).toBeVisible();
    const firstStep = screen.getAllByRole("checkbox", {
      name: "Mark step complete",
    })[0];
    if (!firstStep) throw new Error("Expected a learning step checkbox.");
    await userEvent.click(firstStep);
    await userEvent.click(
      screen.getByRole("radio", {
        name: "The environment may once have been habitable",
      }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByText("Correct.")).toBeVisible();
    await userEvent.type(
      screen.getByLabelText("Your response"),
      "A rock record can support habitability.",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Save reflection locally" }),
    );
    expect(
      JSON.parse(
        localStorage.getItem("mission-control:learning-progress:v1") ?? "null",
      ),
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "NASA Curiosity" }),
    ).toHaveAttribute(
      "href",
      "https://science.nasa.gov/mission/msl-curiosity/",
    );
  });
});
