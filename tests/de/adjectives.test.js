// Tests for the German adjectives (dictionary/de/adjectives.csv, src/lang/de/adjectives.js)
// and the English comparison (src/core/english.js). Expected forms are written from grammar.
import { describe, it, expect } from "vitest";
import { ADJECTIVES_CSV, ADJECTIVE_PAGES, adjectives, comparative, superlative, adjectiveCards, umlaut } from "../../src/lang/de/adjectives.js";
import { englishComparison } from "../../src/core/english.js";
import { expectCsvShape, expectNoteMarkdown } from "../helpers.js";

const adj = (a) => {
  const row = adjectives.find((x) => x.adjective === a);
  if (!row) throw new Error(`${a} is not in dictionary/de/adjectives.csv`);
  return row;
};
const comparison = (a) => [comparative(adj(a)), superlative(adj(a))];

describe("dictionary/de/adjectives.csv", () => {
  it("has the expected columns and one field per column", () => {
    expectCsvShape(ADJECTIVES_CSV, ["topic", "adjective", "english", "umlaut", "comparative", "superlative", "note"]);
  });

  it.each(adjectives.map((a) => [a.adjective, a]))("%s is valid", (_, a) => {
    expect(ADJECTIVE_PAGES.some((p) => p.id === a.topic && p.id !== "endings"), a.topic).toBe(true);
    expect(["", "yes"]).toContain(a.umlaut);
    expect(a.adjective, "adjectives are written in lower case").toMatch(/^[a-zäöüß]/);
    if (a.umlaut) expect(a.adjective).toMatch(/[aou]/);
    expectNoteMarkdown(a.note);
  });

  it("has no duplicates", () => {
    const names = adjectives.map((a) => a.adjective);
    expect(names.filter((x, i) => names.indexOf(x) !== i)).toEqual([]);
  });
});

describe("comparison", () => {
  it("-er and am -sten", () => {
    expect(comparison("klein")).toEqual(["kleiner", "am kleinsten"]);
    expect(comparison("schnell")).toEqual(["schneller", "am schnellsten"]);
    expect(comparison("billig")).toEqual(["billiger", "am billigsten"]);
  });

  it("am -esten after d, t, s, ß, z, sch", () => {
    expect(comparison("laut")).toEqual(["lauter", "am lautesten"]);
    expect(comparison("heiß")).toEqual(["heißer", "am heißesten"]);
    expect(comparison("frisch")).toEqual(["frischer", "am frischesten"]);
    expect(comparison("gesund")).toEqual(["gesünder", "am gesündesten"]);
  });

  it("an umlaut for many short adjectives", () => {
    expect(umlaut("groß")).toBe("größ");
    expect(comparison("alt")).toEqual(["älter", "am ältesten"]);
    expect(comparison("jung")).toEqual(["jünger", "am jüngsten"]);
    expect(comparison("warm")).toEqual(["wärmer", "am wärmsten"]);
    expect(comparison("kurz")).toEqual(["kürzer", "am kürzesten"]);
  });

  it("-el and -euer/-auer drop an e in the comparative", () => {
    expect(comparison("dunkel")).toEqual(["dunkler", "am dunkelsten"]);
    expect(comparison("teuer")).toEqual(["teurer", "am teuersten"]);
    expect(comparison("sauer")).toEqual(["saurer", "am sauersten"]);
    expect(comparison("müde")).toEqual(["müder", "am müdesten"]);
  });

  it("irregular ones", () => {
    expect(comparison("gut")).toEqual(["besser", "am besten"]);
    expect(comparison("groß")).toEqual(["größer", "am größten"]);
    expect(comparison("hoch")).toEqual(["höher", "am höchsten"]);
    expect(comparison("nah")).toEqual(["näher", "am nächsten"]);
  });

  it("none for colours and absolute adjectives", () => {
    expect(comparison("rot")).toEqual([null, null]);
    expect(comparison("verheiratet")).toEqual([null, null]);
  });
});

describe("English comparison", () => {
  it.each([
    ["big", "bigger", "biggest"], ["hot", "hotter", "hottest"], ["old", "older", "oldest"], ["new", "newer", "newest"],
    ["nice", "nicer", "nicest"], ["free", "freer", "freest"], ["dry", "drier", "driest"], ["happy", "happier", "happiest"],
    ["simple", "simpler", "simplest"], ["good", "better", "best"], ["bad", "worse", "worst"],
    ["interesting", "more interesting", "most interesting"], ["tired", "more tired", "most tired"],
  ])("%s → %s, %s", (word, comp, sup) => {
    expect(englishComparison(word)).toEqual([comp, sup]);
  });
});

describe("cards", () => {
  it("base, comparative and superlative, with the English", () => {
    const pairs = adjectiveCards().filter((c) => c.id.startsWith("adjectives.alt")).map((c) => `${c.it} = ${c.en}`);
    expect(pairs).toEqual(["alt = old", "älter = older", "am ältesten = the oldest"]);
    expect(adjectiveCards().filter((c) => c.id.startsWith("adjectives.rot")).map((c) => c.it)).toEqual(["rot"]);
  });

  it("have unique ids and unique English", () => {
    const cards = adjectiveCards();
    const ids = cards.map((c) => c.id);
    expect(ids.filter((x, i) => ids.indexOf(x) !== i)).toEqual([]);
    const en = cards.map((c) => c.en);
    expect(en.filter((x, i) => en.indexOf(x) !== i)).toEqual([]);
  });
});
