// Tests for the Basics (dictionary/basics.csv and src/basics.js).
import { describe, it, expect } from "vitest";
import { TOPICS, BASICS_PAGES, BASICS_CSV, PRONOUNS_CSV, basicsRows, pronounRows, basicsCards, topicCards } from "../src/basics.js";
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

  it("has no duplicate Italian words or phrases within a topic", () => {
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
    for (const r of rows) expect(r.english, r.italian).toMatch(/^(di|a|da|in|su) \+ (il|lo|l'|la|i|gli|le) = \S.*$/);
    const form = (build) => rows.find((r) => r.english.startsWith(`${build} = `))?.italian;
    expect(form("di + il")).toBe("del");
    expect(form("a + lo")).toBe("allo");
    expect(form("da + la")).toBe("dalla");
    expect(form("in + gli")).toBe("negli");
    expect(form("su + l'")).toBe("sull'");
    expect(form("in + le")).toBe("nelle");
    expect(pair("articulated")).toContain("del = di + il = of the");
    expect(pair("articulated")).toContain("dalla = da + la = from the");
  });

  it("days of the week and months, in order", () => {
    expect(pair("days").slice(0, 7)).toEqual([
      "lunedì = Monday", "martedì = Tuesday", "mercoledì = Wednesday", "giovedì = Thursday",
      "venerdì = Friday", "sabato = Saturday", "domenica = Sunday",
    ]);
    expect(pair("months").map((p) => p.split(" = ")[1])).toEqual([
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ]);
  });

  it("some, all and none: indefinite words on the Small words subpage", () => {
    expect(pair("indefinites")).toContain("qualcosa = something, anything");
    expect(pair("indefinites")).toContain("nessuno = nobody, no one");
    expect(BASICS_PAGES.find((p) => p.id === "small-words").topics).toContain("indefinites");
  });

  it("place words show the small word they take before a noun", () => {
    expect(pair("place")).toContain("davanti (a) = in front (of)");
    expect(pair("place")).toContain("lontano (da) = far (from)");
    expect(pair("place")).toContain("fuori (di) = outside, out (of)");
    expect(BASICS_PAGES.find((p) => p.id === "prepositions").topics).toEqual(["prepositions", "articulated", "place"]);
  });

  it("numbers have digits on the other side, from zero to a million", () => {
    for (const r of basicsRows.filter((x) => x.topic === "numbers")) expect(r.english).toMatch(/^\d+$/);
    expect(pair("numbers")).toContain("diciassette = 17");
    const values = basicsRows.filter((x) => x.topic === "numbers").map((r) => Number(r.english));
    expect(values).toEqual([...values].sort((a, b) => a - b)); // in ascending order
    expect(pair("numbers").at(-1)).toBe("un milione = 1000000");
  });

  it("ordinal numbers, seasons and units of time", () => {
    expect(pair("ordinals").slice(0, 3)).toEqual(["primo = first (1st)", "secondo = second (2nd)", "terzo = third (3rd)"]);
    expect(pair("ordinals")).toContain("undicesimo = eleventh (11th)");
    expect(pair("seasons")).toEqual(["la primavera = spring", "l'estate = summer", "l'autunno = autumn", "l'inverno = winter"]);
    expect(pair("time-units")).toContain("fa = ago");
    expect(pair("time-units")).toContain("la settimana = week");
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

describe("dictionary/pronouns.csv", () => {
  const COLUMNS = ["topic", "pronoun", "meaning", "italian", "english", "note"];

  it("has the expected columns and one field per column", () => {
    const [header, ...rows] = parseRows(PRONOUNS_CSV);
    expect(header).toEqual(COLUMNS);
    for (const r of rows) expect(r.length, `row "${r[3]}" has ${r.length} fields`).toBe(COLUMNS.length);
  });

  it("uses only pronoun topics, and every pronoun row has a pronoun and its meaning", () => {
    const pronounTopics = TOPICS.filter((t) => t.pronouns).map((t) => t.id);
    for (const r of pronounRows) {
      expect(pronounTopics, `${r.italian}: topic "${r.topic}"`).toContain(r.topic);
      expect(r.pronoun.trim(), r.italian).not.toBe("");
      expect(r.meaning.trim(), r.italian).not.toBe("");
    }
    for (const t of pronounTopics) expect(pronounRows.some((r) => r.topic === t), t).toBe(true);
  });

  it("each example phrase contains its pronoun (glielo, me ne, ... as written)", () => {
    for (const r of pronounRows) {
      const words = r.italian.toLowerCase().replace(/[?!.]/g, "").split(/\s+/);
      const pron = r.pronoun.toLowerCase();
      expect(words.join(" ").includes(pron), `"${r.italian}" doesn't contain "${r.pronoun}"`).toBe(true);
    }
  });

  it("example cards", () => {
    expect(pair("direct")).toContain("lo vedo = I see him");
    expect(pair("indirect")).toContain("mi piace = I like it");
    expect(pair("reflexive")).toContain("mi chiamo = my name is");
    expect(pair("stressed")).toContain("con me = with me");
  });

  it("the pronouns are on the Pronouns subpage", () => {
    const page = (id) => BASICS_PAGES.find((p) => p.id === id).topics;
    expect(page("pronouns")).toEqual(["pronouns", "direct", "indirect", "reflexive", "stressed", "possessives"]);
  });
});
