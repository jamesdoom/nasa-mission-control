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
});
