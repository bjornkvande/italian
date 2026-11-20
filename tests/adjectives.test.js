// Tests for the adjectives (dictionary/adjectives.csv and src/adjectives.js).
// Expected forms are written out from Italian grammar, not copied from the code.
import { describe, it, expect } from "vitest";
import {
  ADJECTIVES_CSV, ADJECTIVE_PAGES, adjectives, adjectiveForms, adjectiveCards, adjectiveCardId, allAdjectiveCards,
} from "../src/adjectives.js";
import { parseRows } from "../src/csv.js";

const adj = (base) => {
  const a = adjectives.find((x) => x.adjective === base);
  if (!a) throw new Error(`${base} is not in dictionary/adjectives.csv`);
  return a;
};
const forms = (base) => Object.values(adjectiveForms(adj(base)));

describe("forms", () => {
  it("-o adjectives have four forms", () => {
    expect(forms("rosso")).toEqual(["rosso", "rossa", "rossi", "rosse"]);
    expect(forms("piccolo")).toEqual(["piccolo", "piccola", "piccoli", "piccole"]);
  });

  it("-e adjectives have one singular and one plural", () => {
    expect(forms("grande")).toEqual(["grande", "grande", "grandi", "grandi"]);
    expect(forms("felice")).toEqual(["felice", "felice", "felici", "felici"]);
  });

  it("invariable adjectives never change", () => {
    expect(forms("blu")).toEqual(["blu", "blu", "blu", "blu"]);
    expect(forms("rosa")).toEqual(["rosa", "rosa", "rosa", "rosa"]);
  });

  it("-co/-go keep the hard sound with an h", () => {
    expect(forms("bianco")).toEqual(["bianco", "bianca", "bianchi", "bianche"]);
    expect(forms("lungo")).toEqual(["lungo", "lunga", "lunghi", "lunghe"]);
    expect(forms("stanco")).toEqual(["stanco", "stanca", "stanchi", "stanche"]);
  });

  it("soft plurals come from the m_pl column; the feminine stays hard", () => {
    expect(forms("simpatico")).toEqual(["simpatico", "simpatica", "simpatici", "simpatiche"]);
    expect(forms("economico")).toEqual(["economico", "economica", "economici", "economiche"]);
  });

  it("-io: no double i, and grigio keeps the i in the feminine plural", () => {
    expect(forms("vecchio")).toEqual(["vecchio", "vecchia", "vecchi", "vecchie"]);
    expect(forms("grigio")).toEqual(["grigio", "grigia", "grigi", "grigie"]);
    expect(forms("serio")).toEqual(["serio", "seria", "seri", "serie"]);
  });

  it("-cio/-gio after a consonant drops the i in the feminine plural (liscio → lisce)", () => {
    expect(Object.values(adjectiveForms({ adjective: "liscio" }))).toEqual(["liscio", "liscia", "lisci", "lisce"]);
  });
});

describe("cards", () => {
  const pairs = (base) => adjectiveCards(adj(base)).map((c) => `${c.it} = ${c.en}`);

  it("-o adjectives: base form and three more forms", () => {
    expect(pairs("rosso")).toEqual(["rosso = red", "rossa = red (f. sing.)", "rossi = red (m. pl.)", "rosse = red (f. pl.)"]);
  });

  it("-e adjectives: base form and plural", () => {
    expect(pairs("grande")).toEqual(["grande = big", "grandi = big (pl.)"]);
  });

  it("invariable adjectives: only the base form", () => {
    expect(pairs("blu")).toEqual(["blu = blue (dark)"]);
  });

  it("forms that are the same word share one card, so the page colours them alike", () => {
    expect(adjectiveCardId(adj("grande"), "msg")).toBe(adjectiveCardId(adj("grande"), "fsg"));
    expect(adjectiveCardId(adj("grande"), "mpl")).toBe(adjectiveCardId(adj("grande"), "fpl"));
    expect(new Set(["msg", "fsg", "mpl", "fpl"].map((f) => adjectiveCardId(adj("blu"), f))).size).toBe(1);
  });

  it("every card has a cell on the page (the page builds cell ids with adjectiveCardId)", () => {
    const onPage = new Set(adjectives.flatMap((a) => ["msg", "fsg", "mpl", "fpl"].map((f) => adjectiveCardId(a, f))));
    for (const c of allAdjectiveCards()) expect(onPage.has(c.id), c.id).toBe(true);
  });

  it("have unique ids", () => {
    const ids = allAdjectiveCards().map((c) => c.id);
    expect(ids.filter((x, i) => ids.indexOf(x) !== i)).toEqual([]);
  });
});

describe("dictionary/adjectives.csv", () => {
  const COLUMNS = ["topic", "adjective", "english", "invariable", "m_pl", "f_pl", "note"];

  it("has the expected columns and one field per column", () => {
    const [header, ...rows] = parseRows(ADJECTIVES_CSV);
    expect(header).toEqual(COLUMNS);
    for (const r of rows) expect(r.length, `row "${r[1]}" has ${r.length} fields`).toBe(COLUMNS.length);
  });

  it.each(adjectives.map((a) => [a.adjective, a]))("%s is valid", (_, a) => {
    expect(ADJECTIVE_PAGES.map((p) => p.id), `unknown topic "${a.topic}"`).toContain(a.topic);
    expect(a.adjective).toMatch(/^[a-z]+$/);
    expect(a.english.trim()).not.toBe("");
    expect(["", "yes"]).toContain(a.invariable);
    if (a.invariable !== "yes") expect(a.adjective, "must end in -o or -e, or be invariable").toMatch(/[oe]$/);
    for (const col of ["m_pl", "f_pl"]) if (a[col]) expect(a[col]).toMatch(/^[a-z]+$/);
    const singles = a.note.replace(/\*\*/g, "").split("*").length - 1;
    expect(a.note.split("**").length % 2, "unbalanced ** in note").toBe(1);
    expect(singles % 2, "unbalanced * in note").toBe(0);
  });

  it("has no duplicate adjectives or English meanings", () => {
    for (const key of ["adjective", "english"]) {
      const values = adjectives.map((a) => a[key]);
      expect(values.filter((v, i) => values.indexOf(v) !== i), key).toEqual([]);
    }
  });

  it("every subpage has adjectives", () => {
    for (const p of ADJECTIVE_PAGES) expect(adjectives.some((a) => a.topic === p.id), p.id).toBe(true);
  });
});
