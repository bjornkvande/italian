// Tests for the difficulty levels (src/levels.js).
import { describe, it, expect } from "vitest";
import { LEVELS, DEFAULT_LEVEL, STORAGE_KEY, cardsForLevel, loadLevel, saveLevel } from "../src/levels.js";
import { verbs } from "../src/csv.js";
import { cardsFor } from "../src/conjugate.js";
import { basicsCards } from "../src/basics.js";

const all = verbs.flatMap(cardsFor);
const basics = basicsCards();
const decks = { verbs: all, basics };
const tensesIn = (cards) => [...new Set(cards.map((c) => c.tenseKey))].sort();

function fakeStorage(initial = {}) {
  const items = { ...initial };
  return { items, getItem: (k) => (k in items ? items[k] : null), setItem: (k, v) => { items[k] = String(v); } };
}

describe("cards per level", () => {
  it("beginner: only infinitives, one per verb", () => {
    const cards = cardsForLevel(decks, "beginner");
    expect(tensesIn(cards)).toEqual(["infinito"]);
    expect(cards).toHaveLength(verbs.length);
    expect(cards.find((c) => c.it === "parlare").en).toBe("to speak");
  });

  it("intermediate: infinitives and presente for every person", () => {
    const cards = cardsForLevel(decks, "intermediate");
    expect(tensesIn(cards)).toEqual(["infinito", "presente"]);
    const parlare = cards.filter((c) => c.id.startsWith("parlare."));
    expect(parlare.map((c) => c.it)).toEqual([
      "parlare", "io parlo", "tu parli", "lui/lei parla", "noi parliamo", "voi parlate", "loro parlano",
    ]);
  });

  it("advanced: every card", () => {
    expect(cardsForLevel(decks, "advanced")).toEqual(all);
    expect(tensesIn(all)).toEqual(["condizionale", "futuro", "imperativo", "imperfetto", "infinito", "passato", "presente"]);
  });

  it("each verb level includes the one below it", () => {
    const verbLevels = LEVELS.filter((l) => l.group === "verbs");
    expect(verbLevels.map((l) => l.id)).toEqual(["beginner", "intermediate", "advanced"]);
    for (let i = 1; i < verbLevels.length; i++) {
      const lower = new Set(cardsForLevel(decks, verbLevels[i - 1].id).map((c) => c.id));
      const higher = new Set(cardsForLevel(decks, verbLevels[i].id).map((c) => c.id));
      for (const id of lower) expect(higher.has(id), `${id} missing from ${verbLevels[i].id}`).toBe(true);
    }
  });

  it("basics: only the Basics cards, and they come first in the menu", () => {
    expect(cardsForLevel(decks, "basics")).toBe(basics);
    expect(LEVELS[0].id).toBe("basics");
  });

  it("irregular verbs appear at every level, with the right tenses", () => {
    const irregular = (level) => cardsForLevel(decks, level).filter((c) => c.id.split(".")[0] === "essere" || c.id.startsWith("andare."));
    expect(irregular("beginner").map((c) => `${c.it} = ${c.en}`)).toEqual(["essere = to be", "andare = to go"]);
    expect(irregular("intermediate").map((c) => c.it)).toEqual([
      "essere", "io sono", "tu sei", "lui/lei è", "noi siamo", "voi siete", "loro sono",
      "andare", "io vado", "tu vai", "lui/lei va", "noi andiamo", "voi andate", "loro vanno",
    ]);
    expect(tensesIn(irregular("advanced"))).toEqual(tensesIn(all));

    const irregularVerbs = verbs.filter((v) => v.group === "irregular").map((v) => v.infinitive);
    for (const level of ["beginner", "intermediate", "advanced"]) {
      const verbsInLevel = new Set(cardsForLevel(decks, level).map((c) => c.id.split(".")[0]));
      for (const v of irregularVerbs) expect(verbsInLevel.has(v), `${v} missing from ${level}`).toBe(true);
    }
  });

  it("an unknown level falls back to the default", () => {
    expect(cardsForLevel(decks, "expert")).toEqual(cardsForLevel(decks, DEFAULT_LEVEL));
  });
});

describe("remembering the level", () => {
  it("starts at the default level", () => {
    expect(loadLevel(fakeStorage())).toBe("beginner");
  });

  it("saves and loads the chosen level", () => {
    const storage = fakeStorage();
    saveLevel("intermediate", storage);
    expect(storage.items[STORAGE_KEY]).toBe("intermediate");
    expect(loadLevel(storage)).toBe("intermediate");
  });

  it("ignores an unknown saved level and refuses to save one", () => {
    expect(loadLevel(fakeStorage({ [STORAGE_KEY]: "expert" }))).toBe(DEFAULT_LEVEL);
    expect(() => saveLevel("expert", fakeStorage())).toThrow();
  });

  it("works when storage is blocked", () => {
    const blocked = { getItem: () => { throw new Error(); }, setItem: () => { throw new Error(); } };
    expect(loadLevel(blocked)).toBe(DEFAULT_LEVEL);
    expect(() => saveLevel("advanced", blocked)).not.toThrow();
  });
});
