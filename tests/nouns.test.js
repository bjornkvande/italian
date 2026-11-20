// Tests for the nouns (dictionary/nouns.csv and src/nouns.js).
// Expected plurals and articles are written from grammar, not copied from the code.
import { describe, it, expect } from "vitest";
import { NOUNS_CSV, NOUN_PAGES, nouns, pluralOf, englishPlural, nounForms, nounCards } from "../src/nouns.js";
import { parseRows } from "../src/csv.js";

const noun = (n) => {
  const row = nouns.find((x) => x.noun === n);
  if (!row) throw new Error(`${n} is not in dictionary/nouns.csv`);
  return row;
};
const forms = (n) => {
  const f = nounForms(noun(n));
  return [f.singular, f.plural];
};

describe("Italian plurals by the rules", () => {
  it.each([
    ["libro", "m", "libri"], ["tavolo", "m", "tavoli"],
    ["casa", "f", "case"], ["sedia", "f", "sedie"], ["famiglia", "f", "famiglie"],
    ["chiave", "f", "chiavi"], ["ristorante", "m", "ristoranti"],
    ["problema", "m", "problemi"],
    ["banca", "f", "banche"], ["amica", "f", "amiche"], ["lingua", "f", "lingue"],
    ["arancia", "f", "arance"], ["camicia", "f", "camicie"], ["farmacia", "f", "farmacie"],
    ["parco", "m", "parchi"], ["albergo", "m", "alberghi"], ["succo", "m", "succhi"],
    ["negozio", "m", "negozi"], ["specchio", "m", "specchi"], ["viaggio", "m", "viaggi"],
    ["città", "f", "città"], ["caffè", "m", "caffè"], ["tè", "m", "tè"],
    ["bar", "m", "bar"], ["film", "m", "film"], ["autobus", "m", "autobus"],
    ["foto", "f", "foto"], ["crisi", "f", "crisi"], ["serie", "f", "serie"],
  ])("%s (%s) → %s", (singular, gender, plural) => {
    expect(pluralOf(singular, gender)).toBe(plural);
  });
});

describe("English plurals by the rules", () => {
  it.each([
    ["book", "books"], ["day", "days"], ["city", "cities"], ["party", "parties"],
    ["bus", "buses"], ["church", "churches"], ["lunch", "lunches"], ["box", "boxes"], ["photo", "photos"],
  ])("%s → %s", (word, plural) => {
    expect(englishPlural(word)).toBe(plural);
  });
});

describe("nouns with their articles", () => {
  it("regular nouns", () => {
    expect(forms("libro")).toEqual(["il libro", "i libri"]);
    expect(forms("casa")).toEqual(["la casa", "le case"]);
    expect(forms("specchio")).toEqual(["lo specchio", "gli specchi"]);
    expect(forms("albergo")).toEqual(["l'albergo", "gli alberghi"]);
    expect(forms("arancia")).toEqual(["l'arancia", "le arance"]);
    expect(forms("problema")).toEqual(["il problema", "i problemi"]);
    expect(forms("città")).toEqual(["la città", "le città"]);
    expect(forms("autobus")).toEqual(["l'autobus", "gli autobus"]);
  });

  it("exceptions from the dictionary", () => {
    expect(forms("uomo")).toEqual(["l'uomo", "gli uomini"]);
    expect(forms("uovo")).toEqual(["l'uovo", "le uova"]); // feminine in the plural
    expect(forms("moglie")).toEqual(["la moglie", "le mogli"]);
    expect(forms("zio")).toEqual(["lo zio", "gli zii"]);
    expect(forms("amico")).toEqual(["l'amico", "gli amici"]);
    expect(forms("medico")).toEqual(["il medico", "i medici"]);
  });

  it("nouns normally not used in the plural have no plural", () => {
    expect(forms("pane")).toEqual(["il pane", null]);
    expect(forms("acqua")).toEqual(["l'acqua", null]);
    expect(forms("gente")).toEqual(["la gente", null]);
  });

  it("English: the + meaning, plural by rule or from the dictionary", () => {
    const en = (n) => { const f = nounForms(noun(n)); return [f.enSingular, f.enPlural]; };
    expect(en("libro")).toEqual(["the book", "the books"]);
    expect(en("città")).toEqual(["the city", "the cities"]);
    expect(en("uomo")).toEqual(["the man", "the men"]);
    expect(en("persona")).toEqual(["the person", "the people"]);
    expect(en("pesce")).toEqual(["the fish", "the fish"]);
  });
});

describe("cards", () => {
  const cards = nounCards();

  it("singular and plural are separate cards; nouns without a plural have one", () => {
    expect(cards.filter((c) => c.id.startsWith("nouns.libro")).map((c) => `${c.it} = ${c.en}`))
      .toEqual(["il libro = the book", "i libri = the books"]);
    expect(cards.filter((c) => c.id.startsWith("nouns.pane")).map((c) => c.it)).toEqual(["il pane"]);
  });

  it("have unique ids, the Noun heading with the theme, and mark irregular plurals", () => {
    const ids = cards.map((c) => c.id);
    expect(ids.filter((x, i) => ids.indexOf(x) !== i)).toEqual([]);
    const uova = cards.find((c) => c.id === "nouns.uovo.pl");
    expect([uova.kind, uova.tense, uova.irregular]).toEqual(["Noun", "Noun · Food & drink", true]);
    expect(cards.find((c) => c.id === "nouns.libro.pl").irregular).toBe(false);
  });
});

describe("dictionary/nouns.csv", () => {
  const COLUMNS = ["topic", "noun", "gender", "english", "plural", "plural_gender", "en_plural", "level", "note"];

  it("has the expected columns and one field per column", () => {
    const [header, ...rows] = parseRows(NOUNS_CSV);
    expect(header).toEqual(COLUMNS);
    for (const r of rows) expect(r.length, `row "${r[1]}" has ${r.length} fields`).toBe(COLUMNS.length);
  });

  it.each(nouns.map((n) => [n.noun, n]))("%s is valid", (_, n) => {
    expect(NOUN_PAGES.map((p) => p.id), `unknown topic "${n.topic}"`).toContain(n.topic);
    expect(n.noun).toMatch(/^[a-zàèéìòù]+$/);
    expect(["m", "f"]).toContain(n.gender);
    expect(["", "m", "f"]).toContain(n.plural_gender);
    expect(["beginner", "intermediate"]).toContain(n.level);
    expect(n.english).toMatch(/^[a-zé][a-zé ().]*$/);
    expect(n.english, "without 'the'").not.toMatch(/^the /);
    if (n.plural && n.plural !== "-") expect(n.plural).toMatch(/^[a-zàèéìòù]+$/);
    if (n.plural === "-") expect(n.en_plural, "no English plural without an Italian one").toBe("");
    const singles = n.note.replace(/\*\*/g, "").split("*").length - 1;
    expect(n.note.split("**").length % 2, "unbalanced ** in note").toBe(1);
    expect(singles % 2, "unbalanced * in note").toBe(0);
  });

  it("an exception column is only used where the rules get it wrong", () => {
    for (const n of nouns.filter((x) => x.plural && x.plural !== "-")) {
      expect(n.plural, `${n.noun}: the rules already give ${n.plural}`).not.toBe(pluralOf(n.noun, n.gender));
    }
  });

  it("has no duplicate nouns, the planned sizes, and nouns at both levels", () => {
    const names = nouns.map((n) => n.noun);
    expect(names.filter((x, i) => names.indexOf(x) !== i)).toEqual([]);
    const count = (t) => nouns.filter((n) => n.topic === t).length;
    expect(count("everyday")).toBe(50);
    for (const t of ["people", "home", "food", "city"]) expect(count(t), t).toBeGreaterThanOrEqual(20);
    for (const l of ["beginner", "intermediate"]) expect(nouns.some((n) => n.level === l), l).toBe(true);
  });
});
