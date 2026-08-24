import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { InvestigationPage } from "./InvestigationPage";

function Location() {
  return <output aria-label="Location">{useLocation().search}</output>;
}

describe("InvestigationPage", () => {
  it("keeps selections in the URL and explains related records", async () => {
    render(
      <MemoryRouter initialEntries={["/investigate?records=mission-artemis-i"]}>
        <Routes>
          <Route
            path="/investigate"
            element={
              <>
                <InvestigationPage />
                <Location />
              </>
            }
          />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: "Artemis I" })).toBeVisible();
    expect(
      screen.getByText(
        "Recommendations use only shared destination, evidence, and topic labels—never behavior tracking.",
      ),
    ).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Remove" }));
    expect(screen.getByLabelText("Location")).not.toHaveTextContent("records=");
    expect(
      screen.getByRole("heading", { name: "No records selected" }),
    ).toBeVisible();
  });
});
