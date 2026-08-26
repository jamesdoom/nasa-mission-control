import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { readResponseJson } from "../api/responseStatus";
import { DataStatus } from "./DataStatus";

describe("DataStatus", () => {
  it("announces an explicitly stale server fallback", async () => {
    const data = await readResponseJson<{ id: string }>(
      new Response(JSON.stringify({ id: "cached" }), {
        headers: { "x-data-status": "stale-fallback", age: "90" },
      }),
    );
    const { container } = render(
      <DataStatus
        source="NASA test source"
        updatedAt={Date.now()}
        refreshing={false}
        data={data}
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Stale fallback");
    expect(
      screen.getByText(/Current fetch failed · older validated response/),
    ).toBeVisible();
    expect(screen.getByText("STALE DATA")).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("UTC");
    expect(container.querySelector(".data-status")).toHaveAttribute(
      "data-freshness",
      "stale",
    );
  });

  it("states a deterministic UTC retrieval timestamp", () => {
    const { container } = render(
      <DataStatus
        source="NASA DONKI"
        updatedAt={Date.UTC(2026, 7, 26, 14, 30)}
        refreshing={false}
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "2026-08-26 14:30 UTC",
    );
    expect(screen.getByText(/Validated NASA response/)).toBeVisible();
    expect(container.querySelector(".data-status")).toHaveClass(
      "data-status--live",
    );
  });

  it("makes an in-progress refresh machine-readable", () => {
    const { container } = render(
      <DataStatus
        source="NASA EPIC"
        updatedAt={Date.UTC(2026, 7, 26, 14, 30)}
        refreshing
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Refreshing");
    expect(container.querySelector(".data-status")).toHaveClass(
      "data-status--refreshing",
    );
  });
});
