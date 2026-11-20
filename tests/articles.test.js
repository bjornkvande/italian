// Tests for the article rules (src/articles.js) and the Articles examples
// (dictionary/articles.csv). Expected articles are written from grammar.
import { describe, it, expect } from "vitest";
import { definiteArticle, indefiniteArticle, partitiveArticle, withArticle } from "../src/articles.js";
import { ARTICLES_CSV, articleRows, BASICS_PAGES, topicCards, TOPICS } from "../src/basics.js";
import { parseRows } from "../src/csv.js";

describe("the: il, lo, l', la, i, gli, le", () => {
  it.each([
    ["libro", "m", "sg", "il"], ["zaino", "m", "sg", "lo"], ["studente", "m", "sg", "lo"], ["gnocco", "m", "sg", "lo"],
    ["psicologo", "m", "sg", "lo"], ["yogurt", "m", "sg", "lo"], ["amico", "m", "sg", "l'"], ["hotel", "m", "sg", "l'"],
    ["sport", "m", "sg", "lo"], ["sale", "m", "sg", "il"],
    ["casa", "f", "sg", "la"], ["amica", "f", "sg", "l'"], ["scuola", "f", "sg", "la"],
    ["libri", "m", "pl", "i"], ["zaini", "m", "pl", "gli"], ["studenti", "m", "pl", "gli"], ["amici", "m", "pl", "gli"],
    ["case", "f", "pl", "le"], ["amiche", "f", "pl", "le"],
  ])("%s (%s, %s) → %s", (noun, gender, number, expected) => {
    expect(definiteArticle(noun, gender, number)).toBe(expected);
  });
});

describe("a, an: un, uno, una, un'", () => {
  it.each([
    ["libro", "m", "un"], ["amico", "m", "un"], ["studente", "m", "uno"], ["zio", "m", "uno"],
    ["casa", "f", "una"], ["amica", "f", "un'"], ["scuola", "f", "una"],
  ])("%s (%s) → %s", (noun, gender, expected) => {
    expect(indefiniteArticle(noun, gender)).toBe(expected);
  });
});

describe("some: di + the", () => {
  it.each([
    ["pane", "m", "sg", "del"], ["zucchero", "m", "sg", "dello"], ["olio", "m", "sg", "dell'"], ["acqua", "f", "sg", "dell'"],
    ["pasta", "f", "sg", "della"], ["biscotti", "m", "pl", "dei"], ["spaghetti", "m", "pl", "degli"], ["mele", "f", "pl", "delle"],
  ])("%s (%s, %s) → %s", (noun, gender, number, expected) => {
    expect(partitiveArticle(noun, gender, number)).toBe(expected);
  });
});

describe("writing article + noun", () => {
  it("no space after an apostrophe", () => {
    expect(withArticle("l'", "amico")).toBe("l'amico");
    expect(withArticle("un'", "amica")).toBe("un'amica");
    expect(withArticle("il", "libro")).toBe("il libro");
  });
});

describe("dictionary/articles.csv", () => {
  const COLUMNS = ["topic", "italian", "english", "noun", "gender", "number", "note"];
  const ARTICLE = { definite: definiteArticle, indefinite: indefiniteArticle, partitive: partitiveArticle };

  it("has the expected columns and one field per column", () => {
    const [header, ...rows] = parseRows(ARTICLES_CSV);
    expect(header).toEqual(COLUMNS);
    for (const r of rows) expect(r.length, `row "${r[1]}" has ${r.length} fields`).toBe(COLUMNS.length);
  });

  it.each(articleRows.map((r) => [r.italian, r]))("%s has the right article by the rules", (_, r) => {
    expect(Object.keys(ARTICLE)).toContain(r.topic);
    expect(["m", "f"]).toContain(r.gender);
    expect(["sg", "pl"]).toContain(r.number);
    if (r.topic === "indefinite") expect(r.number, "a/an is singular only").toBe("sg");
    expect(r.italian).toBe(withArticle(ARTICLE[r.topic](r.noun, r.gender, r.number), r.noun));
  });

  it("on the Articles subpage of the Basics, with headings and an intro per section", () => {
    expect(BASICS_PAGES.find((p) => p.id === "articles").topics).toEqual(["definite", "indefinite", "partitive"]);
    for (const id of ["definite", "indefinite", "partitive"]) {
      const t = TOPICS.find((x) => x.id === id);
      expect([t.kind, t.intro.length > 0]).toEqual(["Article", true]);
    }
    const card = topicCards(TOPICS.find((t) => t.id === "definite")).find((c) => c.it === "lo zaino");
    expect([card.en, card.kind, card.tense]).toEqual(["the backpack", "Article", "Article · the"]);
  });
});
