// Tests for the German Basics (dictionary/de/basics.csv, src/lang/de/basics.js).
// Expected forms are written from German grammar, not copied from the code.
import { describe, it, expect } from "vitest";
import { BASICS_CSV, TOPICS, BASICS_PAGES, BASICS_DIFFICULTY_TOPICS, basicsRows, basicsCards, topicCards } from "../../src/lang/de/basics.js";
import { expectCsvShape, expectNoteMarkdown } from "../helpers.js";

const rowsOf = (topic) => basicsRows.filter((r) => r.topic === topic);
const german = (topic) => rowsOf(topic).map((r) => r.german);
const pair = (topic) => rowsOf(topic).map((r) => `${r.german} = ${r.english}`);

describe("dictionary/de/basics.csv", () => {
  it("has the expected columns and one field per column", () => {
    expectCsvShape(BASICS_CSV, ["topic", "german", "english", "note"]);
  });

  it.each(basicsRows.map((r) => [`${r.topic}: ${r.german}`, r]))("%s is valid", (_, r) => {
    expect(TOPICS.some((t) => t.id === r.topic), `unknown topic ${r.topic}`).toBe(true);
    expect(r.german).toMatch(/\S/);
    expect(r.english).toMatch(/\S/);
    expectNoteMarkdown(r.note);
  });

  it("has no duplicate words within a topic, and no word twice with the same meaning", () => {
    const keys = basicsRows.map((r) => `${r.topic}.${r.german}`);
    expect(keys.filter((k, i) => keys.indexOf(k) !== i)).toEqual([]);
    const meanings = basicsRows.map((r) => `${r.german} = ${r.english}`);
    expect(meanings.filter((k, i) => meanings.indexOf(k) !== i)).toEqual([]);
  });

  it("a word in two topics with different meanings mentions the other meaning in its note", () => {
    for (const r of basicsRows) {
      for (const other of basicsRows.filter((o) => o.german === r.german && o.english !== r.english)) {
        const meaning = other.english.split(/[,;(]/)[0].trim();
        expect(r.note, `${r.topic}: ${r.german} should mention *${meaning}* (${other.topic})`).toContain(meaning);
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

  it("cards follow the topics, with the German on the `it` side", () => {
    const cards = basicsCards();
    expect(cards.length).toBe(basicsRows.length + 12); // + the Präsens of sein and haben
    expect(cards[0]).toEqual({ id: "basics.pronouns.ich", form: "basics", kind: "Pronoun", heading: "Pronoun · subject", it: "ich", en: "I" });
  });
});

describe("German grammar", () => {
  it("subject pronouns: all persons, with the polite Sie", () => {
    expect(german("pronouns")).toEqual(expect.arrayContaining(["ich", "du", "er", "sie", "es", "wir", "ihr", "Sie"]));
  });

  it("sein and haben in the present, shared with the verb cards", () => {
    const forms = (verb) => topicCards(TOPICS.find((t) => t.id === verb)).map((c) => c.it);
    expect(forms("sein")).toEqual(["ich bin", "du bist", "er/sie/es ist", "wir sind", "ihr seid", "sie sind"]);
    expect(forms("haben")).toEqual(["ich habe", "du hast", "er/sie/es hat", "wir haben", "ihr habt", "sie haben"]);
    expect(topicCards(TOPICS.find((t) => t.id === "sein"))[0].id).toBe("sein.praesens.0");
  });

  it("nominative articles: der (m), die (f), das (n), die (plural)", () => {
    expect(pair("definite").slice(0, 4)).toEqual(["der Mann = the man", "die Frau = the woman", "das Kind = the child", "die Kinder = the children"]);
    expect(pair("indefinite")).toEqual(expect.arrayContaining(["ein Mann = a man", "eine Frau = a woman", "ein Kind = a child", "keine Kinder = no children"]));
  });

  it("accusative: only the masculine changes (den, einen, keinen)", () => {
    for (const r of rowsOf("accusative")) expect(r.german, r.german).toMatch(/^(den|einen|keinen) /);
  });

  it("dative: dem (m/n), der (f), den + -n (plural), einem, einer", () => {
    const allowed = { "dem Mann": 1, "der Frau": 1, "dem Kind": 1, "den Kindern": 1, "einem Mann": 1, "einer Frau": 1, "einem Kind": 1 };
    for (const g of german("dative")) expect(allowed, g).toHaveProperty(g);
  });

  it("preposition + article contractions", () => {
    const expected = { im: "in dem", am: "an dem", zum: "zu dem", zur: "zu der", ins: "in das", vom: "von dem", beim: "bei dem", ans: "an das", aufs: "auf das" };
    for (const r of rowsOf("contractions")) expect(r.english.split(" = ")[0], r.german).toBe(expected[r.german]);
  });

  it("prepositions are in the right case group", () => {
    expect(german("prep-acc")).toEqual(expect.arrayContaining(["für", "ohne", "durch", "um", "gegen"]));
    expect(german("prep-dat")).toEqual(expect.arrayContaining(["mit", "von", "zu", "bei", "nach", "aus", "seit"]));
    expect(german("prep-two")).toEqual(["in", "auf", "an", "über", "unter", "vor", "hinter", "neben", "zwischen"]);
  });

  // A small reader for German number words, from the rules: units, -zehn,
  // -zig (dreißig), ones before tens joined by "und", hundert, tausend.
  const UNITS = { null: 0, eins: 1, ein: 1, eine: 1, zwei: 2, drei: 3, vier: 4, fünf: 5, sechs: 6, sieben: 7, acht: 8, neun: 9 };
  const TENS = { zwanzig: 20, dreißig: 30, vierzig: 40, fünfzig: 50, sechzig: 60, siebzig: 70, achtzig: 80, neunzig: 90 };
  const TEENS = { zehn: 10, elf: 11, zwölf: 12, dreizehn: 13, vierzehn: 14, fünfzehn: 15, sechzehn: 16, siebzehn: 17, achtzehn: 18, neunzehn: 19 };
  function below100(w) {
    if (w === "") return 0;
    if (w in UNITS) return UNITS[w];
    if (w in TEENS) return TEENS[w];
    if (w in TENS) return TENS[w];
    const [ones, tens] = w.split("und");
    return UNITS[ones] + TENS[tens];
  }
  function value(word) {
    if (word === "eine Million") return 1_000_000;
    const [th, rest1] = word.includes("tausend") ? word.split("tausend") : ["", word];
    const [hu, rest2] = rest1.includes("hundert") ? rest1.split("hundert") : ["", rest1];
    return (word.includes("tausend") ? (below100(th) || 1) * 1000 : 0) +
      (rest1.includes("hundert") ? (below100(hu) || 1) * 100 : 0) + below100(rest2);
  }

  it("numbers: each word says its digits (ones before tens, sechzehn, siebzig, dreißig)", () => {
    expect(value("einundzwanzig")).toBe(21); // the reader itself
    expect(value("zweitausendsechsundzwanzig")).toBe(2026);
    for (const r of rowsOf("numbers")) expect(value(r.german), r.german).toBe(Number(r.english));
  });

  it("ordinals: the number + -te up to 19 (-e after a t: achte), + -ste from 20; erste, dritte, siebte", () => {
    const word = Object.fromEntries(rowsOf("numbers").map((r) => [Number(r.english), r.german]));
    const irregular = { 1: "erste", 3: "dritte", 7: "siebte" };
    for (const r of rowsOf("ordinals")) {
      const n = Number(r.english.match(/\((\d+)/)[1]);
      const cardinal = word[n];
      const expected = irregular[n] ?? (n >= 20 ? cardinal + "ste" : cardinal.endsWith("t") ? cardinal + "e" : cardinal + "te");
      expect(r.german, `${n}`).toBe(expected);
    }
  });

  it("telling the time: halb counts towards the next hour", () => {
    expect(rowsOf("clock").find((r) => r.german === "halb vier").english).toContain("3:30");
    expect(rowsOf("clock").find((r) => r.german === "Viertel vor vier").english).toContain("3:45");
  });

  it("seven days and twelve months, in order", () => {
    expect(german("days")).toEqual(["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]);
    expect(german("months")).toHaveLength(12);
    expect(german("months")[0]).toBe("Januar");
  });
});
