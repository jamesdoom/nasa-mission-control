import { beforeEach, describe, expect, it } from "vitest";
import {
  createFlightLogBackup,
  restoreFlightLogBackup,
} from "./flightLogBackup";

describe("Flight Log backup", () => {
  beforeEach(() => localStorage.clear());

  it("exports and restores only supported browser-local records", () => {
    localStorage.setItem(
      "mission-control:journey-favorites:v1",
      JSON.stringify(["moon-then-now"]),
    );
    localStorage.setItem("unrelated", "secret");
    const backup = createFlightLogBackup(localStorage);
    localStorage.clear();
    expect(restoreFlightLogBackup(backup, localStorage)).toBe(1);
    expect(localStorage.getItem("mission-control:journey-favorites:v1")).toBe(
      '["moon-then-now"]',
    );
    expect(localStorage.getItem("unrelated")).toBeNull();
  });

  it("rejects malformed and unsupported files", () => {
    expect(() => restoreFlightLogBackup("not json", localStorage)).toThrow(
      "valid Mission Control JSON backup",
    );
    expect(() =>
      restoreFlightLogBackup(
        JSON.stringify({ version: 2, records: {} }),
        localStorage,
      ),
    ).toThrow("not a supported Mission Control backup");
  });
});
