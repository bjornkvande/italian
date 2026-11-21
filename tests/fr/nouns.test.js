// Tests for the French nouns (dictionary/fr/nouns.csv, src/lang/fr/nouns.js).
import { describe, it, expect } from "vitest";
import { NOUNS_CSV, NOUN_PAGES, nouns, pluralOf, nounForms, nounCards } from "../../src/lang/fr/nouns.js";
import { expectCsvShape, expectNoteMarkdown } from "../helpers.js";

const forms = (n) => { const f = nounForms(nouns.find((x) => x.noun === n)); return [f.singular, f.plural]; };

describe("dictionary/fr/nouns.csv", () => {
  it("has the expected columns and one field per column", () => {
    expectCsvShape(NOUNS_CSV, ["topic", "noun", "gender", "plural", "english", "en_plural", "level", "note"]);
  });

  it.each(nouns.map((n) => [n.noun, n]))("%s is valid", (_, n) => {
    expect(NOUN_PAGES.some((p) => p.id === n.topic)).toBe(true);
    expect(["m", "f"]).toContain(n.gender);
    expect(["beginner", "intermediate"]).toContain(n.level);
    expect(n.english).not.toMatch(/^the /);
    expectNoteMarkdown(n.note);
    // A listed plural must differ from the rule, or it isn't needed.
    if (n.plural && n.plural !== "-") expect(n.plural, "plural is the regular one").not.toBe(pluralOf(n.noun));
  });

  it("has no duplicate nouns or English meanings, and both levels in every theme", () => {
    const names = nouns.map((n) => n.noun);
    expect(names.filter((x, i) => names.indexOf(x) !== i)).toEqual([]);
    const en = nouns.map((n) => n.english);
    expect(en.filter((x, i) => en.indexOf(x) !== i)).toEqual([]);
    for (const p of NOUN_PAGES) for (const l of ["beginner", "intermediate"]) expect(nouns.some((n) => n.topic === p.id && n.level === l), `${p.id} ${l}`).toBe(true);
  });

  it("every noun with h has a silent h (no h aspiré nouns, which would need le/la)", () => {
    expect(nouns.filter((n) => n.noun.startsWith("h")).map((n) => n.noun).sort()).toEqual(["homme", "hôpital", "hôtel"]);
  });
});

describe("French plurals and articles", () => {
  it.each([
    ["livre", "livres"], ["bras", "bras"], ["prix", "prix"], ["nez", "nez"], ["cadeau", "cadeaux"], ["jeu", "jeux"],
    ["hôpital", "hôpitaux"], ["festival", "festivals"], ["genou", "genoux"], ["trou", "trous"],
  ])("%s → %s", (singular, plural) => {
    expect(pluralOf(singular)).toBe(plural);
  });

  it("le, la, l' before a vowel or silent h, les in the plural", () => {
    expect(forms("lit")).toEqual(["le lit", "les lits"]);
    expect(forms("maison")).toEqual(["la maison", "les maisons"]);
    expect(forms("homme")).toEqual(["l'homme", "les hommes"]);
    expect(forms("école")).toEqual(["l'école", "les écoles"]);
    expect(forms("œil")).toEqual(["l'œil", "les yeux"]);
    expect(forms("grand-mère")).toEqual(["la grand-mère", "les grands-mères"]);
    expect(forms("argent")).toEqual(["l'argent", null]);
  });

  it("cards: singular and plural, with the English", () => {
    const pair = (id) => { const c = nounCards().find((x) => x.id === id); return `${c.it} = ${c.en}`; };
    expect(pair("nouns.pied.pl")).toBe("les pieds = the feet");
    expect(pair("nouns.cadeau.pl")).toBe("les cadeaux = the presents");
    const ids = nounCards().map((c) => c.id);
    expect(ids.filter((x, i) => ids.indexOf(x) !== i)).toEqual([]);
  });
});
