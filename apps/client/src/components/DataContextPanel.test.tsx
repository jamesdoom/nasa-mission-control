import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DataContextPanel } from "./DataContextPanel";

describe("DataContextPanel", () => {
  it.each([
    ["apod", "How to read an APOD record"],
    ["asteroids", "How to read an approach record"],
    ["donki", "How to read a DONKI event"],
    ["epic", "How to read an EPIC sequence"],
    ["media", "How to read a NASA Media record"],
  ] as const)("explains %s provenance and limits", (kind, title) => {
    render(<DataContextPanel kind={kind} />);
    expect(screen.getByText(title)).toBeVisible();
    expect(screen.getByText("Freshness")).toBeVisible();
    expect(screen.getByText("What is displayed")).toBeVisible();
    expect(screen.getByText("Evidence labels")).toBeVisible();
    expect(screen.getByText("What it cannot show")).toBeVisible();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      expect.stringMatching(/^https:\/\//),
    );
  });
});
