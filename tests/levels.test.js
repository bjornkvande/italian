// Tests for the difficulty levels (src/levels.js).
import { describe, it, expect } from "vitest";
import { LEVELS, DEFAULT_LEVEL, STORAGE_KEY, cardsForLevel, loadLevel, saveLevel } from "../src/levels.js";
import { verbs } from "../src/csv.js";
import { cardsFor } from "../src/conjugate.js";

const all = verbs.flatMap(cardsFor);
const tensesIn = (cards) => [...new Set(cards.map((c) => c.tenseKey))].sort();

function fakeStorage(initial = {}) {
  const items = { ...initial };
  return { items, getItem: (k) => (k in items ? items[k] : null), setItem: (k, v) => { items[k] = String(v); } };
}

describe("cards per level", () => {
  it("beginner: only infinitives, one per verb", () => {
    const cards = cardsForLevel(all, "beginner");
    expect(tensesIn(cards)).toEqual(["infinito"]);
    expect(cards).toHaveLength(verbs.length);
    expect(cards.find((c) => c.it === "parlare").en).toBe("to speak");
  });

  it("intermediate: infinitives and presente for every person", () => {
    const cards = cardsForLevel(all, "intermediate");
    expect(tensesIn(cards)).toEqual(["infinito", "presente"]);
    const parlare = cards.filter((c) => c.id.startsWith("parlare."));
    expect(parlare.map((c) => c.it)).toEqual([
      "parlare", "io parlo", "tu parli", "lui/lei parla", "noi parliamo", "voi parlate", "loro parlano",
    ]);
  });

  it("advanced: every card", () => {
    expect(cardsForLevel(all, "advanced")).toEqual(all);
    expect(tensesIn(all)).toEqual(["condizionale", "futuro", "imperativo", "imperfetto", "infinito", "passato", "presente"]);
  });

  it("each level includes the one below it", () => {
    for (let i = 1; i < LEVELS.length; i++) {
      const lower = new Set(cardsForLevel(all, LEVELS[i - 1].id).map((c) => c.id));
      const higher = new Set(cardsForLevel(all, LEVELS[i].id).map((c) => c.id));
      for (const id of lower) expect(higher.has(id), `${id} missing from ${LEVELS[i].id}`).toBe(true);
    }
  });

  it("an unknown level falls back to the default", () => {
    expect(cardsForLevel(all, "expert")).toEqual(cardsForLevel(all, DEFAULT_LEVEL));
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
