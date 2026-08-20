import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { CommandPalette } from "./CommandPalette";

function CurrentLocation() {
  const location = useLocation();
  return (
    <output aria-label="Current location">
      {location.pathname}
      {location.search}
    </output>
  );
}

describe("CommandPalette", () => {
  it("filters missions and opens the active command from the keyboard", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <Routes>
          <Route
            path="*"
            element={
              <>
                <CommandPalette onClose={onClose} />
                <CurrentLocation />
              </>
            }
          />
        </Routes>
      </MemoryRouter>,
    );
    const search = screen.getByRole("combobox");
    await user.type(search, "Perseverance");
    expect(
      screen.getByRole("option", { name: /Perseverance/ }),
    ).toBeInTheDocument();
    await user.keyboard("{Enter}");
    expect(screen.getByLabelText("Current location")).toHaveTextContent(
      "/missions/perseverance",
    );
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("reports empty results and closes with Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <CommandPalette onClose={onClose} />
      </MemoryRouter>,
    );
    await user.type(screen.getByRole("combobox"), "not-a-space-command");
    expect(
      screen.getByText("No matching mission command."),
    ).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("hands a query off to the full discovery index", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <Routes>
          <Route
            path="*"
            element={
              <>
                <CommandPalette onClose={onClose} />
                <CurrentLocation />
              </>
            }
          />
        </Routes>
      </MemoryRouter>,
    );
    await user.type(screen.getByRole("combobox"), "Artemis");
    await user.click(
      screen.getByRole("button", {
        name: "Search NASA media and Flight Log →",
      }),
    );
    expect(screen.getByLabelText("Current location")).toHaveTextContent(
      "/search?q=Artemis",
    );
    expect(onClose).toHaveBeenCalledOnce();
  });
});
