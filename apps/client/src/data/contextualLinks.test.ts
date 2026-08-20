import { describe, expect, it } from "vitest";
import { contextualLinksForText } from "./contextualLinks";

describe("contextualLinksForText", () => {
  it("connects recognized subjects to their relevant mission and path", () => {
    expect(contextualLinksForText("Cloud bands over Jupiter")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ to: "/missions/juno" }),
        expect.objectContaining({ to: "/discover#jupiter-beneath-clouds" }),
      ]),
    );
  });

  it("uses the deep-universe path when no specific subject is recognized", () => {
    expect(contextualLinksForText("A mysterious distant object")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ to: "/missions/webb" }),
        expect.objectContaining({ to: "/discover#deep-universe" }),
      ]),
    );
  });
});
