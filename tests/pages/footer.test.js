// Tests for the grammar pages' footer (src/pages/footer.js).
import { describe, it, expect } from "vitest";
import { footerText } from "../../src/pages/footer.js";

describe("footer", () => {
  it("shows the copyright years, the build number and the deploy date", () => {
    expect(footerText({ year: 2026, build: 312, date: "2026-11-21" }))
      .toBe("© Bjørn Jarle Kvande, 2026–2026 · Build 312, 2026-11-21");
  });

  it("runs the copyright up to the current year", () => {
    expect(footerText({ year: 2027, build: 400, date: "2027-01-03" })).toContain("2026–2027");
  });
});
