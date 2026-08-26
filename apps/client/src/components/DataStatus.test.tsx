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
    render(
      <DataStatus
        source="NASA test source"
        updatedAt={Date.now()}
        refreshing={false}
        data={data}
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Stale fallback");
    expect(
      screen.getByText(
        /NASA was unavailable; showing an older validated response/,
      ),
    ).toBeVisible();
  });
});
