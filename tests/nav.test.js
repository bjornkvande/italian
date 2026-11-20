// Tests for the navigation sections and remembering subpages (src/nav.js).
import { describe, it, expect } from "vitest";
import { SECTIONS, VERB_PAGES, lastPage, rememberPage } from "../src/nav.js";
import { PAGES } from "../src/pages.js";

function fakeStorage(initial = {}) {
  const items = { ...initial };
  return { items, getItem: (k) => (k in items ? items[k] : null), setItem: (k, v) => { items[k] = String(v); } };
}

describe("sections", () => {
  it("verb pages each have a page config and an HTML file", () => {
    for (const p of VERB_PAGES) {
      expect(PAGES[p.id], `no page config for ${p.id}`).toBeDefined();
      expect(p.href).toBe(`${p.id}.html`);
    }
    expect(VERB_PAGES.map((p) => p.label)).toEqual(["-are", "-ere", "-ire", "Irregular"]);
  });

  it("basics subpages live on basics.html with their id after #", () => {
    for (const p of SECTIONS.basics.pages) expect(p.href).toBe(`basics.html#${p.id}`);
  });

  it("each section remembers its subpage under its own key", () => {
    const keys = Object.values(SECTIONS).map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe.each(Object.keys(SECTIONS))("remembering the %s subpage", (section) => {
  const [first, second] = SECTIONS[section].pages;

  it("opens the first subpage the first time", () => {
    expect(lastPage(section, fakeStorage()).id).toBe(first.id);
  });

  it("opens the subpage used last", () => {
    const storage = fakeStorage();
    rememberPage(section, second.id, storage);
    expect(storage.items[SECTIONS[section].key]).toBe(second.id);
    expect(lastPage(section, storage).href).toBe(second.href);
  });

  it("ignores an unknown saved subpage and refuses to save one", () => {
    expect(lastPage(section, fakeStorage({ [SECTIONS[section].key]: "nouns" })).id).toBe(first.id);
    expect(() => rememberPage(section, "nouns", fakeStorage())).toThrow();
  });

  it("works when storage is blocked", () => {
    const blocked = { getItem: () => { throw new Error(); }, setItem: () => { throw new Error(); } };
    expect(lastPage(section, blocked).id).toBe(first.id);
    expect(() => rememberPage(section, second.id, blocked)).not.toThrow();
  });
});
