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
    render(<ApodPanel apod={apod} saved={false} onToggle={onToggle} />);
    expect(screen.getByTitle("A cosmic view video")).toBeInTheDocument();
    expect(screen.getByText("Credit: An astronomer")).toBeInTheDocument();
    const button = screen.getByRole("button", { name: /save a cosmic view/i });
    expect(button).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(button);
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("lets readers reveal and collapse the full NASA explanation", async () => {
    const user = userEvent.setup();
    render(<ApodPanel apod={apod} saved={false} onToggle={vi.fn()} />);

    const explanation = screen.getByText("Science context");
    const toggle = screen.getByRole("button", { name: "Continue reading" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(explanation).not.toHaveClass("explanation--expanded");

    await user.click(toggle);
    expect(screen.getByRole("button", { name: "Show less" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(explanation).toHaveClass("explanation--expanded");

    await user.click(screen.getByRole("button", { name: "Show less" }));
    expect(explanation).not.toHaveClass("explanation--expanded");
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
