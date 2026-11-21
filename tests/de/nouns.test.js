// Tests for the German nouns (dictionary/de/nouns.csv, src/lang/de/nouns.js).
// Expected forms and patterns are written from German grammar.
import { describe, it, expect } from "vitest";
import { NOUNS_CSV, NOUN_PAGES, nouns, nounForms, nounCards } from "../../src/lang/de/nouns.js";
import { expectCsvShape, expectNoteMarkdown } from "../helpers.js";

const noun = (n) => {
  const row = nouns.find((x) => x.noun === n);
  if (!row) throw new Error(`${n} is not in dictionary/de/nouns.csv`);
  return row;
};
const forms = (n) => { const f = nounForms(noun(n)); return [f.singular, f.plural]; };
const umlautless = (s) => s.replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/Ä/g, "A").replace(/Ö/g, "O").replace(/Ü/g, "U");

describe("dictionary/de/nouns.csv", () => {
  it("has the expected columns and one field per column", () => {
    expectCsvShape(NOUNS_CSV, ["topic", "noun", "gender", "plural", "english", "en_plural", "level", "note"]);
  });

  it.each(nouns.map((n) => [n.noun, n]))("%s is valid", (_, n) => {
    expect(NOUN_PAGES.some((p) => p.id === n.topic), n.topic).toBe(true);
    expect(["m", "f", "n"]).toContain(n.gender);
    expect(["beginner", "intermediate"]).toContain(n.level);
    expect(n.noun, "nouns are written with a capital").toMatch(/^[A-ZÄÖÜ]/);
    expect(n.plural === "-" || /^[A-ZÄÖÜ]/.test(n.plural), "plural").toBe(true);
    expect(n.english).not.toMatch(/^the /);
    expectNoteMarkdown(n.note);
  });

  it("has no duplicate nouns or English meanings, and nouns at both levels in every theme", () => {
    const names = nouns.map((n) => n.noun);
    expect(names.filter((x, i) => names.indexOf(x) !== i)).toEqual([]);
    const en = nouns.map((n) => n.english);
    expect(en.filter((x, i) => en.indexOf(x) !== i)).toEqual([]);
    for (const p of NOUN_PAGES) {
      for (const level of ["beginner", "intermediate"]) expect(nouns.some((n) => n.topic === p.id && n.level === level), `${p.id} ${level}`).toBe(true);
    }
  });
});

describe("German gender and plural patterns", () => {
  it("-ung, -heit, -keit, -ion, -tät, -schaft and -in (for women) are feminine", () => {
    for (const n of nouns.filter((x) => /(ung|heit|keit|ion|tät|schaft|in)$/.test(x.noun) && !/(Termin|Wein)$/.test(x.noun))) {
      expect(n.gender, n.noun).toBe("f");
    }
  });

  it("the diminutives -chen and -lein are neuter and don't change in the plural", () => {
    // (Kuchen = cake isn't a diminutive.)
    for (const n of nouns.filter((x) => /(chen|lein)$/.test(x.noun) && x.noun !== "Kuchen")) {
      expect(n.gender, n.noun).toBe("n");
      expect(n.plural, n.noun).toBe(n.noun);
    }
  });

  it("feminine nouns in -e add -n; nouns in -in add -nen", () => {
    for (const n of nouns.filter((x) => x.gender === "f" && x.noun.endsWith("e") && x.plural !== "-")) expect(n.plural, n.noun).toBe(n.noun + "n");
    for (const n of nouns.filter((x) => x.gender === "f" && x.noun.endsWith("in"))) expect(n.plural, n.noun).toBe(n.noun + "nen");
  });

  it("masculine and neuter nouns in unstressed -er, -el, -en add nothing, at most an umlaut", () => {
    // A consonant before the ending: Zimmer, Apfel, Garten (not Spiel, where -el isn't an ending),
    // and not stressed loanwords like Hotel (ho-TEL).
    const stressed = ["Hotel"];
    for (const n of nouns.filter((x) => x.gender !== "f" && /[^aeiouäöü](er|el|en)$/.test(x.noun) && x.plural !== "-" && !stressed.includes(x.noun))) {
      expect(umlautless(n.plural), n.noun).toBe(umlautless(n.noun));
    }
  });

  it("every plural starts like its singular (the stem stays, apart from umlauts)", () => {
    for (const n of nouns.filter((x) => x.plural !== "-")) {
      const stem = umlautless(n.noun).replace(/(um|e)$/, "");
      expect(umlautless(n.plural).startsWith(stem), `${n.noun} → ${n.plural}`).toBe(true);
    }
  });
});

describe("nouns with their articles", () => {
  it("der, die, das in the singular; die in the plural", () => {
    expect(forms("Stuhl")).toEqual(["der Stuhl", "die Stühle"]);
    expect(forms("Frage")).toEqual(["die Frage", "die Fragen"]);
    expect(forms("Haus")).toEqual(["das Haus", "die Häuser"]);
    expect(forms("Auto")).toEqual(["das Auto", "die Autos"]);
    expect(forms("Zimmer")).toEqual(["das Zimmer", "die Zimmer"]);
    expect(forms("Mädchen")).toEqual(["das Mädchen", "die Mädchen"]);
    expect(forms("Geld")).toEqual(["das Geld", null]);
  });

  it("cards: the singular and, if used, the plural, with the English", () => {
    const cards = nounCards();
    const pair = (id) => { const c = cards.find((x) => x.id === id); return `${c.it} = ${c.en}`; };
    expect(pair("nouns.Fuß")).toBe("der Fuß = the foot");
    expect(pair("nouns.Fuß.pl")).toBe("die Füße = the feet");
    expect(pair("nouns.Wohnung.pl")).toBe("die Wohnungen = the flats (apartments)");
    expect(cards.some((c) => c.id === "nouns.Geld.pl")).toBe(false);
    const ids = cards.map((c) => c.id);
    expect(ids.filter((x, i) => ids.indexOf(x) !== i)).toEqual([]);
  });
});
