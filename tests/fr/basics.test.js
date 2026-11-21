// Tests for the French Basics (dictionary/fr/basics.csv, src/lang/fr/basics.js).
// Expected forms are written from French grammar, not copied from the code.
import { describe, it, expect } from "vitest";
import { BASICS_CSV, TOPICS, BASICS_PAGES, BASICS_DIFFICULTY_TOPICS, basicsRows, basicsCards, topicCards } from "../../src/lang/fr/basics.js";
import { expectCsvShape, expectNoteMarkdown } from "../helpers.js";

const rowsOf = (topic) => basicsRows.filter((r) => r.topic === topic);
const french = (topic) => rowsOf(topic).map((r) => r.french);
const english = (topic, f) => rowsOf(topic).find((r) => r.french === f).english;

describe("dictionary/fr/basics.csv", () => {
  it("has the expected columns and one field per column", () => {
    expectCsvShape(BASICS_CSV, ["topic", "french", "english", "note"]);
  });

  it.each(basicsRows.map((r) => [`${r.topic}: ${r.french}`, r]))("%s is valid", (_, r) => {
    expect(TOPICS.some((t) => t.id === r.topic), `unknown topic ${r.topic}`).toBe(true);
    expect(r.french).toMatch(/\S/);
    expect(r.english).toMatch(/\S/);
    expectNoteMarkdown(r.note);
    // French typography: a no-break space before ? and !, never a plain space or none.
    expect(r.french, "space before ? or !").not.toMatch(/( |[^\u00a0])[?!]/);
  });

  it("has no word twice within a topic, nor twice with the same meaning", () => {
    const keys = basicsRows.map((r) => `${r.topic}.${r.french}`);
    expect(keys.filter((k, i) => keys.indexOf(k) !== i)).toEqual([]);
    const meanings = basicsRows.map((r) => `${r.french} = ${r.english}`);
    expect(meanings.filter((k, i) => meanings.indexOf(k) !== i)).toEqual([]);
  });

  it("a word in two topics with different meanings mentions the other meaning in its note", () => {
    for (const r of basicsRows) {
      for (const other of basicsRows.filter((o) => o.french === r.french && o.english !== r.english)) {
        const meaning = other.english.split(/[,;(]/)[0].trim();
        expect(r.note, `${r.topic}: ${r.french} should mention *${meaning}* (${other.topic})`).toContain(meaning);
      }
    }
  });
});

describe("topics, subpages and difficulties", () => {
  it("every topic has cards and is on exactly one subpage", () => {
    for (const t of TOPICS) {
      expect(topicCards(t).length, t.id).toBeGreaterThan(0);
      expect(BASICS_PAGES.filter((p) => p.topics.includes(t.id)).length, t.id).toBe(1);
    }
  });

  it("difficulties name real topics, and each level includes the one before", () => {
    const ids = TOPICS.map((t) => t.id);
    const { beginner, intermediate } = BASICS_DIFFICULTY_TOPICS;
    for (const t of [...beginner, ...intermediate]) expect(ids).toContain(t);
    for (const t of beginner) expect(intermediate).toContain(t);
  });

  it("être and avoir come from the verbs, sharing their cards", () => {
    const forms = (id) => topicCards(TOPICS.find((t) => t.id === id)).map((c) => c.it);
    expect(forms("etre")).toEqual(["je suis", "tu es", "il/elle est", "nous sommes", "vous êtes", "ils/elles sont"]);
    expect(forms("avoir")).toEqual(["j'ai", "tu as", "il/elle a", "nous avons", "vous avez", "ils/elles ont"]);
    expect(topicCards(TOPICS.find((t) => t.id === "etre"))[0].id).toBe("être.present.0");
    expect(basicsCards().length).toBe(basicsRows.length + 12);
  });
});

describe("French grammar", () => {
  it("subject pronouns", () => {
    expect(french("pronouns")).toEqual(expect.arrayContaining(["je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles"]));
  });

  it("articles: le (m), la (f), l' before a vowel, les; un, une, des", () => {
    for (const r of rowsOf("definite")) {
      const [article, noun] = r.french.split(/(?<=')|\s/);
      if (/^[aeiouéh]/.test(noun)) expect(article, r.french).toBe("l'");
      else if (r.french.startsWith("les ")) expect(r.english, r.french).toMatch(/s$/);
      else expect(["le", "la"]).toContain(article);
    }
    expect(english("indefinite", "un livre")).toBe("a book");
    expect(english("indefinite", "une table")).toBe("a table");
  });

  it("partitive: du (m), de la (f), de l' before a vowel, des; de after a negative", () => {
    expect(french("partitive")).toEqual(["du pain", "de la confiture", "de l'eau", "des pâtes", "pas de pain"]);
  });

  it("à and de merge with le and les only", () => {
    const expected = { au: "à + le", aux: "à + les", du: "de + le", des: "de + les" };
    for (const r of rowsOf("contractions")) expect(r.english.split(" = ")[0], r.french).toBe(expected[r.french]);
  });

  it("the negation goes around the verb: ne … pas, jamais, rien, plus, personne", () => {
    for (const w of ["pas", "jamais", "rien", "plus", "personne"]) expect(french("yes-no")).toContain(`ne … ${w}`);
  });

  it("possessives agree with the thing owned", () => {
    expect(french("possessives")).toEqual(["mon", "ma", "mes", "ton", "ta", "tes", "son", "sa", "ses", "notre", "nos", "votre", "vos", "leur", "leurs"]);
  });

  // A small reader for French number words, from the rules: units and teens,
  // tens, "et un", hyphens, soixante-dix (60 + 10), quatre-vingts (4 × 20).
  const UNITS = { "zéro": 0, un: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9, dix: 10,
    onze: 11, douze: 12, treize: 13, quatorze: 14, quinze: 15, seize: 16 };
  const TENS = { vingt: 20, trente: 30, quarante: 40, cinquante: 50, soixante: 60 };
  function value(words) {
    if (words === "un million") return 1_000_000;
    if (words === "cent") return 100;
    if (words === "mille") return 1000;
    const parts = words.replace(/ et /g, "-").split("-");
    if (parts[0] === "quatre" && /^vingts?$/.test(parts[1])) return 80 + (parts.length > 2 ? value(parts.slice(2).join("-")) : 0);
    if (parts.length === 1) return UNITS[parts[0]] ?? TENS[parts[0]];
    if (parts[0] in TENS) return TENS[parts[0]] + value(parts.slice(1).join("-"));
    return parts.reduce((sum, p) => sum + UNITS[p], 0); // dix-sept = 10 + 7
  }

  it("numbers: each word says its digits (soixante-dix, quatre-vingts, vingt et un)", () => {
    expect(value("quatre-vingt-dix")).toBe(90); // the reader itself
    expect(value("soixante et onze")).toBe(71);
    for (const r of rowsOf("numbers")) expect(value(r.french), r.french).toBe(Number(r.english));
  });

  it("ordinals: the number without its final e + -ième; premier, cinquième, neuvième", () => {
    const word = Object.fromEntries(rowsOf("numbers").map((r) => [Number(r.english), r.french]));
    for (const r of rowsOf("ordinals")) {
      const n = Number(r.english.match(/\((\d+)/)[1]);
      const special = { 1: "premier", 5: "cinquième", 9: "neuvième" }[n];
      expect(r.french, `${n}`).toBe(special ?? word[n].replace(/e$/, "") + "ième");
    }
  });

  it("telling the time", () => {
    expect(english("clock", "trois heures et demie")).toContain("3:30");
    expect(english("clock", "quatre heures moins le quart")).toContain("3:45");
  });

  it("days and months, in lower case and in order", () => {
    expect(french("days")).toEqual(["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]);
    expect(french("months")).toHaveLength(12);
    for (const m of french("months")) expect(m).toMatch(/^[a-zéû]/);
  });
});
