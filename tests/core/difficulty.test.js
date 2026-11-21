// Tests for the difficulties per word group (src/core/difficulty.js and the
// `difficulties` in src/lang/it/groups.js).
import { describe, it, expect } from "vitest";
import {
  DIFFICULTIES, DEFAULT_DIFFICULTY, STORAGE_KEY,
  cardsForDifficulty, loadDifficulty, saveDifficulty, migrateOldLevel,
} from "../../src/core/difficulty.js";
import { GROUPS, groupById, cardsByGroup } from "../../src/lang/it/groups.js";
import { verbs } from "../../src/lang/it/verbs.js";
import { fakeStorage } from "../helpers.js";

const decks = cardsByGroup();
const at = (groupId, difficulty) => cardsForDifficulty(decks[groupId], groupById(groupId), difficulty);
const keysIn = (cards) => [...new Set(cards.map((c) => c.form))].sort();
const topicsIn = (cards) => [...new Set(cards.map((c) => (c.id.startsWith("basics.") ? c.id.split(".")[1] : c.id.split(".")[0])))].sort();

describe("every word group", () => {
  it.each(GROUPS.map((g) => [g.id]))("%s: each difficulty includes the one below, and Advanced is everything", (groupId) => {
    for (let i = 1; i < DIFFICULTIES.length; i++) {
      const lower = new Set(at(groupId, DIFFICULTIES[i - 1].id).map((c) => c.id));
      const higher = new Set(at(groupId, DIFFICULTIES[i].id).map((c) => c.id));
      expect(lower.size, `${groupId} ${DIFFICULTIES[i - 1].id} is empty`).toBeGreaterThan(0);
      expect(higher.size, `${groupId} ${DIFFICULTIES[i].id} adds nothing`).toBeGreaterThan(lower.size);
      for (const id of lower) expect(higher.has(id), `${id} missing from ${DIFFICULTIES[i].id}`).toBe(true);
    }
    expect(at(groupId, "advanced")).toEqual(decks[groupId]);
  });
});

describe("verbs", () => {
  it("beginner: only infinitives, one per verb", () => {
    expect(keysIn(at("verbs", "beginner"))).toEqual(["infinito"]);
    expect(at("verbs", "beginner")).toHaveLength(verbs.length);
  });

  it("intermediate: infinitives and presente for every person", () => {
    expect(keysIn(at("verbs", "intermediate"))).toEqual(["infinito", "presente"]);
    expect(at("verbs", "intermediate").filter((c) => c.id.startsWith("andare.")).map((c) => c.it)).toEqual([
      "andare", "io vado", "tu vai", "lui/lei va", "noi andiamo", "voi andate", "loro vanno",
    ]);
  });

  it("advanced: all tenses", () => {
    expect(keysIn(at("verbs", "advanced"))).toEqual(["condizionale", "futuro", "imperativo", "imperfetto", "infinito", "passato", "presente"]);
  });
});

describe("basics", () => {
  it("beginner: pronouns, greetings, articles (the, a), essere, avere, numbers, days", () => {
    expect(topicsIn(at("basics", "beginner"))).toEqual(["avere", "days", "definite", "essere", "greetings", "indefinite", "numbers", "pronouns"]);
    expect(at("basics", "beginner").map((c) => c.it)).toContain("io sono");
  });

  it("intermediate adds object, reflexive and stressed pronouns, questions, prepositions, place words, possessives, small words, months, seasons", () => {
    const added = topicsIn(at("basics", "intermediate")).filter((t) => !topicsIn(at("basics", "beginner")).includes(t));
    expect(added).toEqual(["connectors", "demonstratives", "direct", "indefinites", "indirect", "months", "partitive", "place",
      "possessives", "prepositions", "questions", "reflexive", "seasons", "stressed", "time"]);
  });

  it("advanced adds the rest: prepositions + article, ordinals, units of time", () => {
    const added = topicsIn(at("basics", "advanced")).filter((t) => !topicsIn(at("basics", "intermediate")).includes(t));
    expect(added).toEqual(["articulated", "ordinals", "time-units"]);
  });
});

describe("adjectives", () => {
  it("beginner: base forms; intermediate: + feminine singular and comparison; advanced: + plurals", () => {
    expect(keysIn(at("adjectives", "beginner"))).toEqual(["base"]);
    expect(keysIn(at("adjectives", "intermediate"))).toEqual(["base", "comparison", "fsg"]);
    expect(keysIn(at("adjectives", "advanced"))).toEqual(["base", "comparison", "fpl", "fsg", "mpl", "pl"]);
    expect(at("adjectives", "intermediate").map((c) => c.it)).toContain("rossa");
  });
});

describe("remembering the difficulty", () => {
  it("starts at the default for every group", () => {
    for (const g of GROUPS) expect(loadDifficulty(g.id, fakeStorage())).toBe(DEFAULT_DIFFICULTY);
  });

  it("is remembered per group", () => {
    const storage = fakeStorage();
    saveDifficulty("verbs", "advanced", storage);
    saveDifficulty("basics", "intermediate", storage);
    expect(loadDifficulty("verbs", storage)).toBe("advanced");
    expect(loadDifficulty("basics", storage)).toBe("intermediate");
    expect(loadDifficulty("adjectives", storage)).toBe("beginner");
    expect(JSON.parse(storage.items[STORAGE_KEY])).toEqual({ verbs: "advanced", basics: "intermediate" });
  });

  it("ignores unknown or broken saved values and refuses to save an unknown difficulty", () => {
    expect(loadDifficulty("verbs", fakeStorage({ [STORAGE_KEY]: '{"verbs":"expert"}' }))).toBe(DEFAULT_DIFFICULTY);
    expect(loadDifficulty("verbs", fakeStorage({ [STORAGE_KEY]: "{not json" }))).toBe(DEFAULT_DIFFICULTY);
    expect(() => saveDifficulty("verbs", "expert", fakeStorage())).toThrow();
    expect(at("verbs", "expert")).toEqual(at("verbs", DEFAULT_DIFFICULTY));
  });

  it("works when storage is blocked", () => {
    const blocked = { getItem: () => { throw new Error(); }, setItem: () => { throw new Error(); } };
    expect(loadDifficulty("verbs", blocked)).toBe(DEFAULT_DIFFICULTY);
    expect(() => saveDifficulty("verbs", "advanced", blocked)).not.toThrow();
    expect(() => migrateOldLevel(blocked)).not.toThrow();
  });
});

describe("carrying over the old single level", () => {
  it("Basics or Adjectives become what you practise", () => {
    const storage = fakeStorage({ "verbi.level": "adjectives" });
    migrateOldLevel(storage);
    expect(storage.items["verbi.trainGroup"]).toBe("adjectives");
  });

  it("a verb level becomes Verbs at that difficulty", () => {
    const storage = fakeStorage({ "verbi.level": "advanced" });
    migrateOldLevel(storage);
    expect(storage.items["verbi.trainGroup"]).toBe("verbs");
    expect(loadDifficulty("verbs", storage)).toBe("advanced");
  });

  it("does nothing once the new settings exist, or without an old level", () => {
    const storage = fakeStorage({ "verbi.level": "advanced", "verbi.trainGroup": "basics" });
    migrateOldLevel(storage);
    expect(storage.items["verbi.trainGroup"]).toBe("basics");
    expect(storage.items[STORAGE_KEY]).toBeUndefined();
    const empty = fakeStorage();
    migrateOldLevel(empty);
    expect(empty.items).toEqual({});
  });
});
