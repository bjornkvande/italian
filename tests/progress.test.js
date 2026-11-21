// Tests for the progress line on the Train screen (src/progress.js).
import { describe, it, expect } from "vitest";
import { progress, fraction } from "../src/progress.js";

const record = (last) => ({ last, at: 1, count: 1, history: [[last, 1]] });
const cards = ["a", "b", "c", "d"].map((id) => ({ id }));

describe("progress", () => {
  it("counts cards rated 4 or 5, by their weaker direction", () => {
    const records = {
      "a|it-en": record(5), "a|en-it": record(4), // known both ways
      "b|it-en": record(5), "b|en-it": record(2), // weaker direction is 2
      "c|en-it": record(4),                         // only one direction rated: that one counts
      "x|it-en": record(5),                         // not one of these cards
    };
    expect(progress(cards, records)).toEqual({ known: 2, total: 4 });
  });

  it("counts a card shared by two groups once", () => {
    expect(progress([...cards, { id: "a" }], {})).toEqual({ known: 0, total: 4 });
  });

  it("shows as known / total with thousands separators", () => {
    expect(fraction({ known: 47, total: 3950 })).toBe("47 / 3,950");
  });
});
