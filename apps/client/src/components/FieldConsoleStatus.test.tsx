import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FieldConsoleStatus } from "./FieldConsoleStatus";

const worker = vi.hoisted(() => ({
  applyUpdate: vi.fn(),
  ready: true,
  updateAvailable: false,
  version: "build-123",
}));

vi.mock("../hooks/useServiceWorker", () => ({
  useServiceWorker: () => worker,
}));

describe("FieldConsoleStatus", () => {
  beforeEach(() => {
    worker.applyUpdate.mockReset();
    worker.ready = true;
    worker.updateAvailable = false;
    worker.version = "build-123";
  });

  it("reports the active cached build", () => {
    render(<FieldConsoleStatus />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Offline field console ready",
    );
    expect(screen.getByRole("status")).toHaveTextContent("build-123");
  });

  it("requires an explicit action to activate a waiting version", async () => {
    worker.updateAvailable = true;
    render(<FieldConsoleStatus />);
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Update and reload" }));
    expect(worker.applyUpdate).toHaveBeenCalledOnce();
  });
});
