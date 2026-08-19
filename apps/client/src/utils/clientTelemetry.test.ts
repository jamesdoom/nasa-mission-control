import { afterEach, describe, expect, it, vi } from "vitest";
import { registerClientTelemetry } from "./clientTelemetry";

afterEach(() => vi.restoreAllMocks());

describe("client telemetry", () => {
  it("reports sanitized runtime errors through a beacon", () => {
    const sendBeacon = vi.fn().mockReturnValue(true);
    Object.defineProperty(navigator, "sendBeacon", {
      configurable: true,
      value: sendBeacon,
    });
    window.history.replaceState({}, "", "/earth?collection=natural");
    const unregister = registerClientTelemetry();
    window.dispatchEvent(new ErrorEvent("error", { message: "Chunk failed" }));
    expect(sendBeacon).toHaveBeenCalledWith(
      "/api/client-errors",
      expect.any(Blob),
    );
    unregister();
  });
});
