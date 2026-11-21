// Tests for the French adverbs (dictionary/fr/adverbs.csv, src/lang/fr/adverbs.js).
import { describe, it, expect } from "vitest";
import { ADVERBS_CSV, ADVERB_PAGES, LEVELS, adverbs, adverbCards, menteFrom } from "../../src/lang/fr/adverbs.js";
import { basicsRows } from "../../src/lang/fr/basics.js";
import { adjectives } from "../../src/lang/fr/adjectives.js";
import { expectCsvShape, expectNoteMarkdown } from "../helpers.js";

describe("-ment adverbs (written from the rule)", () => {
  it.each([
    ["lent", "lentement"], ["heureux", "heureusement"], ["doux", "doucement"], ["facile", "facilement"],
    ["vrai", "vraiment"], ["absolu", "absolument"], ["récent", "récemment"], ["évident", "évidemment"],
    ["constant", "constamment"], ["seul", "seulement"], ["final", "finalement"],
  ])("%s → %s", (adjective, adverb) => {
    expect(menteFrom(adjective)).toBe(adverb);
  });

  it("every adverb with a `from` adjective follows the rule, and every -ment adverb names it", () => {
    for (const a of adverbs.filter((x) => x.from)) expect(a.adverb, `from ${a.from}`).toBe(menteFrom(a.from));
    for (const a of adverbs.filter((x) => /^\S+ment$/.test(x.adverb) && !["autrement", "tellement"].includes(x.adverb))) expect(a.from, a.adverb).toMatch(/\S/);
  });
});

describe("dictionary/fr/adverbs.csv", () => {
  it("has the expected columns and one field per column", () => {
    expectCsvShape(ADVERBS_CSV, ["topic", "adverb", "english", "level", "from", "note"]);
  });

  it.each(adverbs.map((a) => [a.adverb, a]))("%s is valid", (_, a) => {
    expect(ADVERB_PAGES.some((p) => p.id === a.topic)).toBe(true);
    expect(LEVELS).toContain(a.level);
    expectNoteMarkdown(a.note);
  });

  it("has no duplicates, and nothing already in the Basics or the adjectives", () => {
    const names = adverbs.map((a) => a.adverb);
    expect(names.filter((x, i) => names.indexOf(x) !== i)).toEqual([]);
    const elsewhere = new Set([...basicsRows.map((r) => r.french), ...adjectives.map((a) => a.adjective)]);
    expect(names.filter((n) => elsewhere.has(n))).toEqual([]);
  });

  it("cards: one per adverb, with its level as the form", () => {
    expect(adverbCards()[0]).toEqual({ id: "adverbs.bien", form: "beginner", kind: "Adverb", heading: "Adverb · how", it: "bien", en: "well" });
  });
});
