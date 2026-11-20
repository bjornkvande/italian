// Tests for the Basics (dictionary/basics.csv and src/basics.js).
import { describe, it, expect } from "vitest";
import { TOPICS, BASICS_PAGES, BASICS_CSV, basicsRows, basicsCards, topicCards } from "../src/basics.js";
import { parseRows, verbs } from "../src/csv.js";
import { cardsFor } from "../src/conjugate.js";

const topic = (id) => TOPICS.find((t) => t.id === id);
const pair = (id) => topicCards(topic(id)).map((c) => `${c.it} = ${c.en}`);

describe("dictionary/basics.csv", () => {
  it("has the columns topic, italian, english, note and one field per column", () => {
    const [header, ...rows] = parseRows(BASICS_CSV);
    expect(header).toEqual(["topic", "italian", "english", "note"]);
    for (const r of rows) expect(r.length, `row "${r[1]}" has ${r.length} fields`).toBe(4);
  });

  it.each(basicsRows.map((r) => [`${r.topic}: ${r.italian}`, r]))("%s is valid", (_, r) => {
    expect(TOPICS.map((t) => t.id), `unknown topic "${r.topic}"`).toContain(r.topic);
    expect(r.italian.trim()).not.toBe("");
    expect(r.english.trim()).not.toBe("");
    expect(r.italian).toBe(r.italian.trim());
    const singles = r.note.replace(/\*\*/g, "").split("*").length - 1;
    expect(r.note.split("**").length % 2, "unbalanced ** in note").toBe(1);
    expect(singles % 2, "unbalanced * in note").toBe(0);
  });

  it("has no duplicate Italian words within a topic", () => {
    const keys = basicsRows.map((r) => `${r.topic}.${r.italian}`);
    expect(keys.filter((k, i) => keys.indexOf(k) !== i)).toEqual([]);
  });

  it("uses every topic, from the file or from a verb", () => {
    for (const t of TOPICS) expect(topicCards(t).length, t.id).toBeGreaterThan(0);
  });
});

describe("Basics cards", () => {
  const cards = basicsCards();

  it("have unique ids", () => {
    const ids = cards.map((c) => c.id);
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
  });

  it("come in the topic order", () => {
    const order = [...new Set(cards.map((c) => (c.tenseKey === "presente" ? c.id.split(".")[0] : c.id.split(".")[1])))];
    expect(order).toEqual(TOPICS.map((t) => t.id));
  });

  it("take essere and avere from the verb dictionary: the same cards as the verb levels", () => {
    expect(pair("essere").slice(0, 3)).toEqual(["io sono = I am", "tu sei = you are", "lui/lei è = he/she is"]);
    expect(pair("essere")).toContain("c'è = there is");
    expect(pair("avere")[2]).toBe("lui/lei ha = he/she has");
    expect(pair("avere")).toContain("ho fame = I am hungry");

    const essereVerbCards = cardsFor(verbs.find((v) => v.infinitive === "essere"));
    const fromBasics = topicCards(topic("essere"))[0];
    expect(essereVerbCards.find((c) => c.id === fromBasics.id)).toEqual(fromBasics);
  });

  it("pronouns", () => {
    expect(pair("pronouns")).toEqual([
      "io = I", "tu = you", "lui = he", "lei = she", "Lei = you (polite)", "noi = we", "voi = you all", "loro = they",
    ]);
  });

  it("prepositions + article: all five prepositions with all seven articles", () => {
    const rows = basicsRows.filter((r) => r.topic === "articulated");
    expect(rows).toHaveLength(35);
    const form = (english) => rows.find((r) => r.english === english)?.italian;
    expect(form("di + il")).toBe("del");
    expect(form("a + lo")).toBe("allo");
    expect(form("da + la")).toBe("dalla");
    expect(form("in + gli")).toBe("negli");
    expect(form("su + l'")).toBe("sull'");
    expect(form("in + le")).toBe("nelle");
  });

  it("numbers have digits on the other side", () => {
    for (const r of basicsRows.filter((x) => x.topic === "numbers")) expect(r.english).toMatch(/^\d+$/);
    expect(pair("numbers")).toContain("diciassette = 17");
  });
});

describe("Basics subpages", () => {
  it("every topic is on exactly one subpage", () => {
    const placed = BASICS_PAGES.flatMap((p) => p.topics);
    expect([...placed].sort()).toEqual(TOPICS.map((t) => t.id).sort());
  });

  it("have unique ids that work in an address, and a label", () => {
    const ids = BASICS_PAGES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of BASICS_PAGES) {
      expect(p.id).toMatch(/^[a-z-]+$/);
      expect(p.label).toMatch(/\S/);
    }
  });
});
