import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { MissionMapPage } from "./MissionMapPage";

function LocationState() {
  const location = useLocation();
  return <output aria-label="Location state">{location.search}</output>;
}

describe("MissionMapPage", () => {
  it("filters the structured map through shareable destination state", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/missions/map"]}>
        <Routes>
          <Route
            path="/missions/map"
            element={
              <>
                <MissionMapPage />
                <LocationState />
              </>
            }
          />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText("10 missions displayed")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", {
        name: "Outer Solar System: 3 archive missions",
      }),
    );
    expect(screen.getByLabelText("Location state")).toHaveTextContent(
      "?destination=Outer+Solar+System",
    );
    expect(screen.getByText("3 missions displayed")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Voyager 1" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Apollo 11" }),
    ).not.toBeInTheDocument();
  });
});
