// Checks the French word groups as a whole (src/lang/fr/groups.js); the shape of
// every language's groups is checked in tests/core/language.test.js.
import { describe, it, expect } from "vitest";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { GROUPS, cardsByGroup } from "../../src/lang/fr/groups.js";

const root = fileURLToPath(new URL("../..", import.meta.url));
const decks = cardsByGroup();

describe("French word groups", () => {
  it("are the same five as in Italian, in the same order", () => {
    expect(GROUPS.map((g) => g.id)).toEqual(["basics", "adjectives", "adverbs", "nouns", "verbs"]);
  });

  it("every page in fr/ belongs to a group", () => {
    const pages = new Set(GROUPS.flatMap((g) => g.pages.map((p) => p.href.split("#")[0])));
    for (const f of readdirSync(root + "fr").filter((x) => x.endsWith(".html"))) expect(pages.has(f), f).toBe(true);
  });

  it("a word is a card in one group only (shared verb cards excepted)", () => {
    const groupOf = new Map();
    for (const g of GROUPS) {
      for (const c of decks[g.id]) {
        if (c.kind === "Article" || c.kind === "Verb") continue;
        const other = groupOf.get(c.it);
        if (other && other !== g.id) expect.fail(`"${c.it}" is a card in both ${other} and ${g.id}`);
        groupOf.set(c.it, g.id);
      }
    }
  });

  it("a card shared by two groups is the same card (être/avoir in Basics and Verbs)", () => {
    const seen = new Map();
    for (const g of GROUPS) {
      for (const c of decks[g.id]) {
        if (seen.has(c.id)) expect(c, c.id).toEqual(seen.get(c.id));
        else seen.set(c.id, c);
      }
    }
    expect(decks.basics.some((c) => c.id === "être.present.0")).toBe(true);
  });
});
