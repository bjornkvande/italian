// Tests for the progress bars on the Train screen (src/core/progress.js).
import { describe, it, expect } from "vitest";
import { progress, fraction } from "../../src/core/progress.js";

const record = (last) => ({ last, at: 1, count: 1, history: [[last, 1]] });
const cards = ["a", "b", "c", "d"].map((id) => ({ id }));

describe("progress", () => {
  it("counts each direction rated 4 or 5, out of two per card", () => {
    const records = {
      "a|it-en": record(5), "a|en-it": record(4), // both directions known
      "b|it-en": record(5), "b|en-it": record(2), // one known
      "c|en-it": record(3),                         // not known yet
      "x|it-en": record(5),                         // not one of these cards
    };
    expect(progress(cards, records)).toEqual({ known: 3, total: 8 });
  });

  it("goes back down when a known direction is rated lower", () => {
    expect(progress(cards, { "a|it-en": record(2) })).toEqual({ known: 0, total: 8 });
  });

  it("counts a card shared by two groups once", () => {
    expect(progress([...cards, { id: "a" }], {})).toEqual({ known: 0, total: 8 });
  });

  it("shows as known / total with thousands separators", () => {
    expect(fraction({ known: 47, total: 8874 })).toBe("47 / 8,874");
  });
});
