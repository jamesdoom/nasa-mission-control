import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ProvenancePanel } from "./ProvenancePanel";

describe("ProvenancePanel", () => {
  it("reveals evidence guidance on request", async () => {
    const user = userEvent.setup();
    render(
      <ProvenancePanel
        kind="live"
        title="Retrieved through NASA APOD"
        summary="Open data origin and freshness guidance"
        details={["Retrieval time is not observation time."]}
      />,
    );

    const disclosure = screen.getByText("Retrieved through NASA APOD");
    expect(
      screen.getByText("Retrieval time is not observation time."),
    ).not.toBeVisible();
    await user.click(disclosure);
    expect(
      screen.getByText("Retrieval time is not observation time."),
    ).toBeVisible();
  });
});
