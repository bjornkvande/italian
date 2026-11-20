// Tests for the adverbs (dictionary/adverbs.csv and src/adverbs.js).
import { describe, it, expect } from "vitest";
import { ADVERBS_CSV, ADVERB_PAGES, LEVELS, adverbs, adverbCards, menteFrom } from "../src/adverbs.js";
import { basicsRows } from "../src/basics.js";
import { parseRows } from "../src/csv.js";

describe("-mente adverbs", () => {
  it("are made from the feminine form, or drop the e after -le/-re (written from the rule)", () => {
    expect(menteFrom("lento")).toBe("lentamente");
    expect(menteFrom("sicuro")).toBe("sicuramente");
    expect(menteFrom("veloce")).toBe("velocemente");
    expect(menteFrom("facile")).toBe("facilmente");
    expect(menteFrom("regolare")).toBe("regolarmente");
    expect(menteFrom("probabile")).toBe("probabilmente");
  });

  it("every adverb with a `from` adjective follows the rule", () => {
    const withFrom = adverbs.filter((a) => a.from);
    expect(withFrom.length).toBeGreaterThan(0);
    for (const a of withFrom) expect(a.adverb, `from ${a.from}`).toBe(menteFrom(a.from));
  });

  it("every -mente adverb says which adjective it comes from", () => {
    for (const a of adverbs.filter((x) => x.adverb.endsWith("mente"))) expect(a.from, a.adverb).toMatch(/\S/);
  });
});

describe("cards", () => {
  it("one card per adverb, Italian ↔ English, in subpage order", () => {
    const cards = adverbCards();
    expect(cards).toHaveLength(adverbs.length);
    expect(cards[0]).toEqual({ id: "adverbs.bene", tenseKey: "beginner", kind: "Adverb", tense: "Adverb · how", it: "bene", en: "well" });
    const ids = cards.map((c) => c.id);
    expect(ids.filter((x, i) => ids.indexOf(x) !== i)).toEqual([]);
  });
});

describe("dictionary/adverbs.csv", () => {
  const COLUMNS = ["topic", "adverb", "english", "level", "from", "note"];

  it("has the expected columns and one field per column", () => {
    const [header, ...rows] = parseRows(ADVERBS_CSV);
    expect(header).toEqual(COLUMNS);
    for (const r of rows) expect(r.length, `row "${r[1]}" has ${r.length} fields`).toBe(COLUMNS.length);
  });

  it.each(adverbs.map((a) => [a.adverb, a]))("%s is valid", (_, a) => {
    expect(ADVERB_PAGES.map((p) => p.id), `unknown topic "${a.topic}"`).toContain(a.topic);
    expect(LEVELS, `unknown level "${a.level}"`).toContain(a.level);
    expect(a.adverb).toMatch(/^[a-zàèéìòù' /]+$/);
    expect(a.english.trim()).not.toBe("");
    const singles = a.note.replace(/\*\*/g, "").split("*").length - 1;
    expect(a.note.split("**").length % 2, "unbalanced ** in note").toBe(1);
    expect(singles % 2, "unbalanced * in note").toBe(0);
  });

  it("has no duplicate adverbs or English meanings", () => {
    for (const key of ["adverb", "english"]) {
      const values = adverbs.map((a) => a[key]);
      expect(values.filter((v, i) => values.indexOf(v) !== i), key).toEqual([]);
    }
  });

  it("every subpage and every level has adverbs", () => {
    for (const p of ADVERB_PAGES) expect(adverbs.some((a) => a.topic === p.id), p.id).toBe(true);
    for (const l of LEVELS) expect(adverbs.some((a) => a.level === l), l).toBe(true);
  });

  it("doesn't repeat words that are already in the Basics", () => {
    // "qui / qua" → qui, qua; "davanti (a)" → davanti
    const words = (s) => s.split(" / ").map((w) => w.replace(/\(.*?\)/g, "").trim());
    const inBasics = new Set(basicsRows.flatMap((r) => words(r.italian)));
    for (const a of adverbs) {
      for (const w of words(a.adverb)) expect(inBasics.has(w), `"${w}" is already in the Basics`).toBe(false);
    }
  });
});
