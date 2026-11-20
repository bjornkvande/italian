// Checks the word group list (src/groups.js), so a new group is wired up
// completely: pages that exist, unique ids, cards in the shared shape, a level.
import { describe, it, expect } from "vitest";
import { existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { GROUPS, cardsByGroup } from "../src/groups.js";
import { DIFFICULTIES } from "../src/levels.js";
import { PAGES } from "../src/pages.js";

const root = fileURLToPath(new URL("..", import.meta.url));
const decks = cardsByGroup();

describe("word groups", () => {
  it("have unique ids, tab names and storage keys", () => {
    for (const key of ["id", "name", "storageKey"]) {
      const values = GROUPS.map((g) => g[key]);
      expect(new Set(values).size, `duplicate ${key}`).toBe(values.length);
    }
  });

  it.each(GROUPS.map((g) => [g.id, g]))("%s: subpages have unique ids, a label and an existing HTML file", (_, g) => {
    expect(g.pages.length).toBeGreaterThan(0);
    expect(new Set(g.pages.map((p) => p.id)).size).toBe(g.pages.length);
    for (const p of g.pages) {
      expect(p.label).toMatch(/\S/);
      expect(existsSync(root + p.href.split("#")[0]), `${p.href} doesn't exist`).toBe(true);
    }
  });

  it.each(GROUPS.map((g) => [g.id, g]))("%s: cards have the shared shape and unique ids", (id) => {
    const cards = decks[id];
    expect(cards.length).toBeGreaterThan(0);
    for (const c of cards) {
      for (const key of ["id", "tenseKey", "kind", "tense", "it", "en"]) expect(c[key], `${c.id}.${key}`).toMatch(/\S/);
      // The English-side heading starts with the word class shown on the Italian side.
      expect(c.tense.startsWith(c.kind), `${c.id}: "${c.tense}" vs "${c.kind}"`).toBe(true);
    }
    const ids = cards.map((c) => c.id);
    expect(ids.filter((x, i) => ids.indexOf(x) !== i)).toEqual([]);
  });

  it("a card shared by two groups is the same card (essere/avere in Basics and Verbs)", () => {
    const seen = new Map();
    for (const g of GROUPS) {
      for (const c of decks[g.id]) {
        if (seen.has(c.id)) expect(c, `${c.id} differs between groups`).toEqual(seen.get(c.id));
        else seen.set(c.id, c);
      }
    }
  });

  it("every group has a one-line description for the 'what to practise' menu", () => {
    for (const g of GROUPS) expect(g.description, g.id).toMatch(/\S/);
  });

  it("every group describes each difficulty for the menu", () => {
    for (const g of GROUPS) {
      expect(Object.keys(g.difficulties).sort(), g.id).toEqual(DIFFICULTIES.map((d) => d.id).sort());
      for (const d of DIFFICULTIES) {
        expect(g.difficulties[d.id].description, `${g.id} ${d.id}`).toMatch(/\S/);
        const include = g.difficulties[d.id].include;
        expect(include === null || typeof include === "function", `${g.id} ${d.id} include`).toBe(true);
      }
    }
  });

  it("every HTML page is the start page or belongs to a group", () => {
    const linked = new Set(GROUPS.flatMap((g) => g.pages.map((p) => p.href.split("#")[0])));
    const pages = readdirSync(root).filter((f) => f.endsWith(".html") && f !== "index.html");
    for (const f of pages) expect(linked.has(f), `${f} isn't in any group`).toBe(true);
  });

  it("every verb subpage has a page config", () => {
    for (const p of GROUPS.find((g) => g.id === "verbs").pages) expect(PAGES[p.id], p.id).toBeDefined();
  });
});
