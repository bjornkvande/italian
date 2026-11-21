// Tests for storing how well each card is known (src/core/ratings.js).
import { describe, it, expect } from "vitest";
import { createRatings, STORAGE_KEY } from "../../src/core/ratings.js";
import { verbs } from "../../src/lang/it/verbs.js";
import { cardsFor } from "../../src/lang/it/conjugate.js";
import { fakeStorage } from "../helpers.js";

// A stand-in for the browser's localStorage.
describe("card ids", () => {
  const cards = verbs.flatMap(cardsFor);

  it("are unique, so ratings never mix between cards", () => {
    const ids = cards.map((c) => c.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(dupes).toEqual([]);
  });

  it("are built from verb, tense and person", () => {
    const parlare = cardsFor(verbs.find((v) => v.infinitive === "parlare"));
    expect(parlare.find((c) => c.it === "tu parli").id).toBe("parlare.presente.1");
    expect(parlare.find((c) => c.it === "(Lei) parli!").id).toBe("parlare.imperativo.2");
  });
});

describe("ratings", () => {
  it("stores a rating per card and per direction", () => {
    const r = createRatings(fakeStorage());
    r.rate("parlare.presente.1", "it-en", 4, 1000);
    r.rate("parlare.presente.1", "en-it", 2, 2000);

    expect(r.get("parlare.presente.1", "it-en")).toEqual({ last: 4, at: 1000, count: 1, history: [[4, 1000]] });
    expect(r.get("parlare.presente.1", "en-it")).toEqual({ last: 2, at: 2000, count: 1, history: [[2, 2000]] });
    expect(r.get("parlare.presente.0", "it-en")).toBeUndefined();
  });

  it("keeps the latest rating, the count and the last 10 ratings", () => {
    const r = createRatings(fakeStorage());
    for (let i = 1; i <= 12; i++) r.rate("x", "it-en", (i % 5) + 1, i);
    const rec = r.get("x", "it-en");
    expect(rec.last).toBe((12 % 5) + 1);
    expect(rec.at).toBe(12);
    expect(rec.count).toBe(12);
    expect(rec.history).toHaveLength(10);
    expect(rec.history[0]).toEqual([(3 % 5) + 1, 3]);
  });

  it("correcting a rating on the same visit replaces it instead of adding one", () => {
    const r = createRatings(fakeStorage());
    r.rate("x", "it-en", 5, 1);          // an earlier visit
    r.rate("x", "it-en", 2, 10);         // this visit
    r.correct("x", "it-en", 3, 11);      // changed my mind
    expect(r.get("x", "it-en")).toEqual({ last: 3, at: 11, count: 2, history: [[5, 1], [3, 11]] });
  });

  it("correcting a card that was never rated just rates it", () => {
    const r = createRatings(fakeStorage());
    r.correct("x", "en-it", 4, 7);
    expect(r.get("x", "en-it")).toEqual({ last: 4, at: 7, count: 1, history: [[4, 7]] });
    expect(() => r.correct("x", "en-it", 9)).toThrow();
  });

  it("two open tabs don't overwrite each other's ratings", () => {
    const storage = fakeStorage();
    const tabA = createRatings(storage);
    const tabB = createRatings(storage); // opened before tab A rates anything
    tabA.rate("parlare.presente.0", "it-en", 4, 1);
    tabB.rate("capire.presente.0", "en-it", 2, 2);
    tabA.correct("parlare.presente.0", "it-en", 5, 3);

    const reloaded = createRatings(storage);
    expect(reloaded.get("parlare.presente.0", "it-en").last).toBe(5);
    expect(reloaded.get("capire.presente.0", "en-it").last).toBe(2);
    expect(tabB.get("parlare.presente.0", "it-en").last).toBe(5); // B sees A's rating
  });

  it("saves to storage and reads it back after a reload", () => {
    const storage = fakeStorage();
    createRatings(storage).rate("capire.passato.0", "en-it", 5, 42);
    expect(JSON.parse(storage.items[STORAGE_KEY]).version).toBe(1);

    const reloaded = createRatings(storage);
    expect(reloaded.get("capire.passato.0", "en-it").last).toBe(5);
  });

  it("rejects invalid ratings and directions instead of storing bad data", () => {
    const r = createRatings(fakeStorage());
    for (const bad of [0, 6, 2.5, "3", null]) expect(() => r.rate("x", "it-en", bad)).toThrow();
    expect(() => r.rate("x", "sideways", 3)).toThrow();
    expect(r.all()).toEqual({});
  });

  it("starts empty when storage holds garbage or an unknown version", () => {
    expect(createRatings(fakeStorage({ [STORAGE_KEY]: "{not json" })).all()).toEqual({});
    expect(createRatings(fakeStorage({ [STORAGE_KEY]: '{"version":99,"cards":{"a|it-en":{}}}' })).all()).toEqual({});
  });

  it("keeps working in memory when storage is blocked", () => {
    const blocked = {
      getItem: () => { throw new Error("blocked"); },
      setItem: () => { throw new Error("blocked"); },
    };
    const r = createRatings(blocked);
    expect(() => r.rate("x", "it-en", 3)).not.toThrow();
    expect(r.get("x", "it-en").last).toBe(3);
  });
});
