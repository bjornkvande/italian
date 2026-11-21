// Tests for the shuffle bag (src/core/bag.js).
import { describe, it, expect } from "vitest";
import { createBag, shuffle, STORAGE_KEY } from "../../src/core/bag.js";
import { fakeStorage } from "../helpers.js";

const cards = (n) => Array.from({ length: n }, (_, i) => ({ id: `c${i}` }));
const draw = (bag, n) => Array.from({ length: n }, () => bag.next().id);

describe("shuffle bag", () => {
  it("shows every card exactly once per round, then starts a new round", () => {
    const bag = createBag(cards(20), "verbs.beginner", { storage: fakeStorage() });
    const round1 = draw(bag, 20);
    expect(new Set(round1).size).toBe(20);
    expect(bag.left).toBe(0);
    const round2 = draw(bag, 20);
    expect(new Set(round2).size).toBe(20);
    expect([...round1].sort()).toEqual([...round2].sort());
  });

  it("is random: the order differs between rounds", () => {
    const bag = createBag(cards(30), "k", { storage: fakeStorage() });
    expect(draw(bag, 30)).not.toEqual(draw(bag, 30));
  });

  it("never shows the same card twice in a row, also when a new round starts", () => {
    for (let run = 0; run < 50; run++) {
      const bag = createBag(cards(3), "k", { storage: fakeStorage() });
      const seq = draw(bag, 30);
      for (let i = 1; i < seq.length; i++) expect(seq[i], `at ${i}`).not.toBe(seq[i - 1]);
    }
  });

  it("continues the round after a reload, and remembers each group and level separately", () => {
    const storage = fakeStorage();
    const first = createBag(cards(10), "basics.beginner", { storage });
    const seen = draw(first, 4);
    const reloaded = createBag(cards(10), "basics.beginner", { storage });
    expect(reloaded.left).toBe(6);
    const rest = draw(reloaded, 6);
    expect([...seen, ...rest].sort()).toEqual(cards(10).map((c) => c.id).sort());

    const other = createBag(cards(10), "verbs.advanced", { storage });
    expect(other.left).toBe(0); // its own, fresh bag
    expect(JSON.parse(storage.items[STORAGE_KEY])["basics.beginner"]).toEqual([]);
  });

  it("drops saved cards that no longer exist (e.g. removed from the dictionary)", () => {
    const storage = fakeStorage({ [STORAGE_KEY]: JSON.stringify({ k: ["c1", "gone", "c2"] }) });
    const bag = createBag(cards(5), "k", { storage });
    expect(bag.left).toBe(2);
    expect(draw(bag, 2).sort()).toEqual(["c1", "c2"]);
  });

  it("works with one card, no cards, broken data or blocked storage", () => {
    expect(draw(createBag(cards(1), "k", { storage: fakeStorage() }), 3)).toEqual(["c0", "c0", "c0"]);
    expect(createBag([], "k", { storage: fakeStorage() }).next()).toBeNull();
    expect(createBag(cards(3), "k", { storage: fakeStorage({ [STORAGE_KEY]: "{oops" }) }).next()).toBeTruthy();
    const blocked = { getItem: () => { throw new Error(); }, setItem: () => { throw new Error(); } };
    expect(new Set(draw(createBag(cards(5), "k", { storage: blocked }), 5)).size).toBe(5);
  });

  it("shuffle keeps every item exactly once", () => {
    const list = Array.from({ length: 100 }, (_, i) => i);
    const mixed = shuffle(list);
    expect([...mixed].sort((a, b) => a - b)).toEqual(list);
    expect(mixed).not.toEqual(list);
  });
});
