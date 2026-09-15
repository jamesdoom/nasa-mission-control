import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Apod } from "@mission-control/shared";
import { ApodPanel } from "./ApodPanel";

const apod: Apod = {
  date: "2024-01-01",
  title: "A cosmic view",
  explanation: "Science context",
  mediaType: "video",
  mediaUrl: "https://youtube.com/embed/test",
  hdUrl: null,
  thumbnailUrl: "https://example.com/thumb.jpg",
  copyright: "An astronomer",
};

describe("ApodPanel", () => {
  it("renders video APOD, attribution, and an accessible favorite control", async () => {
    const onToggle = vi.fn();
    const { rerender } = render(
      <ApodPanel apod={apod} saved={false} onToggle={onToggle} />,
    );
    expect(screen.getByTitle("A cosmic view video")).toBeInTheDocument();
    expect(screen.getByText("Credit: An astronomer")).toBeInTheDocument();
    const button = screen.getByRole("button", { name: /save a cosmic view/i });
    expect(button).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(button);
    expect(onToggle).toHaveBeenCalledOnce();
    rerender(<ApodPanel apod={apod} saved={true} onToggle={onToggle} />);
    const remove = screen.getByRole("button", {
      name: "Remove A cosmic view from Flight Log",
    });
    expect(remove).toHaveAttribute("aria-pressed", "true");
    expect(remove).toHaveTextContent("Saved (Remove)");
    await userEvent.click(remove);
    expect(onToggle).toHaveBeenCalledTimes(2);
  });

  it("shows the entire explanation without an expand control", () => {
    const explanation = "A complete NASA story. ".repeat(80);
    render(
      <ApodPanel
        apod={{ ...apod, explanation }}
        saved={false}
        onToggle={vi.fn()}
      />,
    );
    expect(screen.getByText(/A complete NASA story/).textContent).toBe(
      explanation,
    );
    expect(
      screen.queryByRole("button", { name: /Continue reading|Show less/ }),
    ).not.toBeInTheDocument();
  });

  it("uses the native player for direct NASA video files", () => {
    render(
      <ApodPanel
        apod={{
          ...apod,
          mediaUrl:
            "https://apod.nasa.gov/apod/image/2608/perseids_eclipse_mystery.mp4",
          thumbnailUrl: null,
        }}
        saved={false}
        onToggle={vi.fn()}
      />,
    );
    const player = screen.getByLabelText("A cosmic view video");
    expect(player.tagName).toBe("VIDEO");
    expect(player).toHaveAttribute("controls");
    expect(
      screen.getByRole("link", { name: "Open video directly ↗" }),
    ).toHaveAttribute(
      "href",
      "https://apod.nasa.gov/apod/image/2608/perseids_eclipse_mystery.mp4",
    );
  });
});
