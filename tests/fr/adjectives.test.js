// Tests for the French adjectives (dictionary/fr/adjectives.csv, src/lang/fr/adjectives.js).
import { describe, it, expect } from "vitest";
import { ADJECTIVES_CSV, ADJECTIVE_PAGES, adjectives, adjectiveForms, adjectiveCards } from "../../src/lang/fr/adjectives.js";
import { expectCsvShape, expectNoteMarkdown } from "../helpers.js";

const forms = (a) => Object.values(adjectiveForms(adjectives.find((x) => x.adjective === a)));

describe("dictionary/fr/adjectives.csv", () => {
  it("has the expected columns and one field per column", () => {
    expectCsvShape(ADJECTIVES_CSV, ["topic", "adjective", "english", "feminine", "plural", "note"]);
  });

  it.each(adjectives.map((a) => [a.adjective, a]))("%s is valid", (_, a) => {
    expect(ADJECTIVE_PAGES.some((p) => p.id === a.topic && p.id !== "comparison"), a.topic).toBe(true);
    expectNoteMarkdown(a.note);
  });

  it("has no duplicates", () => {
    const names = adjectives.map((a) => a.adjective);
    expect(names.filter((x, i) => names.indexOf(x) !== i)).toEqual([]);
  });
});

describe("agreement", () => {
  it.each([
    ["grand", ["grand", "grande", "grands", "grandes"]],
    ["rouge", ["rouge", "rouge", "rouges", "rouges"]],
    ["sérieux", ["sérieux", "sérieuse", "sérieux", "sérieuses"]],
    ["sportif", ["sportif", "sportive", "sportifs", "sportives"]],
    ["cher", ["cher", "chère", "chers", "chères"]],
    ["bon", ["bon", "bonne", "bons", "bonnes"]],
    ["violet", ["violet", "violette", "violets", "violettes"]],
    ["génial", ["génial", "géniale", "géniaux", "géniales"]],
    ["gris", ["gris", "grise", "gris", "grises"]],
    ["beau", ["beau", "belle", "beaux", "belles"]],
    ["nouveau", ["nouveau", "nouvelle", "nouveaux", "nouvelles"]],
    ["vieux", ["vieux", "vieille", "vieux", "vieilles"]],
    ["blanc", ["blanc", "blanche", "blancs", "blanches"]],
    ["bleu", ["bleu", "bleue", "bleus", "bleues"]],
    ["marron", ["marron", "marron", "marron", "marron"]],
  ])("%s → %s", (a, expected) => {
    expect(forms(a)).toEqual(expected);
  });

  it("cards: only the forms that differ", () => {
    const of = (a) => adjectiveCards().filter((c) => c.id === `adjectives.${a}` || c.id.startsWith(`adjectives.${a}.`)).map((c) => `${c.it} = ${c.en}`);
    expect(of("grand")).toEqual(["grand = big, tall", "grande = big, tall (f. sing.)", "grands = big, tall (m. pl.)", "grandes = big, tall (f. pl.)"]);
    expect(of("rouge")).toEqual(["rouge = red", "rouges = red (pl.)"]);
    expect(of("marron")).toEqual(["marron = brown"]);
    const ids = adjectiveCards().map((c) => c.id);
    expect(ids.filter((x, i) => ids.indexOf(x) !== i)).toEqual([]);
  });
});
