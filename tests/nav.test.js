// Tests for remembering which verb page "Verbs" opens (src/nav.js).
import { describe, it, expect } from "vitest";
import { VERB_PAGES, STORAGE_KEY, lastVerbPage, rememberVerbPage } from "../src/nav.js";
import { PAGES } from "../src/pages.js";

function fakeStorage(initial = {}) {
  const items = { ...initial };
  return { items, getItem: (k) => (k in items ? items[k] : null), setItem: (k, v) => { items[k] = String(v); } };
}

describe("verb pages", () => {
  it("each has a page config and an HTML file name", () => {
    for (const p of VERB_PAGES) {
      expect(PAGES[p.id], `no page config for ${p.id}`).toBeDefined();
      expect(p.href).toBe(`${p.id}.html`);
    }
  });
});

describe("remembering the verb page", () => {
  it("opens -are the first time", () => {
    expect(lastVerbPage(fakeStorage()).id).toBe("are");
  });

  it("opens the page used last", () => {
    const storage = fakeStorage();
    rememberVerbPage("irregular", storage);
    expect(storage.items[STORAGE_KEY]).toBe("irregular");
    expect(lastVerbPage(storage).href).toBe("irregular.html");
  });

  it("ignores an unknown saved page and refuses to save one", () => {
    expect(lastVerbPage(fakeStorage({ [STORAGE_KEY]: "nouns" })).id).toBe("are");
    expect(() => rememberVerbPage("nouns", fakeStorage())).toThrow();
  });

  it("works when storage is blocked", () => {
    const blocked = { getItem: () => { throw new Error(); }, setItem: () => { throw new Error(); } };
    expect(lastVerbPage(blocked).id).toBe("are");
    expect(() => rememberVerbPage("ere", blocked)).not.toThrow();
  });
});

describe("verb page tabs", () => {
  it("every verb page has a label for the row of tabs", () => {
    expect(VERB_PAGES.map((p) => p.label)).toEqual(["-are", "-ere", "-ire", "Irregular"]);
  });
});
