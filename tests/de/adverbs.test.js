// Tests for the German adverbs (dictionary/de/adverbs.csv, src/lang/de/adverbs.js).
import { describe, it, expect } from "vitest";
import { ADVERBS_CSV, ADVERB_PAGES, LEVELS, adverbs, adverbCards } from "../../src/lang/de/adverbs.js";
import { basicsRows } from "../../src/lang/de/basics.js";
import { adjectives } from "../../src/lang/de/adjectives.js";
import { expectCsvShape, expectNoteMarkdown } from "../helpers.js";

describe("dictionary/de/adverbs.csv", () => {
  it("has the expected columns and one field per column", () => {
    expectCsvShape(ADVERBS_CSV, ["topic", "adverb", "english", "level", "note"]);
  });

  it.each(adverbs.map((a) => [a.adverb, a]))("%s is valid", (_, a) => {
    expect(ADVERB_PAGES.some((p) => p.id === a.topic), a.topic).toBe(true);
    expect(LEVELS).toContain(a.level);
    expect(a.english).toMatch(/\S/);
    expectNoteMarkdown(a.note);
  });

  it("has no duplicates, and nothing that is already in the Basics or the adjectives", () => {
    const names = adverbs.map((a) => a.adverb);
    expect(names.filter((x, i) => names.indexOf(x) !== i)).toEqual([]);
    const elsewhere = new Set([...basicsRows.map((r) => r.german), ...adjectives.map((a) => a.adjective)]);
    expect(names.filter((n) => elsewhere.has(n))).toEqual([]);
  });

  it("has adverbs at every level in every topic but one at most", () => {
    for (const l of LEVELS) expect(adverbs.some((a) => a.level === l), l).toBe(true);
    for (const p of ADVERB_PAGES) expect(adverbs.filter((a) => a.topic === p.id).length, p.id).toBeGreaterThanOrEqual(10);
  });

  it("cards: one per adverb, with its level as the form", () => {
    const cards = adverbCards();
    expect(cards).toHaveLength(adverbs.length);
    expect(cards[0]).toEqual({ id: "adverbs.gern", form: "beginner", kind: "Adverb", heading: "Adverb · how", it: "gern", en: "gladly, with pleasure" });
  });
});
