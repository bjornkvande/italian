// Tests for remembering each word group's subpage (src/nav.js).
import { describe, it, expect } from "vitest";
import { lastPage, rememberPage } from "../src/nav.js";
import { GROUPS } from "../src/groups.js";

function fakeStorage(initial = {}) {
  const items = { ...initial };
  return { items, getItem: (k) => (k in items ? items[k] : null), setItem: (k, v) => { items[k] = String(v); } };
}

describe.each(GROUPS.map((g) => [g.id, g]))("remembering the %s subpage", (groupId, group) => {
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
    expect(lastPage(groupId, fakeStorage({ [group.storageKey]: "nouns" })).id).toBe(first.id);
    expect(() => rememberPage(groupId, "nouns", fakeStorage())).toThrow();
  });

  it("works when storage is blocked", () => {
    const blocked = { getItem: () => { throw new Error(); }, setItem: () => { throw new Error(); } };
    expect(lastPage(groupId, blocked).id).toBe(first.id);
    expect(() => rememberPage(groupId, second.id, blocked)).not.toThrow();
  });
});
