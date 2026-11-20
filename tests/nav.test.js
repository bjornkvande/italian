// Tests for remembering each word group's subpage (src/nav.js).
import { describe, it, expect } from "vitest";
import { lastPage, rememberPage, sectionById, grammarHref } from "../src/nav.js";
import { GROUPS } from "../src/groups.js";

function fakeStorage(initial = {}) {
  const items = { ...initial };
  return { items, getItem: (k) => (k in items ? items[k] : null), setItem: (k, v) => { items[k] = String(v); } };
}

describe("Train and grammar", () => {
  it("training remembers the word group, kept on the start page after #", () => {
    expect(sectionById("train").pages.map((p) => p.href)).toEqual(GROUPS.map((g) => `./#${g.id}`));
  });

  it("📖 leads to the group's grammar page used last (the first one by default)", () => {
    for (const g of GROUPS) expect(grammarHref(g.id)).toBe(lastPage(g.id).href);
  });
});

const SECTIONS = ["train", ...GROUPS.map((g) => g.id)].map((id) => [id, sectionById(id)]);

describe.each(SECTIONS)("remembering the %s subpage", (groupId, group) => {
  const [first, second] = group.pages;

  it("opens the first subpage the first time", () => {
    expect(lastPage(groupId, fakeStorage()).id).toBe(first.id);
  });

  it("opens the subpage used last", () => {
    const storage = fakeStorage();
    rememberPage(groupId, second.id, storage);
    expect(storage.items[group.storageKey]).toBe(second.id);
    expect(lastPage(groupId, storage).href).toBe(second.href);
  });

  it("ignores an unknown saved subpage and refuses to save one", () => {
    expect(lastPage(groupId, fakeStorage({ [group.storageKey]: "xyz" })).id).toBe(first.id);
    expect(() => rememberPage(groupId, "xyz", fakeStorage())).toThrow();
  });

  it("works when storage is blocked", () => {
    const blocked = { getItem: () => { throw new Error(); }, setItem: () => { throw new Error(); } };
    expect(lastPage(groupId, blocked).id).toBe(first.id);
    expect(() => rememberPage(groupId, second.id, blocked)).not.toThrow();
  });
});
