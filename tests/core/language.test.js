// Tests for the languages (src/core/language.js and src/lang/*/language.js).
import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { LANGUAGES, LANGUAGE_KEY, LANGUAGE, languageFor, chooseLanguage, storageKey } from "../../src/core/language.js";
import { STORAGE_KEY as RATINGS_KEY } from "../../src/core/ratings.js";
import { STORAGE_KEY as BAGS_KEY } from "../../src/core/bag.js";
import { STORAGE_KEY as DIFFICULTY_KEY, DIFFICULTIES } from "../../src/core/difficulty.js";
import { sectionById } from "../../src/core/nav.js";
import { fakeStorage } from "../helpers.js";

const root = fileURLToPath(new URL("../..", import.meta.url));
const [italian, german] = LANGUAGES;
const page = (lang) => ({ body: { dataset: { lang } } });

describe("which language is in use", () => {
  it("is the page's own language on a grammar page", () => {
    expect(languageFor(page("de"), fakeStorage({ [LANGUAGE_KEY]: "it" })).code).toBe("de");
    expect(languageFor(page("it"), fakeStorage({ [LANGUAGE_KEY]: "de" })).code).toBe("it");
  });

  it("on the Train screen: the one chosen last, Italian at first", () => {
    const storage = fakeStorage();
    expect(languageFor({ body: { dataset: {} } }, storage).code).toBe("it");
    chooseLanguage("de", storage);
    expect(languageFor({ body: { dataset: {} } }, storage).code).toBe("de");
    expect(storage.items[LANGUAGE_KEY]).toBe("de");
  });

  it("falls back to Italian for an unknown language or blocked storage", () => {
    expect(languageFor(undefined, fakeStorage({ [LANGUAGE_KEY]: "xx" })).code).toBe("it");
    const blocked = { getItem: () => { throw new Error(); }, setItem: () => { throw new Error(); } };
    expect(languageFor(undefined, blocked).code).toBe("it");
    expect(() => chooseLanguage("de", blocked)).not.toThrow();
    expect(() => chooseLanguage("xx", fakeStorage())).toThrow();
  });
});

describe("Italian keeps its storage, so existing ratings stay put", () => {
  it("uses the original keys", () => {
    expect(LANGUAGE).toBe(italian); // the tests run without a page: Italian
    expect(RATINGS_KEY).toBe("verbi.ratings");
    expect(BAGS_KEY).toBe("verbi.bags");
    expect(DIFFICULTY_KEY).toBe("verbi.difficulty");
    expect(sectionById("train").storageKey).toBe("verbi.trainGroup");
    expect(italian.groups.map((g) => g.storageKey)).toEqual([
      "verbi.basicsPage", "verbi.adjectivesPage", "verbi.adverbsPage", "verbi.nounsPage", "verbi.verbPage",
    ]);
  });
});

describe("every language", () => {
  it("has a unique code, storage prefix and folder", () => {
    for (const key of ["code", "prefix", "dir"]) expect(new Set(LANGUAGES.map((l) => l[key])).size, key).toBe(LANGUAGES.length);
  });

  it("keeps its storage apart from the other languages", () => {
    const keysOf = (l) => [...["ratings", "bags", "difficulty", "trainGroup"].map((n) => storageKey(n, l)), ...l.groups.map((g) => g.storageKey)];
    for (const l of LANGUAGES) for (const k of keysOf(l)) expect(k.startsWith(l.prefix), k).toBe(true);
    expect(keysOf(german).filter((k) => keysOf(italian).includes(k))).toEqual([]);
  });

  it.each(LANGUAGES.map((l) => [l.code, l]))("%s: has a name, a speech language, a flag and grammar pages that exist", (_, l) => {
    expect(l.name).toMatch(/\S/);
    expect(l.speech.startsWith(`${l.code}-`)).toBe(true);
    expect(l.flag).toMatch(/^<rect/);
    for (const g of l.groups) {
      for (const p of g.pages) expect(existsSync(root + l.dir + p.href.split("#")[0]), `${l.dir}${p.href}`).toBe(true);
    }
  });

  it.each(LANGUAGES.map((l) => [l.code, l]))("%s: cards have the shared shape, unique ids, and every difficulty has cards", (_, l) => {
    for (const g of l.groups) {
      const cards = g.cards();
      const ids = cards.map((c) => c.id);
      expect(ids.filter((x, i) => ids.indexOf(x) !== i), g.id).toEqual([]);
      for (const c of cards) {
        for (const key of ["id", "form", "kind", "heading", "it", "en"]) expect(c[key], `${c.id}.${key}`).toMatch(/\S/);
        expect(c.heading.startsWith(c.kind), c.id).toBe(true);
      }
      let previous = 0;
      for (const d of DIFFICULTIES) {
        const { include, description } = g.difficulties[d.id];
        expect(description, `${g.id} ${d.id}`).toMatch(/\S/);
        const n = include ? cards.filter(include).length : cards.length;
        expect(n, `${g.id} ${d.id}`).toBeGreaterThan(previous); // each level adds cards
        previous = n;
      }
    }
  });
});
