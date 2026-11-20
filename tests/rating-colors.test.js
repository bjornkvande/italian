// Tests for colouring the reference pages by rating (src/rating-colors.js).
import { describe, it, expect } from "vitest";
import { ratingLevels, currentLevels, ratingClass } from "../src/rating-colors.js";
import { createRatings } from "../src/ratings.js";
import { verbs } from "../src/csv.js";
import { cardsFor, verbCardId, TENSES } from "../src/conjugate.js";
import { basicsCards, basicsRows, basicsCardId, TOPICS, BASICS_PAGES } from "../src/basics.js";
import { fakeStorage } from "./helpers.js";

const record = (last) => ({ last, at: 1, count: 1, history: [[last, 1]] });

describe("colour level of a card", () => {
  it("is the weaker of the two directions", () => {
    const levels = ratingLevels({
      "parlare.presente.1|it-en": record(5),
      "parlare.presente.1|en-it": record(2),
    });
    expect(levels.get("parlare.presente.1")).toBe(2);
  });

  it("uses the only rated direction when just one is rated", () => {
    expect(ratingLevels({ "basics.pronouns.io|en-it": record(4) }).get("basics.pronouns.io")).toBe(4);
  });

  it("is missing for cards that aren't rated", () => {
    const levels = ratingLevels({ "parlare.presente.1|it-en": record(3) });
    expect(levels.has("parlare.presente.0")).toBe(false);
    expect(ratingClass(levels, "parlare.presente.0")).toBe("");
    expect(ratingClass(levels, "parlare.presente.1")).toBe("r3");
  });

  it("ignores broken records instead of colouring wrongly", () => {
    const levels = ratingLevels({
      "a|sideways": record(1),
      "b|it-en": { last: 9 },
      "c|it-en": null,
      "d|en-it": record(5),
    });
    expect([...levels.entries()]).toEqual([["d", 5]]);
  });

  it("follows the ratings stored by the flash cards", () => {
    const storage = fakeStorage();
    const ratings = createRatings(storage);
    ratings.rate("essere.presente.0", "it-en", 5);
    ratings.rate("essere.presente.0", "en-it", 3);
    ratings.rate("basics.articulated.del", "it-en", 1);
    const levels = currentLevels(storage);
    expect(ratingClass(levels, "essere.presente.0")).toBe("r3");
    expect(ratingClass(levels, "basics.articulated.del")).toBe("r1");
  });
});

describe("every flash card has a place on a page to be coloured", () => {
  it("verb cards: the infinitive in the index, or a cell in the verb's table", () => {
    for (const v of verbs) {
      const onPage = new Set([verbCardId(v.infinitive, "infinito")]);
      for (const [tense] of TENSES) for (let p = 0; p < 6; p++) onPage.add(verbCardId(v.infinitive, tense, p));
      for (const c of cardsFor(v)) expect(onPage.has(c.id), `${c.id} has no place on its verb page`).toBe(true);
    }
  });

  it("Basics cards: a row of a topic that is on a Basics subpage", () => {
    const onPages = new Set(BASICS_PAGES.flatMap((p) => p.topics));
    const onPage = new Set();
    for (const t of TOPICS.filter((t) => onPages.has(t.id))) {
      for (const r of basicsRows.filter((r) => r.topic === t.id)) onPage.add(basicsCardId(t.id, r.italian));
      if (t.verb) for (const c of cardsFor(verbs.find((v) => v.infinitive === t.verb))) onPage.add(c.id);
    }
    for (const c of basicsCards()) expect(onPage.has(c.id), `${c.id} has no place on the Basics page`).toBe(true);
  });
});
