// Checks the word group list (src/groups.js), so a new group is wired up
// completely: pages that exist, unique ids, cards in the shared shape, a level.
import { describe, it, expect } from "vitest";
import { existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { GROUPS, cardsByGroup } from "../src/groups.js";
import { LEVELS } from "../src/levels.js";
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
      for (const key of ["id", "tenseKey", "tense", "it", "en"]) expect(c[key], `${c.id}.${key}`).toMatch(/\S/);
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

  it("every group can be practised at some level, and every level uses a known group", () => {
    for (const g of GROUPS) expect(LEVELS.some((l) => l.group === g.id), `no level for ${g.id}`).toBe(true);
    for (const l of LEVELS) expect(GROUPS.map((g) => g.id), `level ${l.id}`).toContain(l.group);
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
